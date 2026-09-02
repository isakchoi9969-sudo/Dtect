import { ROUTES } from "../config/routes";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-content">
        <p className="eyebrow">AI Corporate Intelligence Platform</p>

        <h1>
          <span className="highlight">기업 동향</span> 파악부터
          <br />
          <span className="highlight">대응 전략</span>까지, 한 번에
        </h1>

        <h2>이슈 탐색을 넘어, 대응 전략까지 설계하는 AI</h2>

        <p className="hero-description">
          D:TECT는 파편화된 뉴스를 의미 있는 이슈로 구조화합니다. 감성, 위험도,
          시장 반응을 데이터로 시각화하고 실무에 즉시 투입 가능한 대응 초안을
          제안합니다.
        </p>

        <a href={ROUTES.SIGNUP} className="primary-button">
          D:TECT 무료로 시작하기
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
