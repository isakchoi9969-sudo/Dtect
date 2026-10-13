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
    ];

    for (const key of reusableKeys) {
      if (!process.env[key] && legacyEnv[key] !== undefined) {
        process.env[key] = legacyEnv[key];
      }
    }
  }
}

const isProduction = process.env.NODE_ENV === "production";
const developmentTokenSecret = "dtect-local-development-token-secret-change-before-deploy";
const demoMode = process.env.DEMO_MODE === "true";

module.exports = {
  port: process.env.PORT || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  aiServerUrl: process.env.AI_SERVER_URL || "http://localhost:8000",

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

  auth: {
    tokenSecret: process.env.AUTH_TOKEN_SECRET || developmentTokenSecret,
    tokenMaxAgeSeconds: Number(process.env.AUTH_TOKEN_MAX_AGE_SECONDS) || 60 * 60 * 24 * 7,
    isProduction,
  },

  // 시연 환경은 물론, 명시적으로 허용한 경우에만 실제 분석 이력·위험 알림을 생성한다.
  // OpenAI 비용과 이메일 발송이 수반될 수 있는 자동 알림은 기본 비활성화다.
  automatedAlertsEnabled:
    !demoMode && process.env.ENABLE_AUTOMATED_ALERTS === "true",

  // 관심기업 정기 뉴스 분석은 명시적으로 켠 환경에서만 등록합니다.
  // 시연 환경에서는 뉴스 수집·로컬 감성분석도 주기적으로 실행하지 않습니다.
  watchlistSchedulerEnabled:
    process.env.ENABLE_WATCHLIST_SCHEDULER === "true",
};
