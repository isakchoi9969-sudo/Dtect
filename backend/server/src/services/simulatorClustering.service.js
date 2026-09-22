const crypto = require("crypto");
const {
  buildCompanyAliases,
  detectCoreCompanies,
} = require("./simulatorCompany.service");

/**
 * Colab에서 검증한 과거 유사사례 시뮬레이터 기준값.
 * 화면 또는 환경변수에서 임의로 변경하지 않는다.
 */
const SIMULATOR_RULES = Object.freeze({
  searchTopN: 100,
  articleSearchCut: 0.55,
  maxGapDays: 10,
  minArticles: 3,
  issueSimilarityCut: 0.7,
  caseSimilarityCut: 0.6,
  bgeScoreWeight: 60,
  riskScoreWeight: 20,
  industryScoreWeight: 10,
  recencyScoreWeight: 10,
  // 사용자 요청: 업종 점수 미전달 시에도 의미적으로 충분히 유사한 사례를 표시한다.
  finalScoreCut: 60,
  topK: 3,
});

function makeArticleTextHash(article) {
  const fullText = `${String(article.cleanTitle || "").trim()} ${String(
    article.cleanContent || "",
  ).trim()}`;

  return crypto.createHash("sha256").update(fullText, "utf8").digest("hex");
}

function publishedAtTimestamp(article) {
  const timestamp = new Date(article.publishedAt).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

/**
 * 검색된 기사를 원안 순서대로 필터링·핵심 기업 판별·중복 제거·기업별 분리한다.
 */
function prepareCandidatesForClustering(candidates, companies) {
  const aliasesByCompany = buildCompanyAliases(companies);
  const companiesByName = new Map(
    companies.map((company) => [company.companyName, company]),
  );

  const detectedCandidates = candidates
    .filter((candidate) => candidate.similarity >= SIMULATOR_RULES.articleSearchCut)
    .map((candidate) => ({
      ...candidate,
      coreCompanies: detectCoreCompanies(candidate, aliasesByCompany),
      textHash: makeArticleTextHash(candidate),
    }))
    .filter((candidate) => candidate.coreCompanies.length > 0)
    .sort((a, b) => publishedAtTimestamp(a) - publishedAtTimestamp(b));

  const seenHashes = new Set();
  const uniqueCandidates = detectedCandidates.filter((candidate) => {
    if (seenHashes.has(candidate.textHash)) return false;
    seenHashes.add(candidate.textHash);
    return true;
  });

  return uniqueCandidates.flatMap(({ coreCompanies, textHash, ...candidate }) =>
    coreCompanies.flatMap((companyName) => {
      const company = companiesByName.get(companyName);
      if (!company) return [];

      return [{
        ...candidate,
        companyId: company.companyId,
        companyName,
        industry: company.industry,
      }];
    }),
  );
}

function toPublishedAt(article) {
  const publishedAt = new Date(article.publishedAt);
  return Number.isNaN(publishedAt.getTime()) ? null : publishedAt;
}

/**
 * 같은 기업의 이전 기사와 10일을 초과해 벌어질 때 새 사건 군집을 시작한다.
 * 각 군집은 최소 3개 기사를 포함해야 다음 단계로 전달한다.
 */
function groupCandidatesByTime(candidates) {
  const orderedCandidates = candidates
    .map((candidate) => ({ ...candidate, publishedAtDate: toPublishedAt(candidate) }))
    .filter((candidate) => candidate.publishedAtDate !== null)
    .sort((a, b) =>
      a.companyName.localeCompare(b.companyName, "ko")
      || a.publishedAtDate - b.publishedAtDate
      || a.newsId - b.newsId,
    );

  const groups = [];
  const previousByCompany = new Map();
  const groupNumberByCompany = new Map();
  const groupByKey = new Map();

  for (const candidate of orderedCandidates) {
    const companyKey = String(candidate.companyId);
    const previous = previousByCompany.get(companyKey);
    const gapDays = previous
      ? Math.floor((candidate.publishedAtDate - previous) / (24 * 60 * 60 * 1000))
      : null;

    if (gapDays === null || gapDays > SIMULATOR_RULES.maxGapDays) {
      groupNumberByCompany.set(companyKey, (groupNumberByCompany.get(companyKey) || 0) + 1);
    }

    const tempGroup = groupNumberByCompany.get(companyKey);
    const groupKey = `${companyKey}:${tempGroup}`;
    let group = groupByKey.get(groupKey);

    if (!group) {
      group = {
        companyId: candidate.companyId,
        companyName: candidate.companyName,
        industry: candidate.industry,
        tempGroup,
        articles: [],
      };
      groupByKey.set(groupKey, group);
      groups.push(group);
    }

    group.articles.push(candidate);
    previousByCompany.set(companyKey, candidate.publishedAtDate);
  }

  return groups
    .filter((group) => group.articles.length >= SIMULATOR_RULES.minArticles)
    .map((group) => ({
      ...group,
      startDate: group.articles[0].publishedAt,
      lastDate: group.articles[group.articles.length - 1].publishedAt,
      articleCount: group.articles.length,
    }));
}

function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return null;
  }

  let dotProduct = 0;
  let leftNormSquared = 0;
  let rightNormSquared = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = Number(left[index]);
    const rightValue = Number(right[index]);
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return null;

    dotProduct += leftValue * rightValue;
    leftNormSquared += leftValue * leftValue;
    rightNormSquared += rightValue * rightValue;
  }

  if (leftNormSquared === 0 || rightNormSquared === 0) return null;
  return dotProduct / Math.sqrt(leftNormSquared * rightNormSquared);
}

