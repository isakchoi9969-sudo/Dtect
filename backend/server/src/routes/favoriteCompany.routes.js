/*
 * routes/favoriteCompany.routes.js
 *
 * [사전 작업] 중복 등록 방지를 위해 DB에 UNIQUE 제약을 한 번 추가:
 *
 *   ALTER TABLE FAVORITE_COMPANY
 *     ADD CONSTRAINT uq_favorite_user_company UNIQUE (USER_ID, COMPANY_ID);
 *
 * [등록] app.js 에서:
 *   const favoriteCompanyRouter = require("./routes/favoriteCompany.routes");
 *   app.use("/api/favorite-company", favoriteCompanyRouter);
 */

const express = require("express");
const { pool } = require("../db/pool");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();
const WATCHLIST_LIMIT = 15; // 프론트 useWatchlist 의 limit 과 동일하게 유지

router.use(requireAuth);

// GET /api/favorite-company : 내 관심기업 목록
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         f.FAVORITE_ID  AS favoriteId,
         c.COMPANY_ID   AS companyId,
         c.COMPANY_NAME AS companyName,
         c.CEO_NAME     AS ceoName,
         c.INDUSTRY     AS industry,
         c.COMPANY_INFO AS companyInfo,
         c.STOCK_CODE   AS stockCode,
         f.CREATED_AT    AS createdAt
       FROM FAVORITE_COMPANY f
       JOIN COMPANY c ON f.COMPANY_ID = c.COMPANY_ID
       WHERE f.USER_ID = ?
       ORDER BY f.CREATED_AT DESC`,
      [req.authUserId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "관심기업을 불러오지 못했습니다." });
  }
});

// POST /api/favorite-company : 관심기업 등록  body: { companyId }
router.post("/", async (req, res) => {
  console.log("POST body:", req.body, typeof req.body.companyId);
  const companyId = Number(req.body.companyId);
  if (!Number.isInteger(companyId)) {
    return res.status(400).json({ message: "companyId가 올바르지 않습니다." });
  }

  try {
    // 1) 존재하는 기업인지
    const [company] = await pool.query(
      "SELECT COMPANY_ID FROM COMPANY WHERE COMPANY_ID = ?",
      [companyId],
    );
    if (company.length === 0) {
      return res.status(404).json({ message: "존재하지 않는 기업입니다." });
    }

    // 2) 개수 제한
    const [[{ cnt }]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM FAVORITE_COMPANY WHERE USER_ID = ?",
      [req.authUserId],
    );
    if (cnt >= WATCHLIST_LIMIT) {
      return res.status(400).json({
        message: `관심기업은 최대 ${WATCHLIST_LIMIT}개까지 등록할 수 있습니다.`,
      });
    }

    // 3) 등록 (USER_ID는 body가 아니라 로그인 정보에서만 가져옴)
    await pool.query(
      "INSERT INTO FAVORITE_COMPANY (USER_ID, COMPANY_ID, CREATED_AT) VALUES (?, ?, NOW())",
      [req.authUserId, companyId],
    );
    res.status(201).json({ companyId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "이미 등록된 관심기업입니다." });
    }
    console.error(err);
    res.status(500).json({ message: "관심기업을 등록하지 못했습니다." });
  }
});

// DELETE /api/favorite-company/:companyId : 관심기업 해제
router.delete("/:companyId", async (req, res) => {
  const companyId = Number(req.params.companyId);
  if (!Number.isInteger(companyId)) {
    return res.status(400).json({ message: "companyId가 올바르지 않습니다." });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM FAVORITE_COMPANY WHERE USER_ID = ? AND COMPANY_ID = ?",
      [req.authUserId, companyId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "등록되지 않은 관심기업입니다." });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "관심기업을 해제하지 못했습니다." });
  }
});

module.exports = router;
