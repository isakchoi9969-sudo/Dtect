import { useEffect, useState } from "react";
import { ROUTES } from "../config/routes";
// 🔧 변경 1: axios 를 직접 쓰지 않고 config/api.js 의 공용 인스턴스를 쓴다.
//    - baseURL 이 한 곳(api.js)에만 있으므로 포트가 바뀌어도 여기는 안 건드려도 된다.
//    - "http://localhost:3000" 하드코딩이 파일마다 흩어지는 걸 막는다.
import { api } from "../config/api";

function extractErrorMessage(error) {
  const message = error.response?.data?.message;
  const detail = error.response?.data?.detail;

  if (typeof message === "string") {
    return message;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return `입력값을 확인해주세요. (${detail[0].msg})`;
  }

  return "서버 통신 중 오류가 발생했습니다.";
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState("PERSONAL");
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("NONE");
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(isSignup);
  const [companiesError, setCompaniesError] = useState("");

  useEffect(() => {
    if (!isSignup) return undefined;

    const controller = new AbortController();

    async function loadCompanies() {
      try {
        setIsCompaniesLoading(true);
        setCompaniesError("");
        const response = await api.get("/api/company", {
          signal: controller.signal,
        });
        setCompanies(response.data?.data || []);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("회사 목록 조회 실패:", error);
          setCompaniesError(
            "회사 목록을 불러오지 못했습니다. '없음'은 선택할 수 있습니다.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsCompaniesLoading(false);
      }
    }

    loadCompanies();
    return () => controller.abort();
  }, [isSignup]);

  // 🔌 백엔드로 데이터 전송 로직 ----------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 폼 안에 입력된 데이터들을 객체 형태로 추출
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isSignup) {
        // 1️⃣ 회원가입 요청
        // 🔧 변경 3: axios.post("http://localhost:3000/...") → api.post("/...")
        //    baseURL 은 api.js 가 이미 붙여주므로 경로만 적으면 된다.
        const response = await api.post("/api/auth/signup", data);
        alert(response.data.message || "회원가입이 완료되었습니다!");
        window.location.href = ROUTES.LOGIN; // 로그인 페이지로 이동
      } else {
        // 2️⃣ 로그인 요청
        const response = await api.post("/api/auth/login", {
          email: data.email,
          password: data.password,
        });
        alert(response.data.message || "로그인 성공!");
        localStorage.setItem("isLoggedIn", "true");

        window.location.href = ROUTES.DASHBOARD; // 대시보드로 이동
      }
    } catch (error) {
      console.error("인증 실패:", error);
      alert(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <style>{`
        .auth-page .auth-intro {
          position: relative;
          display: flex;
          min-height: 100%;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: clamp(28px, 4vw, 52px);
          background:
            radial-gradient(circle at 15% 18%, rgba(96, 165, 250, 0.2), transparent 30%),
            linear-gradient(145deg, #0b1120 0%, #111c35 54%, #172554 100%);
          color: #f8fafc;
          isolation: isolate;
        }

        .auth-page .auth-intro::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: 25%;
          right: -120px;
          width: 360px;
          height: 360px;
          border: 1px solid rgba(147, 197, 253, 0.16);
          border-radius: 50%;
          box-shadow: 0 0 0 34px rgba(147, 197, 253, 0.035), 0 0 0 68px rgba(147, 197, 253, 0.025);
          transform: translateY(-50%);
        }

        .auth-page .auth-intro::after {
          content: "";
          position: absolute;
          z-index: -1;
          right: 12%;
          bottom: 12%;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.16);
          filter: blur(42px);
          pointer-events: none;
        }

        .auth-page .auth-logo {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 9px;
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.04em;
          text-decoration: none;
        }

        .auth-page .auth-logo::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 0 5px rgba(96, 165, 250, 0.12), 0 0 18px rgba(96, 165, 250, 0.7);
        }

        .auth-page .auth-intro-copy {
          max-width: 430px;
          margin: auto 0;
          padding: clamp(44px, 7vw, 92px) 0;
        }

        .auth-page .auth-intro-copy > span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #93c5fd;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.16em;
        }

        .auth-page .auth-intro-copy > span::before {
          content: "";
          width: 22px;
          height: 1px;
          background: currentColor;
          opacity: 0.7;
        }

        .auth-page .auth-intro-copy h1 {
          margin: 18px 0 17px;
          color: #f8fafc;
          font-size: clamp(2rem, 4vw, 3.3rem);
          font-weight: 720;
          line-height: 1.16;
          letter-spacing: -0.07em;
          word-break: keep-all;
        }

        .auth-page .auth-intro-copy p {
          max-width: 340px;
          margin: 0;
          color: #a8b5cb;
          font-size: 13px;
          line-height: 1.75;
          word-break: keep-all;
        }

        .auth-page .auth-signal {
          display: flex;
          width: min(100%, 360px);
          align-items: end;
          gap: 5px;
          margin-top: 34px;
          padding-top: 15px;
          border-top: 1px solid rgba(148, 163, 184, 0.18);
        }

        .auth-page .auth-signal-bar {
          width: 8px;
          height: var(--signal-height);
          border-radius: 3px 3px 1px 1px;
          background: linear-gradient(180deg, #93c5fd, rgba(59, 130, 246, 0.18));
          opacity: 0.8;
          animation: authSignalIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--signal-index) * 65ms);
        }

        .auth-page .auth-signal-caption {
          margin-left: 10px;
          color: #7f91ad;
          font-size: 10px;
          letter-spacing: 0.06em;
        }

        .auth-page .auth-copyright {
          margin: 0;
          color: #71819b;
          font-size: 10px;
          letter-spacing: 0.03em;
        }

        @keyframes authSignalIn {
          from { opacity: 0; transform: scaleY(0.25); transform-origin: bottom; }
          to { opacity: 0.8; transform: scaleY(1); transform-origin: bottom; }
        }

        @media (max-width: 760px) {
          .auth-page .auth-intro {
            min-height: 280px;
            padding: 28px 24px;
          }
          .auth-page .auth-intro-copy { padding: 42px 0 28px; }
          .auth-page .auth-intro-copy h1 { font-size: clamp(2rem, 9vw, 2.7rem); }
          .auth-page .auth-signal { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-page .auth-signal-bar { animation: none; }
        }
      `}</style>

      <section className="auth-intro" aria-label="D:TECT 소개">
        <a className="auth-logo" href={ROUTES.HOME}>
          D:TECT
        </a>
        <div className="auth-intro-copy">
          <span>AI RISK INTELLIGENCE</span>
          <h1>
            기업의 신호를 먼저 읽고,
            <br />더 나은 판단을 만드세요.
          </h1>
          <p>
            흩어진 시장의 목소리를 분석해, 놓치기 쉬운 리스크를 알려드립니다.
          </p>
          <div className="auth-signal" aria-hidden="true">
            {[34, 52, 42, 68, 56, 82, 64, 92, 74].map((height, index) => (
              <span
                className="auth-signal-bar"
                key={index}
                style={{
                  "--signal-height": `${height}%`,
                  "--signal-index": index,
                }}
              />
            ))}
            <span className="auth-signal-caption">SIGNALS IN VIEW</span>
          </div>
        </div>
        <p className="auth-copyright">© 2026 D:TECT. All rights reserved.</p>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrap">
          <a className="auth-mobile-logo" href={ROUTES.HOME}>
            D:TECT
          </a>
          <div className="auth-heading">
            <span>{isSignup ? "GET STARTED" : "WELCOME BACK"}</span>
            <h2>{isSignup ? "회원가입" : "로그인"}</h2>
            <p>
              {isSignup
                ? "D:TECT와 함께 기업 리스크를 관리해 보세요."
                : "D:TECT 계정으로 안전하게 로그인하세요."}
            </p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                이름
                <input
                  type="text"
                  name="name"
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            {isSignup && (
              <fieldset className="member-type-field">
                <legend>회원 유형</legend>
                <div className="member-type-options">
                  <label>
                    <input
                      type="radio"
                      name="userType"
                      value="PERSONAL"
                      checked={userType === "PERSONAL"}
                      onChange={() => setUserType("PERSONAL")}
                    />
                    <span>
                      <strong>일반회원</strong>
                      <small>개인 사용자를 위한 기본 회원가입</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="userType"
                      value="COMPANY"
                      checked={userType === "COMPANY"}
                      onChange={() => setUserType("COMPANY")}
                    />
                    <span>
                      <strong>기업회원</strong>
                      <small>등록된 회사와 계정을 연결</small>
                    </span>
                  </label>
                </div>
              </fieldset>
            )}
            {isSignup && userType === "COMPANY" && (
              <label>
                소속 기업
                <select
                  name="companyId"
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                  disabled={isCompaniesLoading}
                >
                  <option value="NONE">없음 (등록된 회사가 아닌 경우)</option>
                  {companies.map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                <small className="company-field-help">
                  {isCompaniesLoading
                    ? "등록된 회사 목록을 불러오는 중입니다."
                    : companiesError ||
                      `등록된 회사 ${companies.length}개를 불러왔습니다.`}
                </small>
              </label>
            )}
            <label>
              이메일
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              비밀번호
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    isSignup ? "8자 이상 입력하세요" : "비밀번호를 입력하세요"
                  }
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                >
                  {showPassword ? "숨김" : "보기"}
                </button>
              </span>
            </label>
            {isSignup && (
              <label>
                비밀번호 확인
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </label>
            )}
            {!isSignup && (
              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" /> 로그인 상태 유지
                </label>
                <a href="#password-help">비밀번호를 잊으셨나요?</a>
              </div>
            )}
            {isSignup && (
              <label className="auth-agreement">
                <input type="checkbox" required />{" "}
                <span>
                  <a href="#terms">이용약관</a> 및{" "}
                  <a href="#privacy">개인정보 처리방침</a>에 동의합니다.
                </span>
              </label>
            )}
            <button
              className="auth-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "처리 중..."
                : isSignup
                  ? "무료로 시작하기"
                  : "로그인"}
            </button>
          </form>
          <p className="auth-switch">
            {isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}
            <a href={isSignup ? ROUTES.LOGIN : ROUTES.SIGNUP}>
              {isSignup ? " 로그인" : " 회원가입"}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
