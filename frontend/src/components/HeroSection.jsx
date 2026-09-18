import { ROUTES } from "../config/routes";

function HeroSection() {
  const styles = {
    section: {
      position: "relative",
      minHeight: "calc(100vh - 56px)",
      padding: "100px 0 110px",
      background:
        "radial-gradient(circle at 50% 25%, rgba(25, 118, 255, 0.07), transparent 32%), #ffffff",
      overflow: "hidden",
    },

    // 배경 장식
    grid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.025) 1px, transparent 1px)",
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
      background: "rgba(37, 99, 235, 0.08)",
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
      border: "1px solid rgba(37, 99, 235, 0.16)",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.8)",
      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.12em",
      color: "#2563eb",
    },

    dot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#2563eb",
      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)",
    },

    eyebrow: {
      margin: "0 0 20px",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "0.18em",
      color: "#2563eb",
      textTransform: "uppercase",
    },

    title: {
      margin: 0,
      fontSize: "clamp(42px, 5.2vw, 72px)",
      lineHeight: 1.08,
      letterSpacing: "-0.055em",
      fontWeight: 800,
      color: "#111318",
    },

    highlight: {
      color: "#1677e8",
    },

    subtitle: {
      margin: "28px 0 0",
      fontSize: "20px",
      lineHeight: 1.5,
      fontWeight: 700,
      letterSpacing: "-0.025em",
      color: "#20242b",
    },

    description: {
      maxWidth: "700px",
      margin: "18px auto 0",
      fontSize: "14px",
      lineHeight: 1.8,
      letterSpacing: "-0.015em",
      color: "#6b7280",
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
      background: "#1677e8",
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      boxShadow:
        "0 10px 24px rgba(22, 119, 232, 0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
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
        "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(15,23,42,0.06), rgba(37,99,235,0.12))",
      boxShadow:
        "0 30px 70px rgba(15, 23, 42, 0.10), 0 8px 24px rgba(15, 23, 42, 0.05)",
    },

    dashboardInner: {
      borderRadius: "19px",
      background: "rgba(255,255,255,0.96)",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
    },

    dashboardHeader: {
      height: "48px",
      padding: "0 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #eef0f3",
    },

    browserDots: {
      display: "flex",
      gap: "6px",
    },

    browserDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#d7dce3",
    },

    dashboardLabel: {
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      color: "#9aa1ad",
    },

    live: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "10px",
      fontWeight: 700,
      color: "#16a34a",
    },

    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#22c55e",
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
      border: "1px solid #edf0f4",
      borderRadius: "14px",
      background: "#ffffff",
      boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
    },

    cardLabel: {
      marginBottom: "14px",
      fontSize: "10px",
      fontWeight: 800,
      letterSpacing: "0.08em",
      color: "#8b93a1",
      textTransform: "uppercase",
    },

    issueTitle: {
      margin: 0,
      fontSize: "15px",
      fontWeight: 700,
      letterSpacing: "-0.025em",
      color: "#171a1f",
    },

    issueMeta: {
      marginTop: "8px",
      fontSize: "11px",
      color: "#9299a5",
    },

    tag: {
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 8px",
      marginTop: "14px",
      borderRadius: "6px",
      background: "#eff6ff",
      color: "#2563eb",
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
      color: "#111827",
    },

    sentimentUnit: {
      marginLeft: "3px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#8b93a1",
    },

    bar: {
      height: "6px",
      marginTop: "16px",
      borderRadius: "999px",
      background: "#edf1f5",
      overflow: "hidden",
    },

    barFill: {
      width: "72%",
      height: "100%",
      borderRadius: "999px",
      background: "#1677e8",
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
      background: "#ecfdf3",
      color: "#16803c",
      fontSize: "10px",
      fontWeight: 800,
    },

    riskNumber: {
      fontSize: "25px",
      fontWeight: 800,
      letterSpacing: "-0.04em",
      color: "#111827",
    },

    dashboardFooter: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      padding: "13px 20px",
      borderTop: "1px solid #eef0f3",
      fontSize: "10px",
      color: "#a0a6b0",
    },

    footerLine: {
      width: "28px",
      height: "1px",
      background: "#dfe3e8",
    },
  };

  return (
    <section style={styles.section} className="dtect-hero">
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.container}>
        <div style={styles.heroContent}>
          {/* 상태 표시 */}
          <div style={styles.status}>
            <span style={styles.dot} />
            CORPORATE INTELLIGENCE PLATFORM
          </div>

          {/* 작은 카테고리 */}
          <p style={styles.eyebrow}>D:TECT BUSINESS INTELLIGENCE</p>

          {/* 메인 타이틀 */}
          <h1 style={styles.title}>
            기업 이슈를 <span style={styles.highlight}>발견하고,</span>
            <br />
            대응 전략까지 <span style={styles.highlight}>한눈에.</span>
          </h1>

          {/* 서브 타이틀 */}
          <h2 style={styles.subtitle}>
            이슈 탐색을 넘어, 대응 전략까지 설계하는 기업 인텔리전스
          </h2>

          {/* 설명 */}
          <p style={styles.description}>
            D:TECT는 파편화된 뉴스를 의미 있는 이슈로 구조화합니다.
            <br />
            감성·위험도·시장 반응을 분석하고 실무에 바로 활용할 수 있는 대응
            자료를 제공합니다.
          </p>

          {/* CTA */}
          <div style={styles.buttonArea}>
            <a
              href={ROUTES.SIGNUP}
              style={styles.primaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(22,119,232,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 24px rgba(22, 119, 232, 0.22), inset 0 1px 0 rgba(255,255,255,0.18)";
              }}
            >
              기업 분석 시작하기
              <span style={styles.arrow}>→</span>
            </a>
          </div>
        </div>

        {/* =========================
            D:TECT 분석 화면 미리보기
        ========================= */}
        <div style={styles.dashboard}>
          <div style={styles.dashboardInner}>
            {/* 상단 바 */}
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

            {/* 분석 카드 */}
            <div style={styles.dashboardBody}>
              {/* 주요 이슈 */}
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

              {/* 감성 분석 */}
              <div style={styles.card}>
                <div style={styles.cardLabel}>Sentiment Analysis</div>

                <div style={styles.sentimentRow}>
                  <div>
                    <span style={styles.sentimentNumber}>72</span>
                    <span style={styles.sentimentUnit}>%</span>
                  </div>

                  <span style={{ fontSize: "11px", color: "#2563eb" }}>
                    긍정
                  </span>
                </div>

                <div style={styles.bar}>
                  <div style={styles.barFill} />
                </div>
              </div>

              {/* 리스크 */}
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
                    color: "#9299a5",
                  }}
                >
                  현재 모니터링 중인
                  <br />
                  주요 리스크 지표
                </p>
              </div>
            </div>

            {/* 하단 */}
            <div style={styles.dashboardFooter}>
              <span style={styles.footerLine} />
              실시간 데이터 기반 기업 이슈 모니터링
              <span style={styles.footerLine} />
            </div>
          </div>
        </div>
      </div>

      {/* 반응형 */}
      <style>{`
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
    </section>
  );
}

export default HeroSection;
