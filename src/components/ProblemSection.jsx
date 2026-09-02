import { problemItems } from "../data/landingData";

function ProblemSection() {
  return (
    <section className="section problem-section">
      <div className="container">
        <div className="section-heading">
          <span>WHY D:TECT</span>

          <h2>
            단순 탐색에 뺏기는
            <br />
            시간을 줄이세요
          </h2>
        </div>

        <div className="problem-grid">
          {problemItems.map((item) => (
            <article className="problem-card" key={item.number}>
              <span className="card-number">{item.number}</span>

              <h3>
                {item.title.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < item.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
