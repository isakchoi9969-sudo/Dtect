const express = require("express");
const cors = require("cors");
const { port, frontendOrigin } = require("./config/env");

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

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

module.exports = app;
