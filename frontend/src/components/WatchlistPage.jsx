import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import AnalysisLayout from "./AnalysisLayout";

export default function WatchlistPage() {
  const { companies, toggleCompany, count, limit, loading, error } =
    useWatchlist();

  // AnalysisLayout이 예전 필드명(id, name, ticker 등)을 쓰므로 DB 데이터를 그 형태로 변환해서 전달
  const layoutCompanies = companies.map((company) => ({
    id: company.companyId,
    name: company.companyName,
    ticker: company.stockCode,
    industry: company.industry,
    description: company.companyInfo,
  }));

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  return (
    <AnalysisLayout companies={layoutCompanies}>
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
              <article className="watchlist-card" key={company.companyId}>
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
                  {/* riskLevel / riskScore는 COMPANY 테이블에 없으므로 API가 내려줄 때만 표시 */}
                  {company.riskLevel && (
                    <span
                      className={`watchlist-risk risk-${company.riskLevel}`}
                    >
                      <small>현재 위험도</small>
                      <b>{company.riskLevel}</b>
                      <i>{company.riskScore}점</i>
                    </span>
                  )}
                  <span className="watchlist-card-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
                <button
                  aria-label={`${company.companyName} 관심기업 해제`}
                  className="watchlist-remove"
                  onClick={() => toggleCompany(company.companyId)}
                  type="button"
                >
                  ★
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="watchlist-empty">
            <span>☆</span>
            <h2>등록한 관심기업이 없습니다.</h2>
            <p>기업 검색에서 별표를 눌러 관심기업을 추가해 보세요.</p>
            <a href={ROUTES.COMPANY_SEARCH}>기업 검색하기</a>
          </div>
        )}
      </section>
    </AnalysisLayout>
  );
}
