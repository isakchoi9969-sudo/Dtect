import { ROUTES } from "../config/routes";

function HeroSection() {
  const styles = {
    section: {
      position: "relative",
      minHeight: "calc(100vh - 56px)",
      padding: "88px 0 100px",
      background:
        "radial-gradient(circle at 50% 20%, var(--hero-glow), transparent 38%), var(--hero-bg)",
      overflow: "hidden",
      color: "var(--hero-text)",
    },

    grid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
      backgroundSize: "56px 56px",
      maskImage:
        "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
      pointerEvents: "none",
    },

    glow: {
      position: "absolute",
      width: "480px",
      height: "480px",
      borderRadius: "50%",
      background: "var(--hero-glow-strong)",
      filter: "blur(100px)",
      top: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      pointerEvents: "none",
      opacity: 0.7,
    },

    container: {
      position: "relative",
      zIndex: 1,
      maxWidth: "1120px",
      margin: "0 auto",
      padding: "0 24px",
    },

    heroContent: {
      textAlign: "center",
      maxWidth: "860px",
      margin: "0 auto",
    },

    status: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      marginBottom: "28px",
      border: "1px solid var(--hero-status-border)",
      borderRadius: "999px",
      background: "var(--hero-status-bg)",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.1em",
      color: "var(--hero-primary)",
    },

    dot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "var(--hero-primary)",
      boxShadow: "0 0 0 3px var(--hero-primary-soft)",
    },

    title: {
      margin: 0,
      fontSize: "clamp(36px, 4.8vw, 64px)",
      lineHeight: 1.15,
      letterSpacing: "-0.04em",
      fontWeight: 700,
      color: "var(--hero-title)",
    },

    highlight: {
      color: "var(--hero-primary)",
    },

    subtitle: {
      margin: "20px 0 0",
      fontSize: "17px",
      lineHeight: 1.55,
      fontWeight: 500,
      letterSpacing: "-0.02em",
      color: "var(--hero-subtitle)",
    },

    description: {
      maxWidth: "560px",
      margin: "16px auto 0",
      fontSize: "14.5px",
      lineHeight: 1.75,
      letterSpacing: "-0.01em",
      color: "var(--hero-muted)",
    },

    buttonArea: {
      marginTop: "36px",
      display: "flex",
      justifyContent: "center",
    },

    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      minWidth: "180px",
      height: "48px",
      padding: "0 22px",
      borderRadius: "11px",
      background: "var(--hero-primary)",
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      boxShadow: "0 8px 20px var(--hero-btn-shadow)",
      transition: "all 0.22s ease",
    },

    arrow: {
      fontSize: "15px",
      transition: "transform 0.22s ease",
    },

    dashboard: {
      position: "relative",
      maxWidth: "980px",
      margin: "72px auto 0",
      borderRadius: "18px",
      background: "var(--hero-card-bg)",
      border: "1px solid var(--hero-border)",
      boxShadow:
        "0 24px 60px var(--hero-shadow-strong), 0 4px 16px var(--hero-shadow)",
      overflow: "hidden",
    },

    dashboardHeader: {
      height: "44px",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--hero-border)",
      background: "var(--hero-card-inner)",
    },

    browserDots: {
      display: "flex",
      gap: "5px",
    },

    browserDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "var(--hero-dot)",
    },

    dashboardLabel: {
      fontSize: "10px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      color: "var(--hero-label)",
    },

    live: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "10px",
      fontWeight: 600,
      color: "var(--hero-live)",
    },

    liveDot: {
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: "var(--hero-live-dot)",
    },

    dashboardBody: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr",
      gap: "12px",
      padding: "16px",
      textAlign: "left",
      background: "var(--hero-card-bg)",
    },

    card: {
      minHeight: "138px",
      padding: "16px",
      border: "1px solid var(--hero-border)",
      borderRadius: "12px",
      background: "var(--hero-card-inner)",
    },

    cardLabel: {
      marginBottom: "12px",
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.07em",
      color: "var(--hero-label)",
      textTransform: "uppercase",
    },

    issueTitle: {
      margin: 0,
      fontSize: "14.5px",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      lineHeight: 1.45,
      color: "var(--hero-title)",
    },

    issueMeta: {
      marginTop: "8px",
      fontSize: "11px",
      color: "var(--hero-muted)",
    },

    tag: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 8px",
      marginTop: "12px",
      borderRadius: "5px",
      background: "var(--hero-tag-bg)",
      color: "var(--hero-primary)",
      fontSize: "10px",
      fontWeight: 600,
    },

    sentimentRow: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: "8px",
    },

    sentimentNumber: {
      fontSize: "28px",
      lineHeight: 1,
      fontWeight: 700,
      letterSpacing: "-0.04em",
      color: "var(--hero-title)",
    },

    sentimentUnit: {
      marginLeft: "2px",
      fontSize: "12px",
      fontWeight: 500,
      color: "var(--hero-label)",
    },

    bar: {
      height: "5px",
      marginTop: "14px",
      borderRadius: "999px",
      background: "var(--hero-bar-bg)",
      overflow: "hidden",
    },

    barFill: {
      width: "72%",
      height: "100%",
      borderRadius: "999px",
      background: "var(--hero-primary)",
    },

    riskValue: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "10px",
    },

    riskNumber: {
      fontSize: "24px",
      fontWeight: 700,
      letterSpacing: "-0.03em",
      color: "var(--hero-title)",
    },

    riskBadge: {
      padding: "4px 8px",
      borderRadius: "5px",
      background: "var(--hero-badge-bg)",
      color: "var(--hero-badge-text)",
      fontSize: "10px",
      fontWeight: 700,
    },

    riskDesc: {
      margin: "12px 0 0",
      fontSize: "11px",
      lineHeight: 1.5,
      color: "var(--hero-muted)",
    },

    dashboardFooter: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      borderTop: "1px solid var(--hero-border)",
      fontSize: "10px",
      color: "var(--hero-label)",
      background: "var(--hero-card-inner)",
    },

    footerLine: {
      width: "24px",
      height: "1px",
      background: "var(--hero-border)",
    },
  };

  return (
    <section style={styles.section} className="dtect-hero">
      <style>{`
        .dtect-hero {
          --hero-bg: #ffffff;
          --hero-text: #0f172a;
          --hero-title: #0f172a;
          --hero-subtitle: #334155;
          --hero-muted: #64748b;
          --hero-primary: #2563eb;
          --hero-primary-soft: rgba(37, 99, 235, 0.12);
          --hero-glow: rgba(37, 99, 235, 0.06);
          --hero-glow-strong: rgba(37, 99, 235, 0.07);
          --hero-grid: rgba(15, 23, 42, 0.03);
          --hero-status-bg: rgba(255, 255, 255, 0.85);
          --hero-status-border: rgba(37, 99, 235, 0.15);
          --hero-shadow: rgba(15, 23, 42, 0.04);
          --hero-shadow-strong: rgba(15, 23, 42, 0.08);
          --hero-btn-shadow: rgba(37, 99, 235, 0.25);
          --hero-card-bg: #ffffff;
          --hero-card-inner: #fafbfc;
          --hero-border: #e2e8f0;
          --hero-dot: #cbd5e1;
          --hero-label: #94a3b8;
          --hero-live: #16a34a;
          --hero-live-dot: #22c55e;
          --hero-tag-bg: #eff6ff;
          --hero-bar-bg: #e2e8f0;
          --hero-badge-bg: #ecfdf5;
          --hero-badge-text: #15803d;
        }

        :root[data-theme="dark"] .dtect-hero {
          --hero-bg: #0b1120;
          --hero-text: #f1f5f9;
          --hero-title: #f8fafc;
          --hero-subtitle: #cbd5e1;
          --hero-muted: #94a3b8;
          --hero-primary: #60a5fa;
          --hero-primary-soft: rgba(96, 165, 250, 0.18);
          --hero-glow: rgba(96, 165, 250, 0.1);
          --hero-glow-strong: rgba(96, 165, 250, 0.12);
          --hero-grid: rgba(241, 245, 249, 0.035);
          --hero-status-bg: rgba(15, 23, 42, 0.8);
          --hero-status-border: rgba(96, 165, 250, 0.25);
          --hero-shadow: rgba(0, 0, 0, 0.2);
          --hero-shadow-strong: rgba(0, 0, 0, 0.35);
          --hero-btn-shadow: rgba(37, 99, 235, 0.35);
          --hero-card-bg: #111827;
          --hero-card-inner: #0f172a;
          --hero-border: #1e293b;
          --hero-dot: #334155;
          --hero-label: #64748b;
          --hero-live: #34d399;
          --hero-live-dot: #34d399;
          --hero-tag-bg: #1e3a5f;
          --hero-bar-bg: #1e293b;
          --hero-badge-bg: #064e3b;
          --hero-badge-text: #34d399;
        }

        .dtect-hero a:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px var(--hero-btn-shadow) !important;
        }

        .dtect-hero a:hover span {
          transform: translateX(3px);
        }

        @media (max-width: 800px) {
          .dtect-hero {
            padding-top: 64px !important;
            padding-bottom: 64px !important;
          }
          .dtect-hero .dashboard-body {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .dtect-hero h1 {
            font-size: 34px !important;
          }
        }
      `}</style>

      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.container}>
        <div style={styles.heroContent}>
          <div style={styles.status}>
            <span style={styles.dot} />
            CORPORATE INTELLIGENCE PLATFORM
          </div>

          <h1 style={styles.title}>
            기업 이슈를 <span style={styles.highlight}>발견하고,</span>
            <br />
            대응 전략까지 <span style={styles.highlight}>한눈에.</span>
          </h1>

          <p style={styles.subtitle}>
            이슈 탐색을 넘어, 대응 전략까지 설계하는 기업 인텔리전스
          </p>

          <p style={styles.description}>
            D:TECT는 파편화된 뉴스를 의미 있는 이슈로 구조화합니다.
            <br />
            감성·위험도·시장 반응을 분석하고 실무에 바로 활용할 수 있는 대응
            자료를 제공합니다.
          </p>

          <div style={styles.buttonArea}>
            <a href={ROUTES.SIGNUP} style={styles.primaryButton}>
              기업 분석 시작하기
              <span style={styles.arrow}>→</span>
            </a>
          </div>
        </div>

        <div style={styles.dashboard}>
          <div style={styles.dashboardHeader}>
            <div style={styles.browserDots}>
              <span style={styles.browserDot} />
              <span style={styles.browserDot} />
              <span style={styles.browserDot} />
            </div>
            <span style={styles.dashboardLabel}>D:TECT CORPORATE MONITOR</span>
            <div style={styles.live}>
              <span style={styles.liveDot} />
              LIVE MONITORING
            </div>
          </div>

          <div style={styles.dashboardBody} className="dashboard-body">
            <div style={styles.card}>
              <div style={styles.cardLabel}>Major Issue</div>
              <p style={styles.issueTitle}>
                주요 기업 관련 이슈가
                <br />
                새롭게 감지되었습니다.
              </p>
              <p style={styles.issueMeta}>
                News · Market · Social · 12 min ago
              </p>
              <span style={styles.tag}>ISSUE DETECTED</span>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>Sentiment Analysis</div>
              <div style={styles.sentimentRow}>
                <div>
                  <span style={styles.sentimentNumber}>72</span>
                  <span style={styles.sentimentUnit}>%</span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--hero-primary)",
                  }}
                >
                  긍정
                </span>
              </div>
              <div style={styles.bar}>
                <div style={styles.barFill} />
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>Risk Monitoring</div>
              <div style={styles.riskValue}>
                <span style={styles.riskNumber}>LOW</span>
                <span style={styles.riskBadge}>STABLE</span>
              </div>
              <p style={styles.riskDesc}>
                현재 모니터링 중인
                <br />
                주요 리스크 지표
              </p>
            </div>
          </div>

          <div style={styles.dashboardFooter}>
            <span style={styles.footerLine} />
            실시간 데이터 기반 기업 이슈 모니터링
            <span style={styles.footerLine} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
