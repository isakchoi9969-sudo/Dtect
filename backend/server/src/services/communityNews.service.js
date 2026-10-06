const {
  NewsServiceError,
  cleanNaverText,
  fetchNaverNews,
} = require("./naverNews.service");
const {
  COMMUNITY_NEWS_INDUSTRIES,
  COMMUNITY_NEWS_KEYWORDS,
  COMMUNITY_NEWS_REQUIRED_TITLE_TERMS,
  COMMUNITY_NEWS_REQUIRED_TITLE_SECONDARY_TERMS,
  COMMUNITY_NEWS_COMMON_TECH_ACTIVITY_TERMS,
  COMMUNITY_NEWS_SOURCES,
  COMMUNITY_NEWS_EXCLUDED_TITLE_TERMS,
  COMMUNITY_NEWS_DEFAULT_LIMIT,
  COMMUNITY_NEWS_MAX_LIMIT,
  COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY,
  COMMUNITY_NEWS_MAX_PAGES_PER_QUERY,
  COMMUNITY_NEWS_RECENT_DAYS,
  COMMUNITY_NEWS_FALLBACK_RECENT_DAYS,
  COMMUNITY_NEWS_MAX_ARTICLES_PER_SOURCE,
  COMMUNITY_NEWS_CACHE_TTL_MS,
  COMMUNITY_NEWS_MAX_CONCURRENT_REQUESTS,
} = require("../config/communityNews.config");

class CommunityNewsServiceError extends Error {}

let cachedCommunityNewsSnapshot = null;
let pendingCommunityNewsSnapshot = null;

function getCommunityNewsSource(url) {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return (
      COMMUNITY_NEWS_SOURCES.find((source) =>
        source.domains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        ),
      ) || null
    );
  } catch {
    return null;
  }
}

