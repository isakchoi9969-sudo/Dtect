import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

export default function WatchlistPage() {
  const { companies, toggleCompany, count, limit, loading, error } =
    useWatchlist();

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  return (
    <>
      <Header />

      <section className="watchlist-page-content">
        <header className="watchlist-page-heading">
          <div>
            <p>MY WATCHLIST</p>
            <h1>관심 기업</h1>
            <span>별표로 저장한 기업의 리스크 변화를 한눈에 확인하세요.</span>
          </div>

          <strong>
            {count}
            <small> / {limit}개</small>
          </strong>
        </header>

        {error && (
          <p className="watchlist-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="watchlist-loading">관심기업을 불러오는 중입니다.</p>
        ) : companies.length > 0 ? (
          <div className="watchlist-grid">
            {companies.map((company) => (
              <article
                className="watchlist-card"
                key={company.companyId}
                style={{
                  transition:
                    "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 24px rgba(0,0,0,0.07)";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                <button
                  className="watchlist-card-main"
                  onClick={() => openAnalysis(company)}
                  type="button"
                >
                  <span className="watchlist-card-mark">
                    {company.companyName.slice(0, 2)}
                  </span>

                  <span>
                    <strong>
                      {company.companyName} <small>{company.stockCode}</small>
                    </strong>

                    <em>{company.industry}</em>

                    <p>{company.companyInfo}</p>
                  </span>

                  {company.riskLevel && (
                    <span
                      className={`watchlist-risk risk-${company.riskLevel}`}
                      style={{
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <small>현재 위험도</small>
                      <b>{company.riskLevel}</b>
                      <i>{company.riskScore}점</i>
                    </span>
                  )}
                </button>

                <button
                  aria-label={`${company.companyName} 관심기업 해제`}
                  className="watchlist-remove"
                  onClick={() => toggleCompany(company.companyId)}
                  type="button"
                  style={{
                    transition: "transform 0.18s ease, color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ★
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="watchlist-empty"
            style={{
              transition: "transform 0.25s ease",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transition: "transform 0.3s ease",
              }}
            >
              ☆
            </span>
            <h2>등록한 관심기업이 없습니다.</h2>
            <p>기업 검색에서 별표를 눌러 관심기업을 추가해 보세요.</p>
            <a
              href={ROUTES.COMPANY_SEARCH}
              style={{
                transition: "transform 0.2s ease, opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.opacity = "1";
              }}
            >
              기업 검색하기
            </a>
          </div>
        )}
      </section>
    </>
  );
}
