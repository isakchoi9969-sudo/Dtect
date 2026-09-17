const bcrypt = require("bcryptjs");
const { pool } = require("../db/pool");
const { auth } = require("../config/env");
const { createAuthToken } = require("../services/authToken.service");

const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: auth.isProduction,
  maxAge: auth.tokenMaxAgeSeconds * 1000,
  path: "/",
};

function toUserResponse(user) {
  return {
    id: user.USER_ID,
    email: user.EMAIL,
    name: user.NAME,
    userType: user.USER_TYPE,
    companyId: user.COMPANY_ID,
    companyName: user.COMPANY_NAME || null,
  };
}

/**
 * POST /api/auth/signup
 * 회원가입 → MySQL USER 테이블에 저장
 */
async function signup(req, res) {
  const {
    name,
    email,
    password,
    passwordConfirm,
    userType = "PERSONAL",
    companyId = "NONE",
  } = req.body || {};

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
    if (!["PERSONAL", "COMPANY"].includes(userType)) {
      return res.status(422).json({
        success: false,
        message: "회원 유형을 다시 선택해주세요.",
      });
    }

    let companyIdToSave = null;

    if (userType === "COMPANY" && companyId !== "NONE") {
      const parsedCompanyId = Number(companyId);

      if (!Number.isSafeInteger(parsedCompanyId) || parsedCompanyId <= 0) {
        return res.status(422).json({
          success: false,
          message: "소속 기업 선택값이 올바르지 않습니다.",
        });
      }

      const [companies] = await pool.query(
        "SELECT COMPANY_ID FROM COMPANY WHERE COMPANY_ID = ? LIMIT 1",
        [parsedCompanyId],
      );

      if (companies.length === 0) {
        return res.status(422).json({
          success: false,
          message: "선택한 기업을 찾을 수 없습니다. 목록을 새로고침 후 다시 선택해주세요.",
        });
      }

      companyIdToSave = parsedCompanyId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO \`USER\`
       (LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE, COMPANY_ID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, email, userType, companyIdToSave],
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

    res.cookie("dtect_auth", createAuthToken(user.USER_ID), authCookieOptions);

    return res.json({
      success: true,
      message: "로그인 성공!",
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("로그인 처리 오류:", error);

    return res.status(500).json({
      success: false,
      message: "로그인 처리 중 오류가 발생했습니다.",
    });
  }
}

/**
 * GET /api/auth/me
 * 브라우저 쿠키의 로그인 토큰으로 현재 사용자 정보를 조회한다.
 */
async function getCurrentUser(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.USER_ID, u.COMPANY_ID, u.NAME, u.EMAIL, u.USER_TYPE,
              c.COMPANY_NAME
       FROM \`USER\` u
       LEFT JOIN COMPANY c ON c.COMPANY_ID = u.COMPANY_ID
       WHERE u.USER_ID = ?
       LIMIT 1`,
      [req.authUserId],
    );

    const user = rows[0];
    if (!user) {
      res.clearCookie("dtect_auth", { path: "/" });
      return res.status(401).json({
        success: false,
        message: "사용자 정보를 찾을 수 없습니다.",
      });
    }

    return res.json({ success: true, user: toUserResponse(user) });
  } catch (error) {
    console.error("현재 사용자 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "로그인 정보를 확인하지 못했습니다.",
    });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(_req, res) {
  res.clearCookie("dtect_auth", {
    httpOnly: true,
    sameSite: "lax",
    secure: auth.isProduction,
    path: "/",
  });
  return res.json({ success: true, message: "로그아웃되었습니다." });
}

module.exports = { signup, login, getCurrentUser, logout };
