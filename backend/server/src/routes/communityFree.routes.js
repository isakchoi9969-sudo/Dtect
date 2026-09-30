const express = require("express");
const { pool } = require("../db/pool");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();
const POST_PAGE_SIZE = 10;
const COMMENT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 50;
const CATEGORIES = new Set(["GENERAL", "QUESTION", "INFO", "INDUSTRY"]);
const TEST_POST_PREFIX = "[이모저모 테스트 20260929]";
const recentViews = new Map();
const VIEW_INTERVAL_MS = 30 * 60 * 1000;

function withTestFlag(post) {
  return { ...post, isTest: post.title.startsWith(TEST_POST_PREFIX) };
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function pagination(query, defaultSize) {
  const page = Math.min(positiveInteger(query.page) || 1, 1000000);
  const pageSize = Math.min(positiveInteger(query.pageSize) || defaultSize, MAX_PAGE_SIZE);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function text(value, maxLength) {
  if (typeof value !== "string") return "";
  const valueTrimmed = value.trim();
  return valueTrimmed.length <= maxLength ? valueTrimmed : "";
}

function validCategory(value) {
  return CATEGORIES.has(value);
}

const postSelect = `
  p.FREE_POST_ID AS id, p.USER_ID AS authorId,
  CASE WHEN u.USER_ID IS NULL THEN '탈퇴한 사용자입니다'
       ELSE COALESCE(NULLIF(u.NICKNAME, ''), u.NAME, CONCAT('회원 #', p.USER_ID)) END AS author,
  p.CATEGORY AS category,
  p.TITLE AS title, p.VIEW_COUNT AS views, p.CREATED_AT AS createdAt,
  p.UPDATED_AT AS updatedAt,
  (SELECT COUNT(*) FROM COMMUNITY_FREE_COMMENT cm
   WHERE cm.FREE_POST_ID = p.FREE_POST_ID AND cm.STATUS = 'ACTIVE') AS comments
`;

router.get("/posts", async (req, res) => {
  const { page, pageSize, offset } = pagination(req.query, POST_PAGE_SIZE);
  const where = ["p.STATUS = 'ACTIVE'"];
  const params = [];
  const category = req.query.category;
  if (category && category !== "ALL") {
    if (!validCategory(category)) return res.status(400).json({ message: "분류값이 올바르지 않습니다." });
    where.push("p.CATEGORY = ?");
    params.push(category);
  }

  const search = text(req.query.search || "", 100);
  if (String(req.query.search || "").trim().length > 100) {
    return res.status(400).json({ message: "검색어는 100자 이내로 입력해주세요." });
  }
  if (search) {
    where.push("(LOCATE(?, p.TITLE) > 0 OR LOCATE(?, p.CONTENT) > 0)");
    params.push(search, search);
  }

  const order = {
    recent: "p.CREATED_AT DESC, p.FREE_POST_ID DESC",
    comments: "comments DESC, p.CREATED_AT DESC, p.FREE_POST_ID DESC",
    views: "p.VIEW_COUNT DESC, p.CREATED_AT DESC, p.FREE_POST_ID DESC",
  }[req.query.sort || "recent"];
  if (!order) return res.status(400).json({ message: "정렬 방식이 올바르지 않습니다." });

  try {
    const filter = `FROM COMMUNITY_FREE_POST p
      LEFT JOIN \`USER\` u ON u.USER_ID = p.USER_ID
      WHERE ${where.join(" AND ")}`;
    const [[count]] = await pool.query(`SELECT COUNT(*) AS total ${filter}`, params);
    const [items] = await pool.query(
      `SELECT ${postSelect}, LEFT(p.CONTENT, 240) AS preview ${filter}
       ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );
    const [[recentCommented], [popularPosts]] = await Promise.all([
      pool.query(
        `SELECT p.FREE_POST_ID AS id, p.TITLE AS title, p.CATEGORY AS category,
                activity.commentCount AS comments, activity.latestCommentAt AS latestCommentAt
         FROM COMMUNITY_FREE_POST p
         JOIN (
           SELECT FREE_POST_ID, COUNT(*) AS commentCount, MAX(CREATED_AT) AS latestCommentAt
           FROM COMMUNITY_FREE_COMMENT WHERE STATUS = 'ACTIVE'
           GROUP BY FREE_POST_ID
         ) activity ON activity.FREE_POST_ID = p.FREE_POST_ID
         WHERE p.STATUS = 'ACTIVE' AND p.TITLE NOT LIKE ?
         ORDER BY activity.latestCommentAt DESC, p.FREE_POST_ID DESC LIMIT 4`,
        [`${TEST_POST_PREFIX}%`],
      ),
      pool.query(
        `SELECT p.FREE_POST_ID AS id, p.TITLE AS title, p.CATEGORY AS category,
                p.VIEW_COUNT AS views
         FROM COMMUNITY_FREE_POST p
         WHERE p.STATUS = 'ACTIVE' AND p.TITLE NOT LIKE ? AND p.VIEW_COUNT > 0
         ORDER BY p.VIEW_COUNT DESC, p.CREATED_AT DESC, p.FREE_POST_ID DESC LIMIT 8`,
        [`${TEST_POST_PREFIX}%`],
      ),
    ]);
    const recentlyCommentedIds = new Set(recentCommented.map((post) => post.id));
    return res.json({
      items: items.map(withTestFlag),
      total: Number(count.total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(count.total) / pageSize),
      recentCommented,
      popularPosts: popularPosts.filter((post) => !recentlyCommentedIds.has(post.id)).slice(0, 4),
    });
  } catch (error) {
    console.error("이모저모 게시글 목록 조회 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
});

router.get("/posts/:postId", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  try {
    const [[post]] = await pool.query(
      `SELECT ${postSelect}, p.CONTENT AS body
       FROM COMMUNITY_FREE_POST p
       LEFT JOIN \`USER\` u ON u.USER_ID = p.USER_ID
       WHERE p.FREE_POST_ID = ? AND p.STATUS = 'ACTIVE'`,
      [postId],
    );
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.json(withTestFlag(post));
  } catch (error) {
    console.error("이모저모 게시글 상세 조회 실패:", error);
    return res.status(500).json({ message: "게시글을 불러오지 못했습니다." });
  }
});

router.post("/posts/:postId/view", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  const now = Date.now();
  for (const [key, expiresAt] of recentViews) {
    if (expiresAt <= now) recentViews.delete(key);
  }
  const viewKey = `${postId}:${req.ip}:${req.get("user-agent") || ""}`;
  if (recentViews.has(viewKey)) return res.status(204).end();
  try {
    const [result] = await pool.query(
      "UPDATE COMMUNITY_FREE_POST SET VIEW_COUNT = VIEW_COUNT + 1 WHERE FREE_POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    recentViews.set(viewKey, now + VIEW_INTERVAL_MS);
    return res.status(204).end();
  } catch (error) {
    console.error("이모저모 조회수 기록 실패:", error);
    return res.status(500).json({ message: "조회 수를 기록하지 못했습니다." });
  }
});

router.post("/posts", requireAuth, async (req, res) => {
  const category = req.body?.category;
  const title = text(req.body?.title, 200);
  const content = text(req.body?.content, 10000);
  if (!validCategory(category) || title.length < 2 || content.length < 2) {
    return res.status(400).json({ message: "분류를 선택하고 제목 2~200자, 본문 2~10,000자를 입력해주세요." });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO COMMUNITY_FREE_POST (USER_ID, CATEGORY, TITLE, CONTENT) VALUES (?, ?, ?, ?)",
      [req.authUserId, category, title, content],
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("이모저모 게시글 등록 실패:", error);
    return res.status(500).json({ message: "게시글을 등록하지 못했습니다." });
  }
});

router.patch("/posts/:postId", requireAuth, async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  const category = req.body?.category;
  const title = text(req.body?.title, 200);
  const content = text(req.body?.content, 10000);
  if (!postId || !validCategory(category) || title.length < 2 || content.length < 2) {
    return res.status(400).json({ message: "분류, 제목, 본문을 확인해주세요." });
  }
  try {
    const [[ownedPost]] = await pool.query(
      "SELECT FREE_POST_ID FROM COMMUNITY_FREE_POST WHERE FREE_POST_ID = ? AND USER_ID = ? AND STATUS = 'ACTIVE'",
      [postId, req.authUserId],
    );
    if (!ownedPost) return res.status(404).json({ message: "수정할 수 있는 게시글을 찾을 수 없습니다." });
    const [result] = await pool.query(
      `UPDATE COMMUNITY_FREE_POST
       SET CATEGORY = ?, TITLE = ?, CONTENT = ?
       WHERE FREE_POST_ID = ? AND USER_ID = ? AND STATUS = 'ACTIVE'`,
      [category, title, content, postId, req.authUserId],
    );
    return res.status(204).end();
  } catch (error) {
    console.error("이모저모 게시글 수정 실패:", error);
    return res.status(500).json({ message: "게시글을 수정하지 못했습니다." });
  }
});

router.delete("/posts/:postId", requireAuth, async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  try {
    const [result] = await pool.query(
      `UPDATE COMMUNITY_FREE_POST SET STATUS = 'DELETED'
       WHERE FREE_POST_ID = ? AND USER_ID = ? AND STATUS = 'ACTIVE'`,
      [postId, req.authUserId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "삭제할 수 있는 게시글을 찾을 수 없습니다." });
    return res.status(204).end();
  } catch (error) {
    console.error("이모저모 게시글 삭제 실패:", error);
    return res.status(500).json({ message: "게시글을 삭제하지 못했습니다." });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  if (!postId) return res.status(400).json({ message: "게시글 ID가 올바르지 않습니다." });
  const { page, pageSize, offset } = pagination(req.query, COMMENT_PAGE_SIZE);
  try {
    const [[post]] = await pool.query(
      "SELECT FREE_POST_ID FROM COMMUNITY_FREE_POST WHERE FREE_POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    const visibleRoots = `cm.FREE_POST_ID = ? AND cm.PARENT_FREE_COMMENT_ID IS NULL
      AND (cm.STATUS = 'ACTIVE' OR (cm.STATUS = 'DELETED' AND EXISTS (
        SELECT 1 FROM COMMUNITY_FREE_COMMENT child
        WHERE child.PARENT_FREE_COMMENT_ID = cm.FREE_COMMENT_ID
          AND child.STATUS = 'ACTIVE')))`;
    const [[count]] = await pool.query(
      "SELECT COUNT(*) AS total FROM COMMUNITY_FREE_COMMENT WHERE FREE_POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    const [[rootCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM COMMUNITY_FREE_COMMENT cm WHERE ${visibleRoots}`,
      [postId],
    );
    const [roots] = await pool.query(
      "SELECT cm.FREE_COMMENT_ID AS id, cm.FREE_POST_ID AS postId, cm.USER_ID AS authorId, " +
        "CASE WHEN cm.STATUS = 'DELETED' THEN '삭제된 회원' " +
        "WHEN u.USER_ID IS NULL THEN '탈퇴한 사용자입니다' " +
        "ELSE COALESCE(NULLIF(u.NICKNAME, ''), u.NAME, CONCAT('회원 #', cm.USER_ID)) END AS author, " +
        "cm.PARENT_FREE_COMMENT_ID AS parentCommentId, " +
        "CASE WHEN cm.STATUS = 'DELETED' THEN '삭제된 댓글입니다.' ELSE cm.CONTENT END AS content, " +
        "cm.STATUS AS status, cm.CREATED_AT AS createdAt, cm.UPDATED_AT AS updatedAt " +
        "FROM COMMUNITY_FREE_COMMENT cm LEFT JOIN `USER` u ON u.USER_ID = cm.USER_ID WHERE " + visibleRoots +
        " ORDER BY cm.CREATED_AT DESC, cm.FREE_COMMENT_ID DESC LIMIT ? OFFSET ?",
      [postId, pageSize, offset],
    );
    let items = roots;
    if (roots.length) {
      const [replies] = await pool.query(
        `SELECT cm.FREE_COMMENT_ID AS id, cm.FREE_POST_ID AS postId, cm.USER_ID AS authorId,
                CASE WHEN u.USER_ID IS NULL THEN '탈퇴한 사용자입니다'
                     ELSE COALESCE(NULLIF(u.NICKNAME, ''), u.NAME, CONCAT('회원 #', cm.USER_ID)) END AS author,
                cm.PARENT_FREE_COMMENT_ID AS parentCommentId,
                cm.CONTENT AS content, cm.STATUS AS status, cm.CREATED_AT AS createdAt, cm.UPDATED_AT AS updatedAt
         FROM COMMUNITY_FREE_COMMENT cm
         LEFT JOIN \`USER\` u ON u.USER_ID = cm.USER_ID
         WHERE cm.PARENT_FREE_COMMENT_ID IN (?) AND cm.STATUS = 'ACTIVE'
         ORDER BY cm.CREATED_AT ASC, cm.FREE_COMMENT_ID ASC`,
        [roots.map((root) => root.id)],
      );
      const repliesByParent = new Map();
      for (const reply of replies) {
        if (!repliesByParent.has(reply.parentCommentId)) repliesByParent.set(reply.parentCommentId, []);
        repliesByParent.get(reply.parentCommentId).push(reply);
      }
      items = roots.flatMap((root) => [root, ...(repliesByParent.get(root.id) || [])]);
    }
    return res.json({ items, total: Number(count.total), page, pageSize, totalPages: Math.ceil(Number(rootCount.total) / pageSize) });
  } catch (error) {
    console.error("이모저모 댓글 조회 실패:", error);
    return res.status(500).json({ message: "댓글을 불러오지 못했습니다." });
  }
});

router.delete("/comments/:commentId", requireAuth, async (req, res) => {
  const commentId = positiveInteger(req.params.commentId);
  if (!commentId) return res.status(400).json({ message: "댓글 ID가 올바르지 않습니다." });
  try {
    const [result] = await pool.query(
      "UPDATE COMMUNITY_FREE_COMMENT SET STATUS = 'DELETED' " +
        "WHERE FREE_COMMENT_ID = ? AND USER_ID = ? AND STATUS = 'ACTIVE'",
      [commentId, req.authUserId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "삭제할 수 있는 댓글을 찾을 수 없습니다." });
    return res.status(204).end();
  } catch (error) {
    console.error("이모저모 댓글 삭제 실패:", error);
    return res.status(500).json({ message: "댓글을 삭제하지 못했습니다." });
  }
});

router.post("/posts/:postId/comments", requireAuth, async (req, res) => {
  const postId = positiveInteger(req.params.postId);
  const parentId = req.body?.parentCommentId == null ? null : positiveInteger(req.body.parentCommentId);
  const content = text(req.body?.content, 2000);
  if (!postId || !content || (req.body?.parentCommentId != null && !parentId)) {
    return res.status(400).json({ message: "댓글 내용을 1~2,000자로 입력해주세요." });
  }
  try {
    const [[post]] = await pool.query(
      "SELECT FREE_POST_ID FROM COMMUNITY_FREE_POST WHERE FREE_POST_ID = ? AND STATUS = 'ACTIVE'",
      [postId],
    );
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (parentId) {
      const [[parent]] = await pool.query(
        `SELECT FREE_COMMENT_ID FROM COMMUNITY_FREE_COMMENT
         WHERE FREE_COMMENT_ID = ? AND FREE_POST_ID = ? AND PARENT_FREE_COMMENT_ID IS NULL AND STATUS = 'ACTIVE'`,
        [parentId, postId],
      );
      if (!parent) return res.status(400).json({ message: "답글 대상 댓글을 찾을 수 없습니다." });
    }
    const [result] = await pool.query(
      `INSERT INTO COMMUNITY_FREE_COMMENT
       (FREE_POST_ID, USER_ID, PARENT_FREE_COMMENT_ID, CONTENT) VALUES (?, ?, ?, ?)`,
      [postId, req.authUserId, parentId, content],
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("이모저모 댓글 등록 실패:", error);
    return res.status(500).json({ message: "댓글을 등록하지 못했습니다." });
  }
});

module.exports = router;
