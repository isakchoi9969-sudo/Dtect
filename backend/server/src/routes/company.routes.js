const express = require("express");
const {
  getCompanyQuote,
  getCompanyRiskAssessment,
  getCompanyQuoteHistory,
  getCompanyRelations,
  getCompanies,
  getMarketIndices,
  searchCompany,
} = require("../controllers/company.controller");

const router = express.Router();

router.get("/", getCompanies);
router.get("/search", searchCompany);
router.get("/market-indices", getMarketIndices);
router.get("/:companyId/quote", getCompanyQuote);
router.post("/:companyId/risk-assessment", getCompanyRiskAssessment);
router.get("/:companyId/quote-history", getCompanyQuoteHistory);
router.get("/:companyId/related", getCompanyRelations);
router.post("/:companyId/related", getCompanyRelations);

module.exports = router;
