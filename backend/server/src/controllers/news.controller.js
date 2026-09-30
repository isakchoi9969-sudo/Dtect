const { getIndustryIssues } = require("../services/industryIssue.service");

const { NewsServiceError } = require("../services/naverNews.service");
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

// GET /api/news/industry-issues?industry=IT·통신·플랫폼
async function getIndustryIssueList(req, res) {
  const industry = (req.query.industry || "").trim();

  if (!industry) {
    return res.status(422).json({
      success: false,
      message: "산업을 선택해 주세요.",
    });
  }

  try {
    const issues = await getIndustryIssues(industry);

    return res.json({
      success: true,
      industry,
      issues,
    });
  } catch (error) {
    console.error("산업별 이슈 조회 오류:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });

    return res.status(500).json({
      success: false,
      message: "산업별 분석 이슈를 불러오지 못했습니다.",
    });
  }
}

module.exports = {
  getCompanyNews,
  getIndustryIssueList,
};
