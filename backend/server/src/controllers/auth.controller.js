const bcrypt = require("bcryptjs");
const { pool } = require("../db/pool");

/**
 * POST /api/auth/signup
 * 회원가입 → MySQL USER 테이블에 저장
 */
async function signup(req, res) {
  const { name, email, password, passwordConfirm } = req.body || {};

  if (!name || !email || !password || !passwordConfirm) {
    return res.status(422).json({
      success: false,
      message: "이름, 이메일, 비밀번호를 모두 입력해 주세요.",
    });
  }

  if (password.length < 8) {
    return res.status(422).json({
      success: false,
      message: "비밀번호는 8자 이상이어야 합니다.",
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({
      success: false,
      message: "비밀번호가 일치하지 않습니다.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO \`USER\`
       (LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, email, "PERSONAL"],
    );

    return res.json({
      success: true,
      message: "회원가입이 성공적으로 완료되었습니다!",
    });
  } catch (error) {
    console.error("회원가입 처리 오류:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "회원가입 처리 중 오류가 발생했습니다.",
    });
  }
}

/**
 * POST /api/auth/login
 * MySQL USER 테이블 조회 → 비밀번호 확인
 */
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(422).json({
      success: false,
      message: "이메일과 비밀번호를 입력해 주세요.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT USER_ID, COMPANY_ID, LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE, CREATED_AT
       FROM \`USER\`
       WHERE EMAIL = ?
       LIMIT 1`,
      [email],
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.PASSWORD);

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
      });
    }

    return res.json({
      success: true,
      message: "로그인 성공!",
      user: {
        email: user.EMAIL,
        name: user.NAME,
      },
    });
  } catch (error) {
    console.error("로그인 처리 오류:", error);

    return res.status(500).json({
      success: false,
      message: "로그인 처리 중 오류가 발생했습니다.",
    });
  }
}

module.exports = { signup, login };
