import { ROUTES } from "../config/routes";

function FinalCtaSection() {
  return (
    <section className="final-cta-section dtect-final-cta">
      <style>{`
        .dtect-final-cta {
          --cta-bg: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          --cta-glow: rgba(37, 99, 235, 0.08);
          --cta-badge-text: #2563eb;
          --cta-badge-bg: rgba(37, 99, 235, 0.08);
          --cta-badge-border: rgba(37, 99, 235, 0.2);
          --cta-title: #0f172a;
          --cta-highlight: linear-gradient(135deg, #2563eb, #7c3aed);
          --cta-desc: #64748b;
          --cta-btn-bg: linear-gradient(135deg, #3b82f6, #2563eb);
          --cta-btn-bg-hover: linear-gradient(135deg, #60a5fa, #3b82f6);
          --cta-btn-shadow: rgba(37, 99, 235, 0.35);
          --cta-btn-shadow-hover: rgba(37, 99, 235, 0.45);
        }

        :root[data-theme="dark"] .dtect-final-cta {
          --cta-bg: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          --cta-glow: rgba(59, 130, 246, 0.15);
          --cta-badge-text: #93c5fd;
          --cta-badge-bg: rgba(59, 130, 246, 0.12);
          --cta-badge-border: rgba(59, 130, 246, 0.25);
          --cta-title: #f8fafc;
          --cta-highlight: linear-gradient(135deg, #60a5fa, #a78bfa);
          --cta-desc: #94a3b8;
          --cta-btn-bg: linear-gradient(135deg, #3b82f6, #2563eb);
          --cta-btn-bg-hover: linear-gradient(135deg, #60a5fa, #3b82f6);
          --cta-btn-shadow: rgba(37, 99, 235, 0.5);
          --cta-btn-shadow-hover: rgba(37, 99, 235, 0.6);
        }

        .dtect-final-cta {
          padding: 120px 0;
          background: var(--cta-bg);
          position: relative;
          overflow: hidden;
        }

        .dtect-final-cta::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, var(--cta-glow) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .dtect-final-cta .final-cta-content {
          position: relative;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .dtect-final-cta .cta-badge {
          display: inline-block;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--cta-badge-text);
          background: var(--cta-badge-bg);
          border: 1px solid var(--cta-badge-border);
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 28px;
        }

        .dtect-final-cta .cta-title {
          font-size: clamp(2.25rem, 5vw, 3.25rem);
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.03em;
          color: var(--cta-title);
          margin: 0 0 24px;
        }

        .dtect-final-cta .cta-highlight {
          background: var(--cta-highlight);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dtect-final-cta .cta-description {
          font-size: 1.125rem;
          line-height: 1.7;
          color: var(--cta-desc);
          margin: 0 auto 40px;
          max-width: 520px;
        }

        .dtect-final-cta .cta-actions {
          display: flex;
          justify-content: center;
        }

        .dtect-final-cta .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--cta-btn-bg);
          color: white;
          font-size: 1.0625rem;
          font-weight: 600;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 12px 24px -8px var(--cta-btn-shadow);
          transition: all 0.3s ease;
        }

        .dtect-final-cta .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px var(--cta-btn-shadow-hover);
          background: var(--cta-btn-bg-hover);
        }

        .dtect-final-cta .button-arrow {
          transition: transform 0.3s ease;
        }

        .dtect-final-cta .primary-button:hover .button-arrow {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .dtect-final-cta {
            padding: 80px 0;
          }

          .dtect-final-cta .primary-button {
            width: 100%;
            justify-content: center;
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
            지금 바로 관심 기업을 등록하고, AI가 분석한 기업 동향과 리스크
            리포트를 확인해 보세요.
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
