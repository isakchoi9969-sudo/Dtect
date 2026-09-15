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

// 🟢 테스트 주소 ---------------------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "프론트엔드와 백엔드 연결 성공!" });
});

// 🟢 회원가입 요청 처리 API (임시)
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  console.log("받은 회원가입 데이터:", { name, email, password });

  // 간단한 비밀번호 일치 검증
  if (password !== passwordConfirm) {
    return res
      .status(400)
      .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  }

  res.json({ success: true, message: "회원가입이 성공적으로 완료되었습니다!" });
});

// 🟢 로그인 요청 처리 API (임시 테스트 계정: admin@company.com / 12345678)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  console.log("받은 로그인 데이터:", { email, password });

  // 임시 관리자 계정 검증
  if (email === "admin@company.com" && password === "12345678") {
    res.json({
      success: true,
      message: "로그인 성공!",
      user: { email: "admin@company.com", name: "관리자" },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js 서버 실행 중: http://localhost:${PORT}`);
});
