function WorkflowSection() {
  const styles = {
    section: {
      padding: "120px 0",
      background: "var(--wf-bg)",
    },

    heading: {
      marginBottom: "64px",
    },

    label: {
      display: "inline-block",
      marginBottom: "18px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.16em",
      color: "var(--wf-primary)",
    },

    title: {
      margin: 0,
      fontSize: "clamp(38px, 4vw, 58px)",
      lineHeight: 1.15,
      letterSpacing: "-0.055em",
      fontWeight: 700,
      color: "var(--wf-title)",
    },

    titleMuted: {
      color: "var(--wf-title-muted)",
    },

    subtitle: {
      marginTop: "22px",
      fontSize: "15px",
      lineHeight: 1.8,
      color: "var(--wf-muted)",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gridTemplateRows: "1fr 1fr",
      gap: "18px",
    },

    card: {
      position: "relative",
      overflow: "hidden",
      border: "1px solid var(--wf-border)",
      borderRadius: "24px",
      background: "var(--wf-card-bg)",
      padding: "34px",
      boxSizing: "border-box",
    },

    mainCard: {
      gridRow: "span 2",
      minHeight: "620px",
    },

    sideCard: {
      minHeight: "301px",
    },

    number: {
      position: "absolute",
      top: "32px",
      right: "34px",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      color: "var(--wf-number)",
    },

    category: {
      display: "block",
      marginBottom: "16px",
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.15em",
      color: "var(--wf-label)",
    },

    cardTitle: {
      margin: 0,
      fontSize: "28px",
      lineHeight: 1.35,
      letterSpacing: "-0.045em",
      fontWeight: 500,
      color: "var(--wf-card-title)",
    },

    cardTitleStrong: {
      fontWeight: 700,
      color: "var(--wf-title)",
    },

    cardText: {
      margin: "18px 0 0",
      fontSize: "13px",
      lineHeight: 1.8,
      color: "var(--wf-muted)",
    },

    footer: {
      position: "absolute",
      left: "34px",
      right: "34px",
      bottom: "22px",
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "15px",
      borderTop: "1px solid var(--wf-footer-border)",
      fontSize: "8px",
      fontWeight: 700,
      letterSpacing: "0.12em",
      color: "var(--wf-footer)",
    },
  };

  return (
    <section style={styles.section} className="dtect-workflow">
      <style>{`
        .dtect-workflow {
          --wf-bg: #ffffff;
          --wf-primary: #2563eb;
          --wf-title: #111827;
          --wf-title-muted: #9ca3af;
          --wf-muted: #6b7280;
          --wf-border: #e5e7eb;
          --wf-card-bg: #ffffff;
          --wf-number: #a1a8b3;
          --wf-label: #9ca3af;
          --wf-card-title: #374151;
          --wf-footer-border: #eef0f2;
          --wf-footer: #a5abb4;

          --wf-panel-bg: #f7f8fa;
          --wf-news-bg: #ffffff;
          --wf-news-border: #e8eaee;
          --wf-news-text: #374151;
          --wf-news-time: #b6bbc3;
          --wf-dot-strong: #2563eb;
          --wf-dot-mid: #93c5fd;
          --wf-dot-weak: #cbd5e1;

          --wf-result-bg: #111827;
          --wf-result-label: #93c5fd;
          --wf-result-title: #ffffff;
          --wf-result-meta: #9ca3af;

          --wf-score: #111827;
          --wf-score-unit: #9ca3af;
          --wf-bar-bg: #edf0f3;
          --wf-bar-fill: #2563eb;
          --wf-scale: #a5abb4;
          --wf-scale-active: #2563eb;

          --wf-ready: #16a34a;
          --wf-doc-bg: #f8fafc;
          --wf-doc-border: #e5e7eb;
          --wf-doc-title: #374151;
          --wf-doc-line: #dfe3e8;
        }

        :root[data-theme="dark"] .dtect-workflow {
          --wf-bg: #0c111b;
          --wf-primary: #4c9cff;
          --wf-title: #eef3fb;
          --wf-title-muted: #7f8a9c;
          --wf-muted: #8a96a8;
          --wf-border: #263142;
          --wf-card-bg: #141b27;
          --wf-number: #6b7789;
          --wf-label: #7f8a9c;
          --wf-card-title: #c5d0e0;
          --wf-footer-border: #263142;
          --wf-footer: #6b7789;

          --wf-panel-bg: #101722;
          --wf-news-bg: #111824;
          --wf-news-border: #263142;
          --wf-news-text: #d5deeb;
          --wf-news-time: #6b7789;
          --wf-dot-strong: #4c9cff;
          --wf-dot-mid: #5b8fd4;
          --wf-dot-weak: #3a4658;

          --wf-result-bg: #0a1018;
          --wf-result-label: #8bc6ff;
          --wf-result-title: #eef3fb;
          --wf-result-meta: #7f8a9c;

          --wf-score: #eef3fb;
          --wf-score-unit: #7f8a9c;
          --wf-bar-bg: #263142;
          --wf-bar-fill: #4c9cff;
          --wf-scale: #6b7789;
          --wf-scale-active: #4c9cff;

          --wf-ready: #34d399;
          --wf-doc-bg: #101722;
          --wf-doc-border: #263142;
          --wf-doc-title: #d5deeb;
          --wf-doc-line: #2b394b;
        }

        @media (max-width: 900px) {
          .dtect-workflow .wf-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }
          .dtect-workflow .wf-main-card {
            grid-row: auto !important;
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="container">
        <div style={styles.heading}>
          <span style={styles.label}>WORKFLOW</span>

          <h2 style={styles.title}>
            복잡한 이슈를 발견하고,
            <br />
            <span style={styles.titleMuted}>대응까지 연결합니다.</span>
          </h2>

          <p style={styles.subtitle}>
            뉴스 수집부터 위험도 분석, 대응 자료 작성까지
            <br />
            기업 이슈에 필요한 모든 과정을 하나의 흐름으로 제공합니다.
          </p>
        </div>

        <div style={styles.grid} className="wf-grid">
          {/* 01. ISSUE DETECTION */}
          <article
            className="wf-main-card"
            style={{
              ...styles.card,
              ...styles.mainCard,
            }}
          >
            <span style={styles.number}>01</span>

            <div>
              <span style={styles.category}>ISSUE DETECTION</span>

              <h3 style={styles.cardTitle}>
                뉴스에서
                <br />
                <strong style={styles.cardTitleStrong}>
                  하나의 이슈를 발견합니다.
                </strong>
              </h3>

              <p style={styles.cardText}>
                다양한 채널에서 수집된 뉴스를 분석하고
                <br />
                유사한 맥락의 기사들을 하나의 이슈로 연결합니다.
              </p>
            </div>

            <div
              style={{
                marginTop: "42px",
                padding: "24px",
                borderRadius: "18px",
                background: "var(--wf-panel-bg)",
              }}
            >
              {/* News 01 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: "10px",
                  background: "var(--wf-news-bg)",
                  border: "1px solid var(--wf-news-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--wf-dot-strong)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--wf-label)",
                      }}
                    >
                      ECONOMY
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--wf-news-text)",
                      }}
                    >
                      공급망 관련 신규 보도
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--wf-news-time)",
                  }}
                >
                  09:42
                </span>
              </div>

              {/* News 02 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "7px",
                  padding: "16px 18px",
                  borderRadius: "10px",
                  background: "var(--wf-news-bg)",
                  border: "1px solid var(--wf-news-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--wf-dot-mid)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--wf-label)",
                      }}
                    >
                      INDUSTRY
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--wf-news-text)",
                      }}
                    >
                      생산 차질 가능성 언급
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--wf-news-time)",
                  }}
                >
                  09:18
                </span>
              </div>

              {/* News 03 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "7px",
                  padding: "16px 18px",
                  borderRadius: "10px",
                  background: "var(--wf-news-bg)",
                  border: "1px solid var(--wf-news-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--wf-dot-weak)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--wf-label)",
                      }}
                    >
                      COMPANY
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--wf-news-text)",
                      }}
                    >
                      주요 관계사 대응 발표
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--wf-news-time)",
                  }}
                >
                  08:56
                </span>
              </div>

              {/* Connection dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  padding: "13px 0",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--wf-dot-weak)",
                  }}
                />
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--wf-dot-weak)",
                  }}
                />
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--wf-dot-weak)",
                  }}
                />
              </div>

              {/* Result */}
              <div
                style={{
                  padding: "22px",
                  borderRadius: "12px",
                  background: "var(--wf-result-bg)",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.13em",
                    color: "var(--wf-result-label)",
                  }}
                >
                  DETECTED ISSUE
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--wf-result-title)",
                  }}
                >
                  공급망 리스크
                </div>
                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "10px",
                    color: "var(--wf-result-meta)",
                  }}
                >
                  관련 기사 42건
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <span>ISSUE DETECTION</span>
              <span>01</span>
            </div>
          </article>

          {/* 02. RISK ANALYSIS */}
          <article
            style={{
              ...styles.card,
              ...styles.sideCard,
            }}
          >
            <span style={styles.number}>02</span>
            <span style={styles.category}>RISK ANALYSIS</span>

            <h3 style={styles.cardTitle}>
              이슈의 위험도를
              <br />
              <strong style={styles.cardTitleStrong}>수치로 확인합니다.</strong>
            </h3>

            <p style={styles.cardText}>
              기사량과 감성, 확산 정도를 종합하여
              <br />
              현재 이슈의 위험 수준을 분석합니다.
            </p>

            <div
              style={{
                position: "absolute",
                left: "34px",
                right: "34px",
                bottom: "42px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <strong
                  style={{
                    fontSize: "52px",
                    lineHeight: 1,
                    letterSpacing: "-0.06em",
                    color: "var(--wf-score)",
                  }}
                >
                  84
                </strong>
                <span
                  style={{
                    marginLeft: "5px",
                    fontSize: "12px",
                    color: "var(--wf-score-unit)",
                  }}
                >
                  /100
                </span>
              </div>

              <div
                style={{
                  height: "4px",
                  marginTop: "16px",
                  borderRadius: "10px",
                  background: "var(--wf-bar-bg)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "84%",
                    height: "100%",
                    borderRadius: "10px",
                    background: "var(--wf-bar-fill)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "7px",
                  fontSize: "8px",
                  color: "var(--wf-scale)",
                }}
              >
                <span>낮음</span>
                <span>보통</span>
                <strong style={{ color: "var(--wf-scale-active)" }}>
                  높음
                </strong>
              </div>
            </div>

            <div style={styles.footer}>
              <span>RISK ANALYSIS</span>
              <span>02</span>
            </div>
          </article>

          {/* 03. RESPONSE */}
          <article
            style={{
              ...styles.card,
              ...styles.sideCard,
            }}
          >
            <span style={styles.number}>03</span>
            <span style={styles.category}>RESPONSE</span>

            <h3 style={styles.cardTitle}>
              분석 결과를 바탕으로
              <br />
              <strong style={styles.cardTitleStrong}>대응을 준비합니다.</strong>
            </h3>

            <p
              style={{
                ...styles.cardText,
                margin: "16px 0 0",
                lineHeight: 1.7,
              }}
            >
              과거 유사 사례와 분석 결과를 참고하여
              <br />
              상황에 맞는 대응 자료를 작성합니다.
            </p>

            <div
              style={{
                marginTop: "18px",
                marginBottom: "48px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--wf-label)",
                }}
              >
                <span>RESPONSE MATERIAL</span>
                <span style={{ color: "var(--wf-ready)" }}>READY</span>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  border: "1px solid var(--wf-doc-border)",
                  borderRadius: "12px",
                  background: "var(--wf-doc-bg)",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--wf-doc-title)",
                  }}
                >
                  언론 대응 자료
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "85%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "var(--wf-doc-line)",
                    }}
                  />
                  <span
                    style={{
                      width: "100%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "var(--wf-doc-line)",
                    }}
                  />
                  <span
                    style={{
                      width: "70%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "var(--wf-doc-line)",
                    }}
                  />
                  <span
                    style={{
                      width: "90%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "var(--wf-doc-line)",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "9px",
                    color: "var(--wf-ready)",
                  }}
                >
                  ✓ 초안 생성 완료
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <span>STRATEGIC RESPONSE</span>
              <span>03</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