function normalizeCommunityNewsTitle(title) {
  return cleanNaverText(String(title || ""))
    .toLocaleLowerCase("ko-KR")
    .replace(/[\[\]{}()<>"'“”‘’·ㆍ:;,.!?~`|\\/\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isExcludedCommunityNewsTitle(title) {
  const normalizedTitle = normalizeCommunityNewsTitle(title);

  return COMMUNITY_NEWS_EXCLUDED_TITLE_TERMS.some((term) =>
    normalizedTitle.includes(term.toLocaleLowerCase("ko-KR")),
  );
}

function hasRequiredCommunityNewsTitleTerm(industry, title) {
  const titleTerms = COMMUNITY_NEWS_REQUIRED_TITLE_TERMS[industry] || [];
  const secondaryTitleTerms =
    COMMUNITY_NEWS_REQUIRED_TITLE_SECONDARY_TERMS[industry] || [];
  const normalizedTitle = normalizeCommunityNewsTitle(title);

  const hasPrimaryTerm = titleTerms.some((term) =>
    normalizedTitle.includes(normalizeCommunityNewsTitle(term)),
  );
  const acceptedActivityTerms = [
    ...secondaryTitleTerms,
    ...COMMUNITY_NEWS_COMMON_TECH_ACTIVITY_TERMS,
  ];
  const hasActivityTerm =
    acceptedActivityTerms.length === 0 ||
    acceptedActivityTerms.some((term) =>
      normalizedTitle.includes(normalizeCommunityNewsTitle(term)),
    );

  return hasPrimaryTerm && hasActivityTerm;
}

function toCommunityNewsArticle(item, industry) {
  const title = cleanNaverText(item?.title);
  const originalLink = item?.originallink || "";
  const link = originalLink || item?.link || "";
  const source = getCommunityNewsSource(originalLink || item?.link);

  if (
    !title ||
    !link ||
    !source ||
    isExcludedCommunityNewsTitle(title) ||
    !hasRequiredCommunityNewsTitleTerm(industry, title)
  ) {
    return null;
  }

  return {
    industry,
    title,
    source: source.name,
    sourceId: source.id,
    publishedAt: item.pubDate || "",
    link,
    originalLink,
  };
}

/** URL 중복을 먼저 제거한 뒤, 정규화된 제목이 같은 기사도 하나만 남긴다. */
function deduplicateCommunityNewsArticles(articles) {
  const seenLinks = new Set();
  const seenTitles = new Set();

  return articles.filter((article) => {
    const linkKey = (article.originalLink || article.link || "").trim();
    const titleKey = normalizeCommunityNewsTitle(article.title);

    if (!linkKey || !titleKey || seenLinks.has(linkKey) || seenTitles.has(titleKey)) {
      return false;
    }

    seenLinks.add(linkKey);
    seenTitles.add(titleKey);
    return true;
  });
}

function sortCommunityNewsByNewest(articles) {
  return [...articles].sort(
    (articleA, articleB) =>
      (Date.parse(articleB.publishedAt) || 0) -
      (Date.parse(articleA.publishedAt) || 0),
  );
}

/** 최신순 목록에서 동일 언론사의 과도한 노출을 막는다. */
function limitCommunityNewsPerSource(
  articles,
  maxPerSource = COMMUNITY_NEWS_MAX_ARTICLES_PER_SOURCE,
) {
  const countsBySource = new Map();

  return articles.filter((article) => {
    const count = countsBySource.get(article.sourceId) || 0;
    if (count >= maxPerSource) return false;

    countsBySource.set(article.sourceId, count + 1);
    return true;
  });
}

function clampCommunityNewsLimit(limit) {
  const parsedLimit = Number(limit);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return COMMUNITY_NEWS_DEFAULT_LIMIT;
  }
  return Math.min(parsedLimit, COMMUNITY_NEWS_MAX_LIMIT);
}

function isPublishedWithinDays(publishedAt, days, now = new Date()) {
  const publishedAtTime = Date.parse(publishedAt);
  const nowTime = now.getTime();
  if (!Number.isFinite(publishedAtTime) || !Number.isFinite(nowTime)) return false;

  const cutoffTime = nowTime - days * 24 * 60 * 60 * 1000;
  return publishedAtTime >= cutoffTime && publishedAtTime <= nowTime;
}

function getCommunityArticleKey(article) {
  return article.originalLink || article.link || normalizeCommunityNewsTitle(article.title);
}

/**
 * 언론사별 기본 한도를 우선 적용한다. 기사 수가 부족할 때만 최신순 후보에서
 * 초과 기사를 보충해, 다양성과 "있는 기사 모두 표시" 요구를 함께 만족한다.
 */
function selectCommunityNewsArticles(articles, { limit, now = new Date() } = {}) {
  const targetLimit = clampCommunityNewsLimit(limit);
  const recentArticles = sortCommunityNewsByNewest(articles).filter((article) =>
    isPublishedWithinDays(article.publishedAt, COMMUNITY_NEWS_RECENT_DAYS, now),
  );
  const candidateArticles =
    recentArticles.length >= targetLimit
      ? recentArticles
      : sortCommunityNewsByNewest(articles).filter((article) =>
          isPublishedWithinDays(
            article.publishedAt,
            COMMUNITY_NEWS_FALLBACK_RECENT_DAYS,
            now,
          ),
        );
  const balancedArticles = limitCommunityNewsPerSource(candidateArticles);
  const selectedArticles = balancedArticles.slice(0, targetLimit);

  if (selectedArticles.length < targetLimit) {
    const selectedKeys = new Set(selectedArticles.map(getCommunityArticleKey));
    for (const article of candidateArticles) {
      if (selectedArticles.length >= targetLimit) break;
      const articleKey = getCommunityArticleKey(article);
      if (selectedKeys.has(articleKey)) continue;

      selectedKeys.add(articleKey);
      selectedArticles.push(article);
    }
  }

  return {
    items: selectedArticles,
    returnedCount: selectedArticles.length,
    periodDays:
      recentArticles.length >= targetLimit
        ? COMMUNITY_NEWS_RECENT_DAYS
        : COMMUNITY_NEWS_FALLBACK_RECENT_DAYS,
  };
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  );
  return results;
}

/**
 * 하나의 산업에 연결된 모든 검색어에서 원본 후보를 수집합니다.
 * 실패한 검색어는 기록만 남기고, 다른 검색어의 성공 결과는 계속 사용합니다.
 */
