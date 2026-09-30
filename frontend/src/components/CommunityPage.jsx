import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";

const PAGE_SIZE = 10;
const COMMENT_PAGE_SIZE = 30;
const TEST_POST_PREFIX = "[이모저모 테스트 20260929]";
const EMPTY_LIST = { items: [], total: 0, totalPages: 0, recentCommented: [], popularPosts: [] };
const EMPTY_COMMENTS = { items: [], total: 0, totalPages: 0 };
const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "GENERAL", label: "자유" },
  { value: "QUESTION", label: "질문" },
  { value: "INFO", label: "정보 공유" },
  { value: "INDUSTRY", label: "기업·산업" },
];
const SORTS = [
  { value: "recent", label: "최신순" },
  { value: "comments", label: "댓글순" },
  { value: "views", label: "조회순" },
];
const START_PROMPTS = [
  { category: "QUESTION", mark: "?", title: "궁금한 점 물어보기", description: "기업이나 산업에 대해 궁금한 것을 함께 이야기해요." },
  { category: "INFO", mark: "i", title: "알아낸 정보 나누기", description: "유용한 자료와 공부한 내용을 공유해 주세요." },
  { category: "INDUSTRY", mark: "↗", title: "기업·산업 이야기", description: "관심 있는 기업과 산업의 흐름에 대해 의견을 나눠요." },
];

const categoryLabel = (value) => CATEGORIES.find((item) => item.value === value)?.label || "자유";
const getError = (error, fallback) => error.response?.data?.message || fallback;

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시간 정보 없음";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return minutes + "분 전";
  if (minutes < 1440) return Math.floor(minutes / 60) + "시간 전";
  if (minutes < 10080) return Math.floor(minutes / 1440) + "일 전";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const sort = params.get("sort");
  const rawPage = Number(params.get("page"));
  return {
    category: CATEGORIES.some((item) => item.value === category) ? category : "ALL",
    sort: SORTS.some((item) => item.value === sort) ? sort : "recent",
    search: params.get("q") || "",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    postId: params.get("post") || "",
  };
}

function pageNumbers(current, total) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: Math.min(total, 5) }, (_, index) => start + index);
}

function displayTitle(item) {
  if (!item.isTest) return item.title;
  return item.title.replace(TEST_POST_PREFIX, "").replace(/^\s*\[[^\]]+\]\s*/, "").trim();
}

