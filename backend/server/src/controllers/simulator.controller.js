const { simulateSimilarCases } = require("../services/simulatorPipeline.service");

/** POST /api/simulator/cases */
async function getSimilarCases(req, res) {
  const title = String(req.body?.title || "").trim();
  const content = String(req.body?.content || "").trim();
  const majorCategory = String(req.body?.majorCategory || "").trim() || null;
  const minorCategory = String(req.body?.minorCategory || "").trim() || null;
  const currentIndustry = String(req.body?.currentIndustry || "").trim() || null;

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

module.exports = { getSimilarCases };
