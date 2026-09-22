const axios = require("axios");
const { aiServerUrl } = require("../config/env");

/**
 * FastAPI AI 서버의 /api/ai/sentiment 를 호출한다.
 * 텍스트 순서를 그대로 유지한 결과 배열을 반환한다.
 */
async function analyzeSentiments(texts) {
  if (!texts || texts.length === 0) {
    return [];
  }

  const response = await axios.post(
    `${aiServerUrl}/api/ai/sentiment`,
    { texts },
    { timeout: 30000 }
  );

  return response.data.results;
}

/**
 * FastAPI 시뮬레이터에 현재 이슈를 보내 유사 뉴스 최대 100건을 조회한다.
 * 반환값은 [{ news_id, similarity }]이며, 실제 뉴스 정보는 Node에서 MySQL로 보강한다.
 */
async function searchSimilarNews(title, content) {
  const response = await axios.post(
    `${aiServerUrl}/api/ai/simulator/search`,
    { title, content },
    { timeout: 60000 },
  );

  return response.data.results;
}

/**
 * 별칭별 검색 결과를 NEWS_ID 기준으로 합친 뒤, 가장 높은 cosine 점수를 유지한다.
 * 합친 뒤에도 Chroma 후보 상한 100건은 그대로 적용한다.
 */
function mergeSimilarNewsMatches(matchLists) {
  const matchesByNewsId = new Map();

  for (const matches of matchLists) {
    for (const match of matches || []) {
      const newsId = Number(match.news_id);
      const similarity = Number(match.similarity);
      if (!Number.isInteger(newsId) || !Number.isFinite(similarity)) continue;

      const previous = matchesByNewsId.get(newsId);
      if (!previous || similarity > previous.similarity) {
        matchesByNewsId.set(newsId, { ...match, news_id: newsId, similarity });
      }
    }
  }

  return [...matchesByNewsId.values()]
    .sort((left, right) => right.similarity - left.similarity || left.news_id - right.news_id)
    .slice(0, 100);
}

/** 별칭별 독립 검색을 실행해 주제 검색의 recall을 보완한다. */
async function searchSimilarNewsByQueries(queries) {
  const normalizedQueries = (queries || [])
    .filter((query) => String(query?.title || "").trim() || String(query?.content || "").trim());

  if (normalizedQueries.length === 0) return [];

  const matchLists = await Promise.all(
    normalizedQueries.map((query) => searchSimilarNews(query.title, query.content)),
  );
  return mergeSimilarNewsMatches(matchLists);
}

/**
 * Chroma에 저장된 뉴스 BGE-M3 벡터를 ID별 Map으로 반환한다.
 * 군집 내부 유사도와 centroid 계산에만 사용한다.
 */
async function getNewsEmbeddings(newsIds) {
  if (!newsIds || newsIds.length === 0) {
    return new Map();
  }

  const response = await axios.post(
    `${aiServerUrl}/api/ai/simulator/embeddings`,
    { news_ids: newsIds },
    { timeout: 60000 },
  );

  return new Map(
    response.data.results.map((item) => [Number(item.news_id), item.embedding]),
  );
}

/** 현재 이슈를 과거 사례 centroid 비교용 BGE-M3 벡터로 변환한다. */
async function getIssueEmbedding(title, content) {
  const response = await axios.post(
    `${aiServerUrl}/api/ai/simulator/embed`,
    { title, content },
    { timeout: 60000 },
  );

  return response.data.embedding;
}

module.exports = {
  analyzeSentiments,
  mergeSimilarNewsMatches,
  searchSimilarNews,
  searchSimilarNewsByQueries,
  getNewsEmbeddings,
  getIssueEmbedding,
};
