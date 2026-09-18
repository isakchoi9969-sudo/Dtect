function WorkflowSection() {
  const styles = {
    section: {
      padding: "120px 0",
      background: "#ffffff",
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
      color: "#2563eb",
    },

    title: {
      margin: 0,
      fontSize: "clamp(38px, 4vw, 58px)",
      lineHeight: 1.15,
      letterSpacing: "-0.055em",
      fontWeight: 700,
      color: "#111827",
    },

    titleMuted: {
      color: "#9ca3af",
    },

    subtitle: {
      marginTop: "22px",
      fontSize: "15px",
      lineHeight: 1.8,
      color: "#6b7280",
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
      border: "1px solid #e5e7eb",
      borderRadius: "24px",
      background: "#ffffff",
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
      color: "#a1a8b3",
    },

    category: {
      display: "block",
      marginBottom: "16px",
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.15em",
      color: "#9ca3af",
    },

    cardTitle: {
      margin: 0,
      fontSize: "28px",
      lineHeight: 1.35,
      letterSpacing: "-0.045em",
      fontWeight: 500,
      color: "#374151",
    },

    cardTitleStrong: {
      fontWeight: 700,
      color: "#111827",
    },

    cardText: {
      margin: "18px 0 0",
      fontSize: "13px",
      lineHeight: 1.8,
      color: "#6b7280",
    },

    footer: {
      position: "absolute",
      left: "34px",
      right: "34px",
      bottom: "22px",
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "15px",
      borderTop: "1px solid #eef0f2",
      fontSize: "8px",
      fontWeight: 700,
      letterSpacing: "0.12em",
      color: "#a5abb4",
    },
  };

  return (
    <section style={styles.section}>
      <div className="container">
        {/* =========================
            SECTION HEADER
        ========================== */}

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

        {/* =========================
            WORKFLOW GRID
        ========================== */}

        <div style={styles.grid}>
          {/* =================================
              01. ISSUE DETECTION
          ================================= */}

          <article
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

            {/* NEWS VISUAL */}

            <div
              style={{
                marginTop: "42px",
                padding: "24px",
                borderRadius: "18px",
                background: "#f7f8fa",
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
                  background: "#ffffff",
                  border: "1px solid #e8eaee",
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
                      background: "#2563eb",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#9ca3af",
                      }}
                    >
                      ECONOMY
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                      }}
                    >
                      공급망 관련 신규 보도
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "9px",
                    color: "#b6bbc3",
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
                  background: "#ffffff",
                  border: "1px solid #e8eaee",
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
                      background: "#93c5fd",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#9ca3af",
                      }}
                    >
                      INDUSTRY
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                      }}
                    >
                      생산 차질 가능성 언급
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "9px",
                    color: "#b6bbc3",
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
                  background: "#ffffff",
                  border: "1px solid #e8eaee",
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
                      background: "#cbd5e1",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#9ca3af",
                      }}
                    >
                      COMPANY
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                      }}
                    >
                      주요 관계사 대응 발표
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "9px",
                    color: "#b6bbc3",
                  }}
                >
                  08:56
                </span>
              </div>

              {/* Connection */}

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
                    background: "#cbd5e1",
                  }}
                />

                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#cbd5e1",
                  }}
                />

                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#cbd5e1",
                  }}
                />
              </div>

              {/* Result */}

              <div
                style={{
                  padding: "22px",
                  borderRadius: "12px",
                  background: "#111827",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.13em",
                    color: "#93c5fd",
                  }}
                >
                  DETECTED ISSUE
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  공급망 리스크
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "10px",
                    color: "#9ca3af",
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

          {/* =================================
              02. RISK ANALYSIS
          ================================= */}

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

            {/* Risk Score */}

            <div
              style={{
                position: "absolute",
                left: "34px",
                right: "34px",
                bottom: "42px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <strong
                  style={{
                    fontSize: "52px",
                    lineHeight: 1,
                    letterSpacing: "-0.06em",
                    color: "#111827",
                  }}
                >
                  84
                </strong>

                <span
                  style={{
                    marginLeft: "5px",
                    fontSize: "12px",
                    color: "#9ca3af",
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
                  background: "#edf0f3",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "84%",
                    height: "100%",
                    borderRadius: "10px",
                    background: "#2563eb",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "7px",
                  fontSize: "8px",
                  color: "#a5abb4",
                }}
              >
                <span>낮음</span>
                <span>보통</span>

                <strong
                  style={{
                    color: "#2563eb",
                  }}
                >
                  높음
                </strong>
              </div>
            </div>

            <div style={styles.footer}>
              <span>RISK ANALYSIS</span>
              <span>02</span>
            </div>
          </article>

          {/* =================================
    03. RESPONSE
================================= */}

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

            {/* Response Document */}

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
                  color: "#9ca3af",
                }}
              >
                <span>RESPONSE MATERIAL</span>

                <span
                  style={{
                    color: "#16a34a",
                  }}
                >
                  READY
                </span>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
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
                      background: "#dfe3e8",
                    }}
                  />

                  <span
                    style={{
                      width: "100%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "#dfe3e8",
                    }}
                  />

                  <span
                    style={{
                      width: "70%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "#dfe3e8",
                    }}
                  />

                  <span
                    style={{
                      width: "90%",
                      height: "4px",
                      borderRadius: "4px",
                      background: "#dfe3e8",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "9px",
                    color: "#16a34a",
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
