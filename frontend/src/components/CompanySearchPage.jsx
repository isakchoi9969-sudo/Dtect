import { useState } from "react";
import { api } from "../config/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";
import Header from "./Header";

const recommendedKeywords = ["삼성", "현대", "카카오", "바이오", "2차전지"];

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const {
    isWatched,
    toggleCompany,
    count,
    limit,
    error: watchlistError,
  } = useWatchlist();

  // 검색 실행 (폼 제출과 추천 검색어 클릭에서 공통 사용)
  const runSearch = async (rawKeyword) => {
    const keyword = rawKeyword.trim();

    if (!keyword) {
      return;
    }

    try {
      const response = await api.get("/api/company/search", {
        params: { keyword },
      });

      setSearchResults(response.data.data || []);
      setSubmittedQuery(keyword);
      setNotice("");
    } catch (error) {
      console.error("기업 검색 실패:", error);
      setSearchResults([]);
      setSubmittedQuery(keyword);
      setNotice("기업 검색 중 오류가 발생했습니다.");
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  const chooseKeyword = (keyword) => {
    setQuery(keyword);
    runSearch(keyword);
  };

  // 별표 클릭: 카드 이동(openAnalysis)이 같이 실행되지 않도록 전파를 막고,
  // DB의 COMPANY_ID 기준으로 관심기업 등록/해제
  const toggleWatchlist = (event, company) => {
    event.stopPropagation();
    toggleCompany(company.companyId);
  };

  const openAnalysis = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  const hasResults = submittedQuery.length > 0;

  return (
    <div className={`company-search-page ${hasResults ? "has-results" : ""}`}>
      <Header />

      <main className="company-search-main">
        {!hasResults && (
          <section className="company-search-intro">
            <p className="company-search-eyebrow">CORPORATE INTELLIGENCE</p>

            <div className="company-search-logo">
              D<span>:</span>TECT
            </div>

            <h1>기업의 오늘을 검색하세요.</h1>

            <p>
              뉴스와 시장 신호를 분석해 기업의 리스크와 감성 변화를
              보여드립니다.
            </p>
          </section>
        )}

        <section className="company-search-workspace" aria-label="기업 검색">
          {hasResults && (
            <p className="company-search-eyebrow">COMPANY SEARCH</p>
          )}

          <form className="company-search-form" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>

            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="기업명을 검색하세요"
              value={query}
            />

            <button type="submit">검색</button>
          </form>

          <div className="company-search-recommendations">
            <span>추천 검색어</span>

            {recommendedKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => chooseKeyword(keyword)}
                type="button"
              >
                {keyword}
              </button>
            ))}
          </div>
        </section>

        {notice && (
          <p className="company-search-notice" role="status">
            {notice}
          </p>
        )}

        {watchlistError && (
          <p className="company-search-notice" role="alert">
            {watchlistError}
          </p>
        )}

        {hasResults && (
          <section className="company-search-results">
            <div className="company-search-results-heading">
              <div>
                <p>
                  <b>{submittedQuery}</b> 검색 결과
                </p>

                <span>{searchResults.length}개 기업을 찾았습니다.</span>
              </div>

              <small>
                관심기업 {count}/{limit}
              </small>
            </div>

            {searchResults.length > 0 ? (
              <div className="company-result-list">
                {searchResults.map((company) => {
                  const watched = isWatched(company.companyId);

                  return (
                    <article className="company-result" key={company.companyId}>
                      <button
                        className="company-result-main"
                        onClick={() => openAnalysis(company)}
                        type="button"
                      >
                        <span className="company-result-mark">
                          {company.companyName.slice(0, 2)}
                        </span>

                        <span className="company-result-copy">
                          <strong>{company.companyName}</strong>

                          <em>
                            검색 관련도 {Math.round(company.score * 100)}%
                          </em>

                          <span>DB에 등록된 기업입니다.</span>
                        </span>

                        <span className="company-result-arrow">›</span>
                      </button>

                      <button
                        aria-label={`${company.companyName} 관심기업 ${
                          watched ? "해제" : "등록"
                        }`}
                        className={`company-star ${watched ? "is-active" : ""}`}
                        onClick={(event) => toggleWatchlist(event, company)}
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
                <strong>검색 결과가 없습니다.</strong>
                <p>기업명을 다시 확인해 주세요.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
