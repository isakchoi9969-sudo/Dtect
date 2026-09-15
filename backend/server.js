const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// CORS 설정 (프론트엔드 3000번 포트 허용)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Node.js 서버 실행 중: http://localhost:${PORT}`);
});
