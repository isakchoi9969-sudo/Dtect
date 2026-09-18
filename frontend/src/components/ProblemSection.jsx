import { problemItems } from "../data/landingData";

function ProblemSection() {
  return (
    <section
      className="section problem-section"
      style={{
        padding: "120px 0",
        background: "#f8fafc",
      }}
    >
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
              color: "#2563eb",
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
              color: "#111827",
            }}
          >
            단순 탐색에 뺏기는
            <br />
            <span style={{ color: "#6b7280" }}>시간을 줄이세요</span>
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
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
                overflow: "hidden",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 40px rgba(15, 23, 42, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(15, 23, 42, 0.04)";
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
                  color: "#f1f5f9",
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
                  background: "#eff6ff",
                  color: "#2563eb",
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
                  color: "#111827",
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
                  color: "#6b7280",
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
                  background: "#2563eb",
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
