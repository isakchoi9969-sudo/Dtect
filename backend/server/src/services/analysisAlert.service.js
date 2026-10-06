const { pool } = require("../db/pool");

// 직전 분석보다 종합 리스크가 10점 이상 오르면 급상승 알림
const RISK_SURGE_THRESHOLD = 10;

// 급상승 알림은 현재 위험도가 높음 이상일 때만 생성
const HIGH_RISK_SCORE_THRESHOLD = 50;

function toMysqlDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * 관심기업 분석 결과를 저장하고,
 * 종합 리스크 점수를 직전 분석 결과와 비교해 알림을 생성합니다.
 */
async function saveAnalysisAndCreateAlerts({
  userId,
  companyId,
  riskSignalRate,
  riskScore,
  riskLevel,
  analyzedCount,
  analyzedAt,
}) {
  const [favorites] = await pool.query(
    `SELECT FAVORITE_ID
     FROM FAVORITE_COMPANY
     WHERE USER_ID = ? AND COMPANY_ID = ?
     LIMIT 1`,
    [userId, companyId],
  );

  if (favorites.length === 0) {
    return { isWatched: false, createdAlerts: [] };
  }

  // 이전 종합 리스크 점수 조회
  const [previousRows] = await pool.query(
    `SELECT RISK_SCORE AS riskScore
     FROM COMPANY_ANALYSIS_SNAPSHOT
     WHERE USER_ID = ? AND COMPANY_ID = ?
     ORDER BY ANALYZED_AT DESC, SNAPSHOT_ID DESC
     LIMIT 1`,
    [userId, companyId],
  );

  const previousScore =
    previousRows.length > 0 ? Number(previousRows[0].riskScore) : null;

  const currentScore = Number(Number(riskScore).toFixed(1));

  const changeScore =
    previousScore === null
      ? null
      : Number((currentScore - previousScore).toFixed(1));

  // 분석 이력 저장
  await pool.query(
    `INSERT INTO COMPANY_ANALYSIS_SNAPSHOT
      (USER_ID, COMPANY_ID, RISK_SIGNAL_RATE, RISK_SCORE, RISK_LEVEL, ANALYZED_COUNT, ANALYZED_AT)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      companyId,
      Number(riskSignalRate ?? 0),
      currentScore,
      riskLevel,
      analyzedCount,
      toMysqlDateTime(analyzedAt),
    ],
  );

  const createdAlerts = [];

  // 높음 이상이면서 직전보다 10점 이상 상승한 경우
  if (
    previousScore !== null &&
    currentScore >= HIGH_RISK_SCORE_THRESHOLD &&
    changeScore >= RISK_SURGE_THRESHOLD
  ) {
    await pool.query(
      `INSERT INTO COMPANY_ALERT
        (USER_ID, COMPANY_ID, ALERT_TYPE, PREVIOUS_RATE, CURRENT_RATE, CHANGE_RATE,
         RISK_SCORE, RISK_LEVEL, DETECTED_AT)
       VALUES (?, ?, 'risk_surge', ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        companyId,
        previousScore,
        currentScore,
        changeScore,
        currentScore,
        riskLevel,
        toMysqlDateTime(analyzedAt),
      ],
    );

    createdAlerts.push("risk_surge");
  }

  return { isWatched: true, createdAlerts };
}

module.exports = { saveAnalysisAndCreateAlerts };
