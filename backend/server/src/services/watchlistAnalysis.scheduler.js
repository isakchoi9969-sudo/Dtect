const cron = require("node-cron");
const { pool } = require("../db/pool");
const { analyzeCompanyNews } = require("./newsAnalysis.service");
const { saveAnalysisAndCreateAlerts } = require("./analysisAlert.service");

let isRunning = false;

/**
 * 전체 관심기업을 기업별로 한 번씩 분석합니다.
 * 같은 기업을 여러 사용자가 관심기업으로 등록했어도
 * 뉴스 분석은 한 번만 실행하고, 알림은 사용자별로 저장합니다.
 */
async function runWatchlistAnalysisJob() {
  // 이전 작업이 아직 끝나지 않았다면 중복 실행하지 않습니다.
  if (isRunning) {
    console.log("[관심기업 정기 분석] 이전 작업이 아직 진행 중입니다.");
    return;
  }

  isRunning = true;

  try {
    // 관심기업으로 한 번 이상 등록된 기업만 중복 없이 가져옵니다.
    const [companies] = await pool.query(
      `SELECT DISTINCT
         c.COMPANY_ID AS companyId,
         c.COMPANY_NAME AS companyName
       FROM FAVORITE_COMPANY f
       JOIN COMPANY c ON c.COMPANY_ID = f.COMPANY_ID`,
    );

    console.log(`[관심기업 정기 분석] ${companies.length}개 기업 분석 시작`);

    // API 호출량을 고려해 기업을 순서대로 분석합니다.
    for (const company of companies) {
      try {
        // 최신 뉴스 수집 → 감성 분석 → NEWS_ARTICLE_ANALYSIS 저장
        const analysis = await analyzeCompanyNews(company.companyName, 1, 100);

        const riskSignalRate = analysis.sentiment_percentages?.negative ?? 0;

        const analyzedCount = analysis.analyzed_count ?? 0;
        const analyzedAt = analysis.analyzed_at;

        // 이 기업을 관심기업으로 등록한 사용자 목록을 가져옵니다.
        const [users] = await pool.query(
          `SELECT USER_ID AS userId
           FROM FAVORITE_COMPANY
           WHERE COMPANY_ID = ?`,
          [company.companyId],
        );

        // 사용자별 스냅샷 저장 및 알림 생성
        for (const user of users) {
          await saveAnalysisAndCreateAlerts({
            userId: user.userId,
            companyId: company.companyId,
            riskSignalRate,
            analyzedCount,
            analyzedAt,
          });
        }

        console.log(
          `[관심기업 정기 분석 완료] ${company.companyName} · 위험 신호 ${riskSignalRate}%`,
        );
      } catch (error) {
        // 한 기업 분석 실패가 전체 작업을 멈추지 않게 합니다.
        console.error(
          `[관심기업 분석 실패] ${company.companyName}:`,
          error.message,
        );
      }
    }

    console.log("[관심기업 정기 분석] 전체 작업 완료");
  } catch (error) {
    console.error("[관심기업 정기 분석] 작업 실패:", error.message);
  } finally {
    isRunning = false;
  }
}

function startWatchlistAnalysisScheduler() {
  // 매시간 정각에 관심기업 전체를 분석합니다.
  cron.schedule(
    "0 * * * *",
    () => {
      void runWatchlistAnalysisJob();
    },
    { timezone: "Asia/Seoul" },
  );

  console.log("[관심기업 정기 분석] 매시간 정각 자동 실행 등록 완료");
}

module.exports = {
  startWatchlistAnalysisScheduler,
};
