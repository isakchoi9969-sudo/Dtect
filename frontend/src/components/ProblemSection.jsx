import { problemItems } from "../data/landingData";

function ProblemSection() {
  return (
    <section className="section dtect-problem" aria-labelledby="problem-title">
      <style>{`
        .dtect-problem {
          --prob-bg: #f8fafc;
          --prob-surface: rgba(255, 255, 255, 0.88);
          --prob-border: rgba(148, 163, 184, 0.22);
          --prob-title: #0f172a;
          --prob-muted: #64748b;
          --prob-accent: #2563eb;
          --prob-accent-soft: #eff6ff;
          position: relative;
          padding: clamp(76px, 10vw, 112px) 0;
          overflow: hidden;
          background: var(--prob-bg);
          isolation: isolate;
        }

        .dtect-problem::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: 8%;
          left: 50%;
          width: min(680px, 80vw);
          height: 280px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(37, 99, 235, 0.07), transparent 68%);
          pointer-events: none;
          animation: problemGlow 7s ease-in-out infinite;
        }

        :root[data-theme="dark"] .dtect-problem {
          --prob-bg: #0b1120;
          --prob-surface: rgba(15, 23, 42, 0.78);
          --prob-border: rgba(148, 163, 184, 0.16);
          --prob-title: #f8fafc;
          --prob-muted: #94a3b8;
          --prob-accent: #60a5fa;
          --prob-accent-soft: rgba(59, 130, 246, 0.12);
        }

        .dtect-problem .container {
          width: min(100% - 40px, 1100px);
          margin: 0 auto;
        }

        .dtect-problem .problem-heading {
          max-width: 560px;
          margin: 0 0 clamp(34px, 5vw, 52px);
          animation: problemHeadingIn 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .dtect-problem .problem-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 15px;
          color: var(--prob-accent);
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.14em;
        }

        .dtect-problem .problem-eyebrow::before {
          content: "";
          width: 22px;
          height: 1px;
          background: currentColor;
          opacity: 0.55;
          animation: problemEyebrowPulse 2.2s ease-in-out infinite;
        }

        .dtect-problem .problem-title {
          margin: 0;
          color: var(--prob-title);
          font-size: clamp(2rem, 4.5vw, 3.25rem);
          font-weight: 750;
          line-height: 1.14;
          letter-spacing: -0.065em;
        }

        .dtect-problem .problem-title-muted {
          color: var(--prob-muted);
          font-weight: 500;
        }

        .dtect-problem .problem-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .dtect-problem .problem-card {
          position: relative;
          min-height: 238px;
          padding: 24px 24px 28px;
          overflow: hidden;
          border: 1px solid var(--prob-border);
          border-radius: 16px;
          background: var(--prob-surface);
          box-shadow: 0 14px 38px -30px rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: problemCardIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--card-index) * 80ms);
          transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
          isolation: isolate;
        }

        .dtect-problem .problem-card:hover {
          transform: translateY(-6px) rotate(-0.4deg);
          border-color: color-mix(in srgb, var(--prob-accent) 30%, transparent);
          box-shadow: 0 22px 42px -30px rgba(37, 99, 235, 0.45);
        }

        .dtect-problem .problem-card::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: -40%;
          bottom: -40%;
          left: -45%;
          width: 24%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
          opacity: 0;
          pointer-events: none;
          transform: skewX(-18deg);
        }

        .dtect-problem .problem-card:hover::before {
          opacity: 1;
          animation: problemScan 850ms ease-out;
        }

        .dtect-problem .problem-card::after {
          content: "";
          position: absolute;
          right: 24px;
          bottom: 0;
          left: 24px;
          height: 2px;
          transform: scaleX(0.35);
          transform-origin: left;
          border-radius: 2px 2px 0 0;
          background: var(--prob-accent);
          opacity: 0.8;
          transition: transform 220ms ease;
        }

        .dtect-problem .problem-card:hover::after { transform: scaleX(1); }

        .dtect-problem .problem-number {
          position: absolute;
          top: 18px;
          right: 20px;
          color: var(--prob-accent);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          opacity: 0.65;
          transition: color 220ms ease, transform 220ms ease;
        }

        .dtect-problem .problem-card:hover .problem-number {
          color: var(--prob-title);
          transform: translateY(-2px) scale(1.08);
        }

        .dtect-problem .problem-icon {
          display: grid;
          width: 32px;
          height: 32px;
          margin-bottom: 34px;
          place-items: center;
          border: 1px solid color-mix(in srgb, var(--prob-accent) 16%, transparent);
          border-radius: 9px;
          background: var(--prob-accent-soft);
          color: var(--prob-accent);
          font-size: 11px;
          font-weight: 750;
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--prob-accent) 22%, transparent);
          animation: problemIconPulse 2.8s ease-in-out infinite;
          transition: transform 260ms cubic-bezier(.22, 1, .36, 1), border-radius 260ms ease;
        }

        .dtect-problem .problem-card:hover .problem-icon {
          border-radius: 50%;
          transform: rotate(12deg) scale(1.16);
        }

        .dtect-problem .problem-card h3 {
          margin: 0 0 11px;
          color: var(--prob-title);
          font-size: 19px;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.04em;
        }

        .dtect-problem .problem-card p {
          max-width: 27ch;
          margin: 0;
          color: var(--prob-muted);
          font-size: 13px;
          line-height: 1.65;
          word-break: keep-all;
        }

        @keyframes problemCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes problemGlow {
          0%, 100% { opacity: .55; transform: translateX(-50%) scale(.94); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.06); }
        }

        @keyframes problemHeadingIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes problemEyebrowPulse {
          0%, 100% { transform: scaleX(.7); opacity: .3; }
          50% { transform: scaleX(1.1); opacity: .85; }
        }

        @keyframes problemIconPulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--prob-accent) 22%, transparent); }
          50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--prob-accent) 0%, transparent); }
        }

        @keyframes problemScan {
          from { left: -45%; }
          to { left: 135%; }
        }

        @media (max-width: 820px) {
          .dtect-problem .problem-grid { grid-template-columns: 1fr; }
          .dtect-problem .problem-card { min-height: auto; }
          .dtect-problem .problem-card p { max-width: 48ch; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dtect-problem *,
          .dtect-problem *::before,
          .dtect-problem *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="container">
        <header className="problem-heading">
          <p className="problem-eyebrow">WHY D:TECT</p>
          <h2 id="problem-title" className="problem-title">
            단순 탐색에 뺏기는
            <br />
            <span className="problem-title-muted">시간을 줄이세요</span>
          </h2>
        </header>

        <div className="problem-grid">
          {problemItems.map((item, index) => (
            <article
              className="problem-card"
              key={item.number}
              style={{ "--card-index": index }}
            >
              <span className="problem-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="problem-icon" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>
                {item.title.map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < item.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
