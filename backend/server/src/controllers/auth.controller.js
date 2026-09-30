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
    loginId,
    name,
    email,
    password,
    passwordConfirm,
    userType = "PERSONAL",
    companyId = "NONE",
  } = req.body || {};

  if (!loginId || !name || !email || !password || !passwordConfirm) {
    return res.status(422).json({
      success: false,
      message: "아이디, 이름, 이메일, 비밀번호를 모두 입력해 주세요.",
    });
  }

  const normalizedLoginId = String(loginId).trim();

  if (!/^[A-Za-z0-9]{4,20}$/.test(normalizedLoginId)) {
    return res.status(422).json({
      success: false,
      message: "아이디는 영문과 숫자로 4~20자 입력해 주세요.",
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

    const [duplicateLoginIds] = await pool.query(
      "SELECT USER_ID FROM `USER` WHERE LOGIN_ID = ? LIMIT 1",
      [normalizedLoginId],
    );

    if (duplicateLoginIds.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    const [duplicateEmails] = await pool.query(
      "SELECT USER_ID FROM `USER` WHERE EMAIL = ? LIMIT 1",
      [email],
    );

    if (duplicateEmails.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO \`USER\`
       (LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE, COMPANY_ID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [normalizedLoginId, hashedPassword, name, email, userType, companyIdToSave],
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
        message: "이미 사용 중인 아이디 또는 이메일입니다.",
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
 * MySQL USER 테이블의 아이디 조회 → 비밀번호 확인
 */
async function login(req, res) {
  const { loginId, password } = req.body || {};

  if (!loginId || !password) {
    return res.status(422).json({
      success: false,
      message: "아이디와 비밀번호를 입력해 주세요.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT USER_ID, COMPANY_ID, LOGIN_ID, PASSWORD, NAME, EMAIL, USER_TYPE, CREATED_AT
       FROM \`USER\`
       WHERE LOGIN_ID = ?
       LIMIT 1`,
      [String(loginId).trim()],
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "등록되지 않은 아이디이거나 비밀번호가 틀렸습니다.",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.PASSWORD);

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "등록되지 않은 아이디이거나 비밀번호가 틀렸습니다.",
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
      `SELECT u.USER_ID, u.COMPANY_ID, u.LOGIN_ID, u.NAME, u.EMAIL,
              u.USER_TYPE, u.CREATED_AT, c.COMPANY_NAME
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

    return res.json({
      success: true,
      user: {
        ...toUserResponse(user),
        loginId: user.LOGIN_ID,
        createdAt: user.CREATED_AT,
      },
    });
  } catch (error) {
    console.error("현재 사용자 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "로그인 정보를 확인하지 못했습니다.",
    });
  }
}

/**
 * POST /api/auth/verify-password
 * 개인정보 수정 화면으로 이동하기 전 현재 비밀번호를 확인한다.
 */
async function verifyCurrentPassword(req, res) {
  const currentPassword = String(req.body?.currentPassword || "");

  if (!currentPassword) {
    return res.status(422).json({
      success: false,
      message: "현재 비밀번호를 입력해 주세요.",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT PASSWORD FROM `USER` WHERE USER_ID = ? LIMIT 1",
      [req.authUserId],
    );

    const user = rows[0];
    const passwordOk = user && (await bcrypt.compare(currentPassword, user.PASSWORD));

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("현재 비밀번호 확인 오류:", error);
    return res.status(500).json({
      success: false,
      message: "비밀번호를 확인하지 못했습니다.",
    });
  }
}

/**
 * PATCH /api/auth/me
 * 현재 비밀번호를 다시 검증한 뒤 이름·이메일·비밀번호를 수정한다.
 */
async function updateCurrentUser(req, res) {
  const currentPassword = String(req.body?.currentPassword || "");
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const newPassword = String(req.body?.newPassword || "");
  const newPasswordConfirm = String(req.body?.newPasswordConfirm || "");
  const userType = String(req.body?.userType || "");
  const companyIdInput = req.body?.companyId;

  if (!currentPassword || !name || !email) {
    return res.status(422).json({
      success: false,
      message: "이름, 이메일과 현재 비밀번호를 모두 입력해 주세요.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({
      success: false,
      message: "올바른 이메일 주소를 입력해 주세요.",
    });
  }

  if (!Object.hasOwn({ PERSONAL: true, COMPANY: true }, userType)) {
    return res.status(422).json({
      success: false,
      message: "회원 유형을 다시 선택해 주세요.",
    });
  }

  if (newPassword && newPassword.length < 8) {
    return res.status(422).json({
      success: false,
      message: "새 비밀번호는 8자 이상이어야 합니다.",
    });
  }

  if (newPassword !== newPasswordConfirm) {
    return res.status(400).json({
      success: false,
      message: "새 비밀번호가 일치하지 않습니다.",
    });
  }

  try {
    let companyId = null;

    if (userType === "COMPANY") {
      const parsedCompanyId = Number(companyIdInput);

      if (!Number.isSafeInteger(parsedCompanyId) || parsedCompanyId <= 0) {
        return res.status(422).json({
          success: false,
          message: "소속 기업을 선택해 주세요.",
        });
      }

      const [companies] = await pool.query(
        "SELECT COMPANY_ID FROM COMPANY WHERE COMPANY_ID = ? LIMIT 1",
        [parsedCompanyId],
      );

      if (companies.length === 0) {
        return res.status(422).json({
          success: false,
          message: "선택한 기업을 찾을 수 없습니다. 다시 선택해 주세요.",
        });
      }

      companyId = parsedCompanyId;
    }

    const [rows] = await pool.query(
      "SELECT PASSWORD FROM `USER` WHERE USER_ID = ? LIMIT 1",
      [req.authUserId],
    );
    const user = rows[0];
    const passwordOk = user && (await bcrypt.compare(currentPassword, user.PASSWORD));

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    const [duplicateEmails] = await pool.query(
      "SELECT USER_ID FROM `USER` WHERE EMAIL = ? AND USER_ID <> ? LIMIT 1",
      [email, req.authUserId],
    );

    if (duplicateEmails.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE `USER` SET NAME = ?, EMAIL = ?, PASSWORD = ?, USER_TYPE = ?, COMPANY_ID = ? WHERE USER_ID = ?",
        [name, email, hashedPassword, userType, companyId, req.authUserId],
      );
    } else {
      await pool.query(
        "UPDATE `USER` SET NAME = ?, EMAIL = ?, USER_TYPE = ?, COMPANY_ID = ? WHERE USER_ID = ?",
        [name, email, userType, companyId, req.authUserId],
      );
    }

    const [updatedRows] = await pool.query(
      `SELECT u.USER_ID, u.COMPANY_ID, u.LOGIN_ID, u.NAME, u.EMAIL,
              u.USER_TYPE, u.CREATED_AT, c.COMPANY_NAME
       FROM \`USER\` u
       LEFT JOIN COMPANY c ON c.COMPANY_ID = u.COMPANY_ID
       WHERE u.USER_ID = ?
       LIMIT 1`,
      [req.authUserId],
    );
    const updatedUser = updatedRows[0];

    return res.json({
      success: true,
      message: "내 정보가 수정되었습니다.",
      user: {
        ...toUserResponse(updatedUser),
        loginId: updatedUser.LOGIN_ID,
        createdAt: updatedUser.CREATED_AT,
      },
    });
  } catch (error) {
    console.error("내 정보 수정 오류:", error);
    return res.status(500).json({
      success: false,
      message: "내 정보를 수정하지 못했습니다.",
    });
  }
}

/**
 * DELETE /api/auth/me
 * 현재 비밀번호를 확인한 뒤 개인정보를 제거하고 계정을 탈퇴 상태로 전환한다.
 * 커뮤니티 글·댓글은 USER_ID를 보존해 "탈퇴한 사용자"로 표시한다.
 */
async function withdrawCurrentUser(req, res) {
  const currentPassword = String(req.body?.currentPassword || "");

  if (!currentPassword) {
    return res.status(422).json({
      success: false,
      message: "현재 비밀번호를 입력해 주세요.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT PASSWORD FROM `USER` WHERE USER_ID = ? LIMIT 1",
      [req.authUserId],
    );
    const user = rows[0];
    const passwordOk = user && (await bcrypt.compare(currentPassword, user.PASSWORD));

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    const withdrawalSuffix = `${req.authUserId}_${Date.now()}`;
    const withdrawnLoginId = `withdrawn_${withdrawalSuffix}`;
    const withdrawnEmail = `withdrawn_${withdrawalSuffix}@deleted.invalid`;
    const withdrawnPassword = await bcrypt.hash(
      `withdrawn-${withdrawalSuffix}-${Math.random()}`,
      10,
    );

    await connection.beginTransaction();
    await connection.query("DELETE FROM COMPANY_ALERT WHERE USER_ID = ?", [req.authUserId]);
    await connection.query("DELETE FROM COMPANY_ANALYSIS_SNAPSHOT WHERE USER_ID = ?", [req.authUserId]);
    await connection.query("DELETE FROM FAVORITE_COMPANY WHERE USER_ID = ?", [req.authUserId]);
    await connection.query("DELETE FROM RESPONSE_DRAFT_HISTORY WHERE USER_ID = ?", [req.authUserId]);
    await connection.query(
      `UPDATE \`USER\`
       SET LOGIN_ID = ?, EMAIL = ?, NAME = '탈퇴한 사용자', PASSWORD = ?,
           USER_TYPE = 'PERSONAL', COMPANY_ID = NULL
       WHERE USER_ID = ?`,
      [withdrawnLoginId, withdrawnEmail, withdrawnPassword, req.authUserId],
    );
    await connection.commit();

    res.clearCookie("dtect_auth", {
      httpOnly: true,
      sameSite: "lax",
      secure: auth.isProduction,
      path: "/",
    });

    return res.json({ success: true, message: "회원 탈퇴가 완료되었습니다." });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("회원 탈퇴 처리 오류:", error);
    return res.status(500).json({
      success: false,
      message: "회원 탈퇴를 처리하지 못했습니다.",
    });
  } finally {
    if (connection) connection.release();
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

module.exports = {
  signup,
  login,
  getCurrentUser,
  verifyCurrentPassword,
  updateCurrentUser,
  withdrawCurrentUser,
  logout,
};
