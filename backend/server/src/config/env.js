const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);

module.exports = {
  port: process.env.PORT || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  aiServerUrl: process.env.AI_SERVER_URL || "http://localhost:6000",

  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  naver: {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  },
};