async function fetchCommunityIndustryCandidates(
  industry,
  {
    fetchNews = fetchNaverNews,
    now = new Date(),
    limit = COMMUNITY_NEWS_DEFAULT_LIMIT,
  } = {},
) {
  const keywords = COMMUNITY_NEWS_KEYWORDS[industry];
  if (!COMMUNITY_NEWS_INDUSTRIES.includes(industry) || !keywords) {
    throw new CommunityNewsServiceError("지원하지 않는 산업 태그입니다.");
  }

  const targetLimit = clampCommunityNewsLimit(limit);
  const cutoffDays = COMMUNITY_NEWS_FALLBACK_RECENT_DAYS;
  const keywordStates = keywords.map((keyword) => ({
    keyword,
    nextPage: 1,
    hasMore: true,
    error: null,
  }));
  const rawItems = [];
  let pagesFetched = 0;
  let activeStates = keywordStates;

  // 첫 페이지로 부족한 경우에만 다음 페이지를 조회한다. 각 검색어가 30일 이전
  // 결과에 도달하거나 네이버의 1,000번째 결과 한도에 닿으면 해당 검색어는 멈춘다.
  while (activeStates.length > 0) {
    const attempts = await mapWithConcurrency(
      activeStates,
      COMMUNITY_NEWS_MAX_CONCURRENT_REQUESTS,
      async (state) => {
        try {
          const data = await fetchNews(
            state.keyword,
            state.nextPage,
            COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY,
          );
          return { state, items: data.items || [], error: null };
        } catch (error) {
          if (!(error instanceof NewsServiceError)) throw error;
          return { state, items: [], error: error.message };
        }
      },
    );

    for (const attempt of attempts) {
      const { state, items, error } = attempt;
      if (error) {
        state.error = error;
        state.hasMore = false;
        continue;
      }

      pagesFetched += 1;
      rawItems.push(...items);
      state.nextPage += 1;
      state.hasMore =
        items.length === COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY &&
        state.nextPage <= COMMUNITY_NEWS_MAX_PAGES_PER_QUERY &&
        items.some((item) =>
          isPublishedWithinDays(item.pubDate, cutoffDays, now),
        );
    }

    const preparedSoFar = rawItems
      .map((item) => toCommunityNewsArticle(item, industry))
      .filter(Boolean);
    const selectedSoFar = selectCommunityNewsArticles(
      deduplicateCommunityNewsArticles(preparedSoFar),
      { limit: targetLimit, now },
    );

    if (selectedSoFar.returnedCount >= targetLimit) break;
    activeStates = keywordStates.filter((state) => state.hasMore);
  }

  const failedKeywords = keywordStates
    .filter((state) => state.error)
    .map(({ keyword, error }) => ({ keyword, error }));
  const preparedArticles = rawItems
    .map((item) => toCommunityNewsArticle(item, industry))
    .filter(Boolean);
  const uniqueArticles = deduplicateCommunityNewsArticles(preparedArticles);
  const sortedArticles = sortCommunityNewsByNewest(uniqueArticles);

  return {
    industry,
    allArticles: sortedArticles,
    articles: limitCommunityNewsPerSource(sortedArticles),
    rawCount: rawItems.length,
    filteredCount: preparedArticles.length,
    duplicateCount: preparedArticles.length - uniqueArticles.length,
    failedKeywords,
    pagesFetched,
  };
}

function createConcurrencyLimitedFetcher(fetcher, maxConcurrentRequests) {
  let activeRequestCount = 0;
  const queuedRequests = [];

  function runNextRequest() {
    if (
      activeRequestCount >= maxConcurrentRequests ||
      queuedRequests.length === 0
    ) {
      return;
    }

    const { args, resolve, reject } = queuedRequests.shift();
    activeRequestCount += 1;
    Promise.resolve(fetcher(...args))
      .then(resolve, reject)
      .finally(() => {
        activeRequestCount -= 1;
        runNextRequest();
      });
  }

  return (...args) =>
    new Promise((resolve, reject) => {
      queuedRequests.push({ args, resolve, reject });
      runNextRequest();
    });
}

/**
 * 첫 화면 로딩에 사용할 전체 산업 스냅샷입니다.
 * 모든 산업이 같은 전역 요청 제한을 공유하므로 네이버 API 요청이 한꺼번에 몰리지 않습니다.
 */
