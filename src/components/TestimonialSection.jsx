import { testimonials } from "../data/landingData";

function TestimonialSection() {
  return (
    <section className="section testimonial-section">
      <div className="container">
        <div className="section-heading centered">
          <span>EXPECTED VALUE</span>

          <h2>
            효율적인 판단을 돕는
            <br />
            결정적 도구
          </h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <span className="demo-label">활용 예시</span>

              <blockquote>“{testimonial.quote}”</blockquote>

              <div className="testimonial-user">
                <div className="avatar">{testimonial.name.charAt(0)}</div>

                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
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
