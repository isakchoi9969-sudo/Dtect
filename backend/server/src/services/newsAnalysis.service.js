const {
  fetchAndPrepareNews,
  calculatePercentages,
  MIN_COMPANY_MENTIONS,
} = require("./naverNews.service");
const { analyzeSentiments } = require("./aiClient.service");

async function analyzeCompanyNews(query, page, perPage) {
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
    sentiment_percentages: calculatePercentages(sentimentCounts),
    analyzed_at: new Date().toISOString(),
    latest_article_published_at: analyzedNews[0]?.pub_date || null,
    news_list: analyzedNews,
  };

  return result;
}

module.exports = { analyzeCompanyNews };
