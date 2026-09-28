import assert from "node:assert/strict";
import test from "node:test";
import { paginate } from "../src/utils/pagination.js";

const latestFirstArticles = Array.from({ length: 23 }, (_, index) => ({
  title: `기사 ${index + 1}`,
}));

test("page 1 contains the 10 latest articles", () => {
  assert.deepEqual(paginate(latestFirstArticles, 1).map((article) => article.title),
    Array.from({ length: 10 }, (_, index) => `기사 ${index + 1}`));
});

test("page 2 contains the next 10 older articles without overlap", () => {
  assert.deepEqual(paginate(latestFirstArticles, 2).map((article) => article.title),
    Array.from({ length: 10 }, (_, index) => `기사 ${index + 11}`));
});

test("last page retains the remaining articles and out-of-range pages clamp safely", () => {
  assert.deepEqual(paginate(latestFirstArticles, 3).map((article) => article.title),
    ["기사 21", "기사 22", "기사 23"]);
  assert.deepEqual(paginate(latestFirstArticles, 999), paginate(latestFirstArticles, 3));
});
