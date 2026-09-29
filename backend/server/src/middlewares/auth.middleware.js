const { verifyAuthToken } = require("../services/authToken.service");
const { pool } = require("../db/pool");

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;

  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

async function requireAuth(req, res, next) {
  const token = getCookieValue(req.headers.cookie, "dtect_auth");
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "로그인이 필요하거나 로그인 시간이 만료되었습니다.",
    });
  }

  try {
    const [users] = await pool.query(
      "SELECT USER_ID FROM `USER` WHERE USER_ID = ? AND LOGIN_ID NOT LIKE 'withdrawn_%' LIMIT 1",
      [payload.sub],
    );

    if (users.length === 0) {
      res.clearCookie("dtect_auth", { path: "/" });
      return res.status(401).json({
        success: false,
        message: "로그인이 필요하거나 로그인 시간이 만료되었습니다.",
      });
    }

    req.authUserId = payload.sub;
    return next();
  } catch (error) {
    console.error("로그인 상태 확인 실패:", error);
    return res.status(500).json({
      success: false,
      message: "로그인 상태를 확인하지 못했습니다.",
    });
  }
}

module.exports = { requireAuth };
