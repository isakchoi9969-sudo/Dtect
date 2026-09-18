import { testimonials } from "../data/landingData";

function TestimonialSection() {
  return (
    <section
      className="section testimonial-section"
      style={{
        padding: "130px 0",
        background: "#f7f8fa",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Section Heading */}
        <div
          className="section-heading centered"
          style={{
            textAlign: "center",
            marginBottom: "68px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              marginBottom: "18px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#2563eb",
            }}
          >
            EXPECTED VALUE
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: "42px",
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            효율적인 판단을 돕는
            <br />
            <span style={{ color: "#2563eb" }}>결정적 도구</span>
          </h2>

          <p
            style={{
              margin: "22px auto 0",
              maxWidth: "560px",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "#6b7280",
            }}
          >
            복잡한 기업 이슈를 빠르게 파악하고
            <br />
            대응 방향을 결정할 수 있도록 돕습니다.
          </p>
        </div>

        {/* Cards */}
        <div
          className="testimonial-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              testimonials.length === 1
                ? "minmax(0, 720px)"
                : "repeat(2, minmax(0, 1fr))",
            justifyContent: "center",
            gap: "22px",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <article
              className="testimonial-card"
              key={testimonial.name}
              style={{
                position: "relative",
                padding: "38px 38px 34px",
                background: "#ffffff",
                border: "1px solid #e8ebf0",
                borderRadius: "20px",
                boxShadow: "0 10px 35px rgba(15, 23, 42, 0.05)",
                overflow: "hidden",
                transition: "all 0.25s ease",
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "3px",
                  background:
                    index % 2 === 0
                      ? "linear-gradient(90deg, #2563eb, #60a5fa)"
                      : "linear-gradient(90deg, #0f172a, #64748b)",
                }}
              />

              {/* Label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "30px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 11px",
                    borderRadius: "7px",
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#2563eb",
                    }}
                  />
                  활용 예시
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  0{index + 1}
                </span>
              </div>

              {/* Quote */}
              <blockquote
                style={{
                  position: "relative",
                  margin: 0,
                  padding: "0 0 34px",
                  minHeight: "150px",
                  fontSize: "21px",
                  lineHeight: 1.65,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  color: "#1e293b",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontFamily: "Georgia, serif",
                    fontSize: "48px",
                    lineHeight: 0.6,
                    fontWeight: 700,
                    color: "#dbeafe",
                  }}
                >
                  “
                </span>

                {testimonial.quote}
              </blockquote>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#eef0f3",
                  marginBottom: "24px",
                }}
              />

              {/* User */}
              <div
                className="testimonial-user"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                }}
              >
                <div
                  className="avatar"
                  style={{
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    background: "#111827",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {testimonial.name.charAt(0)}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {testimonial.name}
                  </strong>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
