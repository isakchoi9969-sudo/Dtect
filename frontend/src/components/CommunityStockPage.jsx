import { useEffect, useState } from "react";

import Header from "./Header";
import Footer from "./Footer";
import { api } from "../config/api";
import { useWatchlist } from "../hooks/useWatchlist";
import { ROUTES } from "../config/routes";

const ALL_COMPANIES = "전체 종목";
const sortOptions = [
  { value: "recent", label: "최신순" },
  { value: "views", label: "조회순" },
  { value: "comments", label: "댓글순" },
];
const emptyList = { items: [], total: 0, totalPages: 0 };

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 미상";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function errorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export default function CommunityStockPage() {
  const initialParams = new URLSearchParams(window.location.search);
  const [selectedCompany, setSelectedCompany] = useState(initialParams.get("company") || ALL_COMPANIES);
  const [selectedStockCode, setSelectedStockCode] = useState(initialParams.get("code") || "");
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialParams.get("companyId") || "");
  const [openPostId, setOpenPostId] = useState(initialParams.get("post") || null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState({ key: null, data: emptyList, error: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [post, setPost] = useState(null);
  const [postError, setPostError] = useState("");
  const [comments, setComments] = useState(emptyList);
  const [commentPage, setCommentPage] = useState(1);
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [formCompanyId, setFormCompanyId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [postSaving, setPostSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { companies: watchlistCompanies, loading: watchlistLoading, error: watchlistError } = useWatchlist();
  const listKey = JSON.stringify([
    selectedCompany, selectedCompanyId, selectedStockCode,
    debouncedSearch, sortBy, page, refreshKey,
  ]);
  const list = listState.key === listKey ? listState.data : emptyList;
  const listError = listState.key === listKey ? listState.error : "";
  const listLoading = search.trim() !== debouncedSearch || listState.key !== listKey;

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCompany(params.get("company") || ALL_COMPANIES);
      setSelectedStockCode(params.get("code") || "");
      setSelectedCompanyId(params.get("companyId") || "");
      setOpenPostId(params.get("post") || null);
      setPage(1);
      setPostError("");
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/auth/me", { signal: controller.signal })
      .then((response) => setCurrentUser(response.data.user))
      .catch(() => setCurrentUser(null));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = { page, pageSize: 10, sort: sortBy };
    if (selectedCompanyId) params.companyId = selectedCompanyId;
    else if (selectedStockCode) params.stockCode = selectedStockCode;
    else if (selectedCompany !== ALL_COMPANIES) params.companyName = selectedCompany;
    if (debouncedSearch) params.search = debouncedSearch;
    api.get("/api/community/posts", { params, signal: controller.signal })
      .then((response) => setListState({ key: listKey, data: response.data, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setListState({
            key: listKey,
            data: emptyList,
            error: errorMessage(error, "게시글을 불러오지 못했습니다."),
          });
        }
      });
    return () => controller.abort();
  }, [selectedCompany, selectedCompanyId, selectedStockCode, debouncedSearch, sortBy, page, refreshKey, listKey]);

  useEffect(() => {
    if (!openPostId) return undefined;
    const controller = new AbortController();
    api.get(`/api/community/posts/${openPostId}`, { signal: controller.signal })
      .then((response) => {
        setPost(response.data);
        setPostError("");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setPostError(errorMessage(error, "게시글을 불러오지 못했습니다."));
      });
    return () => controller.abort();
  }, [openPostId]);

  useEffect(() => {
    if (!openPostId) return;
    const key = `community-post-viewed:${openPostId}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    api.post(`/api/community/posts/${openPostId}/view`)
      .then(() => {
        setPost((current) => current && String(current.id) === String(openPostId)
          ? { ...current, views: Number(current.views) + 1 }
          : current);
      })
      .catch(() => window.sessionStorage.removeItem(key));
  }, [openPostId]);

  useEffect(() => {
    if (!openPostId) return undefined;
    const controller = new AbortController();
    api.get(`/api/community/posts/${openPostId}/comments`, {
      params: { page: commentPage, pageSize: 30 },
      signal: controller.signal,
    })
      .then((response) => {
        setComments(response.data);
        setCommentError("");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setCommentError(errorMessage(error, "댓글을 불러오지 못했습니다."));
      });
    return () => controller.abort();
  }, [openPostId, commentPage, commentRefreshKey]);

  useEffect(() => {
    if (!composerOpen) return undefined;
    const controller = new AbortController();
    api.get("/api/company", { signal: controller.signal })
      .then((response) => {
        const options = response.data.data.filter((company) => /^\d{6}$/.test(String(company.stockCode || "")));
        setCompanyOptions(options);
        const selected = options.find((company) =>
          selectedCompanyId
            ? String(company.companyId) === String(selectedCompanyId)
            : company.stockCode === selectedStockCode,
        );
        setFormCompanyId(selected ? String(selected.companyId) : "");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setFormError(errorMessage(error, "기업 목록을 불러오지 못했습니다."));
      });
    return () => controller.abort();
  }, [composerOpen, selectedCompanyId, selectedStockCode]);

  const selectCompany = (companyName, stockCode = "", companyId = "") => {
    const url = new URL(window.location.href);
    if (companyName === ALL_COMPANIES) {
      ["company", "code", "companyId"].forEach((key) => url.searchParams.delete(key));
    } else {
      url.searchParams.set("company", companyName);
      if (stockCode) url.searchParams.set("code", stockCode);
      else url.searchParams.delete("code");
      if (companyId) url.searchParams.set("companyId", companyId);
      else url.searchParams.delete("companyId");
    }
    url.searchParams.delete("post");
    window.history.pushState(window.history.state, "", url);
    setSelectedCompany(companyName);
    setSelectedStockCode(String(stockCode || ""));
    setSelectedCompanyId(String(companyId || ""));
    setOpenPostId(null);
    setSearch("");
    setPage(1);
  };

  const showPost = (postId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("post", postId);
    window.history.pushState(window.history.state, "", url);
    setOpenPostId(String(postId));
    setPost(null);
    setPostError("");
    setCommentPage(1);
    setComments(emptyList);
    setCommentError("");
  };

  const closePost = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    window.history.replaceState(window.history.state, "", url);
    setOpenPostId(null);
    setPost(null);
    setRefreshKey((value) => value + 1);
  };

  const openComposer = () => {
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN;
      return;
    }
    setFormError("");
    setComposerOpen(true);
  };

  const createPost = async (event) => {
    event.preventDefault();
    setFormError("");
    setPostSaving(true);
    try {
      const response = await api.post("/api/community/posts", {
        companyId: Number(formCompanyId),
        title: formTitle,
        content: formContent,
      });
      const company = companyOptions.find((item) => String(item.companyId) === formCompanyId);
      setComposerOpen(false);
      setFormTitle("");
      setFormContent("");
      if (company) selectCompany(company.companyName, company.stockCode, company.companyId);
      showPost(response.data.id);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setFormError(errorMessage(error, "게시글을 등록하지 못했습니다."));
    } finally {
      setPostSaving(false);
    }
  };

  const createComment = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN;
      return;
    }
    setCommentSaving(true);
    setCommentError("");
    try {
      await api.post(`/api/community/posts/${openPostId}/comments`, {
        content: commentText,
        parentCommentId: replyTo?.id || null,
      });
      setCommentText("");
      setReplyTo(null);
      setCommentPage(Math.ceil((comments.total + 1) / 30));
      setCommentRefreshKey((value) => value + 1);
    } catch (error) {
      setCommentError(errorMessage(error, "댓글을 등록하지 못했습니다."));
    } finally {
      setCommentSaving(false);
    }
  };

  const selectedInWatchlist = watchlistCompanies.some((company) =>
    selectedCompanyId
      ? String(company.companyId) === selectedCompanyId
      : selectedStockCode
        ? String(company.stockCode || "") === selectedStockCode
        : company.companyName === selectedCompany,
  );
  const displayedPost = post && String(post.id) === String(openPostId) ? post : null;
  const postLoading = Boolean(openPostId && !displayedPost && !postError);

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
          <button className="community-write-button is-enabled" onClick={openComposer} type="button">
            {currentUser ? "글쓰기" : "로그인 후 글쓰기"}
          </button>
        </header>

        <aside className="community-watchlist-sidebar" aria-label="종목 선택">
          <div className="related-company-panel community-watchlist-panel">
            <div className="related-company-heading">
              <div><span>WATCHLIST</span><h2>내 관심기업</h2></div>
              <span className="community-watchlist-count">{watchlistCompanies.length}</span>
            </div>
            <div className="related-company-list community-watchlist-list">
              <button
                aria-pressed={selectedCompany === ALL_COMPANIES && !selectedStockCode && !selectedCompanyId}
                className={`related-company-item community-watchlist-item${selectedCompany === ALL_COMPANIES ? " is-selected" : ""}`}
                onClick={() => selectCompany(ALL_COMPANIES)}
                type="button"
              >
                <span className="related-company-logo community-watchlist-mark" aria-hidden="true">전체</span>
                <span className="related-company-copy"><strong>전체 토론</strong><small>모든 종목</small></span>
                <span className="related-company-arrow" aria-hidden="true">›</span>
              </button>
              {selectedCompany !== ALL_COMPANIES && !selectedInWatchlist && (
                <button aria-pressed="true" className="related-company-item community-watchlist-item is-selected" onClick={() => selectCompany(selectedCompany, selectedStockCode, selectedCompanyId)} type="button">
                  <span className="related-company-logo community-watchlist-mark" aria-hidden="true">{selectedCompany.slice(0, 2)}</span>
                  <span className="related-company-copy"><strong>{selectedCompany}</strong><small>{selectedStockCode || "현재 선택한 기업"}</small></span>
                  <span className="related-company-arrow" aria-hidden="true">›</span>
                </button>
              )}
              {watchlistCompanies.map((company) => {
                const code = String(company.stockCode || "");
                const selected = selectedCompanyId
                  ? String(company.companyId) === selectedCompanyId
                  : code ? selectedStockCode === code : selectedCompany === company.companyName;
                return (
                  <button
                    aria-pressed={selected}
                    className={`related-company-item community-watchlist-item${selected ? " is-selected" : ""}`}
                    key={company.companyId}
                    onClick={() => selectCompany(company.companyName, code, company.companyId)}
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
            {!watchlistLoading && watchlistError && <div className="community-watchlist-message" role="alert"><p>{watchlistError}</p><a href={ROUTES.LOGIN}>로그인</a></div>}
            {!watchlistLoading && !watchlistError && watchlistCompanies.length === 0 && <p className="community-watchlist-message">등록된 관심기업이 없습니다.</p>}
            <a className="community-watchlist-manage" href={ROUTES.COMPANY_SEARCH}>관심기업 추가·관리 <span aria-hidden="true">→</span></a>
          </div>
        </aside>

        <section className="community-board" aria-label="게시글">
          {openPostId ? (
            <div className="community-post-detail">
              <button className="community-back-button" onClick={closePost} type="button">← 게시글 목록</button>
              {postLoading && <p role="status">게시글을 불러오고 있습니다.</p>}
              {postError && <p className="community-inline-error" role="alert">{postError}</p>}
              {displayedPost && (
                <>
                  <div className="community-detail-company">{displayedPost.company} <span>{displayedPost.code}</span></div>
                  <h2>{displayedPost.title}</h2>
                  <div className="community-detail-meta">{displayedPost.author} <span>·</span> {formatTime(displayedPost.createdAt)} <span>·</span> 조회 {displayedPost.views}</div>
                  <div className="community-detail-body">{displayedPost.body}</div>
                  <div className="community-comments">
                    <h3>댓글 <span>{comments.total}</span></h3>
                    {commentError && <p className="community-inline-error" role="alert">{commentError}</p>}
                    {comments.items.length === 0 && <p className="community-comment-empty">첫 댓글을 남겨보세요.</p>}
                    {comments.items.map((comment) => (
                      <div className={`community-comment${comment.parentCommentId ? " is-reply" : ""}`} key={comment.id}>
                        <div><strong>{comment.author}</strong><time>{formatTime(comment.createdAt)}</time></div>
                        {comment.parentCommentId && <small>답글 · #{comment.parentCommentId}</small>}
                        <p>{comment.content}</p>
                        {currentUser && <button onClick={() => setReplyTo(comment)} type="button">답글</button>}
                      </div>
                    ))}
                    {comments.totalPages > 1 && (
                      <div className="community-pagination">
                        <button disabled={commentPage <= 1} onClick={() => setCommentPage((value) => value - 1)} type="button">이전</button>
                        <span>{commentPage} / {comments.totalPages}</span>
                        <button disabled={commentPage >= comments.totalPages} onClick={() => setCommentPage((value) => value + 1)} type="button">다음</button>
                      </div>
                    )}
                    {currentUser ? (
                      <form className="community-comment-form" onSubmit={createComment}>
                        {replyTo && <div className="community-reply-target">#{replyTo.id} 댓글에 답글 <button onClick={() => setReplyTo(null)} type="button">취소</button></div>}
                        <textarea aria-label="댓글 내용" maxLength={2000} onChange={(event) => setCommentText(event.target.value)} placeholder="의견을 남겨주세요." required rows={3} value={commentText} />
                        <button disabled={commentSaving || !commentText.trim()} type="submit">{commentSaving ? "등록 중..." : "댓글 등록"}</button>
                      </form>
                    ) : (
                      <p className="community-login-hint"><a href={ROUTES.LOGIN}>로그인</a> 후 댓글을 작성할 수 있습니다.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="community-board-header">
                <div>
                  <h2>{selectedCompany === ALL_COMPANIES ? "전체 토론" : `${selectedCompany} 토론방`} <span>{list.total}</span></h2>
                  <p>관심 종목에 대한 실제 게시글을 확인해보세요.</p>
                </div>
                <div className="community-search">
                  <span aria-hidden="true">⌕</span>
                  <input aria-label="현재 토론방 게시글 검색" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="현재 토론방에서 검색" type="search" value={search} />
                  {search && <button aria-label="검색어 지우기" onClick={() => { setSearch(""); setPage(1); }} type="button">×</button>}
                </div>
              </div>
              <div className="community-sort-tabs" aria-label="게시글 정렬">
                {sortOptions.map((option) => (
                  <button aria-pressed={sortBy === option.value} className={sortBy === option.value ? "is-active" : ""} key={option.value} onClick={() => { setSortBy(option.value); setPage(1); }} type="button">{option.label}</button>
                ))}
              </div>
              {listLoading ? (
                <div className="community-board-empty" role="status">게시글을 불러오고 있습니다.</div>
              ) : listError ? (
                <div className="community-board-empty" role="alert"><strong>{listError}</strong><p>잠시 후 다시 시도해주세요.</p><button onClick={() => setRefreshKey((value) => value + 1)} type="button">다시 시도</button></div>
              ) : list.items.length ? (
                <>
                  <div className="community-post-list">
                    {list.items.map((item) => (
                      <button className="community-post-row" key={item.id} onClick={() => showPost(item.id)} type="button">
                        <span className="community-post-company">{item.company}<small>{item.code}</small></span>
                        <span className="community-post-copy"><strong>{item.title}</strong><small>{item.preview}</small></span>
                        <span className="community-post-author">{item.author}<small>{formatTime(item.createdAt)}</small></span>
                        <span className="community-post-stats">조회 {item.views}<small>댓글 {item.comments}</small></span>
                      </button>
                    ))}
                  </div>
                  {list.totalPages > 1 && (
                    <div className="community-pagination">
                      <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">이전</button>
                      <span>{page} / {list.totalPages}</span>
                      <button disabled={page >= list.totalPages} onClick={() => setPage((value) => value + 1)} type="button">다음</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="community-board-empty"><strong>{search.trim() ? "검색 결과가 없습니다." : "아직 등록된 게시글이 없습니다."}</strong><p>{search.trim() ? "검색어를 바꾸거나 지운 뒤 다시 확인해보세요." : "첫 번째 토론 글을 작성해보세요."}</p>{search.trim() && <button onClick={() => { setSearch(""); setPage(1); }} type="button">검색어 지우기</button>}</div>
              )}
            </>
          )}
        </section>

        <section className="community-stock-notice" aria-label="커뮤니티 이용 안내">
          <strong>커뮤니티 이용 안내</strong>
          <span>종목 및 기업 정보를 자유롭게 공유할 수 있습니다. 투자 판단은 본인의 책임이며, 게시글 내용은 D:TECT의 공식 의견이 아닙니다.</span>
        </section>
      </main>

      {composerOpen && (
        <div className="community-compose-backdrop" onClick={() => setComposerOpen(false)}>
          <div aria-labelledby="community-compose-title" aria-modal="true" className="community-compose-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="community-compose-heading"><h2 id="community-compose-title">종목 토론 글쓰기</h2><button aria-label="닫기" onClick={() => setComposerOpen(false)} type="button">×</button></div>
            <form onSubmit={createPost}>
              <label>종목
                <select onChange={(event) => setFormCompanyId(event.target.value)} required value={formCompanyId}>
                  <option value="">종목을 선택해주세요</option>
                  {companyOptions.map((company) => <option key={company.companyId} value={company.companyId}>{company.companyName} ({company.stockCode})</option>)}
                </select>
              </label>
              <label>제목<input maxLength={200} minLength={2} onChange={(event) => setFormTitle(event.target.value)} placeholder="제목을 입력해주세요" required value={formTitle} /></label>
              <label>내용<textarea maxLength={5000} minLength={10} onChange={(event) => setFormContent(event.target.value)} placeholder="의견을 작성해주세요" required rows={9} value={formContent} /></label>
              {formError && <p className="community-inline-error" role="alert">{formError}</p>}
              <div className="community-compose-actions"><button onClick={() => setComposerOpen(false)} type="button">취소</button><button disabled={postSaving || !formCompanyId} type="submit">{postSaving ? "등록 중..." : "게시글 등록"}</button></div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
