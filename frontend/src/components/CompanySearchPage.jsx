import { useMemo, useState } from "react";
import { companyProfiles } from "../data/companyProfiles";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

const recommendedKeywords = ["삼성", "현대", "카카오", "바이오", "2차전지"];

function riskClass(level) {
  return level === "낮음" ? "safe" : level === "주의" ? "caution" : "danger";
}

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  const results = useMemo(() => {
    const term = submittedQuery.trim().toLowerCase();
    if (!term) return [];
    return companyProfiles.filter((company) =>
      [company.name, company.ticker, company.industry, company.description]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [submittedQuery]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
    setNotice("");
  };

  const chooseKeyword = (keyword) => {
    setQuery(keyword);
    setSubmittedQuery(keyword);
    setNotice("");
  };

  const toggleWatchlist = (event, company) => {
    event.stopPropagation();
    const result = toggleCompany(company.id);
    if (result === "limit") {
      setNotice(`관심기업은 최대 ${limit}개까지 등록할 수 있습니다.`);
    } else {
      setNotice(result === "added" ? `${company.name}을 관심기업에 등록했습니다.` : `${company.name}을 관심기업에서 해제했습니다.`);
    }
  };

  const openAnalysis = (company) => {
    window.location.assign(`${ROUTES.COMPANY_DETAIL}?symbol=${company.ticker}`);
  };

  const hasResults = submittedQuery.length > 0;

  return (
    <div className={`company-search-page ${hasResults ? "has-results" : ""}`}>
      <Header />
      <main className="company-search-main">
        {!hasResults && (
          <section className="company-search-intro">
            <p className="company-search-eyebrow">CORPORATE INTELLIGENCE</p>
            <div className="company-search-logo">D<span>:</span>TECT</div>
            <h1>기업의 오늘을 검색하세요.</h1>
            <p>뉴스와 시장 신호를 분석해 기업의 리스크와 감성 변화를 보여드립니다.</p>
          </section>
        )}

        <section className="company-search-workspace" aria-label="기업 검색">
          {hasResults && <p className="company-search-eyebrow">COMPANY SEARCH</p>}
          <form className="company-search-form" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="기업명, 종목코드, 업종을 검색하세요"
              value={query}
            />
            <button type="submit">검색</button>
          </form>
          <div className="company-search-recommendations">
            <span>추천 검색어</span>
            {recommendedKeywords.map((keyword) => (
              <button key={keyword} onClick={() => chooseKeyword(keyword)} type="button">{keyword}</button>
            ))}
          </div>
        </section>

        {notice && <p className="company-search-notice" role="status">{notice}</p>}

        {hasResults && (
          <section className="company-search-results">
            <div className="company-search-results-heading">
              <div><p><b>{submittedQuery}</b> 검색 결과</p><span>{results.length}개 기업을 찾았습니다.</span></div>
              <small>관심기업 {count}/{limit}</small>
            </div>
            {results.length > 0 ? (
              <div className="company-result-list">
                {results.map((company) => {
                  const watched = isWatched(company.id);
                  return (
                    <article className="company-result" key={company.id}>
                      <button className="company-result-main" onClick={() => openAnalysis(company)} type="button">
                      <span className="company-result-mark">{company.name.slice(0, 2)}</span>
                      <span className="company-result-copy"><strong>{company.name} <small>{company.ticker}</small></strong><em>{company.industry} · {company.market}</em><span>{company.description}</span></span>
                      <span className={`company-result-risk ${riskClass(company.riskLevel)}`}><small>현재 위험도</small><b>{company.riskLevel}</b><i>{company.riskScore}</i></span>
                      <span className="company-result-arrow" aria-hidden="true">›</span>
                      </button>
                      <button aria-label={`${company.name} 관심기업 ${watched ? "해제" : "등록"}`} className={`company-star ${watched ? "is-active" : ""}`} onClick={(event) => toggleWatchlist(event, company)} type="button">★</button>
                    </article>
                  );
                })}
              </div>
            ) : <div className="company-search-empty"><strong>검색 결과가 없습니다.</strong><p>기업명 또는 종목코드를 다시 확인해 주세요.</p></div>}
          </section>
        )}
      </main>
    </div>
  );
}
