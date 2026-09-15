import { useState } from "react";
import { ROUTES } from "../config/routes";

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="D:TECT 소개">
        <a className="auth-logo" href={ROUTES.HOME}>D:TECT</a>
        <div className="auth-intro-copy">
          <span>AI RISK INTELLIGENCE</span>
          <h1>기업의 신호를 먼저 읽고,<br />더 나은 판단을 만드세요.</h1>
          <p>흩어진 시장의 목소리를 분석해, 놓치기 쉬운 리스크를 알려드립니다.</p>
        </div>
        <p className="auth-copyright">© 2026 D:TECT. All rights reserved.</p>
      </section>
      <section className="auth-form-section">
        <div className="auth-form-wrap">
          <a className="auth-mobile-logo" href={ROUTES.HOME}>D:TECT</a>
          <div className="auth-heading">
            <span>{isSignup ? "GET STARTED" : "WELCOME BACK"}</span>
            <h2>{isSignup ? "회원가입" : "로그인"}</h2>
            <p>{isSignup ? "D:TECT와 함께 기업 리스크를 관리해 보세요." : "D:TECT 계정으로 안전하게 로그인하세요."}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && <label>이름<input type="text" name="name" placeholder="이름을 입력하세요" autoComplete="name" required /></label>}
            {isSignup && <label>소속 기업<input type="text" name="company" placeholder="예: 삼성전자" autoComplete="organization" required /></label>}
            <label>이메일<input type="email" name="email" placeholder="name@company.com" autoComplete="email" required /></label>
            <label>비밀번호<span className="password-field"><input type={showPassword ? "text" : "password"} name="password" placeholder={isSignup ? "8자 이상 입력하세요" : "비밀번호를 입력하세요"} autoComplete={isSignup ? "new-password" : "current-password"} minLength="8" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? "숨김" : "보기"}</button></span></label>
            {isSignup && <label>비밀번호 확인<input type="password" name="passwordConfirm" placeholder="비밀번호를 다시 입력하세요" autoComplete="new-password" minLength="8" required /></label>}
            {!isSignup && <div className="auth-options"><label className="remember-me"><input type="checkbox" /> 로그인 상태 유지</label><a href="#password-help">비밀번호를 잊으셨나요?</a></div>}
            {isSignup && <label className="auth-agreement"><input type="checkbox" required /> <span><a href="#terms">이용약관</a> 및 <a href="#privacy">개인정보 처리방침</a>에 동의합니다.</span></label>}
            <button className="auth-submit" type="submit">{isSignup ? "무료로 시작하기" : "로그인"}</button>
            {submitted && <p className="auth-notice" role="status">{isSignup ? "회원가입 요청이 준비되었습니다. 백엔드 연결 후 계정이 생성됩니다." : "로그인 요청이 준비되었습니다. 백엔드 연결 후 이용할 수 있습니다."}</p>}
          </form>
          <p className="auth-switch">{isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}<a href={isSignup ? ROUTES.LOGIN : ROUTES.SIGNUP}>{isSignup ? " 로그인" : " 회원가입"}</a></p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
