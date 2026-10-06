const express = require("express");
const {
  getCompanyQuote,
  getCompanyRiskAssessment,
  getCompanyQuoteHistory,
  getCompanyRelations,
  getCompanies,
  getMarketIndices,
  searchCompany,
  saveCompanyAnalysisSnapshot,
  getRiskSurgeAlerts,
} = require("../controllers/company.controller");

const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getCompanies);
router.get("/search", searchCompany);
router.get("/market-indices", getMarketIndices);
// 주의: /:companyId 경로보다 먼저 작성해야 합니다.
router.get("/risk-surge", requireAuth, getRiskSurgeAlerts);

// 기업 분석 완료 후 관심기업 분석 이력 저장
router.post(
  "/:companyId/analysis-snapshots",
  requireAuth,
  saveCompanyAnalysisSnapshot,
);
router.get("/:companyId/quote", getCompanyQuote);
router.post("/:companyId/risk-assessment", getCompanyRiskAssessment);
router.get("/:companyId/quote-history", getCompanyQuoteHistory);
router.get("/:companyId/related", getCompanyRelations);
router.post("/:companyId/related", getCompanyRelations);

module.exports = router;
