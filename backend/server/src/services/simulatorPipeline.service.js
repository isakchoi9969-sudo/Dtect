const {
  getNewsEmbeddings,
  getIssueEmbedding,
  searchSimilarNews,
  searchSimilarNewsByQueries,
} = require("./aiClient.service");
const {
  getKeywordNewsCandidates,
  getSimilarNewsCandidates,
  getSimulatorCompanies,
} = require("./simulatorCandidate.service");
const {
  buildIssueCentroids,
  filterGroupsByCaseSimilarity,
  filterGroupsByInternalSimilarity,
  groupCandidatesByTime,
  prepareCandidatesForClustering,
  SIMULATOR_RULES,
  splitGroupsBySemanticSimilarity,
} = require("./simulatorClustering.service");
const { buildSimulatorResponse } = require("./simulatorResponse.service");
const {
  scoreCaseGroups,
  selectTopSimilarCases,
  selectTopRankedCases,
} = require("./simulatorScoring.service");
const {
  getStoredCaseArticleIndex,
} = require("./simulatorCaseMapping.service");
const { getCategoryRule } = require("../config/simulatorCategory.config");

function mergeCandidatesByNewsId(candidates) {
  const candidatesByNewsId = new Map();

  for (const candidate of candidates) {
    const key = `${candidate.newsId}:${candidate.companyId ?? "none"}`;
    const previous = candidatesByNewsId.get(key);
    if (!previous || candidate.searchSource === "keyword") {
      candidatesByNewsId.set(key, candidate);
    }
  }

  return [...candidatesByNewsId.values()];
}

/**
 * 현재 이슈를 유사 뉴스 후보로 변환한다.
 * 이 단계는 사례 군집화 전에 필요한 기사·기업 데이터만 준비하며 DB를 변경하지 않는다.
 */
async function getSimulationCandidates(title, content) {
  const similarNews = await searchSimilarNews(title, content);
  return getSimilarNewsCandidates(similarNews);
}

/**
 * 현재 이슈에서 시간·기업·기사 간 의미 유사도 조건을 모두 통과한 사건 군집을 만든다.
 */
async function getValidatedIssueGroupResult(
  title,
  content,
  { majorCategory = null, minorCategory = null, searchQueries = null } = {},
) {
  const categoryRule = getCategoryRule(majorCategory, minorCategory);
  const queries = searchQueries?.length > 0 ? searchQueries : [{ title, content }];
  const [similarNews, companies] = await Promise.all([
    searchSimilarNewsByQueries(queries),
    getSimulatorCompanies(),
  ]);
  const semanticCandidates = await getSimilarNewsCandidates(similarNews);
  const articleSimilarityCut = categoryRule.articleSimilarityCut
    || SIMULATOR_RULES.articleSearchCut;
  const semanticCandidatesPassed = semanticCandidates.filter(
    (candidate) => candidate.similarity >= articleSimilarityCut,
  );
  // 소수 후보만 남아도 이후 기업·기간 군집화에서 전부 소실될 수 있으므로
  // 정확 소분류 검색으로 표본을 보충한다.
  const keywordFallbackUsed = Boolean(minorCategory) && semanticCandidatesPassed.length < 10;
  const keywordCandidates = keywordFallbackUsed
    ? await getKeywordNewsCandidates([minorCategory, ...categoryRule.aliases])
    : [];
  const candidates = mergeCandidatesByNewsId([
    ...semanticCandidates,
    ...keywordCandidates,
  ]);
  const preparedCandidates = prepareCandidatesForClustering(candidates, companies, {
    mode: categoryRule.mode,
    topicName: minorCategory || majorCategory || title,
    articleSimilarityCut,
  });
  const timeGroups = groupCandidatesByTime(preparedCandidates);
  const newsIds = [...new Set(
    timeGroups.flatMap((group) => group.articles.map((article) => article.newsId)),
  )];

  const diagnostics = {
    mode: categoryRule.mode,
    searchQueries: queries.length,
    chromaMatches: similarNews.length,
    enrichedCandidates: semanticCandidates.length,
    articleSimilarityCut,
    articleSimilarityPassed: semanticCandidatesPassed.length,
    keywordFallbackUsed,
    keywordCandidates: keywordCandidates.length,
    clusteringCandidates: preparedCandidates.length,
    timeGroups: timeGroups.length,
  };

  if (newsIds.length === 0) {
    return { groups: [], diagnostics };
  }

  const [embeddingsByNewsId, currentIssueEmbedding] = await Promise.all([
    getNewsEmbeddings(newsIds),
    getIssueEmbedding(title, content),
  ]);
  const semanticGroups = splitGroupsBySemanticSimilarity(
    timeGroups,
    embeddingsByNewsId,
  );
  const internallySimilarGroups = filterGroupsByInternalSimilarity(
    semanticGroups,
    embeddingsByNewsId,
  );
  const centroidGroups = buildIssueCentroids(
    internallySimilarGroups,
    embeddingsByNewsId,
  );
  const groups = filterGroupsByCaseSimilarity(centroidGroups, currentIssueEmbedding);

  return {
    groups,
    diagnostics: {
      ...diagnostics,
      semanticGroups: semanticGroups.length,
      internallySimilarGroups: internallySimilarGroups.length,
      centroidGroups: centroidGroups.length,
      caseSimilarityGroups: groups.length,
    },
  };
}

