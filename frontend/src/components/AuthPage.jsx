import { useState } from "react";
import { ROUTES } from "../config/routes";
// 🔧 변경 1: axios 를 직접 쓰지 않고 config/api.js 의 공용 인스턴스를 쓴다.
//    - baseURL 이 한 곳(api.js)에만 있으므로 포트가 바뀌어도 여기는 안 건드려도 된다.
//    - "http://localhost:5000" 하드코딩이 파일마다 흩어지는 걸 막는다.
import { api } from "../config/api";

// 🔧 변경 2: FastAPI 에러 응답을 안전하게 문자열로 뽑아내는 헬퍼.
//
//   FastAPI 에러는 두 가지 모양으로 온다.
//   ① 우리가 직접 raise HTTPException(detail="비밀번호가 일치하지 않습니다.")
//      → { detail: "비밀번호가 일치하지 않습니다." }              (문자열)
//   ② Pydantic 자동 검증 실패 (예: 이메일 형식 오류, 비밀번호 8자 미만)
//      → { detail: [{ loc: [...], msg: "...", type: "..." }] }   (배열)
//
//   기존 코드처럼 error.response?.data?.message 로 읽으면 항상 undefined 다.
//   Express 는 message 필드를 썼지만 FastAPI 는 detail 필드를 쓰기 때문이다.
function extractErrorMessage(error) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    // ① HTTPException 케이스: 그대로 사용자에게 보여줄 수 있는 문장
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    // ② Pydantic 검증 실패 케이스: 첫 번째 오류만 한글 문구로 변환해서 보여준다.
    //    예: "email" 필드가 이메일 형식이 아니면 detail[0].msg 에 원인이 들어있다.
    return `입력값을 확인해주세요. (${detail[0].msg})`;
  }

  return "서버 통신 중 오류가 발생했습니다.";
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 🔌 백엔드로 데이터 전송 로직 ----------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    // 폼 안에 입력된 데이터들을 객체 형태로 추출
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isSignup) {
        // 1️⃣ 회원가입 요청
        // 🔧 변경 3: axios.post("http://localhost:5000/...") → api.post("/...")
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
        window.location.href = ROUTES.DASHBOARD; // 대시보드로 이동
      }
    } catch (error) {
      console.error("인증 실패:", error);
      // 🔧 변경 4: message 대신 detail 을 읽는 헬퍼로 교체
      alert(extractErrorMessage(error));
    }
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
