const express = require("express");
const {
  getCompanyNews,
  getIndustryIssueList,
  getAllCommunityNews,
} = require("../controllers/news.controller");

const router = express.Router();

// /:query 같은 일반 경로보다 먼저 선언합니다.
router.get("/industry-issues", getIndustryIssueList);
router.get("/community/all", getAllCommunityNews);

router.get("/", getCompanyNews);

module.exports = router;