async function getValidatedIssueGroups(title, content, options = {}) {
  const { groups } = await getValidatedIssueGroupResult(title, content, options);
  return groups;
}

/** 선택한 사례 유형을 현재 이슈의 AI 검색 문맥에 추가한다. */
function buildIssueSearchContent(title, content, majorCategory, minorCategory) {
  const normalizedTexts = new Set([title.trim()]);
  const { aliases } = getCategoryRule(majorCategory, minorCategory);

  // UI에서 선택한 분류명뿐 아니라 해당 분류의 대표 검색어도 함께 넣는다.
  // 제목은 그대로 유지하므로 사용자가 입력한 이슈명이 검색의 가장 강한 기준이 된다.
  return [content, majorCategory, minorCategory, ...aliases]
    .filter(Boolean)
    .map((text) => text.trim())
    .filter((text) => {
      if (normalizedTexts.has(text)) return false;
      normalizedTexts.add(text);
      return true;
    })
    .join("\n");
}

/**
 * 기본 이슈 검색과 소분류별 별칭 검색을 독립적으로 만든다.
 * 별칭을 한 문맥에 모두 나열하면 특정 용어의 의미가 희석될 수 있어, 별칭마다 별도 BGE 쿼리를 사용한다.
 */
function buildIssueSearchQueries(title, content, majorCategory, minorCategory) {
  const searchContent = buildIssueSearchContent(
    title,
    content,
    majorCategory,
    minorCategory,
  );
  const { aliases } = getCategoryRule(majorCategory, minorCategory);
  const baseAliasContent = [title, content, majorCategory, minorCategory]
    .filter(Boolean)
    .map((text) => text.trim())
    .filter((text, index, values) => values.indexOf(text) === index)
    .join("\n");
  const seenQueries = new Set();

  return [
    { title, content: searchContent },
    ...aliases.map((alias) => ({ title: alias, content: baseAliasContent })),
  ].filter((query) => {
    const queryKey = `${query.title}\n${query.content}`;
    if (seenQueries.has(queryKey)) return false;
    seenQueries.add(queryKey);
    return true;
  });
}

/** Chroma 뉴스 군집을 DB 저장 없이도 화면에 표시할 수 있는 동적 사례로 변환한다. */
function buildDynamicCaseGroups(groups) {
  return groups.map((group) => ({
    ...group,
    caseId: null,
    issueId: null,
    issueName: group.representativeTitle,
    description: `${group.companyName} 관련 기사 ${group.articleCount}건이 ${group.startDate}부터 ${group.lastDate}까지 확인된 동적 과거 사례 후보입니다.`,
  }));
}

/** 시장·기업 경로가 동일한 기사 묶음을 만들었을 때 한 사례만 남긴다. */
function removeDuplicateDynamicGroups(groups) {
  const seenArticleSets = new Set();

  return groups.filter((group) => {
    const articleSetKey = group.articles
      .map((article) => article.newsId)
      .sort((left, right) => left - right)
      .join(",");
    if (seenArticleSets.has(articleSetKey)) return false;
    seenArticleSets.add(articleSetKey);
    return true;
  });
}

function normalizeFallbackText(value) {
  return String(value || "")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\s·._/\\-]+/g, "");
}

/**
 * Chroma 원본 파일이 없는 개발 환경에서는 MySQL에 등록된 실제 과거 사례를
 * 사례명·이슈명·설명·위험 유형과 선택한 분류어로 비교해 반환한다.
 */
