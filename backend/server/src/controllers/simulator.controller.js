const { simulateSimilarCases } = require("../services/simulatorPipeline.service");
const { generateCaseSummary } = require("../services/aiClient.service");

/** POST /api/simulator/cases */
async function getSimilarCases(req, res) {
  const title = String(req.body?.title || "").trim();
  const content = String(req.body?.content || "").trim();
  const majorCategory = String(req.body?.majorCategory || "").trim() || null;
  const minorCategory = String(req.body?.minorCategory || "").trim() || null;
  const currentIndustry = String(req.body?.currentIndustry || "").trim() || null;
  const includeDiagnostics = req.body?.debug === true;

  if (!title && !majorCategory && !minorCategory) {
    return res.status(422).json({
      success: false,
      message: "이슈명 또는 사례 유형을 하나 이상 선택해 주세요.",
    });
  }

  try {
    const searchTitle = title || minorCategory || majorCategory;
    const result = await simulateSimilarCases(searchTitle, content, {
      currentIndustry,
      majorCategory,
      minorCategory,
      includeDiagnostics,
    });
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error("과거 유사사례 시뮬레이션 실패:", error);
    return res.status(500).json({
      success: false,
      message: "과거 유사사례를 조회하지 못했습니다.",
    });
  }
}

/** POST /api/simulator/cases/summary - 선택 사례의 벡터 검색 기사들을 즉시 요약한다. */
async function getCaseSummary(req, res) {
  const caseTitle = String(req.body?.caseTitle || "").trim();
  const companyName = String(req.body?.companyName || "").trim();
  const articles = (Array.isArray(req.body?.articles) ? req.body.articles : [])
    .slice(0, 4)
    .map((article, index) => ({
      id: String(article?.id || `A${index + 1}`).slice(0, 32),
      title: String(article?.title || "").trim().slice(0, 500),
      summary: String(article?.summary || "").slice(0, 1600),
      published_at: String(article?.publishedAt || "").slice(0, 50),
      press: String(article?.press || "").slice(0, 100),
    }));

  if (caseTitle.length < 2 || articles.length < 1 || articles.some((article) => !article.title)) {
    return res.status(422).json({
      success: false,
      message: "사건명과 기사 한 건 이상이 필요합니다.",
    });
  }

  try {
    const result = await generateCaseSummary({
      case_title: caseTitle,
      company_name: companyName,
      articles,
    });
    return res.json({ success: true, summary: result.data });
  } catch (error) {
    const status = error.response?.status === 503 ? 503 : 502;
    return res.status(status).json({
      success: false,
      message: error.response?.data?.detail || error.message || "AI 사건 요약을 생성하지 못했습니다.",
    });
  }
}

module.exports = { getCaseSummary, getSimilarCases };
