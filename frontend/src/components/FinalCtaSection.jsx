import { ROUTES } from "../config/routes";

function FinalCtaSection() {
  return (
    <section className="final-cta-section">
      <style>{`
        .final-cta-section {
          padding: 120px 0;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          position: relative;
          overflow: hidden;
        }

        .final-cta-section::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .final-cta-section .final-cta-content {
          position: relative;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .final-cta-section .cta-badge {
          display: inline-block;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #93c5fd;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 28px;
        }

        .final-cta-section .cta-title {
          font-size: clamp(2.25rem, 5vw, 3.25rem);
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.03em;
          color: #f8fafc;
          margin: 0 0 24px;
        }

        .final-cta-section .cta-highlight {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .final-cta-section .cta-description {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #94a3b8;
          margin: 0 auto 40px;
          max-width: 520px;
        }

        .final-cta-section .cta-actions {
          display: flex;
          justify-content: center;
        }

        .final-cta-section .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          font-size: 1.0625rem;
          font-weight: 600;
          padding: 16px 32px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 12px 24px -8px rgba(37, 99, 235, 0.5);
          transition: all 0.3s ease;
        }

        .final-cta-section .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px rgba(37, 99, 235, 0.6);
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
        }

        .final-cta-section .button-arrow {
          transition: transform 0.3s ease;
        }

        .final-cta-section .primary-button:hover .button-arrow {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .final-cta-section {
            padding: 80px 0;
          }

          .final-cta-section .primary-button {
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
