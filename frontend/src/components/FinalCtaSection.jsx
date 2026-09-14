import { ROUTES } from "../config/routes";

function FinalCtaSection() {
  return (
    <section className="final-cta-section">
      <div className="container final-cta-content">
        <span>START WITH D:TECT</span>

        <h2>
          더 높은 수준의
          <br />
          인텔리전스를
        </h2>

        <p>
          지금 바로 관심 기업을 등록하고, AI가 분석한 기업 동향과 리스크
          리포트를 확인해 보세요.
        </p>

        <a href={ROUTES.SIGNUP} className="primary-button">
          무료 체험 시작하기
        </a>
      </div>
    </section>
  );
}

export default FinalCtaSection;
