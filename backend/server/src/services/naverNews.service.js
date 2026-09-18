const axios = require("axios");
const { naver } = require("../config/env");
const { getApprovedNewsSource } = require("../config/approvedNewsSources");

const NAVER_NEWS_URL = "https://naverapihub.apigw.ntruss.com/search/v1/news";
const HTML_TAG_PATTERN = /<[^>]+>/g;
const NEWS_PAGE_SIZE = 100;
const MAX_NEWS_PAGES = 10;
const MAX_RAW_NEWS = NEWS_PAGE_SIZE * MAX_NEWS_PAGES;
const TARGET_RELEVANT_NEWS = 100;
const MIN_COMPANY_MENTIONS = 3;

class NewsServiceError extends Error {}

/**
 * 네이버 검색 결과의 HTML 태그와 특수문자를 정리한다.
 * 예: <b>카카오</b> &quot;실적&quot; → 카카오 "실적"
 */
function cleanNaverText(value) {
  if (!value) return "";

  const decoded = value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  return decoded.replace(HTML_TAG_PATTERN, "").trim();
}

/**
 * 긍정·중립·부정 개수를 백분율로 변환한다.
 * 반올림 오차는 negative 에서 보정해 합계가 100이 되도록 한다.
 */
function calculatePercentages(counts) {
  const total = counts.positive + counts.neutral + counts.negative;

  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }

  const positive = Math.round((counts.positive / total) * 100);
  const neutral = Math.round((counts.neutral / total) * 100);
  const negative = 100 - positive - neutral;

  return { positive, neutral, negative };
}

function countKeywordOccurrences(text, keyword) {
  const normalizedKeyword = (keyword || "").trim().toLocaleLowerCase("ko-KR");
  if (!normalizedKeyword) return 0;

  return (
    text.toLocaleLowerCase("ko-KR").split(normalizedKeyword).length - 1
  );
}

function makeArticleIdentifier(article) {
  return (
    article.original_link ||
    article.link ||
    `${article.title}|${article.description}|${article.pub_date}`
  );
}

async function fetchNaverNews(query, page, perPage) {
  if (!naver.clientId || !naver.clientSecret) {
    throw new NewsServiceError(
      "NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET이 설정되지 않았습니다."
    );
  }

  const startIndex = (page - 1) * perPage + 1;

  if (startIndex > 1000) {
    throw new NewsServiceError(
      "네이버 뉴스 검색은 1000번째 결과까지만 조회할 수 있습니다."
    );
  }

  try {
    const response = await axios.get(NAVER_NEWS_URL, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": naver.clientId,
        "X-NCP-APIGW-API-KEY": naver.clientSecret,
      },
      params: {
        query,
        display: perPage,
        start: startIndex,
        sort: "date",
        format: "json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (error instanceof NewsServiceError) throw error;

    // 인증 헤더 값은 로그에 남기지 않는다. 네이버가 반환한 상태와 오류 본문만
    // 남겨 설정/권한/호출 한도/네트워크 문제를 구분할 수 있게 한다.
    console.error("네이버 뉴스 API 요청 실패:", {
      status: error.response?.status || null,
      response: error.response?.data || null,
      code: error.code || null,
      message: error.message,
    });

    throw new NewsServiceError("네이버 뉴스 API에 연결하지 못했습니다.");
  }
}

/**
 * 뉴스를 수집하고, AI 서버에 보낼 분석용 텍스트까지 준비한다.
 * 감성분석 자체는 하지 않는다 (그건 aiClient.service.js 가 담당).
 */
async function fetchAndPrepareNews(query, page = 1) {
  const trimmedQuery = (query || "").trim();

  if (!trimmedQuery) {
    throw new NewsServiceError("검색할 기업명을 입력해 주세요.");
  }

  const articles = [];
  const analysisTexts = [];
  const seenArticleIds = new Set();
  let totalResults = 0;
  let fetchedCount = 0;
  let pagesFetched = 0;
  let sourceFilteredCount = 0;
  let mentionFilteredCount = 0;
  let duplicateCount = 0;

  for (
    let currentPage = Math.max(page, 1);
    currentPage <= MAX_NEWS_PAGES;
    currentPage += 1
  ) {
    const data = await fetchNaverNews(
      trimmedQuery,
      currentPage,
      NEWS_PAGE_SIZE,
    );
    const items = data.items || [];

    if (pagesFetched === 0) {
      totalResults = data.total || 0;
    }

    pagesFetched += 1;
    fetchedCount += items.length;

    for (const item of items) {
      // 네이버 검색 결과의 원문 링크 기준으로, 합의한 26개 언론사 기사만 분석한다.
      // `link`는 네이버 경유 주소이므로 반드시 `originallink`를 우선 사용한다.
      const approvedSource = getApprovedNewsSource(item.originallink);

      if (!approvedSource) {
        sourceFilteredCount += 1;
        continue;
      }

      const title = cleanNaverText(item.title);
      const description = cleanNaverText(item.description);

      if (!title && !description) {
        mentionFilteredCount += 1;
        continue;
      }

      const mentionCount = countKeywordOccurrences(
        `${title} ${description}`,
        trimmedQuery,
      );

      if (mentionCount < MIN_COMPANY_MENTIONS) {
        mentionFilteredCount += 1;
        continue;
      }

      const article = {
        title,
        description,
        link: item.link || "",
        original_link: item.originallink || "",
        pub_date: item.pubDate || "",
        // 프론트는 도메인을 다시 해석하지 않고 이 정보를 그대로 표시할 수 있다.
        source: {
          id: approvedSource.id,
          name: approvedSource.name,
        },
      };
      const articleId = makeArticleIdentifier(article);

      if (seenArticleIds.has(articleId)) {
        duplicateCount += 1;
        continue;
      }

      seenArticleIds.add(articleId);
      articles.push(article);

      // 제목만 분석하지 않고 제목과 요약문을 함께 분석한다.
      analysisTexts.push(`${title}. ${description}`);

      if (articles.length === TARGET_RELEVANT_NEWS) break;
    }

    if (
      articles.length === TARGET_RELEVANT_NEWS ||
      items.length < NEWS_PAGE_SIZE
    ) {
      break;
    }
  }

  return {
    totalResults,
    articles,
    analysisTexts,
    fetchedCount,
    pagesFetched,
    sourceFilteredCount,
    mentionFilteredCount,
    duplicateCount,
  };
}

module.exports = {
  NewsServiceError,
  fetchAndPrepareNews,
  calculatePercentages,
  countKeywordOccurrences,
  makeArticleIdentifier,
  NEWS_PAGE_SIZE,
  MAX_NEWS_PAGES,
  MAX_RAW_NEWS,
  TARGET_RELEVANT_NEWS,
  MIN_COMPANY_MENTIONS,
};
