const express = require("express");
const {
  getCaseSummary,
  getSimilarCases,
} = require("../controllers/simulator.controller");

const router = express.Router();

router.post("/cases", getSimilarCases);
router.post("/cases/summary", getCaseSummary);

module.exports = router;
