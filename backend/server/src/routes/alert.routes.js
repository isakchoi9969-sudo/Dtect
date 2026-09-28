const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  saveAnalysisSnapshot,
  getRiskSurgeAlerts,
  getMajorIssueAlerts,
} = require("../services/alert.service");

const router = express.Router();

router.use(requireAuth);

// 기업 상세 분석이 끝난 후 분석 이력과 알림을 저장합니다.
router.post("/snapshot", async (req, res) => {
  const companyId = Number(req.body.companyId);

  if (!Number.isInteger(companyId) || companyId < 1) {
    return res.status(400).json({
      success: false,
      message: "올바른 기업 ID가 필요합니다.",
    });
  }

  try {
    const result = await saveAnalysisSnapshot(req.authUserId, companyId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("분석 이력 저장 실패:", error.message);

    return res.status(500).json({
      success: false,
      message: "분석 이력을 저장하지 못했습니다.",
    });
  }
});

// 위험도 급상승 알림 목록
router.get("/risk-surge", async (req, res) => {
  try {
    const data = await getRiskSurgeAlerts(req.authUserId, req.query.hours);

    return res.json({ success: true, data });
  } catch (error) {
    console.error("위험도 급상승 알림 조회 실패:", error.message);

    return res.status(500).json({
      success: false,
      message: "위험도 급상승 알림을 불러오지 못했습니다.",
    });
  }
});

// 주요 이슈 발생 알림 목록
router.get("/major-issue", async (req, res) => {
  try {
    const data = await getMajorIssueAlerts(req.authUserId, req.query.hours);

    return res.json({ success: true, data });
  } catch (error) {
    console.error("주요 이슈 발생 알림 조회 실패:", error.message);

    return res.status(500).json({
      success: false,
      message: "주요 이슈 발생 알림을 불러오지 못했습니다.",
    });
  }
});

module.exports = router;
