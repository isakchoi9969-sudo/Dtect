const express = require("express");
const axios = require("axios");
const { checkDbConnection, getCompanyCount } = require("../db/pool");
const { aiServerUrl } = require("../config/env");

const router = express.Router();

// 프론트-백엔드 연결 확인용
router.get("/test", (req, res) => {
  res.json({ message: "프론트엔드와 백엔드 연결 성공!" });
});

router.get("/health/db", async (req, res) => {
  try {
    const dbName = await checkDbConnection();
    res.json({ success: true, message: "DB 연결 성공", database: dbName });
  } catch (error) {
    res.json({ success: false, message: "DB 연결 실패", error: error.message });
  }
});

// AI 서버(FastAPI) 생존 확인용
router.get("/health/ai", async (req, res) => {
  try {
    const response = await axios.get(`${aiServerUrl}/api/ai/health`, {
      timeout: 5000,
    });
    res.json({ success: true, message: "AI 서버 연결 성공", detail: response.data });
  } catch (error) {
    res.json({ success: false, message: "AI 서버 연결 실패", error: error.message });
  }
});

router.get("/test/company-count", async (req, res) => {
  try {
    const count = await getCompanyCount();
    res.json({ success: true, company_count: count });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