/** 모든 기사 쌍의 cosine 유사도가 0.70 이상인 군집만 남긴다. */
function filterGroupsByInternalSimilarity(groups, embeddingsByNewsId) {
  return groups.flatMap((group) => {
    const embeddings = group.articles.map((article) => embeddingsByNewsId.get(article.newsId));
    let minimumPairSimilarity = 1;
    const pairSimilarities = [];

    for (let leftIndex = 0; leftIndex < embeddings.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < embeddings.length; rightIndex += 1) {
        const similarity = cosineSimilarity(embeddings[leftIndex], embeddings[rightIndex]);
        if (similarity === null || similarity < SIMULATOR_RULES.issueSimilarityCut) {
          return [];
        }
        minimumPairSimilarity = Math.min(minimumPairSimilarity, similarity);
        pairSimilarities.push(similarity);
      }
    }

    const averagePairSimilarity = pairSimilarities.reduce(
      (sum, similarity) => sum + similarity,
      0,
    ) / pairSimilarities.length;
    return [{ ...group, minimumPairSimilarity, averagePairSimilarity }];
  });
}

function normalizeVector(vector) {
  const normSquared = vector.reduce((sum, value) => sum + value * value, 0);
  if (normSquared === 0) return null;

  const norm = Math.sqrt(normSquared);
  return vector.map((value) => value / norm);
}

function calculateCentroid(embeddings) {
  if (embeddings.length === 0) return null;

  const dimensions = embeddings[0].length;
  if (!embeddings.every((embedding) => embedding.length === dimensions)) return null;

  const summed = Array(dimensions).fill(0);
  for (const embedding of embeddings) {
    for (let index = 0; index < dimensions; index += 1) {
      summed[index] += embedding[index];
    }
  }

  return normalizeVector(summed.map((value) => value / embeddings.length));
}

/**
 * 통과 군집의 정규화 centroid와 대표 기사를 만든다.
 * 대표 기사는 centroid 유사도 상위 3개 중 정제 본문이 가장 긴 기사다.
 */
function buildIssueCentroids(groups, embeddingsByNewsId) {
  return groups.flatMap((group) => {
    const embeddings = group.articles.map((article) => embeddingsByNewsId.get(article.newsId));
    if (embeddings.some((embedding) => !embedding)) return [];

    const centroid = calculateCentroid(embeddings);
    if (!centroid) return [];

    const topThreeByCentroid = group.articles
      .map((article, index) => ({
        article,
        centroidSimilarity: cosineSimilarity(embeddings[index], centroid),
        contentLength: String(article.cleanContent || "").length,
      }))
      .filter((item) => item.centroidSimilarity !== null)
      .sort((left, right) => right.centroidSimilarity - left.centroidSimilarity)
      .slice(0, 3);

    if (topThreeByCentroid.length === 0) return [];

    const representative = topThreeByCentroid.sort((left, right) =>
      right.contentLength - left.contentLength
      || right.centroidSimilarity - left.centroidSimilarity,
    )[0];

    return [{
      ...group,
      centroid,
      representativeNewsId: representative.article.newsId,
      representativeDate: representative.article.publishedAt,
      representativeTitle: representative.article.title,
      representativeCentroidSimilarity: representative.centroidSimilarity,
    }];
  });
}

/**
 * 저장된 실제 사례의 모든 기사 벡터를 평균 내어 사례별 centroid를 만든다.
 * 검색 후보 기사와의 우연한 ID 중복 여부와 무관하게, 등록된 사례 자체를 비교한다.
 */
function buildStoredCaseCentroids(storedCases, embeddingsByNewsId) {
  return storedCases.flatMap((storedCase) => {
    const newsIds = [...storedCase.newsIds];
    const embeddings = newsIds.map((newsId) => embeddingsByNewsId.get(newsId));
    if (embeddings.length === 0 || embeddings.some((embedding) => !embedding)) {
      return [];
    }

    const centroid = calculateCentroid(embeddings);
    if (!centroid) return [];

    return [{
      ...storedCase,
      centroid,
      startDate: storedCase.issueStartDate,
      lastDate: storedCase.issueLastDate,
      articleCount: storedCase.issueArticleCount,
      storedStartDate: storedCase.issueStartDate,
      storedLastDate: storedCase.issueLastDate,
      storedArticleCount: storedCase.issueArticleCount,
      storedRiskType: storedCase.caseRiskType || storedCase.issueRiskType,
      representativeNewsId: newsIds[0],
      representativeTitle: storedCase.issueName,
    }];
  });
}

/** 현재 이슈와 centroid cosine 유사도가 0.60 이상인 과거 사례만 남긴다. */
function filterGroupsByCaseSimilarity(groups, currentIssueEmbedding) {
  return groups.flatMap((group) => {
    const semanticSimilarity = cosineSimilarity(currentIssueEmbedding, group.centroid);
    if (
      semanticSimilarity === null
      || semanticSimilarity < SIMULATOR_RULES.caseSimilarityCut
    ) {
      return [];
    }

    return [{ ...group, semanticSimilarity }];
  });
}

module.exports = {
  SIMULATOR_RULES,
  cosineSimilarity,
  makeArticleTextHash,
  prepareCandidatesForClustering,
  groupCandidatesByTime,
  filterGroupsByInternalSimilarity,
  buildIssueCentroids,
  buildStoredCaseCentroids,
  calculateCentroid,
  filterGroupsByCaseSimilarity,
  normalizeVector,
};
