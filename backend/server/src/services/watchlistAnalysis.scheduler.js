const cron = require("node-cron");
const { pool } = require("../db/pool");
const { analyzeCompanyNews } = require("./newsAnalysis.service");

let isRunning = false;

/**
 * 전체 관심기업의 뉴스·로컬 감성분석만 기업별로 한 번씩 실행합니다.
 * 자동 작업에서는 OpenAI 종합 리스크 평가, 실제 알림 생성, 이메일 발송을 하지 않습니다.
 */
async function runWatchlistAnalysisJob() {
  if (isRunning) {
    console.log("[관심기업 정기 분석] 이전 작업이 아직 진행 중입니다.");
    return;
  }

  isRunning = true;

  try {
    const [companies] = await pool.query(
      `SELECT DISTINCT
         c.COMPANY_ID AS companyId,
         c.COMPANY_NAME AS companyName
       FROM FAVORITE_COMPANY f
       JOIN COMPANY c ON c.COMPANY_ID = f.COMPANY_ID`,
    );

    console.log(`[관심기업 정기 분석] ${companies.length}개 기업 분석 시작`);

    for (const company of companies) {
      try {
        // 1. 최신 뉴스 수집 및 감성 분석
        const analysis = await analyzeCompanyNews(company.companyName, 1, 40);

        console.log(
          `[관심기업 정기 분석 완료] ${company.companyName} · 기사 ${analysis.analyzed_count ?? 0}건 로컬 감성분석`,
        );
      } catch (error) {
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
  // 10분마다 실행
  cron.schedule(
    "*/10 * * * *",
    () => {
      void runWatchlistAnalysisJob();
    },
    { timezone: "Asia/Seoul" },
  );

  console.log("[관심기업 정기 분석] 10분마다 자동 실행 등록 완료");
}

module.exports = {
  startWatchlistAnalysisScheduler,
};
