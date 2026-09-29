import { useEffect, useState } from "react";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";
import { useWatchlist } from "../hooks/useWatchlist";
import CompanyLogo from "./CompanyLogo";
import Header from "./Header";

const userTypeLabels = {
  PERSONAL: "개인 회원",
  COMPANY: "기업 회원",
};

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function MyPage() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [removing, setRemoving] = useState(false);
  // 최근 생성한 AI 대응자료 이력
  const [draftHistory, setDraftHistory] = useState([]);
  const [draftHistoryLoading, setDraftHistoryLoading] = useState(true);
  const [draftHistoryError, setDraftHistoryError] = useState("");

  // 현재 펼쳐서 보고 있는 초안의 ID
  const [expandedDraftId, setExpandedDraftId] = useState(null);
  const [draftCopyNotice, setDraftCopyNotice] = useState("");
  const {
    companies,
    toggleCompany,
    loading: favoritesLoading,
    error: favoritesError,
  } = useWatchlist();

  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/api/auth/me", { signal: controller.signal })
      .then((response) => setUser(response.data.user))
      .catch((error) => {
        if (error.name === "CanceledError") return;

        if (error.response?.status === 401) {
          window.location.replace(ROUTES.LOGIN);
          return;
        }

        setUserError("내 정보를 불러오지 못했습니다.");
      })
      .finally(() => setUserLoading(false));

    return () => controller.abort();
  }, []);

  // 로그인 사용자의 최근 생성 이력 5건을 불러옵니다.
  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/api/response-drafts/history", {
        params: { limit: 5 },
        signal: controller.signal,
      })
      .then((response) => setDraftHistory(response.data.drafts || []))
      .catch((error) => {
        if (error.name !== "CanceledError") {
          setDraftHistoryError("대응자료 생성 이력을 불러오지 못했습니다.");
        }
      })
      .finally(() => setDraftHistoryLoading(false));

    return () => controller.abort();
  }, []);

  const openAnalysis = (companyId) => {
    window.location.assign(`${ROUTES.COMPANY_DETAIL}?companyId=${companyId}`);
  };

  // 마이페이지에서 저장된 초안 본문을 복사합니다.
  const copySavedDraft = async (draftResponse) => {
    try {
      await navigator.clipboard.writeText(draftResponse);
      setDraftCopyNotice("초안을 클립보드에 복사했습니다.");
    } catch {
      setDraftCopyNotice(
        "복사하지 못했습니다. 초안 내용을 직접 선택해 복사해 주세요.",
      );
    }
  };

  // 삭제 확인 후 서버와 화면의 생성 이력을 함께 삭제합니다.
  const deleteSavedDraft = async (draftId) => {
    const isConfirmed = window.confirm("저장된 초안을 삭제하시겠습니까?");

    if (!isConfirmed) return;

    try {
      await api.delete(`/api/response-drafts/${draftId}`);

      // 새로고침 없이 목록에서 즉시 제거합니다.
      setDraftHistory((previous) =>
        previous.filter((item) => item.draftId !== draftId),
      );

      setExpandedDraftId(null);
      setDraftCopyNotice("");
    } catch (error) {
      window.alert(
        error.response?.data?.message || "초안을 삭제하지 못했습니다.",
      );
    }
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;

    setRemoving(true);
    await toggleCompany(pendingRemoval.companyId);
    setRemoving(false);
    setPendingRemoval(null);
  };

  return (
    <>
      <Header />
      <main className="watchlist-page-content mypage-page-content">
        <header className="watchlist-page-heading">
          <div>
            <p>MY PAGE</p>
            <h1>마이페이지</h1>
            <span>내 정보와 등록한 관심 기업을 확인하세요.</span>
          </div>
        </header>

        <section className="mypage-section" aria-labelledby="mypage-user-title">
          <div className="mypage-section-heading">
            <p>ACCOUNT</p>
            <h2 id="mypage-user-title">내 정보</h2>
          </div>

          {userLoading ? (
            <div className="watchlist-loading" role="status" aria-live="polite">
              <span className="watchlist-loading-dot" aria-hidden="true" />내
              정보를 불러오는 중입니다.
            </div>
          ) : userError ? (
            <p className="watchlist-error" role="alert">
              {userError}
            </p>
          ) : (
            <dl className="mypage-profile-grid">
              <div>
                <dt>이름</dt>
                <dd>{user?.name || "-"}</dd>
              </div>
              <div>
                <dt>아이디</dt>
                <dd>{user?.loginId || "-"}</dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>{user?.email || "-"}</dd>
              </div>
              <div>
                <dt>회원 유형</dt>
                <dd>
                  {userTypeLabels[user?.userType] || user?.userType || "-"}
                </dd>
              </div>
              <div>
                <dt>가입일</dt>
                <dd>{formatDate(user?.createdAt)}</dd>
              </div>
            </dl>
          )}
        </section>

        <section
          className="mypage-section"
          aria-labelledby="mypage-drafts-title"
        >
          <div className="mypage-section-heading">
            <p>RESPONSE DRAFTS</p>
            <h2 id="mypage-drafts-title">최근 생성한 대응자료</h2>
          </div>

          {draftHistoryLoading ? (
            <div className="watchlist-loading" role="status">
              <span className="watchlist-loading-dot" aria-hidden="true" />
              생성 이력을 불러오는 중입니다.
            </div>
          ) : draftHistoryError ? (
            <p className="watchlist-error" role="alert">
              {draftHistoryError}
            </p>
          ) : draftHistory.length > 0 ? (
            <div className="mypage-draft-list">
              {draftHistory.map((item) => {
                // 현재 항목이 펼쳐진 상태인지 확인합니다.
                const isExpanded = expandedDraftId === item.draftId;

                return (
                  <article className="mypage-draft-item" key={item.draftId}>
                    {/* 항목을 누르면 저장된 초안 본문을 열거나 닫습니다. */}
                    <button
                      type="button"
                      className="mypage-draft-summary"
                      onClick={() => {
                        setExpandedDraftId(isExpanded ? null : item.draftId);
                        setDraftCopyNotice("");
                      }}
                      aria-expanded={isExpanded}
                    >
                      <span className="mypage-draft-type">
                        {item.documentType}
                      </span>

                      <span className="mypage-draft-text">
                        <strong>{item.issueName}</strong>
                        <small>{item.industry}</small>
                      </span>

                      <time dateTime={item.generatedAt}>
                        {formatDate(item.generatedAt)}
                      </time>

                      <span className="mypage-draft-arrow" aria-hidden="true">
                        {isExpanded ? "⌃" : "⌄"}
                      </span>
                    </button>

                    {/* 선택한 항목의 전체 초안과 복사 버튼 */}
                    {isExpanded && (
                      <div className="mypage-draft-detail">
                        <p className="mypage-draft-content">
                          {item.draftResponse}
                        </p>

                        <div className="mypage-draft-actions">
                          <button
                            type="button"
                            className="mypage-draft-copy-button"
                            onClick={() => copySavedDraft(item.draftResponse)}
                          >
                            초안 복사
                          </button>

                          <button
                            type="button"
                            className="mypage-draft-delete-button"
                            onClick={() => deleteSavedDraft(item.draftId)}
                          >
                            삭제
                          </button>
                        </div>

                        {draftCopyNotice && (
                          <span className="mypage-draft-copy-notice">
                            {draftCopyNotice}
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="watchlist-empty mypage-draft-empty">
              <span aria-hidden="true">▤</span>
              <h2>아직 생성한 대응자료가 없습니다.</h2>
              <p>대응자료 생성에서 AI 초안을 만들면 최근 이력이 표시됩니다.</p>
              <a href={ROUTES.RESPONSE_GENERATOR}>대응자료 생성하기</a>
            </div>
          )}
        </section>

        <section
          className="mypage-section"
          aria-labelledby="mypage-favorites-title"
        >
          <div className="mypage-section-heading">
            <p>WATCHLIST</p>
            <h2 id="mypage-favorites-title">관심 기업</h2>
          </div>

          {favoritesError && (
            <p className="watchlist-error" role="alert">
              {favoritesError}
            </p>
          )}

          {favoritesLoading ? (
            <div className="watchlist-loading" role="status" aria-live="polite">
              <span className="watchlist-loading-dot" aria-hidden="true" />
              관심기업을 불러오는 중입니다.
            </div>
          ) : companies.length > 0 ? (
            <div className="mypage-company-grid">
              {companies.map((company) => (
                <article className="mypage-company-card" key={company.companyId}>
                  <button
                    type="button"
                    className="mypage-company-card-main"
                    onClick={() => openAnalysis(company.companyId)}
                    aria-label={`${company.companyName} 기업 분석 보기`}
                  >
                    <div className="mypage-company-card-header">
                      <span className="mypage-company-logo">
                        <CompanyLogo companyName={company.companyName} size={34} visualOffset={{ x: 6, y: 8 }} />
                      </span>
                      <div>
                        <strong>{company.companyName}</strong>
                        <span>{company.industry || "업종 정보 없음"}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="mypage-company-star is-active"
                    onClick={() => setPendingRemoval(company)}
                    aria-label={`${company.companyName} 관심기업 해제`}
                    aria-pressed="true"
                  >
                    ★
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="watchlist-empty">
              <span aria-hidden="true">☆</span>
              <h2>등록한 관심 기업이 없습니다.</h2>
              <p>기업 검색에서 관심기업을 등록해 보세요.</p>
              <a href={ROUTES.COMPANY_SEARCH}>기업 검색하기</a>
            </div>
          )}
        </section>

        {pendingRemoval && (
          <div className="mypage-modal-backdrop" role="presentation">
            <section
              className="mypage-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mypage-remove-title"
              aria-describedby="mypage-remove-description"
            >
              <p>WATCHLIST</p>
              <h2 id="mypage-remove-title">관심기업 해제</h2>
              <span id="mypage-remove-description">
                <strong>{pendingRemoval.companyName}</strong>을(를) 관심기업에서 삭제할까요?
              </span>
              <div className="mypage-modal-actions">
                <button type="button" onClick={() => setPendingRemoval(null)} disabled={removing}>
                  취소
                </button>
                <button type="button" className="is-danger" onClick={confirmRemoval} disabled={removing}>
                  {removing ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default MyPage;
