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
  const data = companyData[selectedCompany];

  return (
    <section
      className="dashboard-preview-section"
      aria-label="D:TECT 서비스 미리보기"
    >
      <style>{`
        .dashboard-preview-section {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --purple: #8b5cf6;
          --pink: #ec4899;
          --green: #10b981;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-500: #64748b;
          --gray-700: #334155;
          --gray-900: #0f172a;
        }

        /* Live 점 */
        .dashboard-preview-section .live-dot {
          width: 8px;
          height: 8px;
          background: var(--green);
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Risk Track */
        .dashboard-preview-section .risk-track {
          height: 8px;
          background: var(--gray-100);
          border-radius: 999px;
          overflow: hidden;
          margin: 16px 0 10px;
        }

        .dashboard-preview-section .risk-progress {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }

        .dashboard-preview-section .risk-progress::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shine 2.8s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Activity Chart */
        .dashboard-preview-section .activity-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 96px;
          margin: 16px 0 12px;
        }

        .dashboard-preview-section .activity-bar {
          flex: 1;
          border-radius: 8px 8px 4px 4px;
          background: linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%);
          transform-origin: bottom;
          animation: barRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: height 0.5s ease;
        }

        .dashboard-preview-section .activity-bar:nth-child(odd) {
          background: linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 100%);
        }

        .dashboard-preview-section .activity-bar:nth-child(3n) {
          background: linear-gradient(180deg, #f9a8d4 0%, #ec4899 100%);
        }

        @keyframes barRise {
          from {
            transform: scaleY(0.15);
            opacity: 0.4;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        /* Cards */
        .dashboard-preview-section .metric-card,
        .dashboard-preview-section .report-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .dashboard-preview-section .metric-card:hover,
        .dashboard-preview-section .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.12);
        }

        /* Report Icon */
        .dashboard-preview-section .report-icon {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 8px 20px -6px rgba(59, 130, 246, 0.45);
        }

        /* Selected Watchlist Item */
        .dashboard-preview-section .watchlist-item {
          transition: all 0.25s ease;
        }

        .dashboard-preview-section .watchlist-item.selected {
          background: linear-gradient(90deg, #eff6ff, #f5f3ff);
          color: #1e40af;
          font-weight: 600;
          box-shadow: inset 3px 0 0 #3b82f6;
        }

        .dashboard-preview-section .watchlist-item:hover:not(.selected) {
          background: var(--gray-50);
        }

        /* Risk Value 강조 */
        .dashboard-preview-section .risk-value {
          font-size: 2.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #1e40af, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
