const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateCompanySearchScore,
  calculateIndustrySearchScore,
} = require("../src/services/companySearch.service");

const company = {
  companyName: "삼성SDI",
  stockCode: "006400",
  industry: "2차전지 · 배터리",
  ceoName: "김성수",
  companyInfo: "전기차 배터리와 첨단 소재를 개발하는 기업입니다.",
};

test("기업 검색은 기업명 외 정보도 검색 대상으로 사용한다", () => {
  assert.ok(calculateCompanySearchScore("삼성SDI", company) >= 0.4);
  assert.ok(calculateCompanySearchScore("배터리", company) >= 0.4);
  assert.ok(calculateCompanySearchScore("첨단소재", company) >= 0.4);
  assert.ok(calculateCompanySearchScore("김성수", company) >= 0.4);
  assert.ok(calculateCompanySearchScore("006400", company) >= 0.4);
  assert.equal(calculateCompanySearchScore("관련없는단어", company), 0);
});

test("산업 검색은 산업 분류와 기업 설명만 검색한다", () => {
  assert.ok(calculateIndustrySearchScore("배터리", company) >= 0.4);
  assert.ok(calculateIndustrySearchScore("첨단소재", company) >= 0.4);
  assert.equal(calculateIndustrySearchScore("김성수", company), 0);
  assert.equal(calculateIndustrySearchScore("006400", company), 0);
});
