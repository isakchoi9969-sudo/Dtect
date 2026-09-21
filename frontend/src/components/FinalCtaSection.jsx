import { ROUTES } from "../config/routes";

function FinalCtaSection() {
  return (
    <section className="final-cta-section dtect-final-cta">
      <style>{`
        .dtect-final-cta {
          --cta-bg: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          --cta-glow: rgba(37, 99, 235, 0.06);
          --cta-badge-text: #2563eb;
          --cta-badge-bg: rgba(37, 99, 235, 0.06);
          --cta-badge-border: rgba(37, 99, 235, 0.16);
          --cta-title: #0f172a;
          --cta-highlight: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          --cta-desc: #64748b;
          --cta-btn-bg: #2563eb;
          --cta-btn-bg-hover: #1d4ed8;
          --cta-btn-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.3);
          --cta-btn-shadow-hover: 0 12px 28px -4px rgba(37, 99, 235, 0.4);
        }

        :root[data-theme="dark"] .dtect-final-cta {
          --cta-bg: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          --cta-glow: rgba(59, 130, 246, 0.1);
          --cta-badge-text: #93c5fd;
          --cta-badge-bg: rgba(59, 130, 246, 0.1);
          --cta-badge-border: rgba(59, 130, 246, 0.2);
          --cta-title: #f8fafc;
          --cta-highlight: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%);
          --cta-desc: #94a3b8;
          --cta-btn-bg: #3b82f6;
          --cta-btn-bg-hover: #2563eb;
          --cta-btn-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4);
          --cta-btn-shadow-hover: 0 12px 28px -4px rgba(37, 99, 235, 0.5);
        }

        .dtect-final-cta {
          padding: 88px 24px;
          background: var(--cta-bg);
          position: relative;
          overflow: hidden;
        }

        .dtect-final-cta::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 560px;
          height: 560px;
          background: radial-gradient(circle, var(--cta-glow) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .dtect-final-cta::after {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.3), transparent);
        }

        .dtect-final-cta .final-cta-content {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
        }

        .dtect-final-cta .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          color: var(--cta-badge-text);
          background: var(--cta-badge-bg);
          border: 1px solid var(--cta-badge-border);
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 20px;
        }

        .dtect-final-cta .cta-badge::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .dtect-final-cta .cta-title {
          font-size: clamp(1.85rem, 4.2vw, 2.6rem);
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.03em;
          color: var(--cta-title);
          margin: 0 0 14px;
        }

        .dtect-final-cta .cta-highlight {
          background: var(--cta-highlight);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dtect-final-cta .cta-description {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--cta-desc);
          margin: 0 auto 28px;
          max-width: 420px;
        }

        .dtect-final-cta .cta-actions {
          display: flex;
          justify-content: center;
        }

        .dtect-final-cta .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--cta-btn-bg);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          padding: 13px 24px;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: var(--cta-btn-shadow);
          transition: all 0.22s ease;
        }

        .dtect-final-cta .primary-button:hover {
          background: var(--cta-btn-bg-hover);
          transform: translateY(-1px);
          box-shadow: var(--cta-btn-shadow-hover);
        }

        .dtect-final-cta .button-arrow {
          display: inline-block;
          transition: transform 0.22s ease;
        }

        .dtect-final-cta .primary-button:hover .button-arrow {
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .dtect-final-cta {
            padding: 64px 20px;
          }

          .dtect-final-cta .cta-description {
            font-size: 0.9rem;
            margin-bottom: 24px;
          }

          .dtect-final-cta .primary-button {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }
        }
      `}</style>

      <div className="container">
        <div className="final-cta-content">
          <span className="cta-badge">START WITH D:TECT</span>

          <h2 className="cta-title">
            더 높은 수준의
            <br />
            <span className="cta-highlight">인텔리전스</span>를
          </h2>

          <p className="cta-description">
            지금 바로 관심 기업을 등록하고,
            <br className="hidden sm:block" />
            AI가 분석한 기업 동향과 리스크 리포트를 확인해 보세요.
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
