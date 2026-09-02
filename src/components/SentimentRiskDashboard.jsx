import { useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const companies = [
  { name: "삼성전자", ticker: "005930", score: 72, delta: 12.4 },
  { name: "SK하이닉스", ticker: "000660", score: 48, delta: -3.1 },
  { name: "현대자동차", ticker: "005380", score: 31, delta: 1.8 },
];

const periods = {
  "7일": [28, 34, 30, 46, 53, 65, 72],
  "30일": [22, 27, 24, 32, 29, 38, 43, 47, 44, 52, 58, 55, 62, 68, 72],
  "3개월": [18, 22, 25, 23, 31, 35, 38, 44, 41, 47, 53, 57, 61, 66, 72],
};

const issues = [
  { level: "높음", title: "반도체 공급망 불확실성 확대", source: "경제 · 산업", mentions: "1,248", time: "2시간 전" },
  { level: "주의", title: "글로벌 규제 강화 가능성", source: "정책 · 규제", mentions: "826", time: "5시간 전" },
  { level: "관찰", title: "신제품 수율 관련 시장 우려", source: "제품 · 기술", mentions: "542", time: "어제" },
];

function Sparkline({ points }) {
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 54 - (value / 100) * 48;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sr-sparkline" viewBox="0 0 100 58" preserveAspectRatio="none" aria-label="리스크 추이 그래프">
      <defs>
        <linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d79ef" stopOpacity=".22" />
          <stop offset="1" stopColor="#2d79ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${coords.replaceAll(" ", " L ")} L 100,58 L 0,58 Z`} fill="url(#riskArea)" />
      <polyline points={coords} fill="none" stroke="#2474e8" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <circle cx="100" cy={54 - (points.at(-1) / 100) * 48} r="2.2" fill="#2474e8" />
    </svg>
  );
}

function SentimentRiskDashboard() {
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [period, setPeriod] = useState("30일");
  const company = companies[selectedCompany];
  const chartPoints = useMemo(
    () => periods[period].map((point) => Math.max(8, point - selectedCompany * 13)),
    [period, selectedCompany],
  );
  const score = Math.max(24, company.score - (period === "7일" ? 4 : period === "3개월" ? 7 : 0));

  return (
    <div className="sr-app">
      <header className="sr-header">
        <a className="sr-brand" href="/" aria-label="D:TECT 홈">D<span>:</span>TECT</a>
        <nav aria-label="주요 메뉴">
          <a href="#overview">대시보드</a>
          <a className="active" href="#analysis">기업 분석</a>
          <a href="#response">AI 대응센터</a>
          <a href="#alerts">알림</a>
        </nav>
        <div className="sr-header-actions">
          <ThemeToggle />
          <button className="sr-icon-button" type="button" aria-label="알림">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            <i />
          </button>
          <div className="sr-avatar">김</div>
          <span className="sr-user">김지훈 님</span>
        </div>
      </header>

      <div className="sr-layout">
        <aside className="sr-sidebar">
          <div className="sr-side-heading">
            <span>WATCHLIST</span>
            <button type="button" aria-label="기업 추가">+</button>
          </div>
          <div className="sr-company-list">
            {companies.map((item, index) => (
              <button
                type="button"
                className={selectedCompany === index ? "selected" : ""}
                onClick={() => setSelectedCompany(index)}
                key={item.ticker}
              >
                <span className="sr-company-mark">{item.name[0]}</span>
                <span><strong>{item.name}</strong><small>{item.ticker} · KOSPI</small></span>
                <i className={item.delta < 0 ? "down" : ""}>{item.delta > 0 ? "+" : ""}{item.delta}%</i>
              </button>
            ))}
          </div>
          <button className="sr-add-company" type="button"><span>+</span> 관심 기업 추가</button>
          <div className="sr-side-footer">
            <a href="#settings">설정</a>
            <a href="#help">도움말</a>
          </div>
        </aside>

        <main className="sr-main" id="analysis">
          <div className="sr-title-row">
            <div>
              <p className="sr-kicker">CORPORATE ANALYSIS</p>
              <h1>감성·리스크 분석</h1>
              <p className="sr-subtitle">뉴스와 온라인 여론을 분석해 기업의 잠재 리스크를 빠르게 파악합니다.</p>
            </div>
            <div className="sr-live"><i /> 실시간 업데이트 <span>방금 전</span></div>
          </div>

          <section className="sr-company-bar">
            <div className="sr-company-logo">{company.name[0]}</div>
            <div><strong>{company.name}</strong><span>{company.ticker} · KOSPI</span></div>
            <span className="sr-industry">반도체 · 전자제품</span>
            <button type="button">기업 상세 <span>→</span></button>
          </section>

          <section className="sr-metric-grid" aria-label="핵심 지표">
            <article className="sr-card sr-score-card">
              <div className="sr-card-head"><span>종합 리스크 지수</span><button title="산정 기준" type="button">i</button></div>
              <div className="sr-score-content">
                <div className="sr-gauge" style={{ "--score": `${score * 3.6}deg` }}><div><strong>{score}</strong><span>/ 100</span></div></div>
                <div className="sr-score-copy"><b>높음</b><p>지난 30일 대비<br /><strong>+{company.delta > 0 ? company.delta : 2.4}%</strong> 상승</p></div>
              </div>
              <div className="sr-risk-legend"><span>낮음</span><span>보통</span><span>주의</span><span>높음</span></div>
            </article>

            <article className="sr-card sr-sentiment-card">
              <div className="sr-card-head"><span>감성 분포</span><small>총 2,616건</small></div>
              <div className="sr-donut" aria-label="부정 54%, 중립 29%, 긍정 17%"><div><strong>54%</strong><span>부정</span></div></div>
              <div className="sr-sentiment-legend">
                <p><i className="negative" /><span>부정</span><strong>1,412</strong><small>54%</small></p>
                <p><i className="neutral" /><span>중립</span><strong>759</strong><small>29%</small></p>
                <p><i className="positive" /><span>긍정</span><strong>445</strong><small>17%</small></p>
              </div>
            </article>

            <article className="sr-card sr-keyword-card">
              <div className="sr-card-head"><span>부정 감성 주요 키워드</span><small>언급량 기준</small></div>
              <div className="sr-keywords">
                <span className="xl">공급망</span><span className="lg">규제</span><span className="md">실적 우려</span>
                <span className="sm">수율</span><span className="lg">불확실성</span><span className="sm">경쟁 심화</span>
                <span className="md">가격 하락</span><span className="sm">투자 감소</span>
              </div>
            </article>
          </section>

          <section className="sr-card sr-summary-card" aria-labelledby="situation-summary-title">
            <div className="sr-summary-top">
              <div className="sr-summary-label">
                <span className="sr-ai-mark" aria-hidden="true">AI</span>
                <div>
                  <span>AI CURRENT SITUATION</span>
                  <h2 id="situation-summary-title">현재 상황 요약</h2>
                </div>
              </div>
              <span className="sr-analysis-range">최근 30일 분석 · 오늘 12:00 기준</span>
            </div>

            <div className="sr-summary-body">
              <div className="sr-summary-copy">
                <strong>
                  공급망 불확실성과 글로벌 규제 이슈가 겹치며 {company.name}의
                  리스크가 <em>{score}점</em>까지 상승했습니다.
                </strong>
                <p>
                  최근 7일간 관련 뉴스가 이전 기간보다 18% 증가했고, 부정 감성
                  비중은 54%로 나타났습니다. 특히 공급망 차질과 규제 강화 가능성을
                  다룬 보도가 빠르게 확산되며 전체 위험도를 끌어올리고 있습니다.
                </p>
              </div>

              <div className="sr-summary-facts" aria-label="핵심 분석 결과">
                <div>
                  <span>분석 뉴스</span>
                  <strong>2,616<small>건</small></strong>
                  <i className="up">+18.0%</i>
                </div>
                <div>
                  <span>부정 감성</span>
                  <strong>54<small>%</small></strong>
                  <i className="up">+8.2%p</i>
                </div>
                <div>
                  <span>확산 속도</span>
                  <strong>1.7<small>배</small></strong>
                  <i className="up">빠른 확산</i>
                </div>
              </div>
            </div>

            <div className="sr-summary-bottom">
              <div className="sr-summary-topic">
                <span>리스크 상승 핵심 요인</span>
                <p><b>01</b> 반도체 공급망 불확실성</p>
                <p><b>02</b> 글로벌 규제 강화 가능성</p>
                <p><b>03</b> 신제품 수율 관련 우려</p>
              </div>
              <div className="sr-watch-point">
                <span>향후 관찰 포인트</span>
                <p>
                  주요국의 반도체 규제 발표와 협력사 생산 정상화 여부에 따라
                  단기 리스크가 추가 상승할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          <section className="sr-card sr-trend-card">
            <div className="sr-card-head">
              <div><span>리스크 추이</span><small>뉴스·커뮤니티 언급량과 부정 감성 기반</small></div>
              <div className="sr-period-tabs">
                {Object.keys(periods).map((item) => <button type="button" className={period === item ? "active" : ""} onClick={() => setPeriod(item)} key={item}>{item}</button>)}
              </div>
            </div>
            <div className="sr-chart-wrap">
              <div className="sr-chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
              <div className="sr-chart"><Sparkline points={chartPoints} /><div className="sr-chart-x"><span>8월 1일</span><span>8월 8일</span><span>8월 15일</span><span>8월 22일</span><span>오늘</span></div></div>
            </div>
          </section>

          <section className="sr-card sr-issues-card">
            <div className="sr-card-head"><div><span>주요 리스크 이슈</span><small>감성 악화에 영향을 준 핵심 이슈입니다.</small></div><button className="sr-view-all" type="button">전체 보기 →</button></div>
            <div className="sr-issue-list">
              {issues.map((issue) => (
                <button type="button" key={issue.title}>
                  <b className={`level-${issue.level}`}>{issue.level}</b>
                  <span className="sr-issue-title"><strong>{issue.title}</strong><small>{issue.source}</small></span>
                  <span className="sr-mentions"><small>관련 언급</small><strong>{issue.mentions}건</strong></span>
                  <time>{issue.time}</time><i>›</i>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SentimentRiskDashboard;
