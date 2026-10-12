const assert = require("node:assert/strict");
const test = require("node:test");
const { buildDynamicCaseGroups } = require("../src/services/simulatorPipeline.service");
const { buildSimulatorResponse } = require("../src/services/simulatorResponse.service");

test("dynamic case changes keep the existing simulator response fields", () => {
  const [group] = buildDynamicCaseGroups([{
    companyId: 1,
    companyName: "SK텔레콤",
    industry: "통신업",
    startDate: "2025-04-22T00:00:00.000Z",
    lastDate: "2025-05-08T00:00:00.000Z",
    articleCount: 2,
    semanticSimilarity: 0.82,
    finalScore: 79.2,
    representativeNewsId: 101985,
    representativeTitle: "SK텔레콤 유심 정보 유출 사고 발생",
    representativeUrl: "https://example.com/news/101985",
    articles: [
      {
        newsId: 101985,
        title: "SK텔레콤 유심 정보 유출 사고 발생",
        cleanContent: "유심 정보 유출 관련 기사 본문",
        publishedAt: "2025-04-22T00:00:00.000Z",
      },
      {
        newsId: 101986,
        title: "SKT 유심 교체와 고객정보 유출 보상",
        cleanContent: "유심 교체와 보상 관련 기사 본문",
        publishedAt: "2025-05-08T00:00:00.000Z",
      },
    ],
  }], { majorCategory: "보안·개인정보", minorCategory: "개인정보 유출" });

  const response = buildSimulatorResponse([{ ...group, durationDays: 17, finalRank: 1 }]);
  const result = response.similarCases[0];

  assert.equal(response.similarCases.length, 1);
  assert.match(result.caseTitle, /유심/);
  assert.equal(result.articleCount, 2);
  assert.equal(result.representativeNewsId, 101985);
  assert.equal(result.sourceArticles.length, 2);
  assert.deepEqual(Object.keys(result).sort(), [
    "articleCount", "caseId", "caseTitle", "companyName", "description", "durationDays",
    "finalScore", "industry", "issueId", "issueName", "lastDate", "matchMethod",
    "representativeNewsId", "representativeTitle", "representativeUrl", "riskType",
    "semanticSimilarity", "source", "sourceArticles", "startDate",
  ].sort());
});
