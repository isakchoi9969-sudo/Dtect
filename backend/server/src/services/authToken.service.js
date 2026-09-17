const crypto = require("crypto");
const { auth } = require("../config/env");

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function createSignature(value) {
  return crypto
    .createHmac("sha256", auth.tokenSecret)
    .update(value)
    .digest("base64url");
}

function createAuthToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: userId, iat: now, exp: now + auth.tokenMaxAgeSeconds });
  const signedValue = `${header}.${payload}`;

  return `${signedValue}.${createSignature(signedValue)}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== "string") return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const signedValue = `${header}.${payload}`;
  const expectedSignature = createSignature(signedValue);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const tokenPayload = decode(payload);
    const now = Math.floor(Date.now() / 1000);

    if (!Number.isSafeInteger(tokenPayload.sub) || tokenPayload.exp <= now) {
      return null;
    }

    return tokenPayload;
  } catch {
    return null;
  }
}

module.exports = { createAuthToken, verifyAuthToken };
