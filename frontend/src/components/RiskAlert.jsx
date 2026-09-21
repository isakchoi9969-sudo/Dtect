import { useState, useEffect } from "react";
import axios from "axios";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

function riskClass(level) {
  return level === "낮음" ? "safe" : level === "주의" ? "caution" : "danger";
}

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
  const [filter, setFilter] = useState("all"); // all | danger | caution
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  const fetchAlerts = async () => {
    setLoading(true);
    setNotice("");
    try {
      const response = await axios.get(
        "http://localhost:3000/api/company/risk-surge",
        {
          params: {
            // 필요하면 hours, limit 등 파라미터 추가 가능
            hours: 24,
          },
        },
      );
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
    fetchAlerts();
  }, []);

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  const toggleWatchlist = (event, company) => {
    event.stopPropagation();
    toggleCompany(company);
  };

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((item) => {
          if (filter === "danger") return item.riskLevel === "위험";
          if (filter === "caution") return item.riskLevel === "주의";
          return true;
        });

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
                최근 24시간 내 리스크 점수가 급격히 상승한 기업을 알려드립니다.
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

          <div className="risk-filter-tabs">
            <button
              type="button"
              className={filter === "all" ? "is-active" : ""}
              onClick={() => setFilter("all")}
            >
              전체
            </button>
            <button
              type="button"
              className={filter === "danger" ? "is-active" : ""}
              onClick={() => setFilter("danger")}
            >
              위험
            </button>
            <button
              type="button"
              className={filter === "caution" ? "is-active" : ""}
              onClick={() => setFilter("caution")}
            >
              주의
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
                {loading
                  ? "조회 중..."
                  : `${filteredAlerts.length}개 알림이 있습니다.`}
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
          ) : filteredAlerts.length > 0 ? (
            <div className="company-result-list risk-alert-list">
              {filteredAlerts.map((item) => {
                const watched = isWatched(item.companyId);
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
                          className={`risk-badge ${riskClass(item.riskLevel)}`}
                        >
                          {item.riskLevel}
                          {item.scoreChange != null && (
                            <> · +{Math.round(item.scoreChange * 100)}% 상승</>
                          )}
                        </em>
                        <span className="risk-meta">
                          감지 시각 {formatTime(item.detectedAt)}
                          {item.reason && ` · ${item.reason}`}
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
              <strong>현재 급상승 알림이 없습니다.</strong>
              <p>리스크가 급격히 상승한 기업이 생기면 여기에 표시됩니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
