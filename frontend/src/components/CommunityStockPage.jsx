import { useEffect, useMemo, useState } from "react";

import Header from "./Header";
import Footer from "./Footer";
import { communitySamplePosts } from "../data/communityPosts";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";

const ALL_COMPANIES = "전체 종목";
const sortOptions = [
  { value: "recent", label: "최신순" },
  { value: "views", label: "조회순" },
  { value: "comments", label: "댓글순" },
];

export default function CommunityStockPage() {
  const initialParams = new URLSearchParams(window.location.search);
  const [selectedCompany, setSelectedCompany] = useState(initialParams.get("company") || ALL_COMPANIES);
  const [selectedStockCode, setSelectedStockCode] = useState(initialParams.get("code") || "");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [openPostId, setOpenPostId] = useState(null);
  const { companies: watchlistCompanies, loading: watchlistLoading, error: watchlistError } = useWatchlist();

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCompany(params.get("company") || ALL_COMPANIES);
      setSelectedStockCode(params.get("code") || "");
      setOpenPostId(null);
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const selectCompany = (companyName, stockCode = "") => {
    const code = String(stockCode || "");
    setSelectedCompany(companyName);
    setSelectedStockCode(code);
    setSearch("");
    setOpenPostId(null);

    const url = new URL(window.location.href);
    if (companyName === ALL_COMPANIES) {
      url.searchParams.delete("company");
      url.searchParams.delete("code");
    } else {
      url.searchParams.set("company", companyName);
      if (code) url.searchParams.set("code", code);
      else url.searchParams.delete("code");
    }
    window.history.pushState(window.history.state, "", url);
  };

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    const result = communitySamplePosts.filter((post) => {
      const companyMatches = selectedStockCode
        ? post.code === selectedStockCode
        : selectedCompany === ALL_COMPANIES || post.company === selectedCompany;
      const textMatches = !keyword || [post.title, post.company, post.code, post.author, post.body]
        .some((value) => String(value || "").toLocaleLowerCase().includes(keyword));
      return companyMatches && textMatches;
    });

    return result.sort((a, b) => {
      if (sortBy === "views") return b.views - a.views || a.minutesAgo - b.minutesAgo;
      if (sortBy === "comments") return b.comments - a.comments || a.minutesAgo - b.minutesAgo;
      return a.minutesAgo - b.minutesAgo;
    });
  }, [selectedCompany, selectedStockCode, search, sortBy]);

  const openPost = communitySamplePosts.find((post) => post.id === openPostId);
  const selectedInWatchlist = watchlistCompanies.some((company) =>
    selectedStockCode
      ? String(company.stockCode || "") === selectedStockCode
      : company.companyName === selectedCompany,
  );

  return (
    <div className="community-stock-page">
      <Header />
      <main className="community-stock-main">
        <header className="community-stock-header">
          <div>
            <span className="community-stock-eyebrow">STOCK COMMUNITY</span>
            <h1>종목 토론방</h1>
            <p>관심 종목의 이슈와 뉴스를 공유하고 다양한 의견을 나눠보세요.</p>
          </div>
          <span className="community-write-button">게시글 작성 준비 중</span>
        </header>

        <aside className="community-watchlist-sidebar" aria-label="종목 선택">
          <div className="related-company-panel community-watchlist-panel">
            <div className="related-company-heading">
              <div>
                <span>WATCHLIST</span>
                <h2>내 관심기업</h2>
              </div>
              <span className="community-watchlist-count">{watchlistCompanies.length}</span>
            </div>
            <div className="related-company-list community-watchlist-list">
              <button
                aria-pressed={selectedCompany === ALL_COMPANIES && !selectedStockCode}
                className={`related-company-item community-watchlist-item${selectedCompany === ALL_COMPANIES && !selectedStockCode ? " is-selected" : ""}`}
                onClick={() => selectCompany(ALL_COMPANIES)}
                type="button"
              >
                <span className="related-company-logo community-watchlist-mark" aria-hidden="true">전체</span>
                <span className="related-company-copy"><strong>전체 토론</strong><small>모든 종목</small></span>
                <span className="related-company-arrow" aria-hidden="true">›</span>
              </button>
              {selectedCompany !== ALL_COMPANIES && !selectedInWatchlist && (
                <button
                  aria-pressed="true"
                  className="related-company-item community-watchlist-item is-selected"
                  onClick={() => selectCompany(selectedCompany, selectedStockCode)}
                  type="button"
                >
                  <span className="related-company-logo community-watchlist-mark" aria-hidden="true">{selectedCompany.slice(0, 2)}</span>
                  <span className="related-company-copy"><strong>{selectedCompany}</strong><small>{selectedStockCode || "현재 선택한 기업"}</small></span>
                  <span className="related-company-arrow" aria-hidden="true">›</span>
                </button>
              )}
              {watchlistCompanies.map((company) => {
                const code = String(company.stockCode || "");
                const selected = code
                  ? selectedStockCode === code
                  : !selectedStockCode && selectedCompany === company.companyName;
                return (
                  <button
                    aria-pressed={selected}
                    className={`related-company-item community-watchlist-item${selected ? " is-selected" : ""}`}
                    key={company.companyId}
                    onClick={() => selectCompany(company.companyName, code)}
                    type="button"
                  >
                    <span className="related-company-logo community-watchlist-mark" aria-hidden="true">{company.companyName.slice(0, 2)}</span>
                    <span className="related-company-copy"><strong>{company.companyName}</strong>{code && <small>{code}</small>}</span>
                    <span className="related-company-arrow" aria-hidden="true">›</span>
                  </button>
                );
              })}
            </div>
            {watchlistLoading && <p className="community-watchlist-message" role="status">관심기업을 불러오고 있습니다.</p>}
            {!watchlistLoading && watchlistError && (
              <div className="community-watchlist-message" role="alert">
                <p>{watchlistError}</p>
                <a href={ROUTES.LOGIN}>로그인</a>
              </div>
            )}
            {!watchlistLoading && !watchlistError && watchlistCompanies.length === 0 && (
              <p className="community-watchlist-message">등록된 관심기업이 없습니다.</p>
            )}
            <a className="community-watchlist-manage" href={ROUTES.COMPANY_SEARCH}>관심기업 추가·관리 <span aria-hidden="true">→</span></a>
          </div>
        </aside>

        <section className="community-board" aria-label="게시글">
          {openPost ? (
            <div className="community-post-detail">
              <button className="community-back-button" type="button" onClick={() => setOpenPostId(null)}>← 게시글 목록</button>
              <div className="community-detail-company">{openPost.company} <span>{openPost.code}</span></div>
              <h2>{openPost.title}</h2>
              <div className="community-detail-meta">{openPost.author} <span>·</span> {openPost.time} <span>·</span> 조회 {openPost.views}</div>
              <div className="community-detail-body">{openPost.body}</div>
              <div className="community-detail-footer">댓글 {openPost.comments}개 · 현재 게시글은 화면 예시입니다.</div>
            </div>
          ) : (
            <>
              <div className="community-board-header">
                <div>
                  <h2>{selectedCompany === ALL_COMPANIES ? "전체 토론" : `${selectedCompany} 토론방`} <span>{filteredPosts.length}</span></h2>
                  <p>현재 게시글은 화면 예시이며, 실제 토론 데이터는 연동 준비 중입니다.</p>
                </div>
                <div className="community-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="현재 토론방 게시글 검색"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="현재 토론방에서 검색"
                    type="search"
                    value={search}
                  />
                  {search && <button aria-label="검색어 지우기" onClick={() => setSearch("")} type="button">×</button>}
                </div>
              </div>
              <div className="community-sort-tabs" aria-label="게시글 정렬">
                {sortOptions.map((option) => (
                  <button
                    aria-pressed={sortBy === option.value}
                    className={sortBy === option.value ? "is-active" : ""}
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {filteredPosts.length > 0 ? (
                <div className="community-post-list">
                  {filteredPosts.map((post) => (
                    <button className="community-post-row" key={post.id} onClick={() => setOpenPostId(post.id)} type="button">
                      <span className="community-post-company">{post.company}<small>{post.code}</small></span>
                      <span className="community-post-copy"><strong>{post.title}</strong><small>{post.body}</small></span>
                      <span className="community-post-author">{post.author}<small>{post.time}</small></span>
                      <span className="community-post-stats">조회 {post.views}<small>댓글 {post.comments}</small></span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="community-board-empty">
                  <strong>{search.trim() ? "검색 결과가 없습니다." : "아직 등록된 게시글이 없습니다."}</strong>
                  <p>{search.trim() ? "검색어를 바꾸거나 지운 뒤 다시 확인해보세요." : "다른 관심기업이나 전체 토론을 선택해보세요."}</p>
                  {search.trim() && <button type="button" onClick={() => setSearch("")}>검색어 지우기</button>}
                </div>
              )}
            </>
          )}
        </section>

        <section className="community-stock-notice" aria-label="커뮤니티 이용 안내">
          <strong>커뮤니티 이용 안내</strong>
          <span>종목 및 기업 정보를 자유롭게 공유할 수 있습니다. 투자 판단은 본인의 책임이며, 게시글 내용은 D:TECT의 공식 의견이 아닙니다.</span>
        </section>
      </main>
      <Footer />
    </div>
  );
}
