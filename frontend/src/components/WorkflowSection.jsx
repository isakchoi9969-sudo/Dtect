import React from "react";

function WorkflowSection() {
  const newsItems = [
    {
      category: "ECONOMY",
      title: "공급망 관련 신규 보도",
      time: "09:42",
      tone: "strong",
    },
    {
      category: "INDUSTRY",
      title: "생산 차질 가능성 언급",
      time: "09:18",
      tone: "mid",
    },
    {
      category: "COMPANY",
      title: "주요 관계사 대응 발표",
      time: "08:56",
      tone: "weak",
    },
  ];

  const documentLines = ["85%", "100%", "70%", "90%"];

  return (
    <section className="dtect-workflow">
      <style>{`
        .dtect-workflow {
          --wf-bg: #fff;
          --wf-primary: #2563eb;
          --wf-title: #111827;
          --wf-title-muted: #9ca3af;
          --wf-muted: #6b7280;
          --wf-border: #e6e9ee;
          --wf-card-bg: #fff;
          --wf-panel-bg: #f6f8fb;
          --wf-news-bg: #fff;
          --wf-news-border: #e8ebf0;
          --wf-news-text: #374151;
          --wf-news-time: #aeb5c0;
          --wf-label: #98a1af;
          --wf-number: #a7afbb;
          --wf-card-title: #374151;
          --wf-footer: #a2aab5;
          --wf-result-bg: #111827;
          --wf-result-label: #93c5fd;
          --wf-result-title: #fff;
          --wf-result-meta: #9ca3af;
          --wf-score: #111827;
          --wf-score-unit: #9ca3af;
          --wf-bar-bg: #edf0f4;
          --wf-bar-fill: #2563eb;
          --wf-scale: #a5abb4;
          --wf-ready: #16a34a;
          --wf-doc-bg: #f8fafc;
          --wf-doc-border: #e5e7eb;
          --wf-doc-title: #374151;
          --wf-doc-line: #dfe3e8;

          padding: 88px 0;
          background: var(--wf-bg);
          color: var(--wf-title);
        }

        :root[data-theme="dark"] .dtect-workflow {
          --wf-bg: #0c111b;
          --wf-primary: #4c9cff;
          --wf-title: #eef3fb;
          --wf-title-muted: #7f8a9c;
          --wf-muted: #8a96a8;
          --wf-border: #263142;
          --wf-card-bg: #141b27;
          --wf-panel-bg: #101722;
          --wf-news-bg: #111824;
          --wf-news-border: #263142;
          --wf-news-text: #d5deeb;
          --wf-news-time: #6b7789;
          --wf-label: #7f8a9c;
          --wf-number: #6b7789;
          --wf-card-title: #c5d0e0;
          --wf-footer: #6b7789;
          --wf-result-bg: #0a1018;
          --wf-result-label: #8bc6ff;
          --wf-result-title: #eef3fb;
          --wf-result-meta: #7f8a9c;
          --wf-score: #eef3fb;
          --wf-score-unit: #7f8a9c;
          --wf-bar-bg: #263142;
          --wf-bar-fill: #4c9cff;
          --wf-scale: #6b7789;
          --wf-ready: #34d399;
          --wf-doc-bg: #101722;
          --wf-doc-border: #263142;
          --wf-doc-title: #d5deeb;
          --wf-doc-line: #2b394b;
        }

        .dtect-workflow {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        .dtect-workflow::before {
          position: absolute;
          top: 8%;
          left: 50%;
          z-index: -1;
          width: min(62vw, 760px);
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--wf-primary) 8%, transparent), transparent 68%);
          content: "";
          pointer-events: none;
          transform: translateX(-50%);
          animation: wf-glow-breathe 8s ease-in-out infinite;
        }

        @keyframes wf-glow-breathe {
          0%, 100% { opacity: .55; transform: translateX(-50%) scale(.94); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.06); }
        }

        @keyframes wf-rise-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes wf-flow-dot {
          0%, 100% { opacity: .28; transform: translateY(-2px); }
          45% { opacity: 1; transform: translateY(2px); }
        }

        @keyframes wf-dot-pulse {
          0%, 100% { opacity: .72; transform: scale(.86); }
          50% { opacity: 1; transform: scale(1.18); }
        }

        @keyframes wf-fill-bar {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }

        @keyframes wf-line-draw {
          from { opacity: 0; transform: scaleX(0); transform-origin: left; }
          to { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }

        @keyframes wf-result-glint {
          from { transform: translateX(-130%); }
          to { transform: translateX(150%); }
        }

        .dtect-workflow .wf-heading {
          margin: 0 auto 42px;
          max-width: 1180px;
          padding: 0 24px;
          animation: wf-rise-in .75s cubic-bezier(.22, 1, .36, 1) both;
        }

        .dtect-workflow .wf-label,
        .dtect-workflow .wf-category {
          display: block;
          color: var(--wf-primary);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
          line-height: 1;
        }

        .dtect-workflow .wf-label { margin-bottom: 14px; }

        .dtect-workflow .wf-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 700;
          letter-spacing: -.065em;
          line-height: 1.12;
        }

        .dtect-workflow .wf-title-muted { color: var(--wf-title-muted); }

        .dtect-workflow .wf-subtitle {
          margin: 16px 0 0;
          color: var(--wf-muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .dtect-workflow .wf-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.28fr) minmax(240px, .86fr) minmax(240px, .86fr);
          gap: 14px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .dtect-workflow .wf-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          padding: 25px;
          border: 1px solid var(--wf-border);
          border-radius: 18px;
          background: var(--wf-card-bg);
          box-sizing: border-box;
          opacity: 0;
          animation: wf-rise-in .8s cubic-bezier(.22, 1, .36, 1) forwards;
          transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
        }

        .dtect-workflow .wf-card:nth-child(1) { animation-delay: .16s; }
        .dtect-workflow .wf-card:nth-child(2) { animation-delay: .3s; }
        .dtect-workflow .wf-card:nth-child(3) { animation-delay: .44s; }
        .dtect-workflow .wf-card:hover {
          border-color: color-mix(in srgb, var(--wf-primary) 36%, var(--wf-border));
          box-shadow: 0 16px 34px color-mix(in srgb, var(--wf-primary) 10%, transparent);
          transform: translateY(-5px);
        }

        .dtect-workflow .wf-card-main {
          grid-row: span 2;
          min-height: 430px;
        }

        .dtect-workflow .wf-card-side {
          min-height: 208px;
        }

        .dtect-workflow .wf-number {
          position: absolute;
          top: 25px;
          right: 25px;
          color: var(--wf-number);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          transition: color .3s ease, transform .3s ease;
        }

        .dtect-workflow .wf-card:hover .wf-number { color: var(--wf-primary); transform: translateY(-2px); }

        .dtect-workflow .wf-category { margin-bottom: 13px; color: var(--wf-label); font-size: 9px; }

        .dtect-workflow .wf-card-title {
          margin: 0;
          color: var(--wf-card-title);
          font-size: 23px;
          font-weight: 500;
          letter-spacing: -.055em;
          line-height: 1.27;
        }

        .dtect-workflow .wf-card-title strong { color: var(--wf-title); font-weight: 750; }

        .dtect-workflow .wf-card-text {
          margin: 12px 0 0;
          color: var(--wf-muted);
          font-size: 12px;
          line-height: 1.65;
        }

        .dtect-workflow .wf-feed {
          display: grid;
          gap: 6px;
          margin-top: 28px;
          padding: 15px;
          border-radius: 14px;
          background: var(--wf-panel-bg);
        }

        .dtect-workflow .wf-news {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 12px;
          border: 1px solid var(--wf-news-border);
          border-radius: 9px;
          background: var(--wf-news-bg);
          transition: transform .25s ease, border-color .25s ease;
        }

        .dtect-workflow .wf-news:hover { border-color: color-mix(in srgb, var(--wf-primary) 35%, var(--wf-news-border)); transform: translateX(4px); }

        .dtect-workflow .wf-news-main { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .dtect-workflow .wf-dot { width: 5px; height: 5px; flex: 0 0 auto; border-radius: 50%; background: #cbd5e1; animation: wf-dot-pulse 2.4s ease-in-out infinite; }
        .dtect-workflow .wf-dot-strong { background: var(--wf-primary); }
        .dtect-workflow .wf-dot-mid { background: #93c5fd; }
        .dtect-workflow .wf-news-category { margin-bottom: 3px; color: var(--wf-label); font-size: 7px; font-weight: 800; letter-spacing: .1em; }
        .dtect-workflow .wf-news-title { overflow: hidden; color: var(--wf-news-text); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
        .dtect-workflow .wf-news-time { flex: 0 0 auto; color: var(--wf-news-time); font-size: 8px; }
        .dtect-workflow .wf-connect { display: flex; justify-content: center; gap: 4px; padding: 5px 0 1px; }
        .dtect-workflow .wf-connect span { width: 3px; height: 3px; border-radius: 50%; background: #cbd5e1; animation: wf-flow-dot 1.4s ease-in-out infinite; }
        .dtect-workflow .wf-connect span:nth-child(2) { animation-delay: .18s; }
        .dtect-workflow .wf-connect span:nth-child(3) { animation-delay: .36s; }

        .dtect-workflow .wf-result {
          position: relative;
          overflow: hidden;
          margin-top: 1px;
          padding: 16px;
          border-radius: 10px;
          background: var(--wf-result-bg);
        }

        .dtect-workflow .wf-result::after {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 28%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
          content: "";
          animation: wf-result-glint 3.8s ease-in-out 1.2s infinite;
        }

        .dtect-workflow .wf-result-label { margin-bottom: 7px; color: var(--wf-result-label); font-size: 7px; font-weight: 800; letter-spacing: .13em; }
        .dtect-workflow .wf-result-title { color: var(--wf-result-title); font-size: 16px; font-weight: 750; letter-spacing: -.03em; }
        .dtect-workflow .wf-result-meta { margin-top: 5px; color: var(--wf-result-meta); font-size: 9px; }

        .dtect-workflow .wf-score-wrap { margin-top: 25px; }
        .dtect-workflow .wf-score { color: var(--wf-score); font-size: 45px; font-weight: 750; letter-spacing: -.07em; line-height: 1; }
        .dtect-workflow .wf-score-unit { margin-left: 4px; color: var(--wf-score-unit); font-size: 11px; }
        .dtect-workflow .wf-bar { height: 4px; margin-top: 12px; overflow: hidden; border-radius: 99px; background: var(--wf-bar-bg); }
        .dtect-workflow .wf-bar-fill { width: 84%; height: 100%; border-radius: inherit; background: var(--wf-bar-fill); animation: wf-fill-bar 1.3s cubic-bezier(.22, 1, .36, 1) .75s both; }
        .dtect-workflow .wf-scale { display: flex; justify-content: space-between; margin-top: 6px; color: var(--wf-scale); font-size: 7px; }
        .dtect-workflow .wf-scale strong { color: var(--wf-primary); }

        .dtect-workflow .wf-document { margin-top: 20px; }
        .dtect-workflow .wf-document-head { display: flex; justify-content: space-between; margin-bottom: 7px; color: var(--wf-label); font-size: 7px; font-weight: 800; letter-spacing: .1em; }
        .dtect-workflow .wf-ready { color: var(--wf-ready); }
        .dtect-workflow .wf-document-body { padding: 12px 13px; border: 1px solid var(--wf-doc-border); border-radius: 10px; background: var(--wf-doc-bg); }
        .dtect-workflow .wf-document-title { margin-bottom: 9px; color: var(--wf-doc-title); font-size: 12px; font-weight: 750; }
        .dtect-workflow .wf-lines { display: grid; gap: 5px; }
        .dtect-workflow .wf-line { height: 3px; border-radius: 99px; background: var(--wf-doc-line); animation: wf-line-draw .55s cubic-bezier(.22, 1, .36, 1) both; }
        .dtect-workflow .wf-line:nth-child(1) { animation-delay: .78s; }
        .dtect-workflow .wf-line:nth-child(2) { animation-delay: .9s; }
        .dtect-workflow .wf-line:nth-child(3) { animation-delay: 1.02s; }
        .dtect-workflow .wf-line:nth-child(4) { animation-delay: 1.14s; }
        .dtect-workflow .wf-document-status { margin-top: 9px; color: var(--wf-ready); font-size: 8px; }

        .dtect-workflow .wf-footer { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 12px; border-top: 1px solid var(--wf-border); color: var(--wf-footer); font-size: 7px; font-weight: 800; letter-spacing: .1em; }

        @media (max-width: 900px) {
          .dtect-workflow { padding: 68px 0; }
          .dtect-workflow .wf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dtect-workflow .wf-card-main { grid-row: span 2; }
        }

        @media (max-width: 620px) {
          .dtect-workflow .wf-heading { margin-bottom: 30px; padding: 0 18px; }
          .dtect-workflow .wf-grid { grid-template-columns: 1fr; gap: 10px; padding: 0 18px; }
          .dtect-workflow .wf-card-main, .dtect-workflow .wf-card-side { min-height: auto; }
          .dtect-workflow .wf-card { padding: 21px; }
          .dtect-workflow .wf-card-main { grid-row: auto; }
          .dtect-workflow .wf-number { top: 21px; right: 21px; }
          .dtect-workflow .wf-score-wrap { margin-top: 22px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dtect-workflow *, .dtect-workflow::before {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="wf-heading">
        <span className="wf-label">WORKFLOW</span>
        <h2 className="wf-title">
          복잡한 이슈를 발견하고,
          <br />
          <span className="wf-title-muted">대응까지 연결합니다.</span>
        </h2>
        <p className="wf-subtitle">
          뉴스 수집부터 위험도 분석, 대응 자료 작성까지
          <br />
          기업 이슈에 필요한 모든 과정을 하나의 흐름으로 제공합니다.
        </p>
      </div>

      <div className="wf-grid">
        <article className="wf-card wf-card-main">
          <span className="wf-number">01</span>
          <span className="wf-category">ISSUE DETECTION</span>
          <h3 className="wf-card-title">
            뉴스에서
            <br />
            <strong>하나의 이슈를 발견합니다.</strong>
          </h3>
          <p className="wf-card-text">
            다양한 채널에서 수집된 뉴스를 분석하고
            <br />
            유사한 맥락의 기사들을 하나의 이슈로 연결합니다.
          </p>

          <div className="wf-feed">
            {newsItems.map((item, index) => (
              <React.Fragment key={item.category}>
                <div className="wf-news">
                  <div className="wf-news-main">
                    <span className={`wf-dot wf-dot-${item.tone}`} />
                    <div>
                      <div className="wf-news-category">{item.category}</div>
                      <div className="wf-news-title">{item.title}</div>
                    </div>
                  </div>
                  <span className="wf-news-time">{item.time}</span>
                </div>
                {index < newsItems.length - 1 && (
                  <div className="wf-connect">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="wf-result">
              <div className="wf-result-label">DETECTED ISSUE</div>
              <div className="wf-result-title">공급망 리스크</div>
              <div className="wf-result-meta">관련 기사 42건</div>
            </div>
          </div>
          <div className="wf-footer">
            <span>ISSUE DETECTION</span>
            <span>01</span>
          </div>
        </article>

        <article className="wf-card wf-card-side">
          <span className="wf-number">02</span>
          <span className="wf-category">RISK ANALYSIS</span>
          <h3 className="wf-card-title">
            이슈의 위험도를
            <br />
            <strong>수치로 확인합니다.</strong>
          </h3>
          <p className="wf-card-text">
            기사량과 감성, 확산 정도를 종합하여
            <br />
            현재 이슈의 위험 수준을 분석합니다.
          </p>
          <div className="wf-score-wrap">
            <strong className="wf-score">84</strong>
            <span className="wf-score-unit">/100</span>
            <div className="wf-bar">
              <div className="wf-bar-fill" />
            </div>
            <div className="wf-scale">
              <span>낮음</span>
              <span>보통</span>
              <strong>높음</strong>
            </div>
          </div>
          <div className="wf-footer">
            <span>RISK ANALYSIS</span>
            <span>02</span>
          </div>
        </article>

        <article className="wf-card wf-card-side">
          <span className="wf-number">03</span>
          <span className="wf-category">RESPONSE</span>
          <h3 className="wf-card-title">
            분석 결과를 바탕으로
            <br />
            <strong>대응을 준비합니다.</strong>
          </h3>
          <p className="wf-card-text">
            과거 유사 사례와 분석 결과를 참고하여
            <br />
            상황에 맞는 대응 자료를 작성합니다.
          </p>
          <div className="wf-document">
            <div className="wf-document-head">
              <span>RESPONSE MATERIAL</span>
              <span className="wf-ready">READY</span>
            </div>
            <div className="wf-document-body">
              <div className="wf-document-title">언론 대응 자료</div>
              <div className="wf-lines">
                {documentLines.map((width) => (
                  <span key={width} className="wf-line" style={{ width }} />
                ))}
              </div>
              <div className="wf-document-status">✓ 초안 생성 완료</div>
            </div>
          </div>
          <div className="wf-footer">
            <span>STRATEGIC RESPONSE</span>
            <span>03</span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default WorkflowSection;
