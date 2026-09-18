function WorkflowSection() {
  return (
    <section className="section workflow-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-label">WORKFLOW</span>
          <h2>
            탐색부터 대응까지
            <br />
            이어지는 워크플로우
          </h2>
        </div>

        <div className="bento-grid">
          {/* 01. Intelligence */}
          <article className="workflow-card intelligence-card">
            <header className="card-header">
              <span className="workflow-number">01</span>
              <h3>뉴스·이슈 인텔리전스</h3>
            </header>

            <p className="card-desc">
              다양한 채널의 뉴스를 수집하고, 유사 맥락을 하나의 이슈로 묶어
              탐색을 단순화합니다.
            </p>

            <div className="issue-visual" aria-hidden="true">
              <div className="news-stack">
                <div className="news-item">
                  <span>NEWS 01</span>
                  <p>공급망 관련 신규 보도</p>
                </div>
                <div className="news-item">
                  <span>NEWS 02</span>
                  <p>생산 차질 가능성 언급</p>
                </div>
                <div className="news-item">
                  <span>NEWS 03</span>
                  <p>주요 관계사 대응 발표</p>
                </div>
              </div>

              <div className="merge-indicator">
                <span className="merge-line" />
                <span className="merge-dot" />
              </div>

              <div className="issue-result">
                <span className="issue-tag">ISSUE #12</span>
                <strong>공급망 리스크</strong>
                <small>관련 기사 42건</small>
              </div>
            </div>
          </article>

          {/* 02. Risk */}
          <article className="workflow-card risk-card">
            <header className="card-header">
              <span className="workflow-number">02</span>
              <h3>위험도 정량 분석</h3>
            </header>

            <p className="card-desc">
              기사량, 부정 비율, 지속기간과 확산 흐름을 분석해 위험도를 수치와
              단계로 제시합니다.
            </p>

            <div className="risk-visual">
              <div className="risk-score">
                <span className="score-label">RISK SCORE</span>
                <div className="score-value">
                  <strong>84</strong>
                  <small>/100</small>
                </div>
              </div>

              <div className="risk-track">
                <div className="risk-progress" style={{ width: "84%" }} />
              </div>

              <div className="trend-bars" aria-hidden="true">
                {[26, 34, 31, 46, 52, 62, 74, 86].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </article>

          {/* 03. Response */}
          <article className="workflow-card response-card">
            <header className="card-header">
              <span className="workflow-number">03</span>
              <h3>AI 전략 대응 센터</h3>
            </header>

            <p className="card-desc">
              분석된 이슈와 근거 자료를 바탕으로 과거 사례를 비교하고 상황별
              대응 초안을 생성합니다.
            </p>

            <div className="response-visual" aria-hidden="true">
              <div className="response-tool">
                <span className="tool-label">과거 사례 시뮬레이터</span>
                <strong>유사 사례 8건 분석</strong>
                <small>평균 대응 기간 3.4일</small>
              </div>

              <div className="response-tool document-preview">
                <span className="tool-label">대응자료 생성</span>
                <div className="document-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <small className="completed">초안 생성 완료</small>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
