const { pool } = require("../db/pool");

const SELECT_SIMILAR_NEWS_CANDIDATES = `
  SELECT
    n.NEWS_ID AS newsId,
    n.TITLE AS title,
    n.CONTENT AS content,
    DATE_FORMAT(n.PUBLISHED_AT, '%Y-%m-%d') AS publishedAt,
    np.CLEAN_TITLE AS cleanTitle,
    np.CLEAN_CONTENT AS cleanContent,
    nc.COMPANY_ID AS companyId,
    c.COMPANY_NAME AS companyName,
    c.INDUSTRY AS industry
  FROM NEWS n
  LEFT JOIN NEWS_PREPROCESS np ON np.NEWS_ID = n.NEWS_ID
  LEFT JOIN NEWS_COMPANY nc ON nc.NEWS_ID = n.NEWS_ID
  LEFT JOIN COMPANY c ON c.COMPANY_ID = nc.COMPANY_ID
  WHERE n.NEWS_ID IN (?)
`;

const SELECT_SIMULATOR_COMPANIES = `
  SELECT
    COMPANY_ID AS companyId,
    COMPANY_NAME AS companyName,
    INDUSTRY AS industry
  FROM COMPANY
  ORDER BY COMPANY_ID ASC
`;

function buildKeywordCandidateQuery(keywords) {
  const conditions = keywords.map(() => `
    (n.TITLE LIKE ? OR n.CONTENT LIKE ? OR np.CLEAN_TITLE LIKE ? OR np.CLEAN_CONTENT LIKE ?)
  `);

  return `
    SELECT
      n.NEWS_ID AS newsId,
      n.TITLE AS title,
      n.CONTENT AS content,
      DATE_FORMAT(n.PUBLISHED_AT, '%Y-%m-%d') AS publishedAt,
      np.CLEAN_TITLE AS cleanTitle,
      np.CLEAN_CONTENT AS cleanContent,
      nc.COMPANY_ID AS companyId,
      c.COMPANY_NAME AS companyName,
      c.INDUSTRY AS industry
    FROM NEWS n
    LEFT JOIN NEWS_PREPROCESS np ON np.NEWS_ID = n.NEWS_ID
    LEFT JOIN NEWS_COMPANY nc ON nc.NEWS_ID = n.NEWS_ID
    LEFT JOIN COMPANY c ON c.COMPANY_ID = nc.COMPANY_ID
    WHERE ${conditions.join(" OR ")}
    ORDER BY n.PUBLISHED_AT DESC, n.NEWS_ID DESC
    LIMIT 100
  `;
}

function toSimilarityMap(similarNews) {
  const similarityByNewsId = new Map();

  for (const item of similarNews || []) {
    const newsId = Number(item.news_id);
    const similarity = Number(item.similarity);

    if (!Number.isInteger(newsId) || newsId < 1 || !Number.isFinite(similarity)) {
      continue;
    }

    const currentSimilarity = similarityByNewsId.get(newsId);
    if (currentSimilarity === undefined || similarity > currentSimilarity) {
      similarityByNewsId.set(newsId, similarity);
    }
  }

  return similarityByNewsId;
}

/**
 * FastAPI 검색 결과의 뉴스 ID를 실제 기사·기업 데이터로 보강한다.
 * 기업이 복수인 기사는 NEWS_COMPANY 행별로 분리해 이후 기업별 군집화에 사용한다.
 */
async function getSimilarNewsCandidates(similarNews) {
  const similarityByNewsId = toSimilarityMap(similarNews);
  const newsIds = [...similarityByNewsId.keys()];

  if (newsIds.length === 0) {
    return [];
  }

  const [rows] = await pool.query(SELECT_SIMILAR_NEWS_CANDIDATES, [newsIds]);

  return rows
    .map((row) => ({
      newsId: Number(row.newsId),
      similarity: similarityByNewsId.get(Number(row.newsId)),
      title: row.title || "",
      content: row.content || "",
      cleanTitle: row.cleanTitle || row.title || "",
      cleanContent: row.cleanContent || row.content || "",
      publishedAt: row.publishedAt,
      companyId: row.companyId === null ? null : Number(row.companyId),
      companyName: row.companyName || null,
      industry: row.industry || null,
    }))
    .sort((a, b) => b.similarity - a.similarity || a.newsId - b.newsId);
}

/** 시뮬레이터의 텍스트 기반 핵심 기업 판별에 사용할 회사 목록을 조회한다. */
async function getSimulatorCompanies() {
  const [rows] = await pool.query(SELECT_SIMULATOR_COMPANIES);
  return rows.map((row) => ({
    companyId: Number(row.companyId),
    companyName: row.companyName,
    industry: row.industry || null,
  }));
}

/**
 * 짧은 소분류 검색의 벡터 점수가 모두 기준 미달일 때 사용하는 정확 키워드 fallback.
 * 이 후보도 이후 날짜·군집·centroid 유사도 검증을 모두 거친다.
 */
async function getKeywordNewsCandidates(keywords) {
  const normalizedKeywords = [...new Set(
    (keywords || []).map((keyword) => String(keyword || "").trim()).filter(Boolean),
  )];
  if (normalizedKeywords.length === 0) return [];

  const queryValues = normalizedKeywords.flatMap((keyword) => {
    const pattern = `%${keyword}%`;
    return [pattern, pattern, pattern, pattern];
  });
  const [rows] = await pool.query(buildKeywordCandidateQuery(normalizedKeywords), queryValues);

  return rows.map((row) => ({
    newsId: Number(row.newsId),
    // 키워드 일치는 벡터 기사 유사도 컷과 별개로 신뢰할 수 있는 후보 신호다.
    similarity: null,
    searchSource: "keyword",
    title: row.title || "",
    content: row.content || "",
    cleanTitle: row.cleanTitle || row.title || "",
    cleanContent: row.cleanContent || row.content || "",
    publishedAt: row.publishedAt,
    companyId: row.companyId === null ? null : Number(row.companyId),
    companyName: row.companyName || null,
    industry: row.industry || null,
  }));
}

module.exports = {
  SELECT_SIMILAR_NEWS_CANDIDATES,
  SELECT_SIMULATOR_COMPANIES,
  buildKeywordCandidateQuery,
  getKeywordNewsCandidates,
  getSimilarNewsCandidates,
  getSimulatorCompanies,
  toSimilarityMap,
};
