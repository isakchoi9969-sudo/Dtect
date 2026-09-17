const {
  NewsServiceError,
  fetchAndPrepareNews,
  calculatePercentages,
} = require("../services/naverNews.service");
const { analyzeSentiments } = require("../services/aiClient.service");

/**
 * GET /api/news?query=카카오&page=1&per_page=20
 *
 * 1. 네이버 뉴스 API 로 기사 수집 (이 서버가 직접 처리 - 웹통신)
 * 2. 수집한 텍스트를 AI 서버(FastAPI)에 보내 감성분석 (내부 HTTP 호출)
 * 3. 결과를 조합해 응답
 */
async function getCompanyNews(req, res) {
  const query = (req.query.query || "").trim();
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = Math.min(parseInt(req.query.per_page, 10) || 20, 100);

  if (!query) {
    return res
      .status(422)
      .json({ success: false, message: "검색할 기업명을 입력해 주세요." });
  }

  try {
    const { totalResults, articles, analysisTexts } =
      await fetchAndPrepareNews(query, page, perPage);

    // 감성분석은 AI 서버(FastAPI)에 위임한다.
    const predictions = await analyzeSentiments(analysisTexts);

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

    const analyzedNews = articles.map((article, i) => {
      const prediction = predictions[i] || { label: "neutral", score: 0 };
      sentimentCounts[prediction.label] += 1;

      return {
        ...article,
        sentiment: prediction.label,
        score: Number(prediction.score.toFixed(4)),
      };
    });

    return res.json({
      query,
      page,
      per_page: perPage,
      total_results: totalResults,
      analyzed_count: analyzedNews.length,
      sentiment_summary: sentimentCounts,
      sentiment_percentages: calculatePercentages(sentimentCounts),
      news_list: analyzedNews,
    });
  } catch (error) {
    if (error instanceof NewsServiceError) {
      return res.status(500).json({ success: false, message: error.message });
    }

    console.error("뉴스 처리 오류:", error);
    return res.status(500).json({
      success: false,
      message: `AI 서버 감성분석 요청 실패: ${error.message}`,
    });
  }
}

module.exports = { getCompanyNews };
