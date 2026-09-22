const { pool } = require("../db/pool");

const SELECT_STORED_CASES_BY_REPRESENTATIVE_NEWS = `
  SELECT
    issueNews.NEWS_ID AS representativeNewsId,
    crisisCase.CASE_ID AS caseId,
    crisisCase.ISSUE_ID AS issueId,
    crisisCase.COMPANY_ID AS companyId,
    crisisCase.CASE_NAME AS caseName,
    crisisCase.RISK_TYPE AS caseRiskType,
    crisisCase.DESCRIPTION AS description,
    issueTable.ISSUE_NAME AS issueName,
    issueTable.RISK_TYPE AS issueRiskType
    , DATE_FORMAT(issueTable.START_DATE, '%Y-%m-%d') AS issueStartDate
    , DATE_FORMAT(issueTable.LAST_DATE, '%Y-%m-%d') AS issueLastDate
    , (
      SELECT COUNT(*)
      FROM ISSUE_NEWS issueNewsCount
      WHERE issueNewsCount.ISSUE_ID = issueTable.ISSUE_ID
    ) AS issueArticleCount
  FROM ISSUE_NEWS issueNews
  JOIN ISSUE issueTable ON issueTable.ISSUE_ID = issueNews.ISSUE_ID
  JOIN CRISIS_CASE crisisCase ON crisisCase.ISSUE_ID = issueTable.ISSUE_ID
  WHERE issueNews.NEWS_ID IN (?)
  ORDER BY crisisCase.CASE_ID ASC
`;

const SELECT_STORED_CASE_ARTICLES = `
  SELECT
    crisisCase.CASE_ID AS caseId,
    crisisCase.ISSUE_ID AS issueId,
    crisisCase.COMPANY_ID AS companyId,
    crisisCase.CASE_NAME AS caseName,
    crisisCase.RISK_TYPE AS caseRiskType,
    crisisCase.DESCRIPTION AS description,
    issueTable.ISSUE_NAME AS issueName,
    issueTable.RISK_TYPE AS issueRiskType,
    DATE_FORMAT(issueTable.START_DATE, '%Y-%m-%d') AS issueStartDate,
    DATE_FORMAT(issueTable.LAST_DATE, '%Y-%m-%d') AS issueLastDate,
    company.COMPANY_NAME AS companyName,
    company.INDUSTRY AS industry,
    issueNews.NEWS_ID AS newsId
  FROM CRISIS_CASE crisisCase
  JOIN ISSUE issueTable ON issueTable.ISSUE_ID = crisisCase.ISSUE_ID
  JOIN ISSUE_NEWS issueNews ON issueNews.ISSUE_ID = issueTable.ISSUE_ID
  JOIN COMPANY company ON company.COMPANY_ID = crisisCase.COMPANY_ID
  ORDER BY crisisCase.CASE_ID ASC, issueNews.NEWS_ID ASC
`;

function toStoredCase(row) {
  return {
    caseId: Number(row.caseId),
    issueId: Number(row.issueId),
    companyId: Number(row.companyId),
    caseName: row.caseName,
    caseRiskType: row.caseRiskType || null,
    description: row.description,
    issueName: row.issueName,
    issueRiskType: row.issueRiskType || null,
    issueStartDate: row.issueStartDate || null,
    issueLastDate: row.issueLastDate || null,
    companyName: row.companyName || null,
    industry: row.industry || null,
    issueArticleCount: Number(row.issueArticleCount),
  };
}

/** 대표 뉴스별 저장 사례 후보를 조회한다. */
async function getStoredCasesByRepresentativeNewsIds(representativeNewsIds) {
  if (!representativeNewsIds || representativeNewsIds.length === 0) {
    return new Map();
  }

  const [rows] = await pool.query(
    SELECT_STORED_CASES_BY_REPRESENTATIVE_NEWS,
    [representativeNewsIds],
  );
  const casesByRepresentativeNewsId = new Map();

  for (const row of rows) {
    const representativeNewsId = Number(row.representativeNewsId);
    const storedCase = toStoredCase(row);
    const existing = casesByRepresentativeNewsId.get(representativeNewsId) || [];
    existing.push(storedCase);
    casesByRepresentativeNewsId.set(representativeNewsId, existing);
  }

  return casesByRepresentativeNewsId;
}

/** 저장 사례별 연결 뉴스 ID 집합을 조회한다. */
async function getStoredCaseArticleIndex() {
  const [rows] = await pool.query(SELECT_STORED_CASE_ARTICLES);
  const storedCases = new Map();

  for (const row of rows) {
    const caseId = Number(row.caseId);
    let storedCase = storedCases.get(caseId);
    if (!storedCase) {
      storedCase = { ...toStoredCase(row), newsIds: new Set() };
      storedCases.set(caseId, storedCase);
    }
    storedCase.newsIds.add(Number(row.newsId));
  }

  for (const storedCase of storedCases.values()) {
    storedCase.issueArticleCount = storedCase.newsIds.size;
  }

  return [...storedCases.values()];
}

function applyStoredCase(group, storedCase) {
  return {
    ...group,
    caseId: storedCase.caseId,
    issueId: storedCase.issueId,
    issueName: storedCase.issueName,
    caseName: storedCase.caseName,
    description: storedCase.description,
    storedRiskType: storedCase.caseRiskType || storedCase.issueRiskType,
    storedStartDate: storedCase.issueStartDate,
    storedLastDate: storedCase.issueLastDate,
    storedArticleCount: storedCase.issueArticleCount,
  };
}

/**
 * 대표 뉴스가 정확히 하나의 같은-기업 저장 사례에 연결될 때만 DB 사례를 부여한다.
 */
function mapGroupsToStoredCases(groups, casesByRepresentativeNewsId) {
  return groups.flatMap((group) => {
    const matches = casesByRepresentativeNewsId.get(group.representativeNewsId) || [];
    if (matches.length !== 1 || matches[0].companyId !== group.companyId) {
      return [];
    }

    return [applyStoredCase(group, matches[0])];
  });
}

/**
 * 대표 뉴스가 달라도 군집 기사 전체와 ISSUE_NEWS가 가장 많이 겹치는 실제 사례를 연결한다.
 */
function mapGroupsByArticleOverlap(groups, storedCases) {
  return groups.flatMap((group) => {
    const groupNewsIds = new Set(group.articles.map((article) => article.newsId));
    const rankedMatches = storedCases
      .filter((storedCase) => storedCase.companyId === group.companyId)
      .map((storedCase) => ({
        storedCase,
        overlapCount: [...groupNewsIds].filter((newsId) => storedCase.newsIds.has(newsId)).length,
      }))
      .filter((match) => match.overlapCount > 0)
      .sort((left, right) => right.overlapCount - left.overlapCount);

    if (rankedMatches.length === 0) return [];
    if (
      rankedMatches.length > 1
      && rankedMatches[0].overlapCount === rankedMatches[1].overlapCount
    ) {
      return [];
    }

    return [{
      ...applyStoredCase(group, rankedMatches[0].storedCase),
      caseArticleOverlapCount: rankedMatches[0].overlapCount,
    }];
  });
}

module.exports = {
  SELECT_STORED_CASES_BY_REPRESENTATIVE_NEWS,
  SELECT_STORED_CASE_ARTICLES,
  getStoredCasesByRepresentativeNewsIds,
  getStoredCaseArticleIndex,
  mapGroupsToStoredCases,
  mapGroupsByArticleOverlap,
};
