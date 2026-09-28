import { useState } from "react";

import { api } from "../config/api";

import Header from "./Header";

const recommendedStocks = [
  "삼성전자",
  "005930",
  "SK하이닉스",
  "000660",
  "현대차",
];

export default function StockSearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 종목 검색
  const runSearch = async (rawKeyword) => {
    const keyword = rawKeyword.trim();

    if (!keyword) {
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      const response = await api.get("/api/stock/search", {
        params: { keyword },
      });

      setSearchResults(response.data.data || []);
      setSubmittedQuery(keyword);
    } catch (error) {
      console.error("종목 검색 실패:", error);

      setSearchResults([]);
      setSubmittedQuery(keyword);
      setNotice("종목 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색 버튼
  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  // 추천 검색어
  const chooseKeyword = (keyword) => {
    setQuery(keyword);
    runSearch(keyword);
  };

  const hasResults = submittedQuery.length > 0;

  // 종목 선택
  const openStock = (stock) => {
    console.log("선택한 종목:", stock);

    // 나중에 종목 상세 페이지를 만들 경우
    // 여기에서 ROUTES.STOCK_DETAIL로 이동시키면 됩니다.
  };

  return (
    <div className={`company-search-page ${hasResults ? "has-results" : ""}`}>
      <Header />

      <main className="company-search-main">
        {!hasResults && (
          <section className="company-search-intro">
            <p className="company-search-eyebrow">STOCK INTELLIGENCE</p>

            <div className="company-search-logo">
              D<span>:</span>TECT
            </div>

            <h1>종목을 검색하세요.</h1>

            <p>
              종목명이나 종목코드를 검색해
              <br />
              기업과 시장의 주요 정보를 확인해보세요.
            </p>
          </section>
        )}

        <section className="company-search-workspace" aria-label="종목 검색">
          {hasResults && <p className="company-search-eyebrow">STOCK SEARCH</p>}

          <form className="company-search-form" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>

            <input
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
              placeholder="종목명 또는 종목코드를 검색하세요"
              value={query}
            />

            <button type="submit" disabled={loading}>
              {loading ? "검색 중..." : "검색"}
            </button>
          </form>

          <div className="company-search-recommendations">
            <span>추천 검색어</span>

            {recommendedStocks.map((keyword) => (
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
          <p className="company-search-notice" role="alert">
            {notice}
          </p>
        )}

        {hasResults && (
          <section className="company-search-results">
            <div className="company-search-results-heading">
              <div>
                <p>
                  <b>{submittedQuery}</b> 검색 결과
                </p>

                <span>{searchResults.length}개 종목을 찾았습니다.</span>
              </div>
            </div>

            {searchResults.length > 0 ? (
              <div className="company-result-list">
                {searchResults.map((stock) => {
                  const stockName =
                    stock.stockName ||
                    stock.companyName ||
                    stock.name ||
                    "종목명 없음";

                  const stockCode =
                    stock.stockCode || stock.code || stock.symbol || "";

                  const market =
                    stock.market || stock.marketName || "국내 주식";

                  return (
                    <article
                      className="company-result"
                      key={stockCode || stockName}
                    >
                      <button
                        className="company-result-main"
                        onClick={() => openStock(stock)}
                        type="button"
                      >
                        <span
                          className="company-result-mark"
                          style={{
                            width: "52px",
                            height: "52px",
                            minWidth: "52px",
                            minHeight: "52px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            borderRadius: "14px",
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            boxSizing: "border-box",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {stockCode || "STOCK"}
                        </span>

                        <span className="company-result-copy">
                          <strong>{stockName}</strong>

                          {stockCode && <em>종목코드 {stockCode}</em>}

                          <span>{market}</span>
                        </span>

                        <span className="company-result-arrow">›</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="company-search-empty">
                <strong>검색 결과가 없습니다.</strong>

                <p>종목명 또는 종목코드를 다시 확인해 주세요.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
