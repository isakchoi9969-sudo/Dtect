import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ROUTES } from "../config/routes";
import "./RiskAnalysisLoginModal.css";

export default function RiskAnalysisLoginModal({ onClose, purpose = "risk" }) {
  const isWatchlist = purpose === "watchlist";
  const dialogRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    loginRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="risk-login-dialog"
      aria-labelledby="risk-login-title"
      aria-describedby="risk-login-description"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="risk-login-dialog-content">
        <button type="button" className="risk-login-dialog-close" aria-label="안내 닫기" onClick={onClose}>×</button>
        <span className="risk-login-dialog-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 3 4.5 6v5.5c0 4.3 3.1 7.7 7.5 9.5 4.4-1.8 7.5-5.2 7.5-9.5V6L12 3Z" />
            <path d="m8.5 12 2.3 2.3 4.7-4.6" />
          </svg>
        </span>
        <h2 id="risk-login-title">{isWatchlist ? <>관심 있는 기업을 저장하고<br />변화를 한눈에 살펴보세요</> : <>로그인하고 기업의<br />위험 신호를 확인해 보세요</>}</h2>
        <p id="risk-login-description">
          {isWatchlist ? <>로그인하시면 관심기업을 저장하고<br />기업별 리스크를 편리하게 확인하실 수 있습니다.</> : <>AI 종합 리스크 분석으로 기업의 위험 지수와<br />주요 이슈를 함께 살펴보실 수 있습니다.</>}
        </p>
        <a ref={loginRef} className="risk-login-dialog-primary" href={ROUTES.LOGIN}>{isWatchlist ? "로그인하고 관심기업 저장하기" : "로그인하고 분석하기"}</a>
        <div className="risk-login-dialog-signup">
          <span>아직 회원이 아니신가요?</span>
          <a href={ROUTES.SIGNUP}>회원가입</a>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
