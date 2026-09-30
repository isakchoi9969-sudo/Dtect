const express = require("express");
const { pool } = require("../db/pool");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();
const POST_PAGE_SIZE = 10;
const COMMENT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 50;

function positiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function pageOptions(query, defaultSize) {
  const page = Math.min(positiveInteger(query.page) || 1, 1000000);
  const pageSize = Math.min(positiveInteger(query.pageSize) || defaultSize, MAX_PAGE_SIZE);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function normalizedText(value, maxLength) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text.length <= maxLength ? text : "";
}

const postColumns = `
  p.POST_ID AS id, p.COMPANY_ID AS companyId,
  c.COMPANY_NAME AS company, c.STOCK_CODE AS code,
  p.USER_ID AS authorId,
  CASE WHEN u.USER_ID IS NULL OR u.LOGIN_ID LIKE 'withdrawn_%' THEN '탈퇴한 사용자'
       ELSE COALESCE(NULLIF(u.NICKNAME, ''), u.NAME, CONCAT('회원 #', p.USER_ID)) END AS author,
  p.TITLE AS title, p.VIEW_COUNT AS views, p.CREATED_AT AS createdAt,
  (SELECT COUNT(*) FROM COMMUNITY_COMMENT cm
   WHERE cm.POST_ID = p.POST_ID AND cm.STATUS = 'ACTIVE') AS comments
`;

