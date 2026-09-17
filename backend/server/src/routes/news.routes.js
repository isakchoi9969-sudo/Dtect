const express = require("express");
const { getCompanyNews } = require("../controllers/news.controller");

const router = express.Router();

router.get("/", getCompanyNews);

module.exports = router;
