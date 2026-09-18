const express = require("express");
const cors = require("cors");
const { port, frontendOrigin } = require("./config/env");
const { pool } = require("./db/pool");

const authRoutes = require("./routes/auth.routes");
const newsRoutes = require("./routes/news.routes");
const companyRoutes = require("./routes/company.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

// 프론트엔드에서 오는 요청만 허용 (쿠키/인증 헤더를 주고받으려면 origin을 정확히 명시)
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/company", companyRoutes);
app.use("/api", healthRoutes);

// 프론트엔드 빌드 결과물을 이 서버에서 함께 서빙하려면 아래 주석을 해제하세요.
// const path = require("path");
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
// });

const server = app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
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
