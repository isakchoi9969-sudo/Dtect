const express = require("express");
const cors = require("cors");
const { port, frontendOrigin } = require("./config/env");
const { pool } = require("./db/pool");

const favoriteCompanyRoutes = require("./routes/favoriteCompany.routes");
const authRoutes = require("./routes/auth.routes");
const newsRoutes = require("./routes/news.routes");
const companyRoutes = require("./routes/company.routes");
const healthRoutes = require("./routes/health.routes");
const simulatorRoutes = require("./routes/simulator.routes");
const responseDraftRoutes = require("./routes/responseDraft.routes");
const savedCaseRoutes = require("./routes/savedCase.routes");
const communityRoutes = require("./routes/community.routes");
const communityFreeRoutes = require("./routes/communityFree.routes");

const {
  startWatchlistAnalysisScheduler,
} = require("./services/watchlistAnalysis.scheduler");

const app = express();

// 개발 환경에서는 localhost와 같은 네트워크의 프론트엔드 접속을 허용합니다.
app.use(
  cors({
    origin(origin, callback) {
      // 브라우저 Origin이 없는 요청 또는 기존 localhost 접속
      if (!origin || origin === frontendOrigin) {
        return callback(null, true);
      }

      try {
        const url = new URL(origin);

        // 개발 서버의 5173 포트에서 들어오는 요청 허용
        if (url.protocol === "http:" && url.port === "5173") {
          return callback(null, true);
        }
      } catch {
        // 잘못된 Origin은 아래에서 거부
      }

      return callback(new Error("허용되지 않은 Origin입니다."));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/favorite-company", favoriteCompanyRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use("/api", healthRoutes);
app.use("/api/response-drafts", responseDraftRoutes);
app.use("/api/saved-cases", savedCaseRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/community/free", communityFreeRoutes);

// 프론트엔드 빌드 결과물을 이 서버에서 함께 서빙하려면 아래 주석을 해제하세요.
// const path = require("path");
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
// });

const server = app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  // 관심기업 뉴스 분석을 매시간 정각에 자동 실행합니다.
  startWatchlistAnalysisScheduler();
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log(`${signal} 신호를 받아 백엔드 서버를 종료합니다.`);

  // 종료가 무한정 대기하지 않도록 5초 뒤에는 프로세스를 끝낸다.
  const forceExitTimer = setTimeout(() => {
    console.error("백엔드 종료 시간이 초과되어 강제 종료합니다.");
    process.exit(1);
  }, 5000);

  server.close(async (serverError) => {
    try {
      await pool.end();
    } catch (poolError) {
      console.error("DB 연결 풀 종료 실패:", poolError);
    } finally {
      clearTimeout(forceExitTimer);
      process.exit(serverError ? 1 : 0);
    }
  });
}

server.on("error", (error) => {
  console.error("백엔드 서버 시작 실패:", error.message);
  process.exit(1);
});

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
