function toDateOnly(value) {
  const matchedDate = String(value || "").match(/^\d{4}-\d{2}-\d{2}/);
  if (matchedDate) return matchedDate[0];

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** 현재 시뮬레이터 UI의 similarCases 데이터 구조로 최종 사례를 변환한다. */
function toSimilarCaseResponse(group) {
  return {
    caseId: group.caseId,
    issueId: group.issueId,
    issueName: group.issueName || group.caseName,
    companyName: group.companyName,
    industry: group.industry,
    riskType: group.riskType || group.storedRiskType || null,
    startDate: toDateOnly(group.storedStartDate || group.startDate),
    lastDate: toDateOnly(group.storedLastDate || group.lastDate),
    durationDays: group.storedStartDate && group.storedLastDate
      ? getDurationDays(group.storedStartDate, group.storedLastDate)
      : group.durationDays,
    articleCount: group.storedArticleCount ?? group.articleCount,
    semanticSimilarity: group.semanticSimilarity,
    finalScore: group.finalScore,
    representativeNewsId: group.representativeNewsId,
    representativeTitle: group.representativeTitle,
    description: group.description,
  };
}

function getDurationDays(startDate, lastDate) {
  const start = new Date(startDate);
  const last = new Date(lastDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(last.getTime())) return null;

  return Math.floor((last - start) / (24 * 60 * 60 * 1000)) + 1;
}

function buildSimulatorResponse(groups) {
  return {
    similarCases: groups
      .filter((group) => Number.isInteger(group.caseId) && Number.isInteger(group.issueId))
      .map(toSimilarCaseResponse),
  };
}

module.exports = {
  buildSimulatorResponse,
  toDateOnly,
  toSimilarCaseResponse,
};
