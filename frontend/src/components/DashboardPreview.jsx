import { watchlist } from "../data/landingData";

function DashboardPreview() {
  const activity = [34, 52, 42, 68, 58, 85, 70, 91];

  return (
    <section
      className="dashboard-preview-section"
      aria-label="D:TECT 서비스 미리보기"
    >
      <div className="container">
        <div className="dashboard-window">
          <aside className="watchlist-panel">
            <p className="dashboard-label">WATCHLIST</p>

            <div className="watchlist-items">
              {watchlist.map((company, index) => (
                <button
                  type="button"
                  className={`watchlist-item ${index === 0 ? "selected" : ""}`}
                  key={company}
                >
                  <span className="company-indicator" />
                  {company}
                </button>
              ))}
            </div>
          </aside>

          <div className="intelligence-panel">
            <div className="preview-heading">
              <div>
                <p className="dashboard-label">CORPORATE ANALYSIS</p>
                <h3>Issue Intelligence</h3>
              </div>

              <span className="live-status">
                <span />
                Live Updates
              </span>
            </div>

            <div className="metric-grid">
              <article className="metric-card">
                <span className="metric-label">RISK INDEX</span>

                <strong>84%</strong>

                <div className="risk-track" aria-hidden="true">
                  <div className="risk-progress" />
                </div>

                <p>High Risk</p>
              </article>

              <article className="metric-card activity-card">
                <span className="metric-label">ACTIVITY</span>

                <div className="activity-chart" aria-hidden="true">
                  {activity.map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>

                <p>최근 이슈 언급량 증가</p>
              </article>
            </div>

            <article className="report-card">
              <div className="report-icon" aria-hidden="true">
                D
              </div>

              <div>
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
