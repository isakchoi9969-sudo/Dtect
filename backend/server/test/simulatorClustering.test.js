const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildIssueCentroids,
  mergeRelatedIssueGroups,
} = require("../src/services/simulatorClustering.service");

function makeArticle(newsId, publishedAt) {
  return {
    newsId,
    publishedAt,
    title: `기사 ${newsId}`,
    cleanContent: `본문 ${newsId}`,
  };
}

function makeGroup(companyId, companyName, newsId, publishedAt) {
  return {
    companyId,
    companyName,
    clusterKey: `company:${companyId}`,
    articles: [makeArticle(newsId, publishedAt)],
    startDate: publishedAt,
    lastDate: publishedAt,
    articleCount: 1,
  };
}

test("same-company initial and follow-up groups merge even without identical article IDs", () => {
  const embeddings = new Map([
    [101, [1, 0]],
    [202, [0.99, 0.01]],
  ]);
  const groups = buildIssueCentroids([
    makeGroup(1, "SK텔레콤", 101, "2025-04-22T00:00:00.000Z"),
    makeGroup(1, "SK텔레콤", 202, "2025-05-08T00:00:00.000Z"),
  ], embeddings);

  const merged = mergeRelatedIssueGroups(groups, embeddings);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].articleCount, 2);
  assert.deepEqual(merged[0].articles.map((article) => article.newsId), [101, 202]);
  assert.equal(merged[0].mergedGroupCount, 2);
});

test("groups from different companies remain separate even when their vectors are identical", () => {
  const embeddings = new Map([
    [101, [1, 0]],
    [202, [1, 0]],
  ]);
  const groups = buildIssueCentroids([
    makeGroup(1, "SK텔레콤", 101, "2025-04-22T00:00:00.000Z"),
    makeGroup(2, "쿠팡", 202, "2025-05-08T00:00:00.000Z"),
  ], embeddings);

  assert.equal(mergeRelatedIssueGroups(groups, embeddings).length, 2);
});

test("same-company groups remain separate when their semantic centroids differ", () => {
  const embeddings = new Map([
    [101, [1, 0]],
    [202, [0, 1]],
  ]);
  const groups = buildIssueCentroids([
    makeGroup(1, "SK텔레콤", 101, "2025-04-22T00:00:00.000Z"),
    makeGroup(1, "SK텔레콤", 202, "2025-05-08T00:00:00.000Z"),
  ], embeddings);

  assert.equal(mergeRelatedIssueGroups(groups, embeddings).length, 2);
});

test("same-company groups remain separate when their date gap exceeds the same-event window", () => {
  const embeddings = new Map([
    [101, [1, 0]],
    [202, [1, 0]],
  ]);
  const groups = buildIssueCentroids([
    makeGroup(1, "SK텔레콤", 101, "2025-04-22T00:00:00.000Z"),
    makeGroup(1, "SK텔레콤", 202, "2025-06-01T00:00:00.000Z"),
  ], embeddings);

  assert.equal(mergeRelatedIssueGroups(groups, embeddings).length, 2);
});
