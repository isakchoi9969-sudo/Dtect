const axios = require("axios");
const { naver } = require("../config/env");

const NAVER_NEWS_URL = "https://naverapihub.apigw.ntruss.com/search/v1/news";
const HTML_TAG_PATTERN = /<[^>]+>/g;

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
    throw new NewsServiceError("네이버 뉴스 API에 연결하지 못했습니다.");
  }
}

/**
 * 뉴스를 수집하고, AI 서버에 보낼 분석용 텍스트까지 준비한다.
 * 감성분석 자체는 하지 않는다 (그건 aiClient.service.js 가 담당).
 */
async function fetchAndPrepareNews(query, page, perPage) {
  const trimmedQuery = (query || "").trim();

  if (!trimmedQuery) {
    throw new NewsServiceError("검색할 기업명을 입력해 주세요.");
  }

  const data = await fetchNaverNews(trimmedQuery, page, perPage);
  const items = data.items || [];

  const articles = [];
  const analysisTexts = [];

  for (const item of items) {
    const title = cleanNaverText(item.title);
    const description = cleanNaverText(item.description);

    if (!title && !description) continue;

    articles.push({
      title,
      description,
      link: item.link || "",
      original_link: item.originallink || "",
      pub_date: item.pubDate || "",
    });

    // 제목만 분석하지 않고 제목과 요약문을 함께 분석한다.
    analysisTexts.push(`${title}. ${description}`);
  }

  return {
    totalResults: data.total || 0,
    articles,
    analysisTexts,
  };
}

module.exports = {
  NewsServiceError,
  fetchAndPrepareNews,
  calculatePercentages,
};
