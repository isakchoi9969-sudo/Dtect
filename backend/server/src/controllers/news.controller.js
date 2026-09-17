const {
  NewsServiceError,
} = require("../services/naverNews.service");
const { analyzeCompanyNews } = require("../services/newsAnalysis.service");

/**
 * GET /api/news?query=카카오
 *
 * 항상 최신순 최대 100건을 네이버 뉴스 API에서 조회하고,
 * AI 감성분석 결과를 저장하지 않고 즉시 응답한다.
 */
async function getCompanyNews(req, res) {
  const query = (req.query.query || "").trim();

  if (!query) {
    return res
      .status(422)
      .json({ success: false, message: "검색할 기업명을 입력해 주세요." });
  }

  try {
    return res.json(await analyzeCompanyNews(query, 1, 100));
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
