const {
  NewsServiceError,
} = require("../services/naverNews.service");
const { analyzeCompanyNews } = require("../services/newsAnalysis.service");
const {
  getSentimentTrend,
  persistNewsAnalysis,
} = require("../services/newsHistory.service");

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
    return res.json(await analyzeCompanyNews(query, page, perPage));
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

async function getCompanySentimentTrend(req, res) {
  const query = (req.query.query || "").trim();
  const requestedDays = Number.parseInt(req.query.days, 10);
  const days = Math.min(Math.max(requestedDays || 30, 7), 180);

  if (!query) {
    return res
      .status(422)
      .json({ success: false, message: "검색할 기업명을 입력해 주세요." });
  }

  try {
    const trend = await getSentimentTrend(query, days);
    return res.json({ query, days, trend });
  } catch (error) {
    console.error("감성 추이 조회 오류:", error);
    return res.status(503).json({
      success: false,
      message: "감성 추이 데이터를 불러오지 못했습니다.",
    });
  }
}

module.exports = { getCompanyNews, getCompanySentimentTrend };
