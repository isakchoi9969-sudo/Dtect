const assert = require("node:assert/strict");
const test = require("node:test");
const {
  CASE_SPECIFICITY,
  buildCaseProfile,
  buildCaseTitle,
} = require("../src/services/simulatorCaseTitle.service");
const { selectTopSimilarCases } = require("../src/services/simulatorScoring.service");

function article(title, newsId) {
  return { title, cleanTitle: title, content: title, newsId };
}

function scoredGroup(overrides = {}) {
  return {
    caseId: null,
    companyId: 1,
    eventType: "개인정보 유출",
    eventSpecificity: CASE_SPECIFICITY.SPECIFIC,
    anchorKeywords: ["유심"],
    articleCount: 2,
    semanticSimilarity: 0.82,
    finalScore: 75,
    ...overrides,
  };
}

test("specific article cluster gets an anchor-based case title", () => {
  const group = {
    companyName: "SK텔레콤",
    startDate: "2025-04-22",
    articles: [
      article("SK텔레콤 유심 정보 유출 사고 발생", 1),
      article("SKT 유심 교체와 고객정보 유출 보상", 2),
    ],
  };
  const profile = buildCaseProfile(group);

  assert.equal(profile.eventSpecificity, CASE_SPECIFICITY.SPECIFIC);
  assert.ok(profile.anchorKeywords.includes("유심"));
  assert.match(buildCaseTitle({ ...group, ...profile }), /유심/);
  assert.match(buildCaseTitle({ ...group, ...profile }), /개인정보 유출/);
});

test("telecom-wide security commentary is classified as a general issue", () => {
  const profile = buildCaseProfile({
    companyName: "SK텔레콤",
    articles: [
      article("자고 일어나면 해킹 사고, 범정부 컨트롤타워 서둘러라", 1),
      article("구멍 뚫린 통신업계 보안", 2),
      article("통신 3사 덮친 해킹 공포", 3),
    ],
  });

  assert.equal(profile.eventSpecificity, CASE_SPECIFICITY.GENERAL);
});

test("final selection excludes general issues and does not force three cases", () => {
  const selected = selectTopSimilarCases([
    scoredGroup({ companyId: 1, anchorKeywords: ["유심"], finalScore: 90 }),
    scoredGroup({
      companyId: 1,
      eventSpecificity: CASE_SPECIFICITY.GENERAL,
      anchorKeywords: [],
      finalScore: 89,
    }),
    scoredGroup({
      companyId: 2,
      eventType: "개인정보 유출",
      anchorKeywords: ["고객정보"],
      finalScore: 88,
    }),
  ]);

  assert.equal(selected.length, 2);
  assert.deepEqual(selected.map((group) => group.finalRank), [1, 2]);
});

test("same company and same event anchor is selected once", () => {
  const selected = selectTopSimilarCases([
    scoredGroup({ finalScore: 90 }),
    scoredGroup({ finalScore: 80 }),
  ]);

  assert.equal(selected.length, 1);
});

test("same-company events with different anchors remain separate", () => {
  const selected = selectTopSimilarCases([
    scoredGroup({ anchorKeywords: ["유심"], finalScore: 90 }),
    scoredGroup({ anchorKeywords: ["서버"], finalScore: 80 }),
  ]);

  assert.equal(selected.length, 2);
});
