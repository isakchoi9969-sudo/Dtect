const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { pool } = require("../src/db/pool");
const communityRoutes = require("../src/routes/community.routes");
const { createAuthToken } = require("../src/services/authToken.service");

test("community routes filter by company, reject anonymous writes, and use the signed user ID", async () => {
  const originalQuery = pool.query;
  const calls = [];
  pool.query = async (sql, params = []) => {
    calls.push({ sql, params });
    if (sql.includes("LOGIN_ID NOT LIKE 'withdrawn_%'")) return [[{ USER_ID: 7 }]];
    if (sql.includes("SELECT COUNT(*) AS total")) return [[{ total: 1 }]];
    if (sql.includes("LEFT(p.CONTENT")) {
      return [[{ id: 4, companyId: 123, title: "게시글", comments: 0 }]];
    }
    if (sql.includes("UPDATE COMMUNITY_POST")) return [{ affectedRows: 1 }];
    if (sql.includes("SELECT COMPANY_ID FROM COMPANY")) return [[{ COMPANY_ID: 123 }]];
    if (sql.includes("SELECT POST_ID FROM COMMUNITY_POST")) return [[{ POST_ID: 4 }]];
    if (sql.includes("COMMENT_ID AS id")) return [[{ id: 2, content: "댓글" }]];
    if (sql.includes("INSERT INTO COMMUNITY_POST")) return [{ insertId: 9 }];
    if (sql.includes("INSERT INTO COMMUNITY_COMMENT")) return [{ insertId: 10 }];
    throw new Error(`Unexpected query: ${sql}`);
  };

  const app = express();
  app.use(express.json());
  app.use("/api/community", communityRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/community`;

  try {
    const listResponse = await fetch(`${baseUrl}/posts?companyId=123&sort=recent`);
    assert.equal(listResponse.status, 200);
    const list = await listResponse.json();
    assert.equal(list.total, 1);
    assert.equal(list.items[0].id, 4);
    assert.deepEqual(calls[0].params, [123]);
    assert.deepEqual(calls[1].params, [123, 10, 0]);

    const invalidCodeResponse = await fetch(`${baseUrl}/posts?stockCode=bad`);
    assert.equal(invalidCodeResponse.status, 400);

    const viewResponse = await fetch(`${baseUrl}/posts/4/view`, { method: "POST" });
    assert.equal(viewResponse.status, 204);

    const anonymousResponse = await fetch(`${baseUrl}/posts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ companyId: 123, title: "제목", content: "본문 내용 열 글자 이상입니다." }),
    });
    assert.equal(anonymousResponse.status, 401);

    const signedResponse = await fetch(`${baseUrl}/posts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `dtect_auth=${createAuthToken(7)}`,
      },
      body: JSON.stringify({ companyId: 123, title: "제목", content: "본문 내용 열 글자 이상입니다." }),
    });
    assert.equal(signedResponse.status, 201);
    assert.deepEqual(await signedResponse.json(), { id: 9 });
    assert.deepEqual(calls.at(-1).params, [123, 7, "제목", "본문 내용 열 글자 이상입니다."]);

    const commentResponse = await fetch(`${baseUrl}/posts/4/comments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `dtect_auth=${createAuthToken(7)}`,
      },
      body: JSON.stringify({ content: "댓글 내용" }),
    });
    assert.equal(commentResponse.status, 201);
    assert.deepEqual(calls.at(-1).params, [4, 7, null, "댓글 내용"]);

    const commentsResponse = await fetch(`${baseUrl}/posts/4/comments`);
    assert.equal(commentsResponse.status, 200);
    assert.equal((await commentsResponse.json()).items[0].id, 2);
  } finally {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
  }
});

test("community input helpers enforce positive IDs and bounded text", () => {
  const { positiveInteger, pageOptions, normalizedText } = communityRoutes._test;
  assert.equal(positiveInteger("-1"), null);
  assert.equal(positiveInteger("1.5"), null);
  assert.equal(positiveInteger("123"), 123);
  assert.deepEqual(pageOptions({ page: "2", pageSize: "999" }, 10), {
    page: 2,
    pageSize: 50,
    offset: 50,
  });
  assert.equal(normalizedText("  hello  ", 5), "hello");
  assert.equal(normalizedText("toolong", 5), "");
});
