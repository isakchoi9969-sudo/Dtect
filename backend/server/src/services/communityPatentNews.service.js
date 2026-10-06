const { NewsServiceError, cleanNaverText, fetchNaverNews } = require("./naverNews.service");
const {
  getCommunityNewsSource,
  deduplicateCommunityNewsArticles,
  sortCommunityNewsByNewest,
} = require("./communityNews.service");

const PATENT_QUERIES = ["특허 출원", "특허 등록", "특허 취득"];
const PAGE_SIZE = 50;
// 네이버 검색 API는 검색어별 최대 1,000번째 결과까지 조회할 수 있다.
const MAX_PAGES_PER_QUERY = 20;
const CACHE_TTL_MS = 10 * 60 * 1000;
// 제목에서 특허권의 실제 출원·등록·취득을 직접 언급해야 한다.
// '특허 기술 확보', '출원 통계'처럼 권리 생성 사실이 아닌 기사는 제외한다.
const PATENT_EVENT = /특허(?:권)?[^.!?…]{0,12}(?:출원|등록|취득)|(?:출원|등록|취득)[^.!?…]{0,8}특허(?:권)?/;
const DISPUTE_OR_INVALID_EVENT = /소송|분쟁|침해|피소|가처분|손해배상|무효|심판|고소|고발|법원|판결|재판|법적\s*대응|특허괴물|특허전쟁|취소|거절|반려|포기|철회|취하|이의신청|권리범위확인|의견제출통지서/;
const NOT_YET_FILED = /(?:출원|등록|취득).{0,12}(?:예정|계획|추진|검토|준비|가능성|목표|방침)|(?:예정|계획|추진|검토|준비).{0,12}(?:출원|등록|취득)/;
const GENERAL_PATENT_TOPIC = /\[그래픽\]|\[특징주\]|급등|상한가|주가|출원\s*(?:동향|현황|통계|건수|순위|추세|급증|증가|감소|전망|전략|방법|절차|지원|상담|설명회|교육|비중)|등록\s*(?:동향|현황|통계|건수|순위|추세|급증|증가|감소|전망|절차|방법|지원)|등록\s*결정|특허청\s*(?:공고|통계|발표|설명회|교육)|지난해|작년|최근\s*\d+년|기존\s*특허|보유\s*특허|(?:세계|국내|한국|글로벌)?\s*\d+위|출원\s*\d+건.{0,15}등록\s*\d+건/;
const OLD_PATENT_EVENT = /(?:202[0-5]년|지난해|작년|과거).{0,70}(?:특허(?:권)?.{0,20}(?:출원|등록|취득)|(?:출원|등록|취득).{0,10}특허(?:권)?)/;
const YEAR_START = Date.parse("2026-01-01T00:00:00+09:00");
const YEAR_END = Date.parse("2027-01-01T00:00:00+09:00");

class CommunityPatentNewsServiceError extends Error {}

let cachedSnapshot = null;
let pendingSnapshot = null;

function isPublishedIn2026(publishedAt, now = new Date()) {
  const timestamp = Date.parse(publishedAt);
  return Number.isFinite(timestamp) && timestamp >= YEAR_START &&
    timestamp < YEAR_END && timestamp <= now.getTime();
}

function toPatentNewsArticle(item, now = new Date()) {
  const title = cleanNaverText(item?.title);
  const description = cleanNaverText(item?.description);
  const originalLink = item?.originallink || "";
  const link = originalLink || item?.link || "";
  const source = getCommunityNewsSource(originalLink || item?.link);

  if (!title || !link || !source || !isPublishedIn2026(item?.pubDate, now) ||
    !PATENT_EVENT.test(title) || DISPUTE_OR_INVALID_EVENT.test(`${title} ${description}`) ||
    NOT_YET_FILED.test(title) || GENERAL_PATENT_TOPIC.test(title) ||
    OLD_PATENT_EVENT.test(`${title} ${description}`)) {
    return null;
  }

  return {
    industry: "특허",
    title,
    source: source.name,
    sourceId: source.id,
    publishedAt: item.pubDate,
    link,
    originalLink,
  };
}

async function fetchCommunityPatentNews({ fetchNews = fetchNaverNews, now = new Date() } = {}) {
  const states = PATENT_QUERIES.map((query) => ({ query, page: 1, active: true }));
  const articles = [];
  const failedQueries = [];
  let successfulRequests = 0;

  while (states.some((state) => state.active)) {
    const attempts = await Promise.all(states.filter((state) => state.active).map(async (state) => {
      try {
        return { state, items: (await fetchNews(state.query, state.page, PAGE_SIZE)).items || [] };
      } catch (error) {
        if (!(error instanceof NewsServiceError)) throw error;
        return { state, error: error.message };
      }
    }));

    for (const { state, items, error } of attempts) {
      if (error) {
        failedQueries.push({ query: state.query, error });
        state.active = false;
        continue;
      }
      successfulRequests += 1;
      articles.push(...items.map((item) => toPatentNewsArticle(item, now)).filter(Boolean));
      state.page += 1;
      state.active = items.length === PAGE_SIZE && state.page <= MAX_PAGES_PER_QUERY &&
        items.some((item) => isPublishedIn2026(item.pubDate, now));
    }

  }

  if (successfulRequests === 0) {
    throw new CommunityPatentNewsServiceError("특허 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const items = sortCommunityNewsByNewest(deduplicateCommunityNewsArticles(articles));
  return { items, returnedCount: items.length, year: 2026, failedQueries };
}

async function getCachedCommunityPatentNews(options = {}) {
  const now = options.now || new Date();
  if (cachedSnapshot && cachedSnapshot.expiresAt > now.getTime()) {
    return { snapshot: cachedSnapshot.snapshot, cached: true, cachedAt: cachedSnapshot.cachedAt };
  }
  if (!pendingSnapshot) {
    pendingSnapshot = fetchCommunityPatentNews({ ...options, now })
      .then((snapshot) => {
        cachedSnapshot = {
          snapshot,
          cachedAt: now.toISOString(),
          expiresAt: now.getTime() + CACHE_TTL_MS,
        };
        return snapshot;
      })
      .finally(() => { pendingSnapshot = null; });
  }
  const snapshot = await pendingSnapshot;
  return { snapshot, cached: false, cachedAt: cachedSnapshot.cachedAt };
}

function clearCommunityPatentNewsCache() {
  cachedSnapshot = null;
  pendingSnapshot = null;
}

module.exports = {
  CommunityPatentNewsServiceError,
  isPublishedIn2026,
  toPatentNewsArticle,
  fetchCommunityPatentNews,
  getCachedCommunityPatentNews,
  clearCommunityPatentNewsCache,
};