async function fetchAllCommunityNews({ limit, now = new Date(), fetchNews } = {}) {
  const limitedFetchNews = createConcurrencyLimitedFetcher(
    fetchNews || fetchNaverNews,
    COMMUNITY_NEWS_MAX_CONCURRENT_REQUESTS,
  );
  const industryResults = await Promise.all(
    COMMUNITY_NEWS_INDUSTRIES.map((industry) =>
      fetchCommunityIndustryCandidates(industry, {
        fetchNews: limitedFetchNews,
        now,
        limit,
      }),
    ),
  );
  const successfulKeywordCount = industryResults.reduce(
    (count, result) => count + COMMUNITY_NEWS_KEYWORDS[result.industry].length - result.failedKeywords.length,
    0,
  );

  if (successfulKeywordCount === 0) {
    throw new CommunityNewsServiceError(
      "산업 뉴스 검색 결과를 불러오지 못했습니다.",
    );
  }
  const itemsByIndustry = {};
  const industryMetadata = {};

  for (const result of industryResults) {
    const selection = selectCommunityNewsArticles(result.allArticles, {
      limit,
      now,
    });
    itemsByIndustry[result.industry] = selection.items;
    industryMetadata[result.industry] = {
      returnedCount: selection.returnedCount,
      periodDays: selection.periodDays,
      rawCount: result.rawCount,
      pagesFetched: result.pagesFetched,
      failedKeywords: result.failedKeywords,
    };
  }

  const allCandidates = deduplicateCommunityNewsArticles(
    Object.values(itemsByIndustry).flat(),
  );
  const allSelection = selectCommunityNewsArticles(allCandidates, { limit, now });

  return {
    itemsByIndustry,
    industryMetadata,
    allItems: allSelection.items,
    allMetadata: {
      returnedCount: allSelection.returnedCount,
      periodDays: allSelection.periodDays,
    },
  };
}

/**
 * 모든 사용자가 같은 초기 수집 결과를 짧게 재사용한다.
 * 캐시가 비어 있는 동시 요청도 하나의 수집 Promise를 공유해 중복 호출하지 않는다.
 */
async function getCachedCommunityNewsSnapshot(options = {}) {
  const now = options.now || new Date();
  const nowTime = now.getTime();

  if (
    cachedCommunityNewsSnapshot &&
    cachedCommunityNewsSnapshot.expiresAt > nowTime
  ) {
    return {
      snapshot: cachedCommunityNewsSnapshot.snapshot,
      cached: true,
      cachedAt: cachedCommunityNewsSnapshot.cachedAt,
    };
  }

  if (!pendingCommunityNewsSnapshot) {
    pendingCommunityNewsSnapshot = fetchAllCommunityNews({
      ...options,
      limit: COMMUNITY_NEWS_DEFAULT_LIMIT,
      now,
    })
      .then((snapshot) => {
        cachedCommunityNewsSnapshot = {
          snapshot,
          cachedAt: now.toISOString(),
          expiresAt: nowTime + COMMUNITY_NEWS_CACHE_TTL_MS,
        };
        return snapshot;
      })
      .finally(() => {
        pendingCommunityNewsSnapshot = null;
      });
  }

  const snapshot = await pendingCommunityNewsSnapshot;
  return {
    snapshot,
    cached: false,
    cachedAt: cachedCommunityNewsSnapshot.cachedAt,
  };
}

function clearCommunityNewsSnapshotCache() {
  cachedCommunityNewsSnapshot = null;
  pendingCommunityNewsSnapshot = null;
}

module.exports = {
  CommunityNewsServiceError,
  getCommunityNewsSource,
  normalizeCommunityNewsTitle,
  isExcludedCommunityNewsTitle,
  hasRequiredCommunityNewsTitleTerm,
  toCommunityNewsArticle,
  deduplicateCommunityNewsArticles,
  sortCommunityNewsByNewest,
  limitCommunityNewsPerSource,
  clampCommunityNewsLimit,
  isPublishedWithinDays,
  selectCommunityNewsArticles,
  fetchCommunityIndustryCandidates,
  fetchAllCommunityNews,
  getCachedCommunityNewsSnapshot,
  clearCommunityNewsSnapshotCache,
};
