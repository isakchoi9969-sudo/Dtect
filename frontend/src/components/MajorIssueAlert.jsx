import { useState, useEffect } from "react";
import axios from "axios";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

function severityClass(level) {
  return level === "낮음" ? "safe" : level === "보통" ? "caution" : "danger";
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

export default function MajorIssueAlert() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all"); // all | high | medium
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  const fetchAlerts = async () => {
    setLoading(true);
    setNotice("");
    try {
      const response = await axios.get(
        "http://localhost:3000/api/company/major-issue",
        {
          params: {
            hours: 24,
          },
        },
      );
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error("주요 이슈 발생 알림 조회 실패:", error);
      setAlerts([]);
      setNotice("주요 이슈 발생 알림을 불러오는 중 오류가 발생했습니다.");
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
          if (filter === "high") return item.severity === "높음";
          if (filter === "medium") return item.severity === "보통";
          return true;
        });

  return (
    <div className="company-search-page has-results major-issue-page">
      <Header />
      <main className="company-search-main">
        <section
          className="company-search-workspace"
          aria-label="주요 이슈 발생 알림"
        >
          <p className="company-search-eyebrow">MAJOR ISSUE ALERT</p>
          <div className="risk-surge-header">
            <div>
              <h1>주요 이슈 발생 알림</h1>
              <p className="risk-surge-desc">
                최근 24시간 내 기업에 발생한 주요 이슈를 알려드립니다.
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
              className={filter === "high" ? "is-active" : ""}
              onClick={() => setFilter("high")}
            >
              높음
            </button>
            <button
              type="button"
              className={filter === "medium" ? "is-active" : ""}
              onClick={() => setFilter("medium")}
            >
              보통
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
                <b>주요 이슈</b> 발생 기업
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
                    key={`${item.companyId}-${item.detectedAt}-${item.issueId || item.issueTitle}`}
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
                          className={`risk-badge ${severityClass(item.severity)}`}
                        >
                          {item.severity}
                          {item.issueCategory && <> · {item.issueCategory}</>}
                        </em>
                        <span className="risk-meta">
                          {item.issueTitle && (
                            <>
                              {item.issueTitle}
                              <br />
                            </>
                          )}
                          감지 시각 {formatTime(item.detectedAt)}
                          {item.source && ` · ${item.source}`}
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
              <strong>현재 주요 이슈 알림이 없습니다.</strong>
              <p>새로운 주요 이슈가 발생하면 여기에 표시됩니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
