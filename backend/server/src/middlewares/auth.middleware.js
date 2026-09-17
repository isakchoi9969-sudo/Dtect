const { verifyAuthToken } = require("../services/authToken.service");

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;

  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function requireAuth(req, res, next) {
  const token = getCookieValue(req.headers.cookie, "dtect_auth");
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "로그인이 필요하거나 로그인 시간이 만료되었습니다.",
    });
  }

  req.authUserId = payload.sub;
  return next();
}

module.exports = { requireAuth };
