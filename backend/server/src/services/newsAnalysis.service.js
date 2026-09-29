const {
  fetchAndPrepareNews,
  calculatePercentages,
  MIN_COMPANY_MENTIONS,
} = require("./naverNews.service");
const { analyzeSentiments } = require("./aiClient.service");

const { persistNewsAnalysis } = require("./newsHistory.service");

function getRiskLevel(riskScore) {
  if (riskScore >= 75) return "심각";
  if (riskScore >= 50) return "높음";
  if (riskScore >= 25) return "주의";
  return "낮음";
}

async function analyzeCompanyNews(query, page, perPage) {
  const startedAt = performance.now();
  const {
    totalResults,
    articles,
    analysisTexts,
    fetchedCount,
    pagesFetched,
    sourceFilteredCount,
    mentionFilteredCount,
    duplicateCount,
  } = await fetchAndPrepareNews(query, page, perPage);
  const fetchedAt = performance.now();
  const predictions = await analyzeSentiments(analysisTexts);
  const analyzedAt = performance.now();
  console.info("[news-analysis]", {
    articles: articles.length,
    newsFetchMs: Math.round(fetchedAt - startedAt),
    sentimentMs: Math.round(analyzedAt - fetchedAt),
    totalMs: Math.round(analyzedAt - startedAt),
  });
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

  // 감성 분석한 기사 결과를 기존 NEWS_ARTICLE_ANALYSIS 테이블에 저장합니다.
  // 같은 기사는 ARTICLE_HASH 기준으로 중복 저장되지 않습니다.
  await persistNewsAnalysis(query, analyzedNews);

  const sentimentPercentages = calculatePercentages(sentimentCounts);
  const riskScore = Number(
    Number(sentimentPercentages.negative ?? 0).toFixed(1),
  );

  function getRiskLevel(score) {
    if (score >= 75) return "심각";
    if (score >= 50) return "높음";
    if (score >= 25) return "주의";
    return "낮음";
  }

  const riskLevel = getRiskLevel(riskScore);

  const result = {
    query,
    page,
    per_page: perPage,
    total_results: totalResults,
    fetched_count: fetchedCount,
    pages_fetched: pagesFetched,
    relevant_count: articles.length,
    source_filtered_count: sourceFilteredCount,
    mention_filtered_count: mentionFilteredCount,
    duplicate_count: duplicateCount,
    processed_count:
      articles.length +
      sourceFilteredCount +
      mentionFilteredCount +
      duplicateCount,
    target_reached: articles.length === perPage,
    minimum_keyword_mentions: MIN_COMPANY_MENTIONS,
    analyzed_count: analyzedNews.length,
    sentiment_summary: sentimentCounts,
    sentiment_percentages: sentimentPercentages,
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_score: Number(
      Number(calculatePercentages(sentimentCounts).negative ?? 0).toFixed(1),
    ),
    risk_level: getRiskLevel(
      Number(calculatePercentages(sentimentCounts).negative ?? 0),
    ),
    analyzed_at: new Date().toISOString(),
    latest_article_published_at: analyzedNews[0]?.pub_date || null,
    news_list: analyzedNews,
  };

  return result;
}

module.exports = { analyzeCompanyNews };
