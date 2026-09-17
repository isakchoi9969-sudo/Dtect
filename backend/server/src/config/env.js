const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const serverEnvPath = path.join(__dirname, "../../.env");
dotenv.config({ path: serverEnvPath });

// 통합 FastAPI 구조에서 분리 구조로 옮기는 동안, server/.env가 없을 때만
// 기존 backend/.env의 DB·네이버 API 설정을 선택적으로 재사용한다.
// PORT는 가져오지 않아 Node 서버의 기본 포트 3000을 유지한다.
if (!fs.existsSync(serverEnvPath)) {
  const legacyEnvPath = path.join(__dirname, "../../../.env");

  if (fs.existsSync(legacyEnvPath)) {
    const legacyEnv = dotenv.parse(fs.readFileSync(legacyEnvPath));
    const reusableKeys = [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
      "NAVER_CLIENT_ID",
      "NAVER_CLIENT_SECRET",
      "NEWS_CACHE_TTL_SECONDS",
      "NEWS_COLLECTION_COMPANIES",
      "NEWS_COLLECTION_PER_PAGE",
    ];

    for (const key of reusableKeys) {
      if (!process.env[key] && legacyEnv[key] !== undefined) {
        process.env[key] = legacyEnv[key];
      }
    }
  }
}

function getNonNegativeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function getIntegerInRange(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}

function getCommaSeparatedValues(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = {
  port: process.env.PORT || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  aiServerUrl: process.env.AI_SERVER_URL || "http://localhost:6000",

  newsCacheTtlSeconds: getNonNegativeInteger(
    process.env.NEWS_CACHE_TTL_SECONDS,
    300,
  ),

  newsCollectionCompanies: getCommaSeparatedValues(
    process.env.NEWS_COLLECTION_COMPANIES,
  ),
  newsCollectionPerPage: getIntegerInRange(
    process.env.NEWS_COLLECTION_PER_PAGE,
    100,
    1,
    100,
  ),

  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  naver: {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  },
};
