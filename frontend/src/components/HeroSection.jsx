import { ROUTES } from "../config/routes";

function HeroSection() {
  const styles = {
    section: {
      position: "relative",
      minHeight: "calc(100vh - 56px)",
      padding: "100px 0 110px",
      background:
        "radial-gradient(circle at 50% 25%, var(--hero-glow), transparent 32%), var(--hero-bg)",
      overflow: "hidden",
      color: "var(--hero-text)",
    },

    grid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(var(--hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
      maskImage:
        "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
      pointerEvents: "none",
    },

    glow: {
      position: "absolute",
      width: "520px",
      height: "520px",
      borderRadius: "50%",
      background: "var(--hero-glow-strong)",
      filter: "blur(90px)",
      top: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      pointerEvents: "none",
    },

    container: {
      position: "relative",
      zIndex: 1,
      maxWidth: "1180px",
      margin: "0 auto",
      padding: "0 24px",
    },

    heroContent: {
      textAlign: "center",
      maxWidth: "980px",
      margin: "0 auto",
    },

    status: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "7px 13px",
      marginBottom: "24px",
      border: "1px solid var(--hero-status-border)",
      borderRadius: "999px",
      background: "var(--hero-status-bg)",
      boxShadow: "0 4px 16px var(--hero-shadow)",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.12em",
      color: "var(--hero-primary)",
    },

    dot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "var(--hero-primary)",
      boxShadow: "0 0 0 4px var(--hero-primary-soft)",
    },

    eyebrow: {
      margin: "0 0 20px",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "0.18em",
      color: "var(--hero-primary)",
      textTransform: "uppercase",
    },

    title: {
      margin: 0,
      fontSize: "clamp(42px, 5.2vw, 72px)",
      lineHeight: 1.08,
      letterSpacing: "-0.055em",
      fontWeight: 800,
      color: "var(--hero-title)",
    },

    highlight: {
      color: "var(--hero-primary)",
    },

    subtitle: {
      margin: "28px 0 0",
      fontSize: "20px",
      lineHeight: 1.5,
      fontWeight: 700,
      letterSpacing: "-0.025em",
      color: "var(--hero-subtitle)",
    },

    description: {
      maxWidth: "700px",
      margin: "18px auto 0",
      fontSize: "14px",
      lineHeight: 1.8,
      letterSpacing: "-0.015em",
      color: "var(--hero-muted)",
    },

    buttonArea: {
      marginTop: "32px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
    },

    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      minWidth: "190px",
      height: "52px",
      padding: "0 24px",
      borderRadius: "12px",
      background: "var(--hero-primary)",
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      boxShadow:
        "0 10px 24px var(--hero-btn-shadow), inset 0 1px 0 rgba(255,255,255,0.18)",
      transition: "all 0.2s ease",
    },

    arrow: {
      fontSize: "16px",
      transition: "transform 0.2s ease",
    },

    dashboard: {
      position: "relative",
      maxWidth: "1040px",
      margin: "76px auto 0",
      padding: "1px",
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, var(--hero-dash-border-1), var(--hero-dash-border-2), var(--hero-dash-border-3))",
      boxShadow:
        "0 30px 70px var(--hero-shadow-strong), 0 8px 24px var(--hero-shadow)",
    },

    dashboardInner: {
      borderRadius: "19px",
      background: "var(--hero-card-bg)",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
    },

    dashboardHeader: {
      height: "48px",
      padding: "0 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--hero-border)",
    },

    browserDots: {
      display: "flex",
      gap: "6px",
    },

    browserDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "var(--hero-dot)",
    },

    dashboardLabel: {
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      color: "var(--hero-label)",
    },

    live: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "10px",
      fontWeight: 700,
      color: "var(--hero-live)",
    },

    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "var(--hero-live-dot)",
    },

    dashboardBody: {
      display: "grid",
      gridTemplateColumns: "1.35fr 1fr 1fr",
      gap: "14px",
      padding: "20px",
      textAlign: "left",
    },

    card: {
      minHeight: "145px",
      padding: "18px",
      border: "1px solid var(--hero-border)",
      borderRadius: "14px",
      background: "var(--hero-card-inner)",
      boxShadow: "0 5px 18px var(--hero-shadow)",
    },

    cardLabel: {
      marginBottom: "14px",
      fontSize: "10px",
      fontWeight: 800,
      letterSpacing: "0.08em",
      color: "var(--hero-label)",
      textTransform: "uppercase",
    },

    issueTitle: {
      margin: 0,
      fontSize: "15px",
      fontWeight: 700,
      letterSpacing: "-0.025em",
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
      padding: "5px 8px",
      marginTop: "14px",
      borderRadius: "6px",
      background: "var(--hero-tag-bg)",
      color: "var(--hero-primary)",
      fontSize: "10px",
      fontWeight: 700,
    },

    sentimentRow: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: "10px",
    },

    sentimentNumber: {
      fontSize: "30px",
      lineHeight: 1,
      fontWeight: 800,
      letterSpacing: "-0.05em",
      color: "var(--hero-title)",
    },

    sentimentUnit: {
      marginLeft: "3px",
      fontSize: "12px",
      fontWeight: 600,
      color: "var(--hero-label)",
    },

    bar: {
      height: "6px",
      marginTop: "16px",
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
      marginTop: "12px",
    },

    riskBadge: {
      padding: "6px 9px",
      borderRadius: "6px",
      background: "var(--hero-badge-bg)",
      color: "var(--hero-badge-text)",
      fontSize: "10px",
      fontWeight: 800,
    },

    riskNumber: {
      fontSize: "25px",
      fontWeight: 800,
      letterSpacing: "-0.04em",
      color: "var(--hero-title)",
    },

    dashboardFooter: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      padding: "13px 20px",
      borderTop: "1px solid var(--hero-border)",
      fontSize: "10px",
      color: "var(--hero-label)",
    },

    footerLine: {
      width: "28px",
      height: "1px",
      background: "var(--hero-border)",
    },
  };

  return (
    <section style={styles.section} className="dtect-hero">
      {/* 라이트 / 다크 변수 정의 */}
      <style>{`
        .dtect-hero {
          --hero-bg: #ffffff;
          --hero-text: #111318;
          --hero-title: #111318;
          --hero-subtitle: #20242b;
          --hero-muted: #6b7280;
          --hero-primary: #1677e8;
          --hero-primary-soft: rgba(37, 99, 235, 0.1);
          --hero-glow: rgba(25, 118, 255, 0.07);
          --hero-glow-strong: rgba(37, 99, 235, 0.08);
          --hero-grid: rgba(15, 23, 42, 0.025);
          --hero-status-bg: rgba(255, 255, 255, 0.8);
          --hero-status-border: rgba(37, 99, 235, 0.16);
          --hero-shadow: rgba(15, 23, 42, 0.04);
          --hero-shadow-strong: rgba(15, 23, 42, 0.10);
          --hero-btn-shadow: rgba(22, 119, 232, 0.22);
          --hero-card-bg: rgba(255, 255, 255, 0.96);
          --hero-card-inner: #ffffff;
          --hero-border: #eef0f3;
          --hero-dot: #d7dce3;
          --hero-label: #9aa1ad;
          --hero-live: #16a34a;
          --hero-live-dot: #22c55e;
          --hero-tag-bg: #eff6ff;
          --hero-bar-bg: #edf1f5;
          --hero-badge-bg: #ecfdf3;
          --hero-badge-text: #16803c;
          --hero-dash-border-1: rgba(37, 99, 235, 0.22);
          --hero-dash-border-2: rgba(15, 23, 42, 0.06);
          --hero-dash-border-3: rgba(37, 99, 235, 0.12);
        }

        :root[data-theme="dark"] .dtect-hero {
          --hero-bg: #0c111b;
          --hero-text: #eef3fb;
          --hero-title: #eef3fb;
          --hero-subtitle: #d5deeb;
          --hero-muted: #8a96a8;
          --hero-primary: #4c9cff;
          --hero-primary-soft: rgba(76, 156, 255, 0.18);
          --hero-glow: rgba(76, 156, 255, 0.12);
          --hero-glow-strong: rgba(76, 156, 255, 0.14);
          --hero-grid: rgba(238, 243, 251, 0.04);
          --hero-status-bg: rgba(20, 27, 39, 0.85);
          --hero-status-border: rgba(76, 156, 255, 0.28);
          --hero-shadow: rgba(0, 0, 0, 0.25);
          --hero-shadow-strong: rgba(0, 0, 0, 0.35);
          --hero-btn-shadow: rgba(76, 156, 255, 0.28);
          --hero-card-bg: rgba(17, 24, 36, 0.96);
          --hero-card-inner: #141b27;
          --hero-border: #263142;
          --hero-dot: #3a4658;
          --hero-label: #7f8a9c;
          --hero-live: #34d399;
          --hero-live-dot: #34d399;
          --hero-tag-bg: #172a43;
          --hero-bar-bg: #263142;
          --hero-badge-bg: #14352a;
          --hero-badge-text: #34d399;
          --hero-dash-border-1: rgba(76, 156, 255, 0.3);
          --hero-dash-border-2: rgba(38, 49, 66, 0.6);
          --hero-dash-border-3: rgba(76, 156, 255, 0.18);
        }

        @media (max-width: 800px) {
          .dtect-hero {
            padding-top: 70px !important;
            padding-bottom: 70px !important;
          }
          .dtect-hero .dashboard-body {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .dtect-hero h1 {
            font-size: 42px !important;
          }
          .dtect-hero h2 {
            font-size: 17px !important;
          }
          .dtect-hero .dashboard {
            margin-top: 50px !important;
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

          <h2 style={styles.subtitle}>
            이슈 탐색을 넘어, 대응 전략까지 설계하는 기업 인텔리전스
          </h2>

          <p style={styles.eyebrow}>D:TECT BUSINESS INTELLIGENCE</p>

          <p style={styles.description}>
            D:TECT는 파편화된 뉴스를 의미 있는 이슈로 구조화합니다.
            <br />
            감성·위험도·시장 반응을 분석하고 실무에 바로 활용할 수 있는 대응
            자료를 제공합니다.
          </p>

          <div style={styles.buttonArea}>
            <a
              href={ROUTES.SIGNUP}
              style={styles.primaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px var(--hero-btn-shadow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 24px var(--hero-btn-shadow), inset 0 1px 0 rgba(255,255,255,0.18)";
              }}
            >
              기업 분석 시작하기
              <span style={styles.arrow}>→</span>
            </a>
          </div>
        </div>

        <div style={styles.dashboard} className="dashboard">
          <div style={styles.dashboardInner}>
            <div style={styles.dashboardHeader}>
              <div style={styles.browserDots}>
                <span style={styles.browserDot} />
                <span style={styles.browserDot} />
                <span style={styles.browserDot} />
              </div>

              <span style={styles.dashboardLabel}>
                D:TECT CORPORATE MONITOR
              </span>

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
                    style={{ fontSize: "11px", color: "var(--hero-primary)" }}
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
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "var(--hero-muted)",
                  }}
                >
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
      </div>
    </section>
  );
}

export default HeroSection;
