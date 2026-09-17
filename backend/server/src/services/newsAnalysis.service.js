const {
  fetchAndPrepareNews,
  calculatePercentages,
} = require("./naverNews.service");
const { analyzeSentiments } = require("./aiClient.service");
const {
  cacheNewsAnalysis,
  getCachedNewsAnalysis,
  makeNewsCacheKey,
} = require("./newsCache.service");
const { persistNewsAnalysis } = require("./newsHistory.service");
const { newsCacheTtlSeconds } = require("../config/env");

async function analyzeCompanyNews(query, page, perPage) {
  const cacheKey = makeNewsCacheKey(query, page, perPage);
  const cachedResult = getCachedNewsAnalysis(cacheKey);
  if (cachedResult) return cachedResult;

  const { totalResults, articles, analysisTexts } =
    await fetchAndPrepareNews(query, page, perPage);
  const predictions = await analyzeSentiments(analysisTexts);
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  const analyzedNews = articles.map((article, index) => {
    const prediction = predictions[index] || { label: "neutral", score: 0 };
    const sentiment = Object.hasOwn(sentimentCounts, prediction.label)
      ? prediction.label
      : "neutral";

    sentimentCounts[sentiment] += 1;

    return {
      ...article,
      sentiment,
      score: Number(Number(prediction.score).toFixed(4)),
    };
  });

  const result = {
    query,
    page,
    per_page: perPage,
    total_results: totalResults,
    analyzed_count: analyzedNews.length,
    sentiment_summary: sentimentCounts,
    sentiment_percentages: calculatePercentages(sentimentCounts),
    news_list: analyzedNews,
  };

  // 저장 실패는 저장 서비스 내부에서 처리하므로 뉴스 분석 결과는 계속 반환한다.
  await persistNewsAnalysis(query, analyzedNews);
  cacheNewsAnalysis(cacheKey, result, newsCacheTtlSeconds);

  return result;
}

module.exports = { analyzeCompanyNews };