router.get("/posts", async (req, res) => {
  const { page, pageSize, offset } = pageOptions(req.query, POST_PAGE_SIZE);
  const where = ["p.STATUS = 'ACTIVE'"];
  const params = [];

  if (req.query.companyId !== undefined) {
    const companyId = positiveInteger(req.query.companyId);
    if (!companyId) return res.status(400).json({ message: "기업 ID가 올바르지 않습니다." });
    where.push("p.COMPANY_ID = ?");
    params.push(companyId);
  } else if (req.query.stockCode) {
    const stockCode = String(req.query.stockCode).trim();
    if (!/^\d{6}$/.test(stockCode)) {
      return res.status(400).json({ message: "종목 코드가 올바르지 않습니다." });
    }
    where.push("c.STOCK_CODE = ?");
    params.push(stockCode);
  } else if (req.query.companyName) {
    const companyName = normalizedText(req.query.companyName, 100);
    if (!companyName) return res.status(400).json({ message: "기업명이 올바르지 않습니다." });
    where.push("c.COMPANY_NAME = ?");
    params.push(companyName);
  }

  const search = String(req.query.search || "").trim();
  if (search.length > 100) {
    return res.status(400).json({ message: "검색어는 100자 이내로 입력해주세요." });
  }
  if (search) {
    where.push("(LOCATE(?, p.TITLE) > 0 OR LOCATE(?, p.CONTENT) > 0 OR LOCATE(?, c.COMPANY_NAME) > 0)");
    params.push(search, search, search);
  }

  const order = {
    recent: "p.CREATED_AT DESC, p.POST_ID DESC",
    views: "p.VIEW_COUNT DESC, p.CREATED_AT DESC, p.POST_ID DESC",
    comments: "comments DESC, p.CREATED_AT DESC, p.POST_ID DESC",
  }[req.query.sort || "recent"];
  if (!order) return res.status(400).json({ message: "정렬 방식이 올바르지 않습니다." });

  try {
    const from = "FROM COMMUNITY_POST p JOIN COMPANY c ON c.COMPANY_ID = p.COMPANY_ID LEFT JOIN `USER` u ON u.USER_ID = p.USER_ID";
    const filter = `WHERE ${where.join(" AND ")}`;
    const [[count]] = await pool.query(
      `SELECT COUNT(*) AS total ${from} ${filter}`,
      params,
    );
    const [items] = await pool.query(
      `SELECT ${postColumns}, LEFT(p.CONTENT, 220) AS preview
       ${from} ${filter} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );
    return res.json({
      items,
      total: Number(count.total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(count.total) / pageSize),
    });
  } catch (error) {
    console.error("종목토론방 게시글 조회 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
});

router.get("/posts/:postId", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });

  try {
    const [[post]] = await pool.query(
      `SELECT ${postColumns}, p.CONTENT AS body
       FROM COMMUNITY_POST p JOIN COMPANY c ON c.COMPANY_ID = p.COMPANY_ID
       LEFT JOIN \`USER\` u ON u.USER_ID = p.USER_ID
       WHERE p.POST_ID = ? AND p.STATUS = 'ACTIVE'`,
      [postId],
    );
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.json(post);
  } catch (error) {
    console.error("종목토론방 게시글 상세 조회 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
});

router.post("/posts/:postId/view", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  try {
    const [result] = await pool.query(
      "UPDATE COMMUNITY_POST SET VIEW_COUNT = VIEW_COUNT + 1 WHERE POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.status(204).end();
  } catch (error) {
    console.error("종목토론방 조회 수 기록 실패:", error);
    return res.status(500).json({ message: "조회 수를 기록하지 못했습니다." });
  }
});

router.post("/posts", requireAuth, async (req, res) => {
  const companyId = positiveInteger(req.body?.companyId);
  const title = normalizedText(req.body?.title, 200);
  const content = normalizedText(req.body?.content, 5000);
  if (!companyId || title.length < 2 || content.length < 10) {
    return res.status(400).json({
      message: "기업을 선택하고 제목 2~200자, 본문 10~5000자를 입력해주세요.",
    });
  }

  try {
    const [[company]] = await pool.query(
      "SELECT COMPANY_ID FROM COMPANY WHERE COMPANY_ID = ? AND STOCK_CODE REGEXP '^[0-9]{6}$'",
      [companyId],
    );
    if (!company) return res.status(404).json({ message: "해당 종목을 찾을 수 없습니다." });

    const [result] = await pool.query(
      "INSERT INTO COMMUNITY_POST (COMPANY_ID, USER_ID, TITLE, CONTENT) VALUES (?, ?, ?, ?)",
      [companyId, req.authUserId, title, content],
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("종목토론방 게시글 작성 실패:", error);
    return res.status(500).json({ message: "게시글을 등록하지 못했습니다." });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  const { page, pageSize, offset } = pageOptions(req.query, COMMENT_PAGE_SIZE);

  try {
    const [[count]] = await pool.query(
      "SELECT COUNT(*) AS total FROM COMMUNITY_COMMENT WHERE POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    const [items] = await pool.query(
      `SELECT cm.COMMENT_ID AS id, cm.POST_ID AS postId, cm.USER_ID AS authorId,
              CASE WHEN u.USER_ID IS NULL OR u.LOGIN_ID LIKE 'withdrawn_%' THEN '탈퇴한 사용자'
                   ELSE COALESCE(NULLIF(u.NICKNAME, ''), u.NAME, CONCAT('회원 #', cm.USER_ID)) END AS author,
              cm.PARENT_COMMENT_ID AS parentCommentId,
              cm.CONTENT AS content, cm.CREATED_AT AS createdAt
       FROM COMMUNITY_COMMENT cm
       LEFT JOIN \`USER\` u ON u.USER_ID = cm.USER_ID
       WHERE cm.POST_ID = ? AND cm.STATUS = 'ACTIVE'
       ORDER BY cm.CREATED_AT ASC, cm.COMMENT_ID ASC LIMIT ? OFFSET ?`,
      [postId, pageSize, offset],
    );
    return res.json({
      items,
      total: Number(count.total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(count.total) / pageSize),
    });
  } catch (error) {
    console.error("종목토론방 댓글 조회 실패:", error);
    return res.status(500).json({ message: "댓글을 불러오지 못했습니다." });
  }
});

router.post("/posts/:postId/comments", requireAuth, async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  const parentCommentId = req.body?.parentCommentId == null
    ? null
    : positiveInteger(req.body.parentCommentId);
  const content = normalizedText(req.body?.content, 2000);
  if (!postId || !content || (req.body?.parentCommentId != null && !parentCommentId)) {
    return res.status(400).json({ message: "댓글 내용을 1~2000자로 입력해주세요." });
  }

  try {
    const [[post]] = await pool.query(
      "SELECT POST_ID FROM COMMUNITY_POST WHERE POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (parentCommentId) {
      const [[parent]] = await pool.query(
        "SELECT COMMENT_ID FROM COMMUNITY_COMMENT WHERE COMMENT_ID = ? AND POST_ID = ? AND STATUS = 'ACTIVE'",
        [parentCommentId, postId],
      );
      if (!parent) return res.status(400).json({ message: "답글 대상 댓글을 찾을 수 없습니다." });
    }

    const [result] = await pool.query(
      "INSERT INTO COMMUNITY_COMMENT (POST_ID, USER_ID, PARENT_COMMENT_ID, CONTENT) VALUES (?, ?, ?, ?)",
      [postId, req.authUserId, parentCommentId, content],
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("종목토론방 댓글 작성 실패:", error);
    return res.status(500).json({ message: "댓글을 등록하지 못했습니다." });
  }
});

module.exports = router;
module.exports._test = { positiveInteger, pageOptions, normalizedText };
