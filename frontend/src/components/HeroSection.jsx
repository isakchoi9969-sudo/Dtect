import { ROUTES } from "../config/routes";

function HeroSection() {
  const isLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("isLoggedIn") === "true";

  return (
    <section className="dtect-hero">
      <style>{`
        .dtect-hero {
          --hero-bg: #fbfcfe;
          --hero-title: #111827;
          --hero-body: #687386;
          --hero-primary: #2563eb;
          --hero-primary-soft: #eff6ff;
          --hero-border: #e7ebf1;
          --hero-card: rgba(255,255,255,.9);
          --hero-panel: #f7f9fc;
          --hero-label: #98a1af;
          --hero-green: #16a34a;
          --hero-shadow: rgba(15,23,42,.08);
          --hero-grid: rgba(37,99,235,.045);

          position: relative;
          min-height: min(690px, calc(100vh - 56px));
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 74px 0 66px;
          background:
            radial-gradient(circle at 68% 38%, rgba(37,99,235,.10), transparent 27%),
            var(--hero-bg);
          color: var(--hero-title);
        }

        :root[data-theme="dark"] .dtect-hero {
          --hero-bg: #0c111b;
          --hero-title: #eef3fb;
          --hero-body: #8a96a8;
          --hero-primary: #4c9cff;
          --hero-primary-soft: #172a43;
          --hero-border: #263142;
          --hero-card: rgba(17,24,36,.92);
          --hero-panel: #101722;
          --hero-label: #7f8a9c;
          --hero-green: #34d399;
          --hero-shadow: rgba(0,0,0,.28);
          --hero-grid: rgba(238,243,251,.045);
          background:
            radial-gradient(circle at 68% 38%, rgba(76,156,255,.14), transparent 27%),
            var(--hero-bg);
        }

        .dtect-hero::before {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
          content: "";
          pointer-events: none;
          animation: dtect-grid-drift 24s linear infinite;
        }

        @keyframes dtect-grid-drift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 44px 44px, 44px 44px; }
        }

        @keyframes dtect-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes dtect-float {
          0%, 100% { transform: rotate(1.2deg) translateY(0); }
          50% { transform: rotate(1.2deg) translateY(-6px); }
        }

        @keyframes dtect-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .58; transform: scale(.82); }
        }

        @keyframes dtect-shimmer {
          from { transform: translateX(-105%); }
          to { transform: translateX(105%); }
        }

        .dtect-hero .hero-shell {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, .92fr) minmax(420px, 1.08fr);
          align-items: center;
          gap: clamp(42px, 7vw, 96px);
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        .dtect-hero .hero-copy { max-width: 540px; }

        .dtect-hero .hero-copy > * {
          opacity: 0;
          animation: dtect-fade-up .7s cubic-bezier(.22, 1, .36, 1) forwards;
        }

        .dtect-hero .hero-copy > :nth-child(1) { animation-delay: .08s; }
        .dtect-hero .hero-copy > :nth-child(2) { animation-delay: .16s; }
        .dtect-hero .hero-copy > :nth-child(3) { animation-delay: .24s; }
        .dtect-hero .hero-copy > :nth-child(4) { animation-delay: .32s; }
        .dtect-hero .hero-copy > :nth-child(5) { animation-delay: .4s; }
        .dtect-hero .hero-copy > :nth-child(6) { animation-delay: .48s; }

        .dtect-hero .hero-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          margin-bottom: 20px;
          border: 1px solid color-mix(in srgb, var(--hero-primary) 18%, transparent);
          border-radius: 999px;
          background: color-mix(in srgb, var(--hero-card) 82%, transparent);
          color: var(--hero-primary);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .13em;
        }

        .dtect-hero .hero-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--hero-primary);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--hero-primary) 13%, transparent);
          animation: dtect-pulse 2.4s ease-in-out infinite;
        }

        .dtect-hero h1 {
          margin: 0;
          font-size: clamp(38px, 4.4vw, 58px);
          font-weight: 700;
          letter-spacing: -.065em;
          line-height: 1.1;
        }

        .dtect-hero .hero-highlight { color: var(--hero-primary); }

        .dtect-hero .hero-kicker {
          margin: 20px 0 0;
          color: var(--hero-title);
          font-size: clamp(17px, 2vw, 21px);
          font-weight: 700;
          letter-spacing: -.045em;
          line-height: 1.4;
        }

        .dtect-hero .hero-description {
          max-width: 480px;
          margin: 13px 0 0;
          color: var(--hero-body);
          font-size: 13px;
          line-height: 1.75;
          letter-spacing: -.02em;
        }

        .dtect-hero .hero-actions { display: flex; gap: 10px; margin-top: 26px; }

        .dtect-hero .hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 45px;
          padding: 0 18px;
          border-radius: 10px;
          background: var(--hero-primary);
          box-shadow: 0 10px 25px color-mix(in srgb, var(--hero-primary) 23%, transparent), inset 0 1px 0 rgba(255,255,255,.18);
          color: #fff;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: -.02em;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .dtect-hero .hero-button:hover { transform: translateY(-2px); box-shadow: 0 14px 28px color-mix(in srgb, var(--hero-primary) 30%, transparent); }
        .dtect-hero .hero-button-arrow { font-size: 16px; line-height: 1; }

        .dtect-hero .hero-button:hover .hero-button-arrow { animation: dtect-arrow-nudge .7s ease-in-out infinite alternate; }

        @keyframes dtect-arrow-nudge {
          to { transform: translateX(3px); }
        }

        .dtect-hero .hero-proof {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 24px;
          color: var(--hero-label);
          font-size: 10px;
        }

        .dtect-hero .hero-proof-line { width: 24px; height: 1px; background: var(--hero-border); }

        .dtect-hero .hero-dashboard {
          position: relative;
          padding: 1px;
          border: 1px solid color-mix(in srgb, var(--hero-primary) 16%, var(--hero-border));
          border-radius: 18px;
          background: linear-gradient(145deg, color-mix(in srgb, var(--hero-primary) 32%, transparent), var(--hero-border), transparent);
          box-shadow: 0 26px 60px var(--hero-shadow), 0 8px 20px color-mix(in srgb, var(--hero-shadow) 50%, transparent);
          transform: rotate(1.2deg);
          animation: dtect-float 6s ease-in-out 1s infinite;
        }

        .dtect-hero .hero-dashboard-inner { overflow: hidden; border-radius: 17px; background: var(--hero-card); backdrop-filter: blur(18px); transform: rotate(-1.2deg); }

        .dtect-hero .dashboard-topbar { display: flex; align-items: center; justify-content: space-between; height: 42px; padding: 0 15px; border-bottom: 1px solid var(--hero-border); }
        .dtect-hero .dashboard-dots { display: flex; gap: 5px; }
        .dtect-hero .dashboard-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--hero-border); }
        .dtect-hero .dashboard-name { color: var(--hero-label); font-size: 8px; font-weight: 800; letter-spacing: .11em; }
        .dtect-hero .dashboard-live { display: flex; align-items: center; gap: 5px; color: var(--hero-green); font-size: 8px; font-weight: 800; letter-spacing: .08em; }
        .dtect-hero .dashboard-live i { width: 5px; height: 5px; border-radius: 50%; background: var(--hero-green); animation: dtect-pulse 1.8s ease-in-out infinite; }

        .dtect-hero .dashboard-content { display: grid; grid-template-columns: 1.2fr .8fr; gap: 10px; padding: 13px; text-align: left; }
        .dtect-hero .dashboard-card { padding: 14px; border: 1px solid var(--hero-border); border-radius: 11px; background: var(--hero-panel); animation: dtect-fade-up .7s cubic-bezier(.22, 1, .36, 1) both; }
        .dtect-hero .dashboard-card:nth-child(1) { animation-delay: .4s; }
        .dtect-hero .dashboard-card:nth-child(2) { animation-delay: .52s; }
        .dtect-hero .dashboard-card:nth-child(3) { animation-delay: .64s; }
        .dtect-hero .dashboard-card-main { grid-row: span 2; }
        .dtect-hero .dashboard-label { margin-bottom: 12px; color: var(--hero-label); font-size: 8px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .dtect-hero .dashboard-issue { margin: 0; color: var(--hero-title); font-size: 14px; font-weight: 750; letter-spacing: -.04em; line-height: 1.4; }
        .dtect-hero .dashboard-meta { margin: 8px 0 0; color: var(--hero-body); font-size: 9px; }
        .dtect-hero .dashboard-tag { display: inline-flex; margin-top: 14px; padding: 5px 7px; border-radius: 5px; background: var(--hero-primary-soft); color: var(--hero-primary); font-size: 8px; font-weight: 800; }
        .dtect-hero .dashboard-stat { display: flex; align-items: baseline; justify-content: space-between; }
        .dtect-hero .dashboard-value { color: var(--hero-title); font-size: 27px; font-weight: 800; letter-spacing: -.06em; }
        .dtect-hero .dashboard-unit, .dtect-hero .dashboard-positive { color: var(--hero-primary); font-size: 9px; font-weight: 750; }
        .dtect-hero .dashboard-bar { height: 4px; margin-top: 12px; overflow: hidden; border-radius: 999px; background: var(--hero-border); }
        .dtect-hero .dashboard-bar span { position: relative; display: block; width: 72%; height: 100%; overflow: hidden; border-radius: inherit; background: var(--hero-primary); }
        .dtect-hero .dashboard-bar span::after { position: absolute; inset: 0; width: 45%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent); content: ""; animation: dtect-shimmer 2.8s ease-in-out infinite; }
        .dtect-hero .dashboard-risk { display: flex; align-items: center; justify-content: space-between; }
        .dtect-hero .dashboard-risk strong { color: var(--hero-title); font-size: 21px; letter-spacing: -.05em; }
        .dtect-hero .dashboard-badge { padding: 5px 7px; border-radius: 5px; background: color-mix(in srgb, var(--hero-green) 11%, transparent); color: var(--hero-green); font-size: 8px; font-weight: 800; }
        .dtect-hero .dashboard-footer { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; border-top: 1px solid var(--hero-border); color: var(--hero-label); font-size: 8px; }
        .dtect-hero .dashboard-footer::before, .dtect-hero .dashboard-footer::after { width: 22px; height: 1px; background: var(--hero-border); content: ""; }

        @media (max-width: 860px) {
          .dtect-hero { min-height: auto; padding: 72px 0 58px; }
          .dtect-hero .hero-shell { grid-template-columns: 1fr; gap: 44px; }
          .dtect-hero .hero-copy { max-width: 620px; }
          .dtect-hero .hero-dashboard { max-width: 650px; width: 100%; margin: 0 auto; }
        }

        @media (max-width: 560px) {
          .dtect-hero { padding: 54px 0 44px; }
          .dtect-hero .hero-shell { width: min(100% - 36px, 1160px); gap: 32px; }
          .dtect-hero h1 { font-size: 36px; }
          .dtect-hero .hero-kicker { font-size: 17px; }
          .dtect-hero .hero-description br { display: none; }
          .dtect-hero .dashboard-content { grid-template-columns: 1fr; }
          .dtect-hero .dashboard-card-main { grid-row: auto; }
          .dtect-hero .hero-dashboard { transform: none; }
          .dtect-hero .hero-dashboard-inner { transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dtect-hero *, .dtect-hero::before {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="hero-shell">
        <div className="hero-copy">
          <div className="hero-status">
            <span className="hero-status-dot" />
            CORPORATE INTELLIGENCE PLATFORM
          </div>

          <h1>
            기업 이슈를 <span className="hero-highlight">발견하고,</span>
            <br />
            대응 전략까지 <span className="hero-highlight">한눈에.</span>
          </h1>

          <p className="hero-kicker">
            이슈 탐색을 넘어, 대응 전략까지 설계하는 기업 인텔리전스
          </p>
          <p className="hero-description">
            D:TECT는 파편화된 뉴스를 의미 있는 이슈로 구조화합니다.
            <br />
            감성·위험도·시장 반응을 분석해 실무에 바로 활용할 수 있는 대응
            자료를 제공합니다.
          </p>

          <div className="hero-actions">
            <a
              className="hero-button"
              href={isLoggedIn ? ROUTES.COMPANY_SEARCH : ROUTES.SIGNUP}
            >
              기업 분석 시작하기
              <span className="hero-button-arrow">→</span>
            </a>
          </div>

          <div className="hero-proof">
            <span className="hero-proof-line" />
            실시간 데이터 기반 기업 이슈 모니터링
          </div>
        </div>

        <div className="hero-dashboard">
          <div className="hero-dashboard-inner">
            <div className="dashboard-topbar">
              <div className="dashboard-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="dashboard-name">D:TECT CORPORATE MONITOR</span>
              <div className="dashboard-live">
                <i /> LIVE
              </div>
            </div>

            <div className="dashboard-content">
              <div className="dashboard-card dashboard-card-main">
                <div className="dashboard-label">Major Issue</div>
                <p className="dashboard-issue">
                  주요 기업 관련 이슈가
                  <br />
                  새롭게 감지되었습니다.
                </p>
                <p className="dashboard-meta">
                  News · Market · Social · 12 min ago
                </p>
                <span className="dashboard-tag">ISSUE DETECTED</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-label">Sentiment Analysis</div>
                <div className="dashboard-stat">
                  <div>
                    <strong className="dashboard-value">72</strong>
                    <span className="dashboard-unit">%</span>
                  </div>
                  <span className="dashboard-positive">긍정</span>
                </div>
                <div className="dashboard-bar">
                  <span />
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-label">Risk Monitoring</div>
                <div className="dashboard-risk">
                  <strong>LOW</strong>
                  <span className="dashboard-badge">STABLE</span>
                </div>
                <p className="dashboard-meta">
                  현재 모니터링 중인 주요 리스크 지표
                </p>
              </div>
            </div>

            <div className="dashboard-footer">실시간 분석 대시보드</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
