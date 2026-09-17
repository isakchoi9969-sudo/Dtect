const bcrypt = require("bcryptjs");
const { pool } = require("../db/pool");

// 회원가입 DB 연동 전까지만 사용하는 임시 저장소.
// (기존 FastAPI 의 _fake_users_db 와 동일한 역할, 서버 재시작 시 초기화됨)
const fakeUsersDb = new Map();

/**
 * POST /api/auth/signup
 * 아직 DB에 저장하지 않고 기존 임시 방식을 그대로 유지.
 */
async function signup(req, res) {
  const { name, email, password, passwordConfirm } = req.body || {};

  if (!name || !email || !password || !passwordConfirm) {
    return res
      .status(422)
      .json({ success: false, message: "이름, 이메일, 비밀번호를 모두 입력해 주세요." });
  }

  if (password.length < 8) {
    return res
      .status(422)
      .json({ success: false, message: "비밀번호는 8자 이상이어야 합니다." });
  }

  if (password !== passwordConfirm) {
    return res
      .status(400)
      .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  }

  fakeUsersDb.set(email, { name, password });

  return res.json({
    success: true,
    message: "회원가입이 성공적으로 완료되었습니다!",
  });
}

/**
 * POST /api/auth/login
 * MySQL USER 테이블 실제 조회 → 없으면 임시 회원가입 데이터 확인.
 */
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(422)
      .json({ success: false, message: "이메일과 비밀번호를 입력해 주세요." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT USER_ID, COMPANY_ID, LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE, CREATED_AT
       FROM \`USER\`
       WHERE EMAIL = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    if (user) {
      let passwordOk = false;

      try {
        passwordOk = await bcrypt.compare(password, user.PASSWORD);
      } catch (error) {
        console.error("비밀번호 검증 오류:", error);
      }

      if (!passwordOk) {
        return res.status(401).json({
          success: false,
          message: "등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
        });
      }

      return res.json({
        success: true,
        message: "로그인 성공!",
        user: { email: user.EMAIL, name: user.NAME },
      });
    }

    // 회원가입 DB 연동 전까지만 사용하는 코드
    const tempUser = fakeUsersDb.get(email);

    if (tempUser && tempUser.password === password) {
      return res.json({
        success: true,
        message: "로그인 성공!",
        user: { email, name: tempUser.name },
      });
    }

    return res.status(401).json({
      success: false,
      message: "등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
    });
  } catch (error) {
    console.error("로그인 처리 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: "로그인 처리 중 오류가 발생했습니다." });
  }
}

module.exports = { signup, login };
