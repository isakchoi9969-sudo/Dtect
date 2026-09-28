const { pool } = require("../db/pool");

const ALERT_TYPE_RISK_SURGE = "RISK_SURGE";

// 위험 신호 기준
const CAUTION_THRESHOLD = 70;
const DANGER_THRESHOLD = 80;

// 직전 분석보다 10%p 이상 높아졌을 때 급상승으로 판단
const SURGE_THRESHOLD = 10;

const ISSUE_RULES = [
  {
    category: "안전사고",
    severity: "높음",
    keywords: ["중대재해", "사망", "화재", "폭발", "안전사고"],
  },
  {
    category: "개인정보·보안",
    severity: "높음",
    keywords: ["개인정보 유출", "정보 유출", "해킹", "랜섬웨어"],
  },
  {
    category: "규제·법적 이슈",
    severity: "높음",
    keywords: ["과징금", "검찰", "고발", "수사", "제재", "소송"],
  },
  {
    category: "생산·노사 이슈",
    severity: "보통",
    keywords: ["파업", "노조", "생산 차질", "리콜"],
  },
  {
    category: "소비자 피해",
    severity: "보통",
    keywords: ["환불", "소비자 피해", "품질 불량"],
  },
];

function getRiskLevel(rate) {
  return rate >= DANGER_THRESHOLD ? "위험" : "주의";
}

function getHours(value) {
  const hours = Number(value);

  return Number.isInteger(hours) && hours >= 1 && hours <= 168 ? hours : 24;
}

function getCutoff(hours) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  return cutoff;
}

function findIssueRule(title, description) {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  return ISSUE_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );
}

