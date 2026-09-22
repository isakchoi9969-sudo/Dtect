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

<<<<<<< HEAD
  const response = await axios.post(
    `${aiServerUrl}/api/ai/sentiment`,
    { texts },
    { timeout: 30000 },
  );
=======
  let response;

  try {
    response = await axios.post(
      `${aiServerUrl}/api/ai/sentiment`,
      { texts },
      { timeout: 30000 },
    );
  } catch (error) {
    const detail = error.response?.data?.detail;
    const reason = detail || error.message;
    throw new Error(`AI 감성분석 처리 오류: ${reason}`, { cause: error });
  }
>>>>>>> f7e87115956cb865792a46b4785f5a82f2e33f4a

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

/** FastAPI AI 서버에 대응자료 초안 생성을 요청합니다. */
async function generateResponseDraft(payload) {
  const response = await axios.post(
    `${aiServerUrl}/api/ai/response-draft`,
    payload,
    { timeout: 60000 },
  );

  return response.data;
}

module.exports = {
  analyzeSentiments,
  searchSimilarNews,
  getNewsEmbeddings,
  getIssueEmbedding,
  generateResponseDraft, // 대응자료 생성 함수 내보내기
};
