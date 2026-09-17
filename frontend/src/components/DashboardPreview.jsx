import { watchlist } from "../data/landingData";

const ACTIVITY_DATA = [34, 52, 42, 68, 58, 85, 70, 91];

function DashboardPreview() {
  return (
    <section
      className="dashboard-preview-section"
      aria-label="D:TECT 서비스 미리보기"
    >
      {/* ===== 스타일 + 애니메이션을 JSX 안에 직접 넣음 ===== */}
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
      `}</style>

      <div className="container">
        <div className="dashboard-window">
          {/* ===== Watchlist ===== */}
          <aside className="watchlist-panel">
            <p className="dashboard-label">WATCHLIST</p>

            <div className="watchlist-items">
              {watchlist.map((company, index) => (
                <button
                  key={company}
                  type="button"
                  className={`watchlist-item ${index === 0 ? "selected" : ""}`}
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
                <strong className="risk-value">84%</strong>

                <div className="risk-track">
                  <div className="risk-progress" style={{ width: "84%" }} />
                </div>

                <p className="risk-label">High Risk</p>
              </article>

              {/* Activity Chart */}
              <article className="metric-card activity-card">
                <span className="metric-label">ACTIVITY</span>

                <div className="activity-chart">
                  {ACTIVITY_DATA.map((height, index) => (
                    <span
                      key={index}
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
                <h4>공급망 리스크 분석 리포트</h4>
                <p>
                  42건의 주요 보도자료가 분석되었으며, 실시간 대응 가이드라인이
                  생성되었습니다.
                </p>
              </div>

              <span className="report-status">분석 완료</span>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;