// 관심기업인지 확인한 뒤 최근 분석 결과를 스냅샷으로 저장합니다.
async function saveAnalysisSnapshot(userId, companyId) {
  const [favorites] = await pool.query(
    `SELECT 1
     FROM FAVORITE_COMPANY
     WHERE USER_ID = ? AND COMPANY_ID = ?
     LIMIT 1`,
    [userId, companyId],
  );

  // 관심기업이 아니면 저장하지 않습니다.
  if (favorites.length === 0) {
    return { saved: false, reason: "NOT_FAVORITE" };
  }

  // 방금 분석한 기사들의 위험 신호 비율을 계산합니다.
  const [[analysis]] = await pool.query(
    `SELECT
       COUNT(*) AS analyzedCount,
       ROUND(
         COALESCE(
           SUM(n.SENTIMENT = 'negative') / NULLIF(COUNT(*), 0) * 100,
           0
         ),
         2
       ) AS riskSignalRate
     FROM NEWS_ARTICLE_ANALYSIS n
     JOIN COMPANY c ON c.COMPANY_NAME = n.COMPANY_QUERY
     WHERE c.COMPANY_ID = ?
       AND n.LAST_ANALYZED_AT >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)`,
    [companyId],
  );

  const analyzedCount = Number(analysis.analyzedCount || 0);
  const currentRate = Number(analysis.riskSignalRate || 0);

  if (analyzedCount === 0) {
    return { saved: false, reason: "NO_RECENT_ANALYSIS" };
  }

  // 현재 저장하기 전, 직전 분석 결과를 가져옵니다.
  const [previousRows] = await pool.query(
    `SELECT RISK_SIGNAL_RATE AS riskSignalRate
     FROM COMPANY_ANALYSIS_SNAPSHOT
     WHERE USER_ID = ? AND COMPANY_ID = ?
     ORDER BY ANALYZED_AT DESC, SNAPSHOT_ID DESC
     LIMIT 1`,
    [userId, companyId],
  );

  const previousRate =
    previousRows.length > 0 ? Number(previousRows[0].riskSignalRate) : null;

  const changeRate =
    previousRate === null
      ? null
      : Number((currentRate - previousRate).toFixed(2));

  // 현재 분석 결과를 시점별 이력으로 저장합니다.
  await pool.query(
    `INSERT INTO COMPANY_ANALYSIS_SNAPSHOT (
       USER_ID,
       COMPANY_ID,
       RISK_SIGNAL_RATE,
       ANALYZED_COUNT,
       ANALYZED_AT
     ) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())`,
    [userId, companyId, currentRate, analyzedCount],
  );

  const isFirstHighRisk =
    previousRate === null && currentRate >= DANGER_THRESHOLD;

  const isRiskSurge =
    previousRate !== null &&
    currentRate >= CAUTION_THRESHOLD &&
    changeRate >= SURGE_THRESHOLD;

  // 처음부터 매우 높거나, 직전 분석보다 10%p 이상 상승한 경우 알림을 저장합니다.
  if (isFirstHighRisk || isRiskSurge) {
    await pool.query(
      `INSERT INTO COMPANY_ALERT (
         USER_ID,
         COMPANY_ID,
         ALERT_TYPE,
         PREVIOUS_RATE,
         CURRENT_RATE,
         CHANGE_RATE,
         DETECTED_AT
       ) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        userId,
        companyId,
        ALERT_TYPE_RISK_SURGE,
        previousRate,
        currentRate,
        changeRate,
      ],
    );
  }

  return {
    saved: true,
    currentRate,
    previousRate,
    changeRate,
  };
}

// 위험도 급상승 알림 목록을 반환합니다.
async function getRiskSurgeAlerts(userId, hoursInput) {
  const hours = getHours(hoursInput);

  const [rows] = await pool.query(
    `SELECT
       a.ALERT_ID AS alertId,
       a.COMPANY_ID AS companyId,
       c.COMPANY_NAME AS companyName,
       a.PREVIOUS_RATE AS previousRate,
       a.CURRENT_RATE AS currentRate,
       a.CHANGE_RATE AS changeRate,
       a.DETECTED_AT AS detectedAt
     FROM COMPANY_ALERT a
     JOIN COMPANY c ON c.COMPANY_ID = a.COMPANY_ID
     WHERE a.USER_ID = ?
       AND a.ALERT_TYPE = ?
       AND a.DETECTED_AT >= ?
     ORDER BY a.DETECTED_AT DESC`,
    [userId, ALERT_TYPE_RISK_SURGE, getCutoff(hours)],
  );

  return rows.map((row) => ({
    alertId: row.alertId,
    companyId: row.companyId,
    companyName: row.companyName,
    previousRate: row.previousRate === null ? null : Number(row.previousRate),
    currentRate: Number(row.currentRate),
    changeRate: row.changeRate === null ? null : Number(row.changeRate),
    riskLevel: getRiskLevel(Number(row.currentRate)),
    detectedAt: row.detectedAt,
  }));
}

// 관심기업의 최근 기사에서 주요 이슈 키워드를 찾습니다.
async function getMajorIssueAlerts(userId, hoursInput) {
  const hours = getHours(hoursInput);

  const [rows] = await pool.query(
    `SELECT
       c.COMPANY_ID AS companyId,
       c.COMPANY_NAME AS companyName,
       n.ANALYSIS_ID AS issueId,
       n.TITLE AS issueTitle,
       n.DESCRIPTION AS description,
       COALESCE(n.ORIGINAL_LINK, n.NAVER_LINK) AS articleUrl,
       n.LAST_ANALYZED_AT AS detectedAt
     FROM FAVORITE_COMPANY f
     JOIN COMPANY c ON c.COMPANY_ID = f.COMPANY_ID
     JOIN NEWS_ARTICLE_ANALYSIS n ON n.COMPANY_QUERY = c.COMPANY_NAME
     WHERE f.USER_ID = ?
       AND n.SENTIMENT = 'negative'
       AND n.LAST_ANALYZED_AT >= ?
     ORDER BY n.LAST_ANALYZED_AT DESC
     LIMIT 300`,
    [userId, getCutoff(hours)],
  );

  return rows
    .map((row) => {
      const rule = findIssueRule(row.issueTitle, row.description);

      if (!rule) return null;

      return {
        companyId: row.companyId,
        companyName: row.companyName,
        issueId: row.issueId,
        issueTitle: row.issueTitle,
        issueCategory: rule.category,
        severity: rule.severity,
        articleUrl: row.articleUrl,
        detectedAt: row.detectedAt,
      };
    })
    .filter(Boolean);
}

module.exports = {
  saveAnalysisSnapshot,
  getRiskSurgeAlerts,
  getMajorIssueAlerts,
};
