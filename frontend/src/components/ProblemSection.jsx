import { problemItems } from "../data/landingData";

function ProblemSection() {
  return (
    <section
      className="section problem-section dtect-problem"
      style={{
        padding: "120px 0",
        background: "var(--prob-bg)",
      }}
    >
      <style>{`
        .dtect-problem {
          --prob-bg: #f8fafc;
          --prob-primary: #2563eb;
          --prob-title: #111827;
          --prob-title-muted: #6b7280;
          --prob-muted: #6b7280;
          --prob-card-bg: #ffffff;
          --prob-card-border: #e5e7eb;
          --prob-card-shadow: rgba(15, 23, 42, 0.04);
          --prob-card-shadow-hover: rgba(15, 23, 42, 0.08);
          --prob-bg-number: #f1f5f9;
          --prob-badge-bg: #eff6ff;
          --prob-badge-text: #2563eb;
          --prob-accent: #2563eb;
        }

        :root[data-theme="dark"] .dtect-problem {
          --prob-bg: #0f1621;
          --prob-primary: #4c9cff;
          --prob-title: #eef3fb;
          --prob-title-muted: #8a96a8;
          --prob-muted: #8a96a8;
          --prob-card-bg: #141b27;
          --prob-card-border: #263142;
          --prob-card-shadow: rgba(0, 0, 0, 0.25);
          --prob-card-shadow-hover: rgba(0, 0, 0, 0.4);
          --prob-bg-number: #1a2332;
          --prob-badge-bg: #172a43;
          --prob-badge-text: #4c9cff;
          --prob-accent: #4c9cff;
        }

        @media (max-width: 900px) {
          .dtect-problem .problem-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        className="container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* 제목 */}
        <div
          className="section-heading"
          style={{
            marginBottom: "60px",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.15em",
              color: "var(--prob-primary)",
            }}
          >
            WHY D:TECT
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: "1.2",
              fontWeight: "700",
              letterSpacing: "-0.04em",
              color: "var(--prob-title)",
            }}
          >
            단순 탐색에 뺏기는
            <br />
            <span style={{ color: "var(--prob-title-muted)" }}>
              시간을 줄이세요
            </span>
          </h2>
        </div>

        {/* 카드 */}
        <div
          className="problem-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {problemItems.map((item, index) => (
            <article
              className="problem-card"
              key={item.number}
              style={{
                position: "relative",
                minHeight: "260px",
                padding: "32px",
                borderRadius: "20px",
                background: "var(--prob-card-bg)",
                border: "1px solid var(--prob-card-border)",
                boxShadow: "0 8px 30px var(--prob-card-shadow)",
                overflow: "hidden",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 40px var(--prob-card-shadow-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px var(--prob-card-shadow)";
              }}
            >
              {/* 배경 숫자 */}
              <span
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "24px",
                  fontSize: "70px",
                  fontWeight: "800",
                  lineHeight: "1",
                  color: "var(--prob-bg-number)",
                  zIndex: 0,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* 번호 */}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  marginBottom: "40px",
                  borderRadius: "10px",
                  background: "var(--prob-badge-bg)",
                  color: "var(--prob-badge-text)",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* 제목 */}
              <h3
                style={{
                  position: "relative",
                  zIndex: 1,
                  margin: "0 0 14px",
                  fontSize: "22px",
                  lineHeight: "1.4",
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                  color: "var(--prob-title)",
                }}
              >
                {item.title.map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < item.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>

              {/* 설명 */}
              <p
                style={{
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: "1.7",
                  color: "var(--prob-muted)",
                  wordBreak: "keep-all",
                }}
              >
                {item.description}
              </p>

              {/* 하단 포인트 */}
              <span
                style={{
                  position: "absolute",
                  left: "32px",
                  bottom: 0,
                  width: "40px",
                  height: "3px",
                  background: "var(--prob-accent)",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
