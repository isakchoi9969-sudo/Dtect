const crypto = require("crypto");
const { pool } = require("../db/pool");

const UPSERT_NEWS_ARTICLE_ANALYSIS = `
  INSERT INTO NEWS_ARTICLE_ANALYSIS (
    COMPANY_QUERY,
    ARTICLE_HASH,
    TITLE,
    DESCRIPTION,
    NAVER_LINK,
    ORIGINAL_LINK,
    PUBLISHED_AT,
    SENTIMENT,
    CONFIDENCE,
    FIRST_COLLECTED_AT,
    LAST_ANALYZED_AT
  ) VALUES ?
  ON DUPLICATE KEY UPDATE
    TITLE = VALUES(TITLE),
    DESCRIPTION = VALUES(DESCRIPTION),
    NAVER_LINK = VALUES(NAVER_LINK),
    ORIGINAL_LINK = VALUES(ORIGINAL_LINK),
    PUBLISHED_AT = VALUES(PUBLISHED_AT),
    SENTIMENT = VALUES(SENTIMENT),
    CONFIDENCE = VALUES(CONFIDENCE),
    LAST_ANALYZED_AT = UTC_TIMESTAMP()
`;

const SELECT_SENTIMENT_TREND = `
  SELECT
    DATE_FORMAT(PUBLISHED_AT, '%Y-%m-%d') AS analysis_date,
    COUNT(*) AS total,
    SUM(SENTIMENT = 'positive') AS positive_count,
    SUM(SENTIMENT = 'neutral') AS neutral_count,
    SUM(SENTIMENT = 'negative') AS negative_count
  FROM NEWS_ARTICLE_ANALYSIS
  WHERE COMPANY_QUERY = ?
    AND PUBLISHED_AT >= ?
  GROUP BY DATE(PUBLISHED_AT)
  ORDER BY analysis_date
`;

function parseNaverPubDate(value) {
  const publishedAt = new Date(value);
  return Number.isNaN(publishedAt.getTime()) ? null : publishedAt;
}

function makeArticleHash(companyQuery, article) {
  const identifier =
    article.original_link ||
    article.link ||
    `${article.title || ""}|${article.pub_date || ""}`;

  return crypto
    .createHash("sha256")
    .update(`${companyQuery}|${identifier}`, "utf8")
    .digest("hex");
}

function makeHistoryRow(companyQuery, article) {
  return [
    companyQuery,
    makeArticleHash(companyQuery, article),
    article.title || "",
    article.description || null,
    article.link || null,
    article.original_link || null,
    parseNaverPubDate(article.pub_date),
    article.sentiment,
    article.score,
    new Date(),
    new Date(),
  ];
}

async function persistNewsAnalysis(companyQuery, articles) {
  if (!articles.length) return;

  const rows = articles.map((article) => makeHistoryRow(companyQuery, article));

  try {
    await pool.query(UPSERT_NEWS_ARTICLE_ANALYSIS, [rows]);
  } catch (error) {
    console.error("뉴스 분석 이력 저장 실패:", error.message);
  }
}

function getStartDate(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  return startDate.toISOString().slice(0, 10);
}

async function getSentimentTrend(companyQuery, days) {
  const [rows] = await pool.query(SELECT_SENTIMENT_TREND, [
    companyQuery,
    getStartDate(days),
  ]);

  return rows.map((row) => {
    const total = Number(row.total);
    const positive = Math.round((Number(row.positive_count) / total) * 100);
    const neutral = Math.round((Number(row.neutral_count) / total) * 100);

    return {
      date: row.analysis_date,
      total,
      positive,
      neutral,
      negative: 100 - positive - neutral,
    };
  });
}

module.exports = {
  getSentimentTrend,
  makeArticleHash,
  makeHistoryRow,
  parseNaverPubDate,
  persistNewsAnalysis,
};
