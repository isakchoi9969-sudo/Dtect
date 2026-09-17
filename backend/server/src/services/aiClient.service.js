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

module.exports = { analyzeSentiments };
