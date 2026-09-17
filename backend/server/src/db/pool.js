const mysql = require("mysql2/promise");
const { db } = require("../config/env");

// FastAPI 의 SQLAlchemy engine 대응.
// 커넥션 풀 하나를 앱 전역에서 재사용한다.
const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
  charset: "utf8mb4_general_ci",
  waitForConnections: true,
  connectionLimit: 10,
});

async function checkDbConnection() {
  const [rows] = await pool.query("SELECT DATABASE() AS db_name");
  return rows[0].db_name;
}

async function getCompanyCount() {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM COMPANY");
  return rows[0].count;
}

module.exports = { pool, checkDbConnection, getCompanyCount };
