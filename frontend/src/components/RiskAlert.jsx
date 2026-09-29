import { useState, useEffect } from "react";
import { api } from "../config/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

function formatTime(isoString) {
  if (!isoString) return "-";

  const date = new Date(isoString);
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RiskSurgeAlertPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  const fetchAlerts = async () => {
    setLoading(true);
    setNotice("");

    try {
      const response = await api.get("/api/company/risk-surge", {
        params: { hours: 24 },
      });

      setAlerts(response.data.data || []);
    } catch (error) {
      console.error("위험도 급상승 알림 조회 실패:", error);
      setAlerts([]);
      setNotice("위험도 급상승 알림을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAlerts();
  }, []);

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  const toggleWatchlist = (event, company) => {
    event.stopPropagation();
    toggleCompany(company.companyId);
  };

  return (
    <div className="company-search-page has-results risk-surge-page">
      <Header />

      <main className="company-search-main">
        <section
          className="company-search-workspace"
          aria-label="위험도 급상승 알림"
        >
          <p className="company-search-eyebrow">RISK SURGE ALERT</p>

          <div className="risk-surge-header">
            <div>
              <h1>위험도 급상승 알림</h1>
              <p className="risk-surge-desc">
                종합 리스크가 높음 이상인 관심기업을 알려드립니다.
              </p>
            </div>

            <button
              type="button"
              className="risk-refresh-btn"
              onClick={fetchAlerts}
              disabled={loading}
            >
              {loading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>
        </section>

        {notice && (
          <p className="company-search-notice" role="status">
            {notice}
          </p>
        )}

        <section className="company-search-results">
          <div className="company-search-results-heading">
            <div>
              <p>
                <b>위험도 급상승</b> 기업
              </p>
              <span>
                {loading ? "조회 중..." : `${alerts.length}개 알림이 있습니다.`}
              </span>
            </div>

            <small>
              관심기업 {count}/{limit}
            </small>
          </div>

          {loading ? (
            <div className="company-search-empty">
              <strong>알림을 불러오는 중입니다...</strong>
            </div>
          ) : alerts.length > 0 ? (
            <div className="company-result-list risk-alert-list">
              {alerts.map((item) => {
                const watched = isWatched(item.companyId);
                const isCritical = item.riskLevel === "심각";

                return (
                  <article
                    className="company-result risk-alert-item"
                    key={`${item.companyId}-${item.detectedAt}`}
                  >
                    <button
                      className="company-result-main"
                      onClick={() => openAnalysis(item)}
                      type="button"
                    >
                      <span className="company-result-mark">
                        {item.companyName?.slice(0, 2) || "??"}
                      </span>

                      <span className="company-result-copy">
                        <strong>{item.companyName}</strong>

                        <em
                          className={`risk-badge ${isCritical ? "danger" : "caution"}`}
                        >
                          종합 리스크 {item.riskLevel}
                        </em>

                        <span className="risk-meta">
                          종합 리스크 점수{" "}
                          <b>{Number(item.riskScore ?? 0).toFixed(0)}점</b>
                          <br />
                          감지 시각 {formatTime(item.detectedAt)}
                        </span>
                      </span>

                      <span className="company-result-arrow">›</span>
                    </button>

                    <button
                      aria-label={`${item.companyName} 관심기업 ${
                        watched ? "해제" : "등록"
                      }`}
                      className={`company-star ${watched ? "is-active" : ""}`}
                      onClick={(event) => toggleWatchlist(event, item)}
                      type="button"
                    >
                      ★
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="company-search-empty">
              <strong>현재 위험도 급상승 알림이 없습니다.</strong>
              <p>
                종합 리스크가 높음 이상인 관심기업이 생기면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
