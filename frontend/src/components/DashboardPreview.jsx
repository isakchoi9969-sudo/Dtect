import { useState } from "react";
import { watchlist } from "../data/landingData";

// 회사별 데이터 (원하는 수치로 마음대로 바꿔도 됩니다)
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
  const [selectedCompany, setSelectedCompany] = useState(watchlist[0]); // 기본값: 삼성전자
  const data = companyData[selectedCompany];

  return (
    <section
      className="dashboard-preview-section"
      aria-label="D:TECT 서비스 미리보기"
    >
      {/* ===== 스타일 + 애니메이션 ===== */}
      <style>{`
        .dashboard-preview-section .live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .dashboard-preview-section .risk-track {
          height: 10px;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
          margin: 14px 0 10px;
        }

        .dashboard-preview-section .risk-progress {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 999px;
          animation: progressGlow 2.2s ease-in-out infinite alternate;
          transition: width 0.6s ease;
        }

        @keyframes progressGlow {
          from { filter: brightness(1); }
          to { filter: brightness(1.3); }
        }

        .dashboard-preview-section .activity-chart {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          height: 90px;
          margin: 14px 0 10px;
        }

        .dashboard-preview-section .activity-bar {
          flex: 1;
          background: linear-gradient(180deg, #60a5fa, #3b82f6);
          border-radius: 6px 6px 2px 2px;
          transform-origin: bottom;
          animation: barRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .dashboard-preview-section .activity-bar:nth-child(odd) {
          background: linear-gradient(180deg, #a78bfa, #7c3aed);
        }

        .dashboard-preview-section .activity-bar:nth-child(3n) {
          background: linear-gradient(180deg, #f472b6, #db2777);
        }

        @keyframes barRise {
          from {
            transform: scaleY(0);
            opacity: 0.2;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .dashboard-preview-section .metric-card,
        .dashboard-preview-section .report-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .dashboard-preview-section .metric-card:hover,
        .dashboard-preview-section .report-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.15);
        }

        .dashboard-preview-section .report-icon {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        /* 선택된 회사 강조 */
        .dashboard-preview-section .watchlist-item.selected {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }
      `}</style>

      <div className="container">
        <div className="dashboard-window">
          {/* ===== Watchlist ===== */}
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

          {/* ===== Main Panel ===== */}
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

            {/* Metrics */}
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

              {/* Activity Chart */}
              <article className="metric-card activity-card">
                <span className="metric-label">ACTIVITY</span>

                <div className="activity-chart">
                  {data.activity.map((height, index) => (
                    <span
                      key={`${selectedCompany}-${index}`} // key를 바꿔서 애니메이션 다시 실행
                      className="activity-bar"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${index * 0.08}s`,
                      }}
                    />
                  ))}
                </div>

                <p className="activity-caption">최근 이슈 언급량 증가</p>
              </article>
            </div>

            {/* Report Card */}
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
