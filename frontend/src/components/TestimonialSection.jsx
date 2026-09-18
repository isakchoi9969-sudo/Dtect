import { testimonials } from "../data/landingData";

function TestimonialSection() {
  return (
    <section
      className="section testimonial-section dtect-testimonial"
      style={{
        padding: "130px 0",
        background: "var(--ts-bg)",
      }}
    >
      <style>{`
        .dtect-testimonial {
          --ts-bg: #f7f8fa;
          --ts-primary: #2563eb;
          --ts-title: #111827;
          --ts-muted: #6b7280;
          --ts-card-bg: #ffffff;
          --ts-card-border: #e8ebf0;
          --ts-card-shadow: rgba(15, 23, 42, 0.05);
          --ts-accent-a: linear-gradient(90deg, #2563eb, #60a5fa);
          --ts-accent-b: linear-gradient(90deg, #0f172a, #64748b);
          --ts-label-bg: #f1f5f9;
          --ts-label-text: #475569;
          --ts-label-dot: #2563eb;
          --ts-index: #cbd5e1;
          --ts-quote: #1e293b;
          --ts-quote-mark: #dbeafe;
          --ts-divider: #eef0f3;
          --ts-avatar-bg: #111827;
          --ts-avatar-text: #ffffff;
          --ts-name: #1e293b;
          --ts-role: #94a3b8;
        }

        :root[data-theme="dark"] .dtect-testimonial {
          --ts-bg: #0f1621;
          --ts-primary: #4c9cff;
          --ts-title: #eef3fb;
          --ts-muted: #8a96a8;
          --ts-card-bg: #141b27;
          --ts-card-border: #263142;
          --ts-card-shadow: rgba(0, 0, 0, 0.3);
          --ts-accent-a: linear-gradient(90deg, #4c9cff, #72afff);
          --ts-accent-b: linear-gradient(90deg, #4c9cff, #3a4658);
          --ts-label-bg: #1a2332;
          --ts-label-text: #aeb8c8;
          --ts-label-dot: #4c9cff;
          --ts-index: #4a5568;
          --ts-quote: #e8eef8;
          --ts-quote-mark: #1c3655;
          --ts-divider: #263142;
          --ts-avatar-bg: #1c3655;
          --ts-avatar-text: #8fc5ff;
          --ts-name: #e8eef8;
          --ts-role: #7f8a9c;
        }

        @media (max-width: 800px) {
          .dtect-testimonial .testimonial-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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
              color: "var(--ts-primary)",
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
              color: "var(--ts-title)",
            }}
          >
            효율적인 판단을 돕는
            <br />
            <span style={{ color: "var(--ts-primary)" }}>결정적 도구</span>
          </h2>

          <p
            style={{
              margin: "22px auto 0",
              maxWidth: "560px",
              fontSize: "15px",
              lineHeight: 1.8,
              color: "var(--ts-muted)",
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
                background: "var(--ts-card-bg)",
                border: "1px solid var(--ts-card-border)",
                borderRadius: "20px",
                boxShadow: "0 10px 35px var(--ts-card-shadow)",
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
                      ? "var(--ts-accent-a)"
                      : "var(--ts-accent-b)",
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
                    background: "var(--ts-label-bg)",
                    color: "var(--ts-label-text)",
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
                      background: "var(--ts-label-dot)",
                    }}
                  />
                  활용 예시
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--ts-index)",
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
                  color: "var(--ts-quote)",
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
                    color: "var(--ts-quote-mark)",
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
                  background: "var(--ts-divider)",
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
                    background: "var(--ts-avatar-bg)",
                    color: "var(--ts-avatar-text)",
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
                      color: "var(--ts-name)",
                    }}
                  >
                    {testimonial.name}
                  </strong>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--ts-role)",
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
