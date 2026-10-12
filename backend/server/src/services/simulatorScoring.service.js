const { SIMULATOR_RULES } = require("./simulatorClustering.service");
const { CASE_SPECIFICITY } = require("./simulatorCaseTitle.service");

function round(value, digits) {
  return Number(value.toFixed(digits));
}

function getRecencyScore(startDate, currentDate = new Date()) {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(current.getTime())) {
    return 0;
  }

  const yearsAgo = Math.floor((current - start) / (24 * 60 * 60 * 1000)) / 365.25;
  if (yearsAgo <= 1) return 10;
  if (yearsAgo <= 2) return 8;
  if (yearsAgo <= 3) return 6;
  if (yearsAgo <= 4) return 4;
  return 2;
}

function getDurationDays(startDate, lastDate) {
  const start = new Date(startDate);
  const last = new Date(lastDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(last.getTime())) {
    return null;
  }

  return Math.floor((last - start) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Colab 원안 점수: BGE 60 + 임시 위험 20 + 산업 10 + 최근성 10.
 * NEWS_ANALYSIS가 비어 있어 위험 점수는 현재 모든 사례에 동일하게 20점을 부여한다.
 */
function scoreCaseGroups(groups, { currentIndustry = null, currentDate = new Date() } = {}) {
  return groups.map((group) => {
    const semanticSimilarity = round(group.semanticSimilarity, 4);
    const bgeScore = round(semanticSimilarity * SIMULATOR_RULES.bgeScoreWeight, 2);
    const riskScore = SIMULATOR_RULES.riskScoreWeight;
    const industryScore = currentIndustry && group.industry === currentIndustry
      ? SIMULATOR_RULES.industryScoreWeight
      : 0;
    const recencyScore = getRecencyScore(group.startDate, currentDate);
    const finalScore = round(
      bgeScore + riskScore + industryScore + recencyScore,
      2,
    );

    return {
      ...group,
      riskType: group.storedRiskType || null,
      durationDays: getDurationDays(group.startDate, group.lastDate),
      semanticSimilarity,
      bgeScore,
      riskScore,
      industryScore,
      recencyScore,
      finalScore,
    };
  });
}

function isEligibleDynamicCase(group) {
  if (group.caseId !== null && group.caseId !== undefined) return true;
  if (group.eventSpecificity !== CASE_SPECIFICITY.SPECIFIC) return false;
  if (group.articleCount >= 2) return true;

  // 후보 생성은 기존처럼 1건도 허용하되, 최종 노출은 매우 높은 의미 유사도의 단일 기사만 허용한다.
  return group.articleCount === 1 && group.semanticSimilarity >= 0.75;
}

function isDuplicateSelectedCase(candidate, selected) {
  if (
    candidate.caseId !== null
    || candidate.companyId === null
    || candidate.companyId === undefined
  ) return false;

  // 고유 핵심어가 없는 두 사건은 실제로 다른 사건일 수 있으므로 여기서 합치지 않는다.
  // 그런 경우는 앞선 centroid·기간 병합 단계가 처리한다.
  if (!candidate.anchorKeywords?.length) return false;

  return selected.some((existing) =>
    existing.caseId === null
    && existing.companyId === candidate.companyId
    && existing.eventType === candidate.eventType
    && existing.anchorKeywords?.length > 0
    && existing.anchorKeywords.join("|") === candidate.anchorKeywords.join("|")
  );
}

/** 사건성·의미 유사도·최종 점수 기준을 통과한 서로 다른 최대 3개 사례에 순위를 부여한다. */
function selectTopSimilarCases(scoredGroups) {
  const selected = [];
  const sortedGroups = scoredGroups
    .filter((group) =>
      group.semanticSimilarity >= SIMULATOR_RULES.caseSimilarityCut
      && group.finalScore >= SIMULATOR_RULES.finalScoreCut,
    )
    .filter(isEligibleDynamicCase)
    .sort((left, right) => right.finalScore - left.finalScore);

  for (const group of sortedGroups) {
    if (isDuplicateSelectedCase(group, selected)) continue;
    selected.push(group);
    if (selected.length === SIMULATOR_RULES.topK) break;
  }

  return selected.map((group, index) => ({ ...group, finalRank: index + 1 }));
}

/**
 * 이슈명 단독 검색의 임시 결과 정책: 저장된 실제 사례 중 상위 3개를 항상 반환한다.
 * 추후 사례 유형 선택값이 추가되면 해당 유형으로 후보를 좁힌 뒤 이 순위를 적용한다.
 */
function selectTopRankedCases(scoredGroups) {
  return scoredGroups
    .sort((left, right) => right.finalScore - left.finalScore)
    .slice(0, SIMULATOR_RULES.topK)
    .map((group, index) => ({ ...group, finalRank: index + 1 }));
}

module.exports = {
  getDurationDays,
  getRecencyScore,
  isEligibleDynamicCase,
  scoreCaseGroups,
  selectTopSimilarCases,
  selectTopRankedCases,
};
