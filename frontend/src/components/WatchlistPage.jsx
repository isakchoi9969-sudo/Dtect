import { companyProfiles } from "../data/companyProfiles";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import AnalysisLayout from "./AnalysisLayout";

export default function WatchlistPage() {
  const { companyIds, toggleCompany, count, limit } = useWatchlist();
  const watchlistCompanies = companyProfiles.filter((company) => companyIds.includes(company.id));

  const openAnalysis = (company) => {
    window.location.assign(`${ROUTES.COMPANY_DETAIL}?symbol=${company.ticker}`);
  };

  return (
    <AnalysisLayout companies={watchlistCompanies}>
      <section className="watchlist-page-content">
        <header className="watchlist-page-heading">
          <div><p>MY WATCHLIST</p><h1>관심 기업</h1><span>별표로 저장한 기업의 리스크 변화를 한눈에 확인하세요.</span></div>
          <strong>{count}<small> / {limit}개</small></strong>
        </header>

        {watchlistCompanies.length > 0 ? (
          <div className="watchlist-grid">
            {watchlistCompanies.map((company) => (
              <article className="watchlist-card" key={company.id}>
                <button className="watchlist-card-main" onClick={() => openAnalysis(company)} type="button">
                  <span className="watchlist-card-mark">{company.name.slice(0, 2)}</span>
                  <span><strong>{company.name} <small>{company.ticker}</small></strong><em>{company.industry} · {company.market}</em><p>{company.description}</p></span>
                  <span className={`watchlist-risk risk-${company.riskLevel}`}><small>현재 위험도</small><b>{company.riskLevel}</b><i>{company.riskScore}점</i></span>
                  <span className="watchlist-card-arrow" aria-hidden="true">›</span>
                </button>
                <button aria-label={`${company.name} 관심기업 해제`} className="watchlist-remove" onClick={() => toggleCompany(company.id)} type="button">★</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="watchlist-empty"><span>☆</span><h2>등록한 관심기업이 없습니다.</h2><p>기업 검색에서 별표를 눌러 관심기업을 추가해 보세요.</p><a href={ROUTES.COMPANY_SEARCH}>기업 검색하기</a></div>
        )}
      </section>
    </AnalysisLayout>
  );
}
