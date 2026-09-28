const { pool } = require("../db/pool");

// 위험 신호 비율이 70% 이상이면 주요 이슈 발생 알림
const MAJOR_ISSUE_THRESHOLD = 70;

// 직전 분석보다 10%p 이상 상승하면 위험도 급상승 알림
const RISK_SURGE_THRESHOLD = 10;

// ISO 날짜를 MySQL DATETIME 형식으로 변환
function toMysqlDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * 관심기업의 분석 결과만 저장하고,
 * 직전 분석과 비교해 필요한 알림을 생성한다.
 */
async function saveAnalysisAndCreateAlerts({
  userId,
  companyId,
  riskSignalRate,
  analyzedCount,
  analyzedAt,
}) {
  // 관심기업인지 먼저 확인
  const [favorites] = await pool.query(
    `SELECT FAVORITE_ID
     FROM FAVORITE_COMPANY
     WHERE USER_ID = ? AND COMPANY_ID = ?
     LIMIT 1`,
    [userId, companyId],
  );

  // 관심기업이 아니면 분석 이력과 알림을 저장하지 않음
  if (favorites.length === 0) {
    return { isWatched: false, createdAlerts: [] };
  }

  // 현재 분석 이전의 가장 최근 결과 조회
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

  const currentRate = Number(Number(riskSignalRate).toFixed(2));
  const changeRate =
    previousRate === null
      ? null
      : Number((currentRate - previousRate).toFixed(2));

  // 현재 분석 결과 저장
  await pool.query(
    `INSERT INTO COMPANY_ANALYSIS_SNAPSHOT
      (USER_ID, COMPANY_ID, RISK_SIGNAL_RATE, ANALYZED_COUNT, ANALYZED_AT)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      companyId,
      currentRate,
      analyzedCount,
      toMysqlDateTime(analyzedAt),
    ],
  );

  const createdAlerts = [];

  // 첫 분석이거나 직전 분석이 70% 미만이었다가
  // 이번에 70% 이상이 된 경우 주요 이슈 알림 생성
  if (
    currentRate >= MAJOR_ISSUE_THRESHOLD &&
    (previousRate === null || previousRate < MAJOR_ISSUE_THRESHOLD)
  ) {
    await pool.query(
      `INSERT INTO COMPANY_ALERT
      (USER_ID, COMPANY_ID, ALERT_TYPE, PREVIOUS_RATE, CURRENT_RATE, CHANGE_RATE, DETECTED_AT)
     VALUES (?, ?, 'major_issue', ?, ?, ?, ?)`,
      [
        userId,
        companyId,
        previousRate,
        currentRate,
        changeRate,
        toMysqlDateTime(analyzedAt),
      ],
    );

    createdAlerts.push("major_issue");
  }

  // 직전 분석값이 있고, 10%p 이상 상승했을 때만 급상승 알림 생성
  if (previousRate !== null && changeRate >= RISK_SURGE_THRESHOLD) {
    await pool.query(
      `INSERT INTO COMPANY_ALERT
      (USER_ID, COMPANY_ID, ALERT_TYPE, PREVIOUS_RATE, CURRENT_RATE, CHANGE_RATE, DETECTED_AT)
     VALUES (?, ?, 'risk_surge', ?, ?, ?, ?)`,
      [
        userId,
        companyId,
        previousRate,
        currentRate,
        changeRate,
        toMysqlDateTime(analyzedAt),
      ],
    );

    createdAlerts.push("risk_surge");
  }
  return { isWatched: true, createdAlerts };
}

module.exports = { saveAnalysisAndCreateAlerts };
