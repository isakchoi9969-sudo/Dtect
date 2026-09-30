import { useEffect, useState } from "react";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";
import { useWatchlist } from "../hooks/useWatchlist";
import CompanyLogo from "./CompanyLogo";
import Header from "./Header";
import { deleteSavedCase, fetchSavedCases } from "../services/savedCaseApi";

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
  const [profileModalStep, setProfileModalStep] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    newPassword: "",
    newPasswordConfirm: "",
    userType: "PERSONAL",
    companyId: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileCompanies, setProfileCompanies] = useState([]);
  const [profileCompaniesLoading, setProfileCompaniesLoading] = useState(false);
  const [pendingUserType, setPendingUserType] = useState(null);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [removing, setRemoving] = useState(false);
  // 최근 생성한 AI 대응자료 이력
  const [draftHistory, setDraftHistory] = useState([]);
  const [draftHistoryLoading, setDraftHistoryLoading] = useState(true);
  const [draftHistoryError, setDraftHistoryError] = useState("");
  const [savedCases, setSavedCases] = useState([]);
  const [savedCasesLoading, setSavedCasesLoading] = useState(true);
  const [savedCasesError, setSavedCasesError] = useState("");

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

  useEffect(() => {
    let active = true;

    fetchSavedCases()
      .then((response) => {
        if (active) setSavedCases(response.savedCases || []);
      })
      .catch((error) => {
        if (active && error.name !== "CanceledError") {
          setSavedCasesError("저장한 과거 사례를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) setSavedCasesLoading(false);
      });

    return () => { active = false; };
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

  const removeSavedCase = async (savedCaseId) => {
    if (!window.confirm("저장한 과거 사례를 삭제하시겠습니까?")) return;

    try {
      await deleteSavedCase(savedCaseId);
      setSavedCases((previous) => previous.filter((item) => item.savedCaseId !== savedCaseId));
    } catch (error) {
      window.alert(error.response?.data?.message || "저장한 과거 사례를 삭제하지 못했습니다.");
    }
  };

  const openProfileEditor = () => {
    setCurrentPassword("");
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      newPassword: "",
      newPasswordConfirm: "",
      userType: user?.userType || "PERSONAL",
      companyId: user?.companyId ? String(user.companyId) : "",
    });
    setProfileError("");
    setProfileModalStep("verify");
    setProfileCompaniesLoading(true);
    api
      .get("/api/company")
      .then((response) => setProfileCompanies(response.data.data || []))
      .catch(() => setProfileError("기업 목록을 불러오지 못했습니다."))
      .finally(() => setProfileCompaniesLoading(false));
  };

  const closeProfileEditor = (force = false) => {
    if (profileSaving && !force) return;
    setProfileModalStep(null);
    setCurrentPassword("");
    setProfileError("");
    setPendingUserType(null);
  };

  const verifyPassword = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");

    try {
      await api.post("/api/auth/verify-password", { currentPassword });
      setProfileModalStep("edit");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "비밀번호를 확인하지 못했습니다.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");

    try {
      const response = await api.patch("/api/auth/me", {
        currentPassword,
        ...profileForm,
      });
      setUser(response.data.user);
      window.dispatchEvent(
        new CustomEvent("dtect-user-updated", { detail: response.data.user }),
      );
      closeProfileEditor(true);
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "내 정보를 수정하지 못했습니다.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const openWithdrawal = () => {
    setWithdrawalPassword("");
    setWithdrawalError("");
    setWithdrawalOpen(true);
  };

  const closeWithdrawal = () => {
    if (withdrawing) return;
    setWithdrawalOpen(false);
    setWithdrawalPassword("");
    setWithdrawalError("");
  };

  const withdrawAccount = async (event) => {
    event.preventDefault();
    setWithdrawing(true);
    setWithdrawalError("");

    try {
      const response = await api.delete("/api/auth/me", {
        data: { currentPassword: withdrawalPassword },
      });
      localStorage.removeItem("isLoggedIn");
      window.alert(response.data.message || "회원 탈퇴가 완료되었습니다.");
      window.location.assign(ROUTES.HOME);
    } catch (error) {
      setWithdrawalError(
        error.response?.data?.message || "회원 탈퇴를 처리하지 못했습니다.",
      );
    } finally {
      setWithdrawing(false);
    }
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
          <div className="mypage-section-heading mypage-profile-heading">
            <div>
              <p>ACCOUNT</p>
              <h2 id="mypage-user-title">내 정보</h2>
            </div>
            {!userLoading && !userError && (
              <button
                type="button"
                className="mypage-profile-edit-button"
                onClick={openProfileEditor}
              >
                개인정보 수정하기
              </button>
            )}
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
          aria-labelledby="mypage-saved-cases-title"
        >
          <div className="mypage-section-heading">
            <p>SAVED CASES</p>
            <h2 id="mypage-saved-cases-title">저장한 과거 사례</h2>
          </div>

          {savedCasesError && <p className="watchlist-error" role="alert">{savedCasesError}</p>}
          {savedCasesLoading ? (
            <div className="watchlist-loading" role="status">저장한 과거 사례를 불러오는 중입니다.</div>
          ) : savedCases.length > 0 ? (
            <div className="mypage-saved-case-list">
              {savedCases.map((item) => (
                <article className="mypage-saved-case-item" key={item.savedCaseId}>
                  <div className="mypage-saved-case-heading">
                    <span aria-hidden="true">♥</span>
                    <div>
                      <h3>{item.caseTitle}</h3>
                      <p>
                        {[item.riskType, formatDate(item.startDate), item.articleCount && `관련 기사 ${item.articleCount}건`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  {item.aiSummary?.overview && (
                    <p className="mypage-saved-case-preview">
                      {item.aiSummary.overview}
                    </p>
                  )}
                  <div className="mypage-saved-case-actions">
                    {item.representativeUrl && (
                      <a href={item.representativeUrl} target="_blank" rel="noreferrer">
                        대표기사 보기
                      </a>
                    )}
                    <button type="button" onClick={() => removeSavedCase(item.savedCaseId)}>저장 취소</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="watchlist-empty mypage-saved-case-empty">
              <span aria-hidden="true">♡</span>
              <h2>아직 저장한 과거 사례가 없습니다.</h2>
              <p>과거사례 시뮬레이터에서 하트를 눌러 관심 사건을 저장해 보세요.</p>
              <a href={ROUTES.CASE_SIMULATOR}>과거사례 시뮬레이터로 이동</a>
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

        <section className="mypage-withdrawal-section" aria-labelledby="mypage-withdrawal-title">
          <div>
            <p>ACCOUNT MANAGEMENT</p>
            <h2 id="mypage-withdrawal-title">회원 탈퇴</h2>
            <span>탈퇴하면 관심기업, 알림 및 저장한 대응자료를 복구할 수 없습니다.</span>
          </div>
          <button type="button" className="mypage-withdrawal-button" onClick={openWithdrawal}>
            회원 탈퇴하기
          </button>
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

      {profileModalStep && (
        <div
          className="mypage-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProfileEditor();
          }}
        >
          <section
            className="mypage-modal mypage-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypage-profile-modal-title"
          >
            {profileModalStep === "verify" ? (
              <form onSubmit={verifyPassword}>
                <p>ACCOUNT SECURITY</p>
                <h2 id="mypage-profile-modal-title">현재 비밀번호 확인</h2>
                <span>개인정보를 수정하려면 현재 비밀번호를 입력해 주세요.</span>
                <label className="mypage-profile-field">
                  현재 비밀번호
                  <input
                    autoComplete="current-password"
                    autoFocus
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    type="password"
                    value={currentPassword}
                  />
                </label>
                {profileError && <p className="mypage-profile-error" role="alert">{profileError}</p>}
                <div className="mypage-modal-actions">
                  <button type="button" onClick={closeProfileEditor} disabled={profileSaving}>취소</button>
                  <button type="submit" className="is-primary" disabled={profileSaving}>
                    {profileSaving ? "확인 중..." : "확인"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={saveProfile}>
                <p>ACCOUNT</p>
                <h2 id="mypage-profile-modal-title">개인정보 수정</h2>
                <span>이름과 이메일을 수정하고, 필요하면 새 비밀번호를 설정하세요.</span>
                <label className="mypage-profile-field">
                  이름
                  <input
                    autoComplete="name"
                    onChange={(event) => setProfileForm((form) => ({ ...form, name: event.target.value }))}
                    required
                    value={profileForm.name}
                  />
                </label>
                <label className="mypage-profile-field">
                  이메일
                  <input
                    autoComplete="email"
                    onChange={(event) => setProfileForm((form) => ({ ...form, email: event.target.value }))}
                    required
                    type="email"
                    value={profileForm.email}
                  />
                </label>
                <div className="mypage-profile-member-type">
                  <span>회원 유형</span>
                  <div>
                    <button
                      className={profileForm.userType === "PERSONAL" ? "is-selected" : ""}
                      onClick={() => {
                        if (profileForm.userType !== "PERSONAL") setPendingUserType("PERSONAL");
                      }}
                      type="button"
                    >
                      개인 회원
                    </button>
                    <button
                      className={profileForm.userType === "COMPANY" ? "is-selected" : ""}
                      onClick={() => {
                        if (profileForm.userType !== "COMPANY") setPendingUserType("COMPANY");
                      }}
                      type="button"
                    >
                      기업 회원
                    </button>
                  </div>
                </div>
                {profileForm.userType === "COMPANY" && (
                  <label className="mypage-profile-field">
                    소속 기업
                    <select
                      disabled={profileCompaniesLoading}
                      onChange={(event) => setProfileForm((form) => ({ ...form, companyId: event.target.value }))}
                      required
                      value={profileForm.companyId}
                    >
                      <option value="">
                        {profileCompaniesLoading ? "기업 목록을 불러오는 중..." : "소속 기업을 선택하세요"}
                      </option>
                      {profileCompanies.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="mypage-profile-field">
                  새 비밀번호 <small>(변경하지 않으면 비워 두세요)</small>
                  <input
                    autoComplete="new-password"
                    minLength="8"
                    onChange={(event) => setProfileForm((form) => ({ ...form, newPassword: event.target.value }))}
                    type="password"
                    value={profileForm.newPassword}
                  />
                </label>
                <label className="mypage-profile-field">
                  새 비밀번호 확인
                  <input
                    autoComplete="new-password"
                    minLength="8"
                    onChange={(event) => setProfileForm((form) => ({ ...form, newPasswordConfirm: event.target.value }))}
                    type="password"
                    value={profileForm.newPasswordConfirm}
                  />
                </label>
                {profileError && <p className="mypage-profile-error" role="alert">{profileError}</p>}
                <div className="mypage-modal-actions">
                  <button type="button" onClick={closeProfileEditor} disabled={profileSaving}>취소</button>
                  <button type="submit" className="is-primary" disabled={profileSaving}>
                    {profileSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {pendingUserType && (
        <div className="mypage-modal-backdrop mypage-confirm-backdrop" role="presentation">
          <section
            className="mypage-modal mypage-member-type-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypage-member-type-title"
          >
            <p>MEMBERSHIP TYPE</p>
            <h2 id="mypage-member-type-title">
              {pendingUserType === "COMPANY" ? "기업 회원으로 변경할까요?" : "개인 회원으로 변경할까요?"}
            </h2>
            <span>
              {pendingUserType === "COMPANY"
                ? "소속 기업을 선택한 뒤 저장하면 기업 회원으로 변경됩니다."
                : "저장하면 소속 기업 정보가 해제되고 개인 회원으로 변경됩니다."}
            </span>
            <div className="mypage-modal-actions">
              <button type="button" onClick={() => setPendingUserType(null)}>취소</button>
              <button
                type="button"
                className="is-primary"
                onClick={() => {
                  setProfileForm((form) => ({
                    ...form,
                    userType: pendingUserType,
                    companyId: pendingUserType === "PERSONAL" ? "" : form.companyId,
                  }));
                  setPendingUserType(null);
                }}
              >
                변경
              </button>
            </div>
          </section>
        </div>
      )}

      {withdrawalOpen && (
        <div
          className="mypage-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWithdrawal();
          }}
        >
          <section
            className="mypage-modal mypage-withdrawal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypage-withdrawal-modal-title"
          >
            <form onSubmit={withdrawAccount}>
              <p>ACCOUNT WITHDRAWAL</p>
              <h2 id="mypage-withdrawal-modal-title">정말 탈퇴하시겠습니까?</h2>
              <span>
                관심기업, 알림 및 저장한 대응자료가 삭제됩니다. 커뮤니티 글과 댓글은 <strong>탈퇴한 사용자</strong>로 표시됩니다.
              </span>
              <label className="mypage-profile-field">
                현재 비밀번호
                <input
                  autoComplete="current-password"
                  autoFocus
                  onChange={(event) => setWithdrawalPassword(event.target.value)}
                  required
                  type="password"
                  value={withdrawalPassword}
                />
              </label>
              {withdrawalError && <p className="mypage-profile-error" role="alert">{withdrawalError}</p>}
              <div className="mypage-modal-actions">
                <button type="button" onClick={closeWithdrawal} disabled={withdrawing}>취소</button>
                <button type="submit" className="is-danger" disabled={withdrawing}>
                  {withdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default MyPage;
