const express = require("express");
const {
  getCompanyNews,
  getCompanySentimentTrend,
} = require("../controllers/news.controller");

const router = express.Router();

router.get("/trend", getCompanySentimentTrend);
router.get("/", getCompanyNews);

module.exports = router;
