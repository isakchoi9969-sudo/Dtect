import { useState } from "react";
import { watchlist } from "../data/landingData";

const companyData = {
  삼성전자: {
    risk: 84,
    riskLabel: "High Risk",
    activity: [34, 52, 42, 68, 58, 85, 70, 91],
    reportTitle: "공급망 리스크 분석 리포트",
    reportDesc:
      "42건의 주요 보도자료가 분석되었으며, 실시간 대응 가이드라인이 생성되었습니다.",
    status: "분석 완료",
  },
  하이닉스: {
    risk: 67,
    riskLabel: "Medium Risk",
    activity: [28, 45, 38, 55, 62, 48, 71, 59],
    reportTitle: "반도체 수급 리스크 분석 리포트",
    reportDesc:
      "31건의 관련 기사가 분석되었으며, 원자재 가격 변동에 대한 대응 방안이 제시되었습니다.",
    status: "분석 완료",
  },
  현대모터: {
    risk: 41,
    riskLabel: "Low Risk",
    activity: [22, 35, 29, 41, 38, 52, 47, 33],
    reportTitle: "전기차 배터리 공급망 분석 리포트",
    reportDesc:
      "18건의 주요 이슈가 감지되었으며, 안정적인 공급망 유지 전략이 수립되었습니다.",
    status: "분석 완료",
  },
};

