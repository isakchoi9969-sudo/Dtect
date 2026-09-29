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
  const { companies, loading: favoritesLoading, error: favoritesError } =
    useWatchlist();

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

  const openAnalysis = (companyId) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${companyId}`,
    );
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
              <span className="watchlist-loading-dot" aria-hidden="true" />
              내 정보를 불러오는 중입니다.
            </div>
          ) : userError ? (
            <p className="watchlist-error" role="alert">{userError}</p>
          ) : (
            <dl className="mypage-profile-grid">
              <div><dt>이름</dt><dd>{user?.name || "-"}</dd></div>
              <div><dt>아이디</dt><dd>{user?.loginId || "-"}</dd></div>
              <div><dt>이메일</dt><dd>{user?.email || "-"}</dd></div>
              <div><dt>회원 유형</dt><dd>{userTypeLabels[user?.userType] || user?.userType || "-"}</dd></div>
              <div><dt>가입일</dt><dd>{formatDate(user?.createdAt)}</dd></div>
            </dl>
          )}
        </section>

        <section className="mypage-section" aria-labelledby="mypage-favorites-title">
          <div className="mypage-section-heading">
            <p>WATCHLIST</p>
            <h2 id="mypage-favorites-title">관심 기업</h2>
          </div>

          {favoritesError && <p className="watchlist-error" role="alert">{favoritesError}</p>}

          {favoritesLoading ? (
            <div className="watchlist-loading" role="status" aria-live="polite">
              <span className="watchlist-loading-dot" aria-hidden="true" />
              관심기업을 불러오는 중입니다.
            </div>
          ) : companies.length > 0 ? (
            <div className="mypage-company-grid">
              {companies.map((company) => (
                <article className="mypage-company-card" key={company.companyId}>
                  <div className="mypage-company-card-header">
                    <span className="mypage-company-logo">
                      <CompanyLogo companyName={company.companyName} size={34} visualOffset={{ x: 6, y: 8 }} />
                    </span>
                    <div>
                      <strong>{company.companyName}</strong>
                      <span>{company.industry || "업종 정보 없음"}</span>
                    </div>
                  </div>
                  <dl className="mypage-company-details">
                    <div><dt>CEO</dt><dd>{company.ceoName || "-"}</dd></div>
                    <div><dt>종목코드</dt><dd>{company.stockCode || "-"}</dd></div>
                  </dl>
                  <button type="button" className="mypage-analysis-button" onClick={() => openAnalysis(company.companyId)}>기업 분석 보기</button>
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
      </main>
    </>
  );
}

export default MyPage;
