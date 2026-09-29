const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { pool } = require("../src/db/pool");
const communityFreeRoutes = require("../src/routes/communityFree.routes");

test("free-board highlights omit demo posts and avoid repeating an active post", async () => {
  const originalQuery = pool.query;
  pool.query = async (sql, params = []) => {
    if (sql.includes("SELECT COUNT(*) AS total") && sql.includes("COMMUNITY_FREE_POST")) return [[{ total: 2 }]];
    if (sql.includes("LEFT(p.CONTENT")) return [[
      { id: 1, title: "[이모저모 테스트 20260929] 예시 글", category: "GENERAL" },
      { id: 2, title: "실제 글", category: "QUESTION" },
    ]];
    if (sql.includes("activity.commentCount")) {
      assert.deepEqual(params, ["[이모저모 테스트 20260929]%"]);
      return [[{ id: 2, title: "실제 글", category: "QUESTION", comments: 3 }]];
    }
    if (sql.includes("p.VIEW_COUNT AS views")) return [[
      { id: 2, title: "실제 글", views: 10 },
      { id: 3, title: "또 다른 글", views: 5 },
    ]];
    throw new Error(`Unexpected query: ${sql}`);
  };
  const app = express();
  app.use("/api/community/free", communityFreeRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/community/free/posts`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data.items.map((item) => item.isTest), [true, false]);
    assert.deepEqual(data.recentCommented.map((item) => item.id), [2]);
    assert.deepEqual(data.popularPosts.map((item) => item.id), [3]);
  } finally {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
  }
});

test("free-board comments keep replies with their parent across pages", async () => {
  const originalQuery = pool.query;
  pool.query = async (sql, params = []) => {
    if (sql.includes("SELECT FREE_POST_ID FROM COMMUNITY_FREE_POST")) return [[{ FREE_POST_ID: 9 }]];
    if (sql.includes("SELECT COUNT(*) AS total FROM COMMUNITY_FREE_COMMENT")) {
      return [[{ total: sql.includes("PARENT_FREE_COMMENT_ID IS NULL") ? 2 : 3 }]];
    }
    if (sql.includes("ORDER BY CREATED_AT DESC")) {
      return [[params.at(-1) === 0
        ? { id: 22, parentCommentId: null, content: "새 댓글" }
        : { id: 11, parentCommentId: null, content: "옛 댓글" }]];
    }
    if (sql.includes("PARENT_FREE_COMMENT_ID IN")) {
      return [params[0][0] === 22
        ? [{ id: 23, parentCommentId: 22, content: "답글" }]
        : []];
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  const app = express();
  app.use("/api/community/free", communityFreeRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const url = `http://127.0.0.1:${server.address().port}/api/community/free/posts/9/comments?pageSize=1`;

  try {
    const first = await fetch(`${url}&page=1`).then((response) => response.json());
    assert.equal(first.total, 3);
    assert.equal(first.totalPages, 2);
    assert.deepEqual(first.items.map((item) => item.id), [22, 23]);

    const second = await fetch(`${url}&page=2`).then((response) => response.json());
    assert.deepEqual(second.items.map((item) => item.id), [11]);
  } finally {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
  }
});

test("free-board view count ignores repeated requests from the same visitor", async () => {
  const originalQuery = pool.query;
  let updates = 0;
  pool.query = async (sql) => {
    assert.match(sql, /UPDATE COMMUNITY_FREE_POST SET VIEW_COUNT/);
    updates += 1;
    return [{ affectedRows: 1 }];
  };
  const app = express();
  app.use("/api/community/free", communityFreeRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const url = `http://127.0.0.1:${server.address().port}/api/community/free/posts/90001/view`;

  try {
    for (let index = 0; index < 2; index += 1) {
      const response = await fetch(url, { method: "POST", headers: { "user-agent": "free-board-test" } });
      assert.equal(response.status, 204);
    }
    assert.equal(updates, 1);
  } finally {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
  }
});
