const { pool } = require("../db/pool");
const { generateRiskAssessment } = require("./aiClient.service");

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 30;
const MIN_ARTICLES = 3;
const MIN_VOLUME_PRIOR = 5;
const NEGATIVE_PERSISTENCE_FULL_SCORE_DAYS = 15;
const SCORING_VERSION = "2.3.0";
const SCORE_WEIGHTS = Object.freeze({
  issueImpact: 0.4,
  negativeSentiment: 0.3,
  negativeNewsAcceleration: 0.2,
  negativePersistence: 0.1,
});

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function normalizeTitle(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function getPublishedAt(article) {
  const value = article?.publishedAt || article?.pub_date;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPressName(article) {
  if (typeof article?.source === "string") return article.source.trim();
  return String(article?.source?.name || article?.press || "").trim();
}

function getPublishedDayInSeoul(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp + (9 * 60 * 60 * 1000)).toISOString().slice(0, 10);
}

function uniqueRecentArticles(articles, now = new Date()) {
  const cutoff = now.getTime() - RECENT_DAYS * DAY_MS;
  const unique = new Map();

  for (const article of articles || []) {
    const publishedAt = getPublishedAt(article);
    if (!publishedAt || publishedAt.getTime() < cutoff || publishedAt > now) continue;

    const title = String(article.title || "").trim();
    const key = String(article.original_link || article.link || "").trim() || normalizeTitle(title);
    if (!key) continue;

    const normalized = {
      id: `A${unique.size + 1}`,
      title: title.slice(0, 500),
      summary: String(article.description || article.summary || "").slice(0, 1200),
      publishedAt: publishedAt.toISOString(),
      press: getPressName(article).slice(0, 100),
      sentiment: ["positive", "neutral", "negative"].includes(article.sentiment)
        ? article.sentiment
        : "neutral",
      sentimentConfidence: clamp(article.score, 0, 1),
      url: String(article.original_link || article.link || "").slice(0, 500),
    };
    const existing = unique.get(key);
    if (!existing || normalized.publishedAt > existing.publishedAt) unique.set(key, normalized);
  }

  return [...unique.values()]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((article, index) => ({ ...article, id: `A${index + 1}` }));
}

function getRiskLevel(score) {
  if (score === null || score === undefined || score === "" || !Number.isFinite(Number(score))) {
    return "unknown";
  }
  const normalizedScore = Number(score);
  if (normalizedScore >= 75) return "critical";
  if (normalizedScore >= 50) return "high";
  if (normalizedScore >= 25) return "watch";
  return "low";
}

function getRiskLevelLabel(level) {
  return ({ low: "낮음", watch: "주의", high: "높음", critical: "심각" })[level] || "평가 중";
}

function calculateWeightedRiskScore(components) {
  const available = Object.entries(components)
    .filter(([key, value]) => {
      const isNumeric = typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "");
      return Object.prototype.hasOwnProperty.call(SCORE_WEIGHTS, key) &&
        value !== null && value !== undefined && isNumeric && Number.isFinite(Number(value));
    })
    .map(([key, value]) => ({ value: clamp(value), weight: SCORE_WEIGHTS[key] }));
  const coverage = available.reduce((total, item) => total + item.weight, 0);
  if (!coverage) return { score: null, coverage: 0 };
  // Keep the denominator fixed at 100: missing data never inflates the remaining signals.
  const score = Math.round(available.reduce((total, item) => total + item.value * item.weight, 0));
  return { score, coverage: Number(coverage.toFixed(2)) };
}