export default function CommunityPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [boardLocation, setBoardLocation] = useState(readLocation);
  const { category, sort, page, postId } = boardLocation;
  const [search, setSearch] = useState(boardLocation.search);
  const [searchQuery, setSearchQuery] = useState(boardLocation.search);
  const [listRequest, setListRequest] = useState({ key: "", data: EMPTY_LIST, error: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [postRequest, setPostRequest] = useState({ id: "", data: null, error: "" });
  const [postActionError, setPostActionError] = useState("");
  const [commentRequest, setCommentRequest] = useState({ key: "", data: EMPTY_COMMENTS, error: "" });
  const [commentActionError, setCommentActionError] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [replyTo, setReplyTo] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formCategory, setFormCategory] = useState("GENERAL");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [composerError, setComposerError] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const composerRef = useRef(null);
  const composerTriggerRef = useRef(null);
  const savingPostRef = useRef(false);

  const listKey = JSON.stringify([category, sort, searchQuery, page, refreshKey]);
  const listLoading = listRequest.key !== listKey;
  const list = listLoading ? EMPTY_LIST : listRequest.data;
  const listError = listLoading ? "" : listRequest.error;
  const activity = listRequest.data;
  const hasActivity = Boolean(activity.recentCommented?.length || activity.popularPosts?.length);
  const postLoading = Boolean(postId && postRequest.id !== postId);
  const post = postRequest.id === postId ? postRequest.data : null;
  const postError = postActionError || (postRequest.id === postId ? postRequest.error : "");
  const commentKey = JSON.stringify([postId, commentPage, refreshKey]);
  const commentLoading = Boolean(postId && commentRequest.key !== commentKey);
  const comments = commentLoading ? EMPTY_COMMENTS : commentRequest.data;
  const commentError = commentActionError || (commentLoading ? "" : commentRequest.error);
  const writeLabel = currentUser ? "＋ 글쓰기" : "로그인 후 글쓰기";

  const changeLocation = (changes, mode = "pushState") => {
    const next = { ...boardLocation, ...changes };
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({
      category: next.category === "ALL" ? "" : next.category,
      sort: next.sort === "recent" ? "" : next.sort,
      q: next.search.trim(),
      page: next.page === 1 ? "" : String(next.page),
      post: next.postId,
    })) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href !== window.location.href) window.history[mode]({}, "", url);
    setBoardLocation(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/auth/me", { signal: controller.signal })
      .then((response) => setCurrentUser(response.data.user || null))
      .catch((error) => { if (error.code !== "ERR_CANCELED") setCurrentUser(null); })
      .finally(() => { if (!controller.signal.aborted) setUserLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/community/free/posts", {
      params: { category, sort, search: searchQuery, page, pageSize: PAGE_SIZE },
      signal: controller.signal,
    }).then((response) => setListRequest({ key: listKey, data: response.data, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setListRequest({ key: listKey, data: EMPTY_LIST, error: getError(error, "게시글을 불러오지 못했습니다.") });
        }
      });
    return () => controller.abort();
  }, [category, sort, searchQuery, page, refreshKey, listKey]);

  useEffect(() => {
    const onPopState = () => {
      const next = readLocation();
      setBoardLocation(next);
      setSearch(next.search);
      setSearchQuery(next.search);
      setCommentPage(1);
      setReplyTo(null);
      setPostActionError("");
      setCommentActionError("");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!postId) return undefined;
    const controller = new AbortController();
    const viewKey = "dtect-free-post-view-" + postId;
    if (!window.sessionStorage.getItem(viewKey)) {
      api.post("/api/community/free/posts/" + postId + "/view", {}, { signal: controller.signal })
        .then(() => window.sessionStorage.setItem(viewKey, "1"))
        .catch(() => {});
    }
    api.get("/api/community/free/posts/" + postId, { signal: controller.signal })
      .then((response) => setPostRequest({ id: postId, data: response.data, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setPostRequest({ id: postId, data: null, error: getError(error, "게시글을 불러오지 못했습니다.") });
        }
      });
    return () => controller.abort();
  }, [postId]);

  useEffect(() => {
    if (!postId) return undefined;
    const controller = new AbortController();
    api.get("/api/community/free/posts/" + postId + "/comments", {
      params: { page: commentPage, pageSize: COMMENT_PAGE_SIZE },
      signal: controller.signal,
    }).then((response) => setCommentRequest({ key: commentKey, data: response.data, error: "" }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setCommentRequest({ key: commentKey, data: EMPTY_COMMENTS, error: getError(error, "댓글을 불러오지 못했습니다.") });
        }
      });
    return () => controller.abort();
  }, [postId, commentPage, refreshKey, commentKey]);

  useEffect(() => {
    if (!composerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    composerRef.current?.querySelector("select")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !savingPostRef.current) {
        setComposerOpen(false);
      } else if (event.key === "Tab") {
        const focusable = [...composerRef.current.querySelectorAll("button:not(:disabled), input, textarea, select")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      composerTriggerRef.current?.focus();
    };
  }, [composerOpen]);

  const openPost = (id) => {
    changeLocation({ postId: String(id) }, "pushState");
    setPostRequest({ id: "", data: null, error: "" });
    setCommentPage(1);
    setReplyTo(null);
    setPostActionError("");
    setCommentActionError("");
  };

  const closePost = () => {
    changeLocation({ postId: "" }, "replaceState");
    setRefreshKey((value) => value + 1);
  };

  const openComposer = (item = null, categoryOverride = null) => {
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN;
      return;
    }
    composerTriggerRef.current = document.activeElement;
    setEditingPost(item);
    setFormCategory(categoryOverride || item?.category || "GENERAL");
    setFormTitle(item?.title || "");
    setFormContent(item?.body || "");
    setComposerError("");
    setComposerOpen(true);
  };

  const submitPost = async (event) => {
    event.preventDefault();
    savingPostRef.current = true;
    setSavingPost(true);
    setComposerError("");
    const payload = { category: formCategory, title: formTitle, content: formContent };
    try {
      if (editingPost) {
        await api.patch("/api/community/free/posts/" + editingPost.id, payload);
        setPostRequest((value) => ({ ...value, data: value.data ? { ...value.data, ...payload, body: payload.content, isTest: payload.title.startsWith(TEST_POST_PREFIX) } : null }));
      } else {
        const response = await api.post("/api/community/free/posts", payload);
        changeLocation({ category: "ALL", sort: "recent", search: "", page: 1, postId: String(response.data.id) }, "pushState");
        setSearch("");
        setSearchQuery("");
        setCommentPage(1);
      }
      setComposerOpen(false);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setComposerError(getError(error, "게시글을 저장하지 못했습니다."));
    } finally {
      savingPostRef.current = false;
      setSavingPost(false);
    }
  };

  const removePost = async () => {
    if (!post || !window.confirm("이 게시글을 삭제할까요?")) return;
    try {
      await api.delete("/api/community/free/posts/" + post.id);
      changeLocation({ postId: "", page: 1 }, "replaceState");
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setPostActionError(getError(error, "게시글을 삭제하지 못했습니다."));
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN;
      return;
    }
    setSavingComment(true);
    setCommentActionError("");
    try {
      await api.post("/api/community/free/posts/" + postId + "/comments", {
        content: commentText,
        parentCommentId: replyTo?.id || null,
      });
      setCommentText("");
      setReplyTo(null);
      if (!replyTo) setCommentPage(1);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setCommentActionError(getError(error, "댓글을 등록하지 못했습니다."));
    } finally {
      setSavingComment(false);
    }
  };

  const removeComment = async (comment) => {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    try {
      await api.delete("/api/community/free/comments/" + comment.id);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setCommentActionError(getError(error, "댓글을 삭제하지 못했습니다."));
    }
  };

  const isOwner = post && currentUser && String(post.authorId) === String(currentUser.id);

  return (
    <div className="free-community-page">
      <Header />
      <main className="free-community-main">
        <header className="free-community-header">
          <div>
            <span className="free-community-eyebrow">D:TECT COMMUNITY</span>
            <h1>이모저모</h1>
            <p>가벼운 이야기부터 기업과 산업에 관한 생각까지, 편하게 나눠보세요.</p>
          </div>
          {postId && <button className="free-community-primary-button" disabled={userLoading} onClick={() => openComposer()} type="button">{writeLabel}</button>}
        </header>

        {!postId ? (
          <>
          <section className="free-community-start" aria-label="글쓰기 시작">
            <div className="free-community-start-heading">
              <div><span>START A CONVERSATION</span><h2>어떤 이야기로 시작할까요?</h2></div>
              <p>{currentUser ? "주제를 고르면 해당 분류로 바로 글을 쓸 수 있습니다." : "로그인 후 원하는 주제로 글을 남길 수 있습니다."}</p>
            </div>
            <div className="free-community-start-options">
              {START_PROMPTS.map((item) => <button className={"free-community-start-option is-" + item.category.toLowerCase()} disabled={userLoading} key={item.category} onClick={() => openComposer(null, item.category)} type="button"><span className="free-community-start-mark" aria-hidden="true">{item.mark}</span><strong>{item.title}</strong><small>{item.description}</small><span className="free-community-start-action">{currentUser ? "글쓰기 →" : "로그인 후 작성 →"}</span></button>)}
            </div>
          </section>
          <div className={"free-community-layout" + (hasActivity ? "" : " is-wide")}>
            <section className="free-community-feed" aria-label="자유게시판">
              <div className="free-community-tools">
                <nav className="free-community-categories" aria-label="게시글 분류">
                  {CATEGORIES.map((item) => (
                    <button aria-pressed={category === item.value} className={category === item.value ? "is-active" : ""} key={item.value} onClick={() => changeLocation({ category: item.value, page: 1 })} type="button">{item.label}</button>
                  ))}
                </nav>
                <div className="free-community-filter-row">
                  <label className="free-community-search"><span aria-hidden="true">⌕</span><input aria-label="게시글 검색" maxLength={100} onChange={(event) => { setSearch(event.target.value); changeLocation({ search: event.target.value, page: 1 }, "replaceState"); }} placeholder="제목이나 내용 검색" type="search" value={search} />{search && <button aria-label="검색어 지우기" onClick={() => { setSearch(""); changeLocation({ search: "", page: 1 }, "replaceState"); }} type="button">×</button>}</label>
                  <nav className="free-community-sorts" aria-label="정렬">
                    {SORTS.map((item) => <button aria-pressed={sort === item.value} className={sort === item.value ? "is-active" : ""} key={item.value} onClick={() => changeLocation({ sort: item.value, page: 1 })} type="button">{item.label}</button>)}
                  </nav>
                </div>
              </div>

              <div className="free-community-feed-heading">
                <div><strong>{category === "ALL" ? "전체 글" : categoryLabel(category)}</strong><span>{listLoading ? "불러오는 중" : `${list.total.toLocaleString()}건`}</span></div>
                <button className="free-community-primary-button" disabled={userLoading} onClick={() => openComposer()} type="button">{writeLabel}</button>
              </div>

              {listLoading ? <div className="free-community-state" role="status">게시글을 불러오고 있습니다.</div>
                : listError ? <div className="free-community-state" role="alert"><strong>{listError}</strong><button onClick={() => setRefreshKey((value) => value + 1)} type="button">다시 시도</button></div>
                  : list.items.length ? (
                    <>
                      {list.items.some((item) => item.isTest) && <p className="free-community-demo-note">현재 목록에는 화면 확인용 테스트 글이 포함되어 있습니다.</p>}
                      <div className="free-community-post-list">
                        {list.items.map((item) => (
                          <button className="free-community-post-row" key={item.id} onClick={() => openPost(item.id)} type="button">
                            <span className={"free-community-category-tag free-community-category-tag--" + item.category.toLowerCase()}>{categoryLabel(item.category)}</span>
                            <span className="free-community-post-copy"><strong>{item.isTest && <em className="free-community-test-tag">테스트</em>}{displayTitle(item)}</strong><span>{item.preview}</span></span>
                            <span className="free-community-post-meta"><span>{item.author}</span><time>{timeAgo(item.createdAt)}</time></span>
                            <span className="free-community-post-stats"><span>조회 {Number(item.views).toLocaleString()}</span><span>댓글 {Number(item.comments).toLocaleString()}</span></span>
                          </button>
                        ))}
                      </div>
                      {list.totalPages > 1 && <nav aria-label="게시글 페이지" className="free-community-pagination free-community-post-pagination"><button disabled={page <= 1} onClick={() => changeLocation({ page: 1 })} type="button">처음</button><button disabled={page <= 1} onClick={() => changeLocation({ page: page - 1 })} type="button">이전</button>{pageNumbers(page, list.totalPages).map((number) => <button aria-current={page === number ? "page" : undefined} className={page === number ? "is-active" : ""} key={number} onClick={() => changeLocation({ page: number })} type="button">{number}</button>)}<button disabled={page >= list.totalPages} onClick={() => changeLocation({ page: page + 1 })} type="button">다음</button><button disabled={page >= list.totalPages} onClick={() => changeLocation({ page: list.totalPages })} type="button">끝</button></nav>}
                      <div className="free-community-feed-footer"><button className="free-community-primary-button" disabled={userLoading} onClick={() => openComposer()} type="button">{writeLabel}</button></div>
                    </>
                  ) : (
                    <div className="free-community-empty"><span aria-hidden="true">✦</span><strong>{list.total > 0 ? "이 페이지에는 글이 없습니다." : searchQuery ? "검색 결과가 없습니다." : "아직 게시글이 없습니다."}</strong><p>{list.total > 0 ? "첫 페이지로 돌아가 글을 확인해 주세요." : searchQuery ? "검색어나 분류를 바꿔 다시 찾아보세요." : "첫 글을 남겨 이모저모의 대화를 시작해보세요."}</p>{list.total > 0 ? <button onClick={() => changeLocation({ page: 1 })} type="button">첫 페이지로</button> : !searchQuery && <button onClick={() => openComposer()} type="button">첫 게시글 작성하기</button>}</div>
                  )}
            </section>

            {hasActivity && <aside className="free-community-sidebar">
              {activity.recentCommented?.length > 0 && <section className="free-community-side-card">
                <div className="free-community-side-heading"><span>ACTIVE DISCUSSIONS</span><h2>최근 댓글 달린 글</h2></div>
                <ol className="free-community-highlight-list">{activity.recentCommented.map((item) => <li key={item.id}><button onClick={() => openPost(item.id)} type="button"><span className="free-community-highlight-category">{categoryLabel(item.category)} · {timeAgo(item.latestCommentAt)}</span><strong>{item.title}</strong><small>댓글 {Number(item.comments).toLocaleString()}개</small></button></li>)}</ol>
              </section>}
              {activity.popularPosts?.length > 0 && <section className="free-community-side-card">
                <div className="free-community-side-heading"><span>POPULAR POSTS</span><h2>많이 읽힌 글</h2></div>
                <ol className="free-community-highlight-list">{activity.popularPosts.map((item) => <li key={item.id}><button onClick={() => openPost(item.id)} type="button"><span className="free-community-highlight-category">{categoryLabel(item.category)}</span><strong>{item.title}</strong><small>조회 {Number(item.views).toLocaleString()}회</small></button></li>)}</ol>
              </section>}
              <section className="free-community-side-note"><strong>함께 지켜주세요</strong><p>서로 다른 의견을 존중하고, 개인정보나 확인되지 않은 민감한 정보는 게시하지 말아주세요.</p><span className="free-community-report-decoration" aria-disabled="true" title="신고 기능은 준비 중입니다">신고 기능 준비 중</span></section>
            </aside>}
          </div>
          </>
        ) : (
          <article className="free-community-detail">
            <button className="free-community-back" onClick={closePost} type="button">← 목록으로</button>
            {postLoading && <div className="free-community-state" role="status">게시글을 불러오고 있습니다.</div>}
            {postError && <p className="free-community-error" role="alert">{postError}</p>}
            {post && (
              <>
                <header className="free-community-detail-head">
                  <div className="free-community-detail-tags"><span className={"free-community-category-tag free-community-category-tag--" + post.category.toLowerCase()}>{categoryLabel(post.category)}</span>{post.isTest && <span className="free-community-test-tag">테스트 글</span>}<span className="free-community-report-decoration" aria-disabled="true" title="신고 기능은 준비 중입니다">신고</span></div>
                  <h2>{displayTitle(post)}</h2>
                  <div className="free-community-detail-meta"><span>{post.author}</span><time>{timeAgo(post.createdAt)}</time><span>조회 {Number(post.views).toLocaleString()}</span></div>
                  {isOwner && <div className="free-community-owner-actions"><button onClick={() => openComposer(post)} type="button">수정</button><button onClick={removePost} type="button">삭제</button></div>}
                </header>
                <div className="free-community-detail-body">{post.body}</div>
                <section className="free-community-comments" aria-label="댓글">
                  <h3>댓글 <span>{comments.total.toLocaleString()}</span></h3>
                  {commentError && <p className="free-community-error" role="alert">{commentError}</p>}
                  {commentLoading ? <p className="free-community-comment-empty">댓글을 불러오고 있습니다.</p> : comments.items.length ? (
                    <div className="free-community-comment-list">{comments.items.map((comment) => (
                      <div className={"free-community-comment" + (comment.parentCommentId ? " is-reply" : "")} key={comment.id}>
                        <div className="free-community-comment-meta"><strong>{comment.author}</strong><time>{timeAgo(comment.createdAt)}</time></div>
                        {comment.parentCommentId && <small>답글</small>}<p>{comment.content}</p>
                        {currentUser && comment.status === "ACTIVE" && !comment.parentCommentId && <button onClick={() => setReplyTo(comment)} type="button">답글</button>}
                        {currentUser && comment.status === "ACTIVE" && String(comment.authorId) === String(currentUser.id) && <button onClick={() => removeComment(comment)} type="button">삭제</button>}
                      </div>
                    ))}</div>
                  ) : <p className="free-community-comment-empty">첫 댓글을 남겨보세요.</p>}
                  {comments.totalPages > 1 && <nav className="free-community-pagination" aria-label="댓글 페이지"><button disabled={commentPage <= 1} onClick={() => setCommentPage((value) => value - 1)} type="button">이전</button><span>{commentPage} / {comments.totalPages}</span><button disabled={commentPage >= comments.totalPages} onClick={() => setCommentPage((value) => value + 1)} type="button">다음</button></nav>}
                  {replyTo && <div className="free-community-replying">#{replyTo.id} 댓글에 답글 작성 중 <button onClick={() => setReplyTo(null)} type="button">취소</button></div>}
                  <form className="free-community-comment-form" onSubmit={submitComment}>
                    <textarea aria-label="댓글 내용" maxLength={2000} minLength={2} onChange={(event) => setCommentText(event.target.value)} placeholder={currentUser ? "따뜻하고 건설적인 의견을 남겨주세요." : "로그인 후 댓글을 작성할 수 있습니다."} required rows={3} value={commentText} />
                    <div><span>{currentUser ? "댓글은 2~2,000자로 작성할 수 있습니다." : <><a href={ROUTES.LOGIN}>로그인</a> 후 댓글을 작성할 수 있습니다.</>}</span><button disabled={savingComment || !currentUser || commentText.trim().length < 2} type="submit">{savingComment ? "등록 중…" : "댓글 등록"}</button></div>
                  </form>
                </section>
              </>
            )}
          </article>
        )}
      </main>
      <Footer />

      {composerOpen && <div className="free-community-modal-backdrop" onClick={() => { if (!savingPostRef.current) setComposerOpen(false); }}>
        <section aria-labelledby="free-community-compose-title" aria-modal="true" className="free-community-compose" onClick={(event) => event.stopPropagation()} ref={composerRef} role="dialog">
          <header><div><span>SHARE YOUR THOUGHTS</span><h2 id="free-community-compose-title">{editingPost ? "게시글 수정" : "새 글 작성"}</h2></div><button aria-label="닫기" disabled={savingPost} onClick={() => setComposerOpen(false)} type="button">×</button></header>
          <form onSubmit={submitPost}>
            <label>분류<select onChange={(event) => setFormCategory(event.target.value)} value={formCategory}>{CATEGORIES.filter((item) => item.value !== "ALL").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>제목<input maxLength={200} minLength={2} onChange={(event) => setFormTitle(event.target.value)} placeholder="무슨 이야기를 나누고 싶으신가요?" required value={formTitle} /></label>
            <label>내용<textarea maxLength={10000} minLength={2} onChange={(event) => setFormContent(event.target.value)} placeholder="자유롭게 의견을 작성해주세요." required rows={10} value={formContent} /></label>
            <div className="free-community-compose-footer"><span>{formContent.length.toLocaleString()} / 10,000자</span>{composerError && <p role="alert">{composerError}</p>}<button disabled={savingPost} type="submit">{savingPost ? "저장 중…" : editingPost ? "수정 완료" : "게시글 등록"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
