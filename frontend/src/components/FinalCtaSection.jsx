import { ROUTES } from "../config/routes";

function FinalCtaSection() {
  return (
    <section className="final-cta-section dtect-final-cta">
      <style>{`
        .dtect-final-cta {
          --bg: #f8fafc;
          --card-bg: rgba(255, 255, 255, 0.82);
          --card-border: rgba(148, 163, 184, 0.22);
          --title: #0f172a;
          --text: #64748b;
          --blue: #2563eb;
          --blue-dark: #1d4ed8;
          --blue-soft: rgba(37, 99, 235, 0.08);
          --line: rgba(37, 99, 235, 0.12);

          position: relative;
          padding: 72px 24px;
          background: var(--bg);
          overflow: hidden;
        }

        /* 배경 빛 */
        .dtect-final-cta::before {
          content: "";
          position: absolute;
          width: 520px;
          height: 260px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            ellipse,
            rgba(37, 99, 235, 0.09) 0%,
            rgba(37, 99, 235, 0.035) 35%,
            transparent 72%
          );
          pointer-events: none;
          animation: ctaGlow 8s ease-in-out infinite;
        }

        /* 상단 포인트 라인 */
        .dtect-final-cta::after {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 72px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(37, 99, 235, 0.55),
            transparent
          );
          animation: ctaLinePulse 2.8s ease-in-out infinite;
        }

        .dtect-final-cta .container {
          position: relative;
          z-index: 1;
        }

        .dtect-final-cta .final-cta-content {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 40px;
          text-align: center;

          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          overflow: hidden;
          animation: ctaCardIn 720ms cubic-bezier(0.22, 1, 0.36, 1) both, ctaCardFloat 7s ease-in-out 1s infinite;
        }

        .dtect-final-cta .final-cta-content::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -54px;
          width: 150px;
          height: 150px;
          border: 1px solid rgba(37, 99, 235, 0.14);
          border-radius: 50%;
          box-shadow: 0 0 0 16px rgba(37, 99, 235, 0.035), 0 0 0 34px rgba(37, 99, 235, 0.018);
          pointer-events: none;
          animation: ctaOrbit 9s linear infinite;
        }

        .dtect-final-cta .final-cta-content::after {
          content: "";
          position: absolute;
          top: -25%;
          bottom: -25%;
          left: -35%;
          width: 18%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
          pointer-events: none;
          transform: skewX(-18deg);
          animation: ctaShine 5.5s ease-in-out 1.2s infinite;
        }

        .dtect-final-cta .final-cta-content > * {
          position: relative;
          z-index: 1;
        }

        /* 작은 라벨 */
        .dtect-final-cta .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 6px 11px;
          margin-bottom: 18px;

          border: 1px solid var(--line);
          border-radius: 999px;

          background: var(--blue-soft);
          color: var(--blue);

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .dtect-final-cta .cta-badge::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
          animation: ctaDotPulse 1.9s ease-in-out infinite;
        }

        /* 제목 */
        .dtect-final-cta .cta-title {
          margin: 0;

          color: var(--title);
          font-size: clamp(2rem, 4vw, 2.7rem);
          font-weight: 750;
          line-height: 1.2;
          letter-spacing: -0.045em;
        }

        .dtect-final-cta .cta-highlight {
          background: linear-gradient(
            135deg,
            #2563eb 0%,
            #4f46e5 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 180% 100%;
          animation: ctaTextShimmer 4.5s ease-in-out infinite;
        }

        /* 설명 */
        .dtect-final-cta .cta-description {
          margin: 16px auto 26px;
          max-width: 490px;

          color: var(--text);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.7;
          letter-spacing: -0.01em;
        }

        /* 버튼 */
        .dtect-final-cta .cta-actions {
          display: flex;
          justify-content: center;
        }

        .dtect-final-cta .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          min-width: 156px;
          padding: 12px 18px;

          border-radius: 10px;
          border: 1px solid rgba(37, 99, 235, 0.2);

          background: var(--blue);
          color: #ffffff;

          font-size: 13px;
          font-weight: 650;
          letter-spacing: -0.01em;
          text-decoration: none;

          box-shadow:
            0 6px 18px rgba(37, 99, 235, 0.22);

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .dtect-final-cta .primary-button:hover {
          background: var(--blue-dark);
          transform: translateY(-2px);

          box-shadow:
            0 10px 24px rgba(37, 99, 235, 0.3);
        }

        .dtect-final-cta .button-arrow {
          font-size: 15px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .dtect-final-cta .primary-button:hover .button-arrow {
          transform: translateX(3px);
        }

        .dtect-final-cta .primary-button:focus-visible {
          outline: 3px solid color-mix(in srgb, var(--blue) 35%, transparent);
          outline-offset: 4px;
        }

        @keyframes ctaCardIn {
          from { opacity: 0; transform: translateY(18px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes ctaCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes ctaGlow {
          0%, 100% { opacity: .62; transform: translate(-50%, -50%) scale(.94); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes ctaLinePulse {
          0%, 100% { opacity: .45; width: 72px; }
          50% { opacity: .9; width: 108px; }
        }

        @keyframes ctaDotPulse {
          0%, 100% { transform: scale(.8); opacity: .6; }
          50% { transform: scale(1.25); opacity: 1; }
        }

        @keyframes ctaTextShimmer {
          0%, 70%, 100% { background-position: 0% 50%; }
          84% { background-position: 100% 50%; }
        }

        @keyframes ctaOrbit {
          from { transform: rotate(0deg) translateX(3px); }
          to { transform: rotate(360deg) translateX(3px); }
        }

        @keyframes ctaShine {
          0%, 45% { left: -35%; opacity: 0; }
          55% { opacity: 1; }
          80%, 100% { left: 135%; opacity: 0; }
        }

        /* =========================
           DARK MODE
        ========================= */

        :root[data-theme="dark"] .dtect-final-cta {
          --bg: #0b1120;
          --card-bg: rgba(15, 23, 42, 0.72);
          --card-border: rgba(148, 163, 184, 0.14);
          --title: #f8fafc;
          --text: #94a3b8;
          --blue: #60a5fa;
          --blue-dark: #3b82f6;
          --blue-soft: rgba(59, 130, 246, 0.1);
          --line: rgba(96, 165, 250, 0.18);
        }

        :root[data-theme="dark"] .dtect-final-cta::before {
          background: radial-gradient(
            ellipse,
            rgba(59, 130, 246, 0.13) 0%,
            rgba(59, 130, 246, 0.045) 38%,
            transparent 72%
          );
        }

        :root[data-theme="dark"] .dtect-final-cta .final-cta-content {
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        :root[data-theme="dark"] .dtect-final-cta .cta-highlight {
          background: linear-gradient(
            135deg,
            #60a5fa 0%,
            #818cf8 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 640px) {
          .dtect-final-cta {
            padding: 48px 16px;
          }

          .dtect-final-cta .final-cta-content {
            padding: 36px 22px;
            border-radius: 20px;
          }

          .dtect-final-cta .cta-badge {
            margin-bottom: 15px;
            font-size: 9px;
          }

          .dtect-final-cta .cta-title {
            font-size: 1.85rem;
          }

          .dtect-final-cta .cta-description {
            margin-top: 13px;
            margin-bottom: 22px;
            font-size: 13px;
          }

          .dtect-final-cta .primary-button {
            width: 100%;
            max-width: 230px;
            padding: 13px 18px;
          }
        }
      `}</style>

      <div className="container">
        <div className="final-cta-content">
          <span className="cta-badge">START WITH D:TECT</span>

          <h2 className="cta-title">
            더 나은 판단을 위한
            <br />
            <span className="cta-highlight">기업 인텔리전스</span>
          </h2>

          <p className="cta-description">
            관심 기업을 등록하고 주요 이슈와 리스크를 한눈에 확인하세요.
            <br />
            D:TECT가 복잡한 기업 데이터를 빠르게 정리합니다.
          </p>

          <div className="cta-actions">
            <a href={ROUTES.SIGNUP} className="primary-button">
              무료 체험 시작하기
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