function calculateRiskSignals(articles, history) {
  const recentDb = Number(history.recentArticleCount) || 0;
  const previousDb = Number(history.previousArticleCount) || 0;
  const previousMonthlyAverage = previousDb / 2;
  const hasDatabaseVolume = recentDb > 0 || previousDb > 0;
  const volumeAcceleration = hasDatabaseVolume
    ? clamp(Math.log2((recentDb + MIN_VOLUME_PRIOR) / (previousMonthlyAverage + MIN_VOLUME_PRIOR)) * 50)
    : null;
  const priorMonthlyPresses = (Number(history.previousPressCount) || 0) / 2;
  const recentPresses = Number(history.recentPressCount) || 0;
  const pressSpreadScore = hasDatabaseVolume
    ? clamp(Math.log2((recentPresses + 2) / (priorMonthlyPresses + 2)) * 50)
    : null;
  const newsAcceleration = volumeAcceleration === null
    ? null
    : Math.round(volumeAcceleration * 0.8 + (pressSpreadScore ?? volumeAcceleration) * 0.2);

  const negativeArticles = articles.filter((article) => article.sentiment === "negative");
  const negativeConfidence = negativeArticles.length
    ? negativeArticles.reduce((total, article) => total + article.sentimentConfidence, 0) /
      negativeArticles.length
    : 0;
  const negativeShare = negativeArticles.length / Math.max(articles.length, 1);
  const sampleReliability = articles.length / (articles.length + 5);
  const negativeSentiment = articles.length
    ? Math.round(clamp(negativeShare * negativeConfidence * sampleReliability * 100))
    : null;
  const negativeActiveDays = new Set(
    negativeArticles.map((article) => getPublishedDayInSeoul(article.publishedAt)).filter(Boolean),
  ).size;
  const negativePersistence = articles.length
    ? Math.round(clamp((negativeActiveDays / NEGATIVE_PERSISTENCE_FULL_SCORE_DAYS) * 100))
    : null;
  const negativeNewsAcceleration = newsAcceleration === null
    ? null
    : Math.round(newsAcceleration * negativeShare);

  return {
    analyzedArticleCount: articles.length,
    databaseRecentArticleCount: recentDb,
    databaseBaselineMonthlyArticleAverage: Number(previousMonthlyAverage.toFixed(1)),
    databaseRecentPressCount: recentPresses,
    negativeArticleShare: Number(negativeShare.toFixed(4)),
    negativeActiveDays,
    negativeArticleCount: negativeArticles.length,
    negativeArticlePercent: Math.round((negativeArticles.length / Math.max(articles.length, 1)) * 100),
    scores: {
      newsAcceleration,
      negativeNewsAcceleration,
      negativePersistence,
      negativeSentiment,
    },
  };
}

async function getCompanyHistory(companyId) {
  const [[company]] = await pool.query(
    `SELECT COMPANY_ID AS companyId, COMPANY_NAME AS companyName,
            INDUSTRY AS industry, STOCK_CODE AS stockCode
       FROM COMPANY WHERE COMPANY_ID = ? LIMIT 1`,
    [companyId],
  );
  if (!company) return null;

  const [[history]] = await pool.query(
    `SELECT
       COUNT(DISTINCT CASE
         WHEN news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN news.NEWS_ID END) AS recentArticleCount,
       COUNT(DISTINCT CASE
         WHEN news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL 90 DAY)
          AND news.PUBLISHED_AT < DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN news.NEWS_ID END) AS previousArticleCount,
       COUNT(DISTINCT CASE
         WHEN news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN news.PRESS END) AS recentPressCount,
       COUNT(DISTINCT CASE
         WHEN news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL 90 DAY)
          AND news.PUBLISHED_AT < DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN news.PRESS END) AS previousPressCount
     FROM NEWS news
     JOIN NEWS_COMPANY link ON link.NEWS_ID = news.NEWS_ID
     WHERE link.COMPANY_ID = ?
       AND news.PUBLISHED_AT >= DATE_SUB(NOW(), INTERVAL 90 DAY)`,
    [companyId],
  );

  return { ...company, history };
}

