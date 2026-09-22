const {
  getNewsEmbeddings,
  getIssueEmbedding,
  searchSimilarNews,
} = require("./aiClient.service");
const {
  getSimilarNewsCandidates,
  getSimulatorCompanies,
} = require("./simulatorCandidate.service");
const {
  getStoredCaseArticleIndex,
} = require("./simulatorCaseMapping.service");
const {
  buildIssueCentroids,
  buildStoredCaseCentroids,
  cosineSimilarity,
  filterGroupsByCaseSimilarity,
  filterGroupsByInternalSimilarity,
  groupCandidatesByTime,
  prepareCandidatesForClustering,
} = require("./simulatorClustering.service");
const { buildSimulatorResponse } = require("./simulatorResponse.service");
const {
  scoreCaseGroups,
  selectTopRankedCases,
} = require("./simulatorScoring.service");

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
async function getValidatedIssueGroups(title, content) {
  const [candidates, companies] = await Promise.all([
    getSimulationCandidates(title, content),
    getSimulatorCompanies(),
  ]);
  const preparedCandidates = prepareCandidatesForClustering(candidates, companies);
  const timeGroups = groupCandidatesByTime(preparedCandidates);
  const newsIds = [...new Set(
    timeGroups.flatMap((group) => group.articles.map((article) => article.newsId)),
  )];

  if (newsIds.length === 0) {
    return [];
  }

  const [embeddingsByNewsId, currentIssueEmbedding] = await Promise.all([
    getNewsEmbeddings(newsIds),
    getIssueEmbedding(title, content),
  ]);
  const internallySimilarGroups = filterGroupsByInternalSimilarity(
    timeGroups,
    embeddingsByNewsId,
  );
  const centroidGroups = buildIssueCentroids(
    internallySimilarGroups,
    embeddingsByNewsId,
  );
  return filterGroupsByCaseSimilarity(centroidGroups, currentIssueEmbedding);
}

/** 선택한 사례 유형을 현재 이슈의 AI 검색 문맥에 추가한다. */
function buildIssueSearchContent(title, content, majorCategory, minorCategory) {
  const normalizedTexts = new Set([title.trim()]);

  return [content, majorCategory, minorCategory]
    .filter(Boolean)
    .map((text) => text.trim())
    .filter((text) => {
      if (normalizedTexts.has(text)) return false;
      normalizedTexts.add(text);
      return true;
    })
    .join("\n");
}

/** 저장된 실제 사례만 점수화해 현재 UI용 similarCases 응답으로 변환한다. */
async function simulateSimilarCases(
  title,
  content,
  {
    currentIndustry = null,
    currentDate = new Date(),
    majorCategory = null,
    minorCategory = null,
  } = {},
) {
  const storedCases = await getStoredCaseArticleIndex();
  const storedNewsIds = [...new Set(
    storedCases.flatMap((storedCase) => [...storedCase.newsIds]),
  )];
  const [embeddingsByNewsId, currentIssueEmbedding] = await Promise.all([
    getNewsEmbeddings(storedNewsIds),
    getIssueEmbedding(
      title,
      buildIssueSearchContent(title, content, majorCategory, minorCategory),
    ),
  ]);
  const storedCaseGroups = buildStoredCaseCentroids(storedCases, embeddingsByNewsId)
    .map((group) => ({
      ...group,
      semanticSimilarity: cosineSimilarity(
        currentIssueEmbedding,
        group.centroid,
      ),
    }))
    .filter((group) => group.semanticSimilarity !== null);
  const scoredGroups = scoreCaseGroups(storedCaseGroups, {
    currentIndustry,
    currentDate,
  });
  return buildSimulatorResponse(selectTopRankedCases(scoredGroups));
}

module.exports = {
  buildIssueSearchContent,
  getSimulationCandidates,
  getValidatedIssueGroups,
  simulateSimilarCases,
};