async function getStoredCaseFallbackGroups(
  title,
  majorCategory,
  minorCategory,
) {
  const { aliases } = getCategoryRule(majorCategory, minorCategory);
  const weightedTerms = [
    { text: minorCategory, similarity: 0.95 },
    { text: title, similarity: 0.9 },
    ...aliases.map((text) => ({ text, similarity: 0.85 })),
    { text: majorCategory, similarity: 0.75 },
  ]
    .map((term) => ({
      ...term,
      normalized: normalizeFallbackText(term.text),
    }))
    .filter((term) => term.normalized);
  const storedCases = await getStoredCaseArticleIndex();

  return storedCases.flatMap((storedCase) => {
    const searchableText = normalizeFallbackText([
      storedCase.caseName,
      storedCase.issueName,
      storedCase.description,
      storedCase.caseRiskType,
      storedCase.issueRiskType,
    ].join(" "));
    const matchedTerms = weightedTerms.filter((term) =>
      searchableText.includes(term.normalized),
    );

    if (matchedTerms.length === 0) return [];

    const semanticSimilarity = Math.max(
      ...matchedTerms.map((term) => term.similarity),
    );
    const newsIds = [...storedCase.newsIds];

    return [{
      ...storedCase,
      startDate: storedCase.issueStartDate,
      lastDate: storedCase.issueLastDate,
      articleCount: storedCase.issueArticleCount,
      storedStartDate: storedCase.issueStartDate,
      storedLastDate: storedCase.issueLastDate,
      storedArticleCount: storedCase.issueArticleCount,
      storedRiskType: storedCase.caseRiskType || storedCase.issueRiskType,
      representativeNewsId: newsIds[0] ?? null,
      representativeTitle: storedCase.issueName,
      semanticSimilarity,
      matchMethod: "category",
    }];
  });
}

function isVectorStoreUnavailable(error) {
  return error?.response?.status === 503;
}

/**
 * Chroma에서 찾은 동적 사례만 점수화한다.
 * 과거에 등록한 개인정보 유출 사례를 결과 부족 시 대신 반환하지 않는다.
 */
async function simulateSimilarCases(
  title,
  content,
  {
    currentIndustry = null,
    currentDate = new Date(),
    majorCategory = null,
    minorCategory = null,
    includeDiagnostics = false,
  } = {},
) {
  const searchContent = buildIssueSearchContent(
    title,
    content,
    majorCategory,
    minorCategory,
  );
  const searchQueries = buildIssueSearchQueries(
    title,
    content,
    majorCategory,
    minorCategory,
  );
  let validationResult;

  try {
    validationResult = await getValidatedIssueGroupResult(title, searchContent, {
      majorCategory,
      minorCategory,
      searchQueries,
    });
  } catch (error) {
    if (!isVectorStoreUnavailable(error)) throw error;

    const fallbackGroups = await getStoredCaseFallbackGroups(
      title,
      majorCategory,
      minorCategory,
    );
    const scoredFallbackGroups = scoreCaseGroups(fallbackGroups, {
      currentIndustry,
      currentDate,
    });
    const selectedFallbackGroups = selectTopRankedCases(scoredFallbackGroups);
    const fallbackResponse = buildSimulatorResponse(selectedFallbackGroups);

    if (!includeDiagnostics) return fallbackResponse;

    return {
      ...fallbackResponse,
      diagnostics: {
        mode: "STORED_CASE_FALLBACK",
        reason: error.response?.data?.detail || "vector store unavailable",
        storedCasesMatched: fallbackGroups.length,
        finalCases: selectedFallbackGroups.length,
      },
    };
  }
  const scoredDynamicGroups = scoreCaseGroups(
    removeDuplicateDynamicGroups(buildDynamicCaseGroups(validationResult.groups)),
    { currentIndustry, currentDate },
  );
  const selectedGroups = selectTopSimilarCases(scoredDynamicGroups);
  const response = buildSimulatorResponse(selectedGroups);

  if (!includeDiagnostics) return response;

  return {
    ...response,
    diagnostics: {
      ...validationResult.diagnostics,
      scoredGroups: scoredDynamicGroups.length,
      finalCases: selectedGroups.length,
    },
  };
}

module.exports = {
  buildIssueSearchContent,
  buildIssueSearchQueries,
  buildDynamicCaseGroups,
  getStoredCaseFallbackGroups,
  isVectorStoreUnavailable,
  mergeCandidatesByNewsId,
  removeDuplicateDynamicGroups,
  getSimulationCandidates,
  getValidatedIssueGroupResult,
  getValidatedIssueGroups,
  simulateSimilarCases,
};