async function assessCompanyRisk({
  companyId,
  articles: rawArticles,
}) {
  const companyData = await getCompanyHistory(companyId);
  if (!companyData) return null;

  const articles = uniqueRecentArticles(rawArticles);
  const signals = calculateRiskSignals(articles, companyData.history);
  const baseResponse = {
    scoringVersion: SCORING_VERSION,
    status: articles.length < MIN_ARTICLES ? "insufficient_data" : "ready",
    companyName: companyData.companyName,
    industry: companyData.industry,
    analyzedAt: new Date().toISOString(),
    articleCount: articles.length,
    requiredArticleCount: MIN_ARTICLES,
    confidence: "low",
    signals,
    weights: SCORE_WEIGHTS,
  };

  if (articles.length < MIN_ARTICLES) {
    return {
      ...baseResponse,
      riskScore: null,
      riskLevel: "unknown",
      riskLevelLabel: "데이터 부족",
      evaluationMessage: `최근 ${RECENT_DAYS}일간 분석 가능한 기업 관련 기사가 ${MIN_ARTICLES}건 미만입니다.`,
      keyDrivers: [],
      watchItems: [],
      dataLimitations: [`분석 기사 ${articles.length}건 / 최소 ${MIN_ARTICLES}건 필요`],
    };
  }

  let llmResult;
  try {
    llmResult = await generateRiskAssessment({
      company: {
        name: companyData.companyName,
        industry: companyData.industry,
      },
      signals,
      articles: articles.slice(0, 8),
    });
  } catch (error) {
    console.error("LLM 종합리스크 평가 실패:", error.message);
    return {
      ...baseResponse,
      status: "llm_unavailable",
      riskScore: null,
      riskLevel: "unknown",
      riskLevelLabel: "최종 판단 대기",
      evaluationMessage: "세부 지표는 표시되며, 종합 위험도와 등급은 AI 평가 완료 후 산출됩니다.",
      keyDrivers: [],
      watchItems: [],
      dataLimitations: ["LLM 평가가 없어 최종 위험 점수와 등급을 산출하지 않았습니다."],
      impactScore: null,
      scoreCoverage: 0,
    };
  }

  const issueImpact = clamp(llmResult.issue_impact);
  const scoreResult = calculateWeightedRiskScore({
    issueImpact,
    negativeNewsAcceleration: signals.scores.negativeNewsAcceleration,
    negativePersistence: signals.scores.negativePersistence,
    negativeSentiment: signals.scores.negativeSentiment,
  });
  const { score: riskScore, coverage: scoreCoverage } = scoreResult;
  const riskLevel = getRiskLevel(riskScore);
  const validArticleIds = new Set(articles.map((article) => article.id));
  const keyDrivers = (llmResult.key_drivers || []).slice(0, 3).map((driver) => ({
    factor: driver.factor,
    explanation: driver.explanation,
    evidenceIds: (driver.evidence_ids || []).filter((id) => validArticleIds.has(id)),
  }));
  const analysisEvidenceIds = (llmResult.analysis_evidence_ids || [])
    .filter((id) => validArticleIds.has(id));
  const citedEvidenceIds = new Set([
    ...analysisEvidenceIds,
    ...keyDrivers.flatMap((driver) => driver.evidenceIds),
  ]);
  const confidenceRank = { low: 0, medium: 1, high: 2 };
  const pressCount = new Set(articles.map((article) => article.press).filter(Boolean)).size;
  const dataConfidence = articles.length >= 20 && pressCount >= 3 && scoreCoverage >= 0.95
    ? "high"
    : articles.length >= 8 && pressCount >= 2 && scoreCoverage >= 0.75
      ? "medium"
      : "low";
  const modelConfidence = llmResult.confidence || "low";
  const confidence = confidenceRank[dataConfidence] <= confidenceRank[modelConfidence]
    ? dataConfidence
    : modelConfidence;

  return {
    ...baseResponse,
    status: "ready",
    riskScore,
    riskLevel,
    riskLevelLabel: getRiskLevelLabel(riskLevel),
    analysisResult: llmResult.analysis_result,
    analysisMode: llmResult.tone_fallback ? "metric_fallback" : "llm",
    evaluationMessage: llmResult.analysis_result,
    analysisEvidenceIds,
    keyDrivers,
    watchItems: (llmResult.watch_items || []).slice(0, 3),
    dataLimitations: (llmResult.data_limitations || []).slice(0, 3),
    impactScore: issueImpact,
    scoreCoverage,
    confidence,
    evidence: articles.filter((article) => citedEvidenceIds.has(article.id))
      .map(({ id, title, url, press, publishedAt }) => ({ id, title, url, press, publishedAt })),
  };
}

module.exports = {
  MIN_ARTICLES,
  RECENT_DAYS,
  SCORING_VERSION,
  SCORE_WEIGHTS,
  assessCompanyRisk,
  calculateRiskSignals,
  calculateWeightedRiskScore,
  getRiskLevel,
  uniqueRecentArticles,
};
