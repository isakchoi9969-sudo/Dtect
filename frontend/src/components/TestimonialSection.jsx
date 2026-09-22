import { testimonials } from "../data/landingData";

function TestimonialSection() {
  return (
    <section
      className="section dtect-testimonial"
      aria-labelledby="testimonial-title"
    >
      <style>{`
        .dtect-testimonial {
          --ts-bg: #f8fafc;
          --ts-surface: rgba(255, 255, 255, 0.9);
          --ts-border: rgba(148, 163, 184, 0.22);
          --ts-title: #0f172a;
          --ts-muted: #64748b;
          --ts-accent: #2563eb;
          --ts-accent-soft: #eff6ff;
          --ts-divider: #e9eef5;
          --ts-avatar: #0f172a;
          position: relative;
          padding: clamp(76px, 10vw, 112px) 0;
          overflow: hidden;
          background: var(--ts-bg);
          isolation: isolate;
        }

        .dtect-testimonial::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: 0;
          left: 50%;
          width: min(760px, 90vw);
          height: 260px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(37, 99, 235, 0.065), transparent 70%);
          pointer-events: none;
        }

        :root[data-theme="dark"] .dtect-testimonial {
          --ts-bg: #0b1120;
          --ts-surface: rgba(15, 23, 42, 0.8);
          --ts-border: rgba(148, 163, 184, 0.16);
          --ts-title: #f8fafc;
          --ts-muted: #94a3b8;
          --ts-accent: #60a5fa;
          --ts-accent-soft: rgba(59, 130, 246, 0.13);
          --ts-divider: #243047;
          --ts-avatar: #1e3a5f;
        }

        .dtect-testimonial .container {
          width: min(100% - 40px, 1040px);
          margin: 0 auto;
        }

        .dtect-testimonial .testimonial-heading {
          max-width: 570px;
          margin: 0 auto clamp(34px, 5vw, 48px);
          text-align: center;
        }

        .dtect-testimonial .testimonial-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 15px;
          color: var(--ts-accent);
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.14em;
        }

        .dtect-testimonial .testimonial-eyebrow::before,
        .dtect-testimonial .testimonial-eyebrow::after {
          content: "";
          width: 18px;
          height: 1px;
          background: currentColor;
          opacity: 0.5;
        }

        .dtect-testimonial .testimonial-title {
          margin: 0;
          color: var(--ts-title);
          font-size: clamp(2rem, 4.5vw, 2.75rem);
          font-weight: 750;
          line-height: 1.18;
          letter-spacing: -0.065em;
        }

        .dtect-testimonial .testimonial-title strong {
          color: var(--ts-accent);
          font-weight: inherit;
        }

        .dtect-testimonial .testimonial-intro {
          margin: 15px auto 0;
          color: var(--ts-muted);
          font-size: 13px;
          line-height: 1.7;
          word-break: keep-all;
        }

        .dtect-testimonial .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          justify-content: center;
          gap: 14px;
        }

        .dtect-testimonial .testimonial-grid:has(> :only-child) {
          grid-template-columns: minmax(0, 680px);
        }

        .dtect-testimonial .testimonial-card {
          position: relative;
          display: flex;
          min-height: 258px;
          flex-direction: column;
          padding: 22px 24px 20px;
          overflow: hidden;
          border: 1px solid var(--ts-border);
          border-radius: 16px;
          background: var(--ts-surface);
          box-shadow: 0 16px 38px -32px rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: testimonialCardIn 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--testimonial-index) * 90ms);
          transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
        }

        .dtect-testimonial .testimonial-card::before {
          content: "";
          position: absolute;
          top: 0;
          right: 24px;
          left: 24px;
          height: 2px;
          background: linear-gradient(90deg, var(--ts-accent), transparent);
          opacity: 0.75;
        }

        .dtect-testimonial .testimonial-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--ts-accent) 30%, transparent);
          box-shadow: 0 24px 44px -32px rgba(37, 99, 235, 0.45);
        }

        .dtect-testimonial .testimonial-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }

        .dtect-testimonial .testimonial-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border-radius: 7px;
          background: var(--ts-accent-soft);
          color: var(--ts-accent);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.04em;
        }

        .dtect-testimonial .testimonial-label::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .dtect-testimonial .testimonial-index {
          color: var(--ts-muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          opacity: 0.6;
        }

        .dtect-testimonial blockquote {
          flex: 1;
          margin: 0;
          color: var(--ts-title);
          font-size: clamp(17px, 2vw, 20px);
          font-weight: 650;
          line-height: 1.55;
          letter-spacing: -0.035em;
          word-break: keep-all;
        }

        .dtect-testimonial .quote-mark {
          display: block;
          height: 14px;
          color: var(--ts-accent);
          font-family: Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          line-height: 0.7;
          opacity: 0.55;
        }

        .dtect-testimonial .testimonial-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 22px;
          padding-top: 15px;
          border-top: 1px solid var(--ts-divider);
        }

        .dtect-testimonial .testimonial-avatar {
          display: grid;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          place-items: center;
          border-radius: 9px;
          background: var(--ts-avatar);
          color: #fff;
          font-size: 12px;
          font-weight: 750;
        }

        .dtect-testimonial .testimonial-name {
          display: block;
          color: var(--ts-title);
          font-size: 12px;
          font-weight: 700;
        }

        .dtect-testimonial .testimonial-role {
          display: block;
          margin-top: 3px;
          color: var(--ts-muted);
          font-size: 10px;
        }

        @keyframes testimonialCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .dtect-testimonial .testimonial-grid { grid-template-columns: 1fr; }
          .dtect-testimonial .testimonial-grid:has(> :only-child) { grid-template-columns: 1fr; }
          .dtect-testimonial .testimonial-card { min-height: 230px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dtect-testimonial *,
          .dtect-testimonial *::before,
          .dtect-testimonial *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="container">
        <header className="testimonial-heading">
          <p className="testimonial-eyebrow">EXPECTED VALUE</p>
          <h2 id="testimonial-title" className="testimonial-title">
            효율적인 판단을 돕는
            <br />
            <strong>결정적 도구</strong>
          </h2>
          <p className="testimonial-intro">
            복잡한 기업 이슈를 빠르게 파악하고
            <br />
            대응 방향을 결정할 수 있도록 돕습니다.
          </p>
        </header>

        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <article
              className="testimonial-card"
              key={testimonial.name}
              style={{ "--testimonial-index": index }}
            >
              <div className="testimonial-meta">
                <span className="testimonial-label">활용 예시</span>
                <span className="testimonial-index">0{index + 1}</span>
              </div>

              <blockquote>
                <span className="quote-mark" aria-hidden="true">
                  “
                </span>
                {testimonial.quote}
              </blockquote>

              <footer className="testimonial-user">
                <div className="testimonial-avatar" aria-hidden="true">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <strong className="testimonial-name">
                    {testimonial.name}
                  </strong>
                  <span className="testimonial-role">{testimonial.role}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
