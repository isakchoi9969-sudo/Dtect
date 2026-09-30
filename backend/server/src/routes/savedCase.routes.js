const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  createSavedCase,
  getSavedCases,
  getSavedCaseStatus,
  deleteSavedCase,
  deleteSavedCaseByKey,
} = require("../controllers/savedCase.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/", getSavedCases);
router.post("/status", getSavedCaseStatus);
router.post("/", createSavedCase);
router.delete("/by-key/:caseKey", deleteSavedCaseByKey);
router.delete("/:savedCaseId", deleteSavedCase);

module.exports = router;