function DashboardPreview() {
  const [selectedCompany, setSelectedCompany] = useState(watchlist[0]);
  const fallbackData = companyData[watchlist[0]] ?? companyData["삼성전자"];
  const data = companyData[selectedCompany] ?? fallbackData;

  return (
    <section
      className="dashboard-preview-section"
      aria-label="D:TECT 서비스 미리보기"
    >
      <style>{`
        .dashboard-preview-section {
          --primary: #2563eb;
          --primary-soft: #eff6ff;
          --purple: #7c3aed;
          --green: #10b981;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-400: #94a3b8;
          --gray-500: #64748b;
          --gray-700: #334155;
          --gray-900: #0f172a;
          color: var(--gray-900);
        }

        .dashboard-preview-section .dashboard-window {
          display: grid;
          grid-template-columns: 168px minmax(0, 1fr);
          gap: 0;
          max-width: 920px;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 18px 50px -30px rgba(15, 23, 42, 0.34),
            0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .dashboard-preview-section .watchlist-panel {
          padding: 22px 12px;
          border-right: 1px solid var(--gray-100);
          background: rgba(248, 250, 252, 0.72);
        }

        .dashboard-preview-section .dashboard-label,
        .dashboard-preview-section .metric-label {
          display: block;
          color: var(--gray-400);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          line-height: 1.2;
        }

        .dashboard-preview-section .dashboard-label { padding: 0 10px; }

        .dashboard-preview-section .watchlist-items {
          display: grid;
          gap: 3px;
          margin-top: 16px;
        }

        .dashboard-preview-section .watchlist-item {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 9px;
          padding: 10px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--gray-500);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          text-align: left;
          transition: color 180ms ease, background 180ms ease, transform 180ms ease;
        }

        .dashboard-preview-section .watchlist-item:hover { transform: translateX(2px); color: var(--gray-900); }
        .dashboard-preview-section .watchlist-item:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .dashboard-preview-section .watchlist-item.selected {
          background: var(--primary-soft);
          color: #1d4ed8;
          font-weight: 650;
        }

        .dashboard-preview-section .company-indicator {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;
          border-radius: 50%;
          background: var(--gray-300, #cbd5e1);
          transition: background 180ms ease, transform 180ms ease;
        }

        .dashboard-preview-section .selected .company-indicator {
          background: var(--primary);
          transform: scale(1.35);
        }

        .dashboard-preview-section .intelligence-panel { min-width: 0; padding: 24px 26px 26px; }
        .dashboard-preview-section .preview-heading,
        .dashboard-preview-section .report-card,
        .dashboard-preview-section .live-status { display: flex; align-items: center; }
        .dashboard-preview-section .preview-heading { justify-content: space-between; gap: 16px; }
        .dashboard-preview-section .preview-heading .dashboard-label { padding: 0; }
        .dashboard-preview-section h3 { margin: 5px 0 0; font-size: 20px; letter-spacing: -0.04em; }

        .dashboard-preview-section .live-status {
          gap: 7px;
          color: var(--gray-500);
          font-size: 11px;
          white-space: nowrap;
        }

        .dashboard-preview-section .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .dashboard-preview-section .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
        .dashboard-preview-section .metric-card,
        .dashboard-preview-section .report-card {
          border: 1px solid var(--gray-100);
          border-radius: 13px;
          background: #fff;
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .dashboard-preview-section .metric-card { min-height: 146px; padding: 17px; }
        .dashboard-preview-section .metric-card:hover,
        .dashboard-preview-section .report-card:hover { transform: translateY(-2px); border-color: #dbeafe; box-shadow: 0 14px 26px -20px rgba(37, 99, 235, 0.5); }

        .dashboard-preview-section .risk-value {
          display: block;
          margin-top: 10px;
          color: var(--gray-900);
          font-size: 35px;
          font-weight: 750;
          letter-spacing: -0.06em;
          line-height: 1;
        }

        .dashboard-preview-section .risk-value,
        .dashboard-preview-section .risk-label,
        .dashboard-preview-section .risk-progress { transition: opacity 180ms ease; }
        .dashboard-preview-section .risk-track { height: 6px; margin: 18px 0 9px; overflow: hidden; border-radius: 999px; background: var(--gray-100); }
        .dashboard-preview-section .risk-progress { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #60a5fa, var(--purple)); transition: width 650ms cubic-bezier(0.22, 1, 0.36, 1); }
        .dashboard-preview-section .risk-label,
        .dashboard-preview-section .activity-caption { margin: 0; color: var(--gray-500); font-size: 11px; }

        .dashboard-preview-section .activity-chart { display: flex; align-items: end; gap: 6px; height: 78px; margin: 13px 0 10px; }
        .dashboard-preview-section .activity-bar { flex: 1; min-width: 4px; border-radius: 4px 4px 2px 2px; background: linear-gradient(180deg, #a78bfa, #6366f1); transform-origin: bottom; animation: dashboardBarIn 500ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dashboard-preview-section .activity-bar:nth-child(3n) { background: linear-gradient(180deg, #93c5fd, #3b82f6); }

        .dashboard-preview-section .report-card { gap: 13px; margin-top: 10px; padding: 15px 17px; }
        .dashboard-preview-section .report-icon { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; font-size: 13px; font-weight: 800; box-shadow: 0 7px 16px -9px rgba(37, 99, 235, 0.8); }
        .dashboard-preview-section .report-body { min-width: 0; flex: 1; }
        .dashboard-preview-section .report-body .metric-label { margin-bottom: 5px; }
        .dashboard-preview-section .report-body h4 { overflow: hidden; margin: 0; color: var(--gray-700); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
        .dashboard-preview-section .report-body p { overflow: hidden; margin: 4px 0 0; color: var(--gray-500); font-size: 11px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
        .dashboard-preview-section .report-status { align-self: flex-start; padding: 5px 8px; border-radius: 999px; background: #ecfdf5; color: #059669; font-size: 10px; font-weight: 650; white-space: nowrap; }

        @keyframes dashboardBarIn { from { opacity: 0; transform: scaleY(0.25); } to { opacity: 1; transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-preview-section *, .dashboard-preview-section *::before, .dashboard-preview-section *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        @media (max-width: 680px) {
          .dashboard-preview-section .dashboard-window { grid-template-columns: 1fr; }
          .dashboard-preview-section .watchlist-panel { border-right: 0; border-bottom: 1px solid var(--gray-100); padding: 14px; }
          .dashboard-preview-section .watchlist-items { display: flex; gap: 4px; margin-top: 10px; overflow-x: auto; }
          .dashboard-preview-section .watchlist-item { width: auto; flex: 0 0 auto; }
          .dashboard-preview-section .intelligence-panel { padding: 20px 16px 16px; }
        }
        @media (max-width: 430px) {
          .dashboard-preview-section .metric-grid { grid-template-columns: 1fr; }
          .dashboard-preview-section .metric-card { min-height: 0; }
          .dashboard-preview-section .report-card { align-items: flex-start; }
          .dashboard-preview-section .report-status { display: none; }
        }
      `}</style>

      <div className="container">
        <div className="dashboard-window">
          {/* Watchlist */}
          <aside className="watchlist-panel">
            <p className="dashboard-label">WATCHLIST</p>

            <div className="watchlist-items">
              {watchlist.map((company) => (
                <button
                  key={company}
                  type="button"
                  className={`watchlist-item ${selectedCompany === company ? "selected" : ""}`}
                  onClick={() => setSelectedCompany(company)}
                  aria-pressed={selectedCompany === company}
                >
                  <span className="company-indicator" />
                  {company}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Panel */}
          <div className="intelligence-panel">
            <div className="preview-heading">
              <div>
                <p className="dashboard-label">CORPORATE ANALYSIS</p>
                <h3>Issue Intelligence</h3>
              </div>

              <span className="live-status">
                <span className="live-dot" />
                Live Updates
              </span>
            </div>

            <div className="metric-grid">
              {/* Risk Index */}
              <article className="metric-card risk-card">
                <span className="metric-label">RISK INDEX</span>
                <strong className="risk-value">{data.risk}%</strong>

                <div className="risk-track">
                  <div
                    className="risk-progress"
                    style={{ width: `${data.risk}%` }}
                  />
                </div>

                <p className="risk-label">{data.riskLabel}</p>
              </article>

              {/* Activity */}
              <article className="metric-card activity-card">
                <span className="metric-label">ACTIVITY</span>

                <div className="activity-chart">
                  {data.activity.map((height, index) => (
                    <span
                      key={`${selectedCompany}-${index}`}
                      className="activity-bar"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${index * 0.07}s`,
                      }}
                    />
                  ))}
                </div>

                <p className="activity-caption">최근 이슈 언급량 증가</p>
              </article>
            </div>

            {/* Report */}
            <article className="report-card">
              <div className="report-icon">D</div>

              <div className="report-body">
                <span className="metric-label">ANALYSIS REPORT</span>
                <h4>{data.reportTitle}</h4>
                <p>{data.reportDesc}</p>
              </div>

              <span className="report-status">{data.status}</span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;
