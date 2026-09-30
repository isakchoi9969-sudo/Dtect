const cron = require("node-cron");
const { pool } = require("../db/pool");
const { analyzeCompanyNews } = require("./newsAnalysis.service");
const { assessCompanyRisk } = require("./companyRiskAssessment.service");
const { saveAnalysisAndCreateAlerts } = require("./analysisAlert.service");
const { sendRiskSurgeAlertEmail } = require("./emailAlert.service");

let isRunning = false;

/**
 * 전체 관심기업을 기업별로 한 번씩 분석합니다.
 * 같은 기업을 여러 사용자가 관심기업으로 등록했어도
 * 뉴스 분석과 종합 리스크 평가는 한 번만 실행합니다.
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

        // 2. 감성·추이·이슈를 반영한 실제 종합 리스크 평가
        const assessment = await assessCompanyRisk({
          companyId: company.companyId,
          articles: (analysis.news_list || []).map((article) => ({
            title: article.title,
            description: article.description,
            pub_date: article.pub_date,
            source: article.source,
            original_link: article.original_link,
            sentiment: article.sentiment,
            score: article.score,
          })),
        });

        // 종합 리스크 점수를 산출하지 못한 경우에는 알림을 만들지 않음
        if (
          assessment?.status !== "ready" ||
          !Number.isFinite(Number(assessment?.riskScore))
        ) {
          console.log(
            `[관심기업 정기 분석 보류] ${company.companyName} · 종합 리스크 평가 대기`,
          );
          continue;
        }

        const riskSignalRate = analysis.sentiment_percentages?.negative ?? 0;
        const riskScore = Number(assessment.riskScore);
        const riskLevel = assessment.riskLevel;

        const analyzedCount = analysis.analyzed_count ?? 0;
        const analyzedAt = analysis.analyzed_at;

        // 관심기업을 등록한 사용자와 회원가입 이메일을 함께 조회합니다.
        const [users] = await pool.query(
          `SELECT
            f.USER_ID AS userId,
            u.NAME AS userName,
            u.EMAIL AS email
          FROM FAVORITE_COMPANY f
          JOIN \`USER\` u ON u.USER_ID = f.USER_ID
          WHERE f.COMPANY_ID = ?`,
          [company.companyId],
        );

        for (const user of users) {
          // DB에 분석 이력과 알림을 저장한 결과를 받습니다.
          const result = await saveAnalysisAndCreateAlerts({
            userId: user.userId,
            companyId: company.companyId,
            riskSignalRate,
            riskScore,
            riskLevel,
            analyzedCount,
            analyzedAt,
          });

          // 실제로 새 위험도 급상승 알림이 생성됐을 때만 메일을 보냅니다.
          if (result.createdAlerts.includes("risk_surge")) {
            try {
              await sendRiskSurgeAlertEmail({
                to: user.email,
                userName: user.userName,
                companyName: company.companyName,
                riskLevel,
                riskScore,
                detectedAt: analyzedAt,
              });

              // 메일을 성공적으로 보낸 알림에만 발송 시각을 기록합니다.
              await pool.query(
                `UPDATE COMPANY_ALERT
                 SET EMAIL_SENT_AT = NOW()
                 WHERE USER_ID = ?
                   AND COMPANY_ID = ?
                   AND ALERT_TYPE = 'risk_surge'
                   AND EMAIL_SENT_AT IS NULL
                 ORDER BY ALERT_ID DESC
                 LIMIT 1`,
                [user.userId, company.companyId],
              );

              console.log(
                `[알림 메일 발송 완료] ${company.companyName} → ${user.email}`,
              );
            } catch (error) {
              // 메일 발송 실패가 정기 분석을 중단시키지 않도록 처리합니다.
              console.error(
                `[알림 메일 발송 실패] ${company.companyName} → ${user.email}:`,
                error.message,
              );
            }
          }
        }

        console.log(
          `[관심기업 정기 분석 완료] ${company.companyName} · 종합 리스크 ${riskScore}점 (${riskLevel})`,
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
