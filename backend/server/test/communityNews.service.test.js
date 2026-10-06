const test = require("node:test");
const assert = require("node:assert/strict");
const { COMMUNITY_NEWS_SOURCES } = require("../src/config/communityNews.config");

const {
  getCommunityNewsSource,
  deduplicateCommunityNewsArticles,
  isExcludedCommunityNewsTitle,
  hasRequiredCommunityNewsTitleTerm,
  limitCommunityNewsPerSource,
  selectCommunityNewsArticles,
  toCommunityNewsArticle,
  getCachedCommunityNewsSnapshot,
  clearCommunityNewsSnapshotCache,
  fetchCommunityIndustryCandidates,
} = require("../src/services/communityNews.service");

test("커뮤니티 뉴스는 전용 화이트리스트의 원문 도메인만 식별한다", () => {
  assert.equal(COMMUNITY_NEWS_SOURCES.length, 40);
  assert.equal(
    getCommunityNewsSource("https://www.etnews.com/20261001000001").name,
    "전자신문",
  );
  assert.equal(
    getCommunityNewsSource("https://www.mediatoday.co.kr/news/articleView.html?idxno=1").name,
    "미디어오늘",
  );
  assert.equal(getCommunityNewsSource("https://example.com/news"), null);
});

test("최근 3일 결과가 부족하면 30일까지 확장하고 부족한 수만 반환한다", () => {
  const now = new Date("2026-10-01T12:00:00.000Z");
  const articles = [
    {
      sourceId: "etnews",
      title: "오늘 기사",
      link: "https://news.example/today",
      publishedAt: "2026-10-01T09:00:00.000Z",
    },
    {
      sourceId: "newsis",
      title: "20일 전 기사",
      link: "https://news.example/twenty-days",
      publishedAt: "2026-09-11T09:00:00.000Z",
    },
    {
      sourceId: "yna",
      title: "31일 전 기사",
      link: "https://news.example/thirty-one-days",
      publishedAt: "2026-08-31T09:00:00.000Z",
    },
  ];

  const result = selectCommunityNewsArticles(articles, { limit: 25, now });

  assert.equal(result.periodDays, 30);
  assert.equal(result.returnedCount, 2);
  assert.deepEqual(
    result.items.map((article) => article.title),
    ["오늘 기사", "20일 전 기사"],
  );
});

test("전체 산업 스냅샷은 캐시가 유효한 동안 네이버 요청을 재사용한다", async () => {
  clearCommunityNewsSnapshotCache();
  let requestCount = 0;
  const now = new Date("2026-10-01T12:00:00.000Z");
  const fetchNews = async (query) => {
    requestCount += 1;
    return {
      items: [
        {
          title: `${query} 기술 동향`,
          originallink: `https://www.etnews.com/${encodeURIComponent(query)}`,
          pubDate: "2026-10-01T09:00:00.000Z",
        },
      ],
    };
  };

  const first = await getCachedCommunityNewsSnapshot({ now, fetchNews });
  const countAfterFirstRequest = requestCount;
  const second = await getCachedCommunityNewsSnapshot({ now, fetchNews });

  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(requestCount, countAfterFirstRequest);
  assert.equal(first.snapshot.allItems.length > 0, true);
  clearCommunityNewsSnapshotCache();
});

test("커뮤니티 뉴스는 URL과 정규화한 제목 기준으로 중복을 제거한다", () => {
  const articles = [
    { title: "AI 기술 공개", link: "https://news.example/a" },
    { title: "AI 기술 공개", link: "https://news.example/b" },
    { title: "다른 기사", link: "https://news.example/a" },
  ];

  assert.deepEqual(deduplicateCommunityNewsArticles(articles), [articles[0]]);
});

test("명백한 판촉성 제목은 제외하고 언론사별 노출 수를 제한한다", () => {
  assert.equal(isExcludedCommunityNewsTitle("신제품 할인 프로모션 진행"), true);
  assert.equal(isExcludedCommunityNewsTitle("대통령 태양광 정책 발언"), true);
  assert.equal(isExcludedCommunityNewsTitle("대학 신재생에너지 학과 경쟁률"), true);
  assert.equal(isExcludedCommunityNewsTitle("신제품 기술 공개"), false);

  const articles = [
    { sourceId: "etnews", title: "1" },
    { sourceId: "etnews", title: "2" },
    { sourceId: "newsis", title: "3" },
  ];
  assert.deepEqual(limitCommunityNewsPerSource(articles, 1), [
    articles[0],
    articles[2],
  ]);
});

test("기사 제목의 산업 핵심어가 없으면 해당 태그 기사로 포함하지 않는다", () => {
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("조선", "제주 호텔 염소가스 누출 사고"),
    false,
  );
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("조선", "친환경 선박 수주 확대"),
    true,
  );
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("에너지", "반도체 산업 투자 확대"),
    false,
  );

  assert.equal(
    toCommunityNewsArticle(
      {
        title: "제주 호텔 염소가스 누출 사고",
        originallink: "https://biz.chosun.com/news/1",
        pubDate: "2026-10-01T09:00:00.000Z",
      },
      "조선",
    ),
    null,
  );
});

test("기술·연구 성과가 없는 AI 교육 기사는 제외한다", () => {
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("AI", "생성형 AI 모델 개발"),
    true,
  );
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("AI", "AI 기반 물류 플랫폼 출시"),
    true,
  );
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("AI", "AI 기술을 제조 현장에 도입"),
    true,
  );
  assert.equal(
    hasRequiredCommunityNewsTitleTerm("AI", "생성형 AI 실무교육"),
    false,
  );
  assert.equal(isExcludedCommunityNewsTitle("LG화학 생성형 AI 실무교육"), true);
  assert.equal(isExcludedCommunityNewsTitle("AI 기업 주가 급등"), true);
  assert.equal(isExcludedCommunityNewsTitle("AI 정책 관련 국회 공방"), true);
  assert.equal(isExcludedCommunityNewsTitle("생성형 AI 기술 개발"), false);

  assert.equal(
    toCommunityNewsArticle(
      {
        title: "LG화학, 육군 간부 대상 생성형 AI 실무교육",
        originallink: "https://www.etnews.com/20261001000001",
        pubDate: "2026-10-01T09:00:00.000Z",
      },
      "AI",
    ),
    null,
  );
});

test("30일 내 기사가 부족하면 검색어별 다음 네이버 페이지를 수집한다", async () => {
  const requestedPages = [];
  const now = new Date("2026-10-01T12:00:00.000Z");
  const invalidFirstPage = Array.from({ length: 30 }, (_, index) => ({
    title: `일반 소식 ${index}`,
    originallink: `https://www.etnews.com/invalid-${index}`,
    pubDate: "2026-10-01T09:00:00.000Z",
  }));
  const validSecondPage = Array.from({ length: 25 }, (_, index) => ({
    title: `AI 기술 개발 ${index}`,
    originallink: `https://www.etnews.com/patent-${index}`,
    pubDate: "2026-09-15T09:00:00.000Z",
  }));
  const fetchNews = async (_query, page) => {
    requestedPages.push(page);
    return { items: page === 1 ? invalidFirstPage : validSecondPage };
  };

  const result = await fetchCommunityIndustryCandidates("AI", {
    fetchNews,
    now,
  });

  assert.equal(requestedPages.includes(2), true);
  assert.equal(result.pagesFetched > 5, true);
  assert.equal(result.allArticles.length >= 25, true);
});
