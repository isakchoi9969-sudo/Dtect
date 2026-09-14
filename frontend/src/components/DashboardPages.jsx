import Header from "./Header";

const companies = [
  { name: "삼성전자", code: "005930", score: 76, change: "+4.2", issues: 12, tone: "blue", initials: "SE", status: "주의" },
  { name: "현대자동차", code: "005380", score: 82, change: "+1.6", issues: 7, tone: "sky", initials: "H", status: "안정" },
  { name: "카카오", code: "035720", score: 61, change: "-5.8", issues: 19, tone: "yellow", initials: "K", status: "관찰" },
  { name: "SK하이닉스", code: "000660", score: 71, change: "+2.3", issues: 9, tone: "purple", initials: "SK", status: "주의" },
];

const issues = [
  { level: "높음", title: "개인정보 보호 관련 논의 확산", company: "카카오", time: "12분 전", count: "1,284", color: "high" },
  { level: "주의", title: "반도체 공급망 불확실성 재점화", company: "삼성전자", time: "38분 전", count: "846", color: "medium" },
  { level: "관찰", title: "전기차 보조금 정책 변경 가능성", company: "현대자동차", time: "1시간 전", count: "392", color: "low" },
  { level: "주의", title: "메모리 가격 전망 조정 의견", company: "SK하이닉스", time: "2시간 전", count: "268", color: "medium" },
];

function CompanyMark({ item }) { return <span className={`dash-company-mark ${item.tone}`}>{item.initials}</span>; }

function WatchlistDashboard() {
  return <DashboardLayout title="관심 기업 요약" subtitle="등록한 관심 기업의 주요 신호와 변화를 한눈에 확인하세요." active="watchlist">
    <section className="dash-summary-grid">
      <article className="dash-summary-card"><span>관심 기업</span><strong>12<small>개</small></strong><p>이번 주 <b>2개 기업</b>을 추가했어요.</p></article>
      <article className="dash-summary-card"><span>주의가 필요한 기업</span><strong className="warn">3<small>개</small></strong><p>지난주 대비 <b>1개 증가</b>했어요.</p></article>
      <article className="dash-summary-card"><span>오늘 감지된 이슈</span><strong>47<small>건</small></strong><p><b className="up">↑ 18%</b> 어제 대비 언급량이 늘었어요.</p></article>
    </section>
    <section className="dash-section-card"><div className="dash-card-heading"><div><span>WATCHLIST</span><h2>관심 기업 현황</h2></div><button type="button">기업 관리 +</button></div><div className="company-overview-list">{companies.map((company) => <article className="company-overview" key={company.name}><CompanyMark item={company} /><div><h3>{company.name} <small>{company.code}</small></h3><p>감성·위험도 분석 결과</p></div><div className="company-issues"><span>새 이슈</span><strong>{company.issues}건</strong></div><div className="company-risk"><span>리스크 신호</span><div><b>{company.score}</b><i className={company.score < 65 ? "danger" : company.score < 78 ? "caution" : "safe"} style={{ "--risk": `${company.score}%` }} /></div></div><em className={company.change.startsWith("-") ? "fall" : "rise"}>{company.change.startsWith("-") ? "↓" : "↑"} {company.change.replace("-", "+")}%</em><button className="dash-chevron" aria-label={`${company.name} 상세 보기`}>›</button></article>)}</div></section>
    <div className="dash-two-column"><section className="dash-section-card"><div className="dash-card-heading"><div><span>RECENT SIGNALS</span><h2>최근 감지된 신호</h2></div><button type="button">전체 보기</button></div><div className="signal-list"><p><i className="dot red" /><span><b>카카오</b> · 개인정보 보호 논의가 빠르게 증가하고 있습니다.</span><time>12분 전</time></p><p><i className="dot yellow" /><span><b>삼성전자</b> · 반도체 공급망 관련 언급을 확인하세요.</span><time>38분 전</time></p><p><i className="dot blue" /><span><b>현대자동차</b> · 전기차 시장 반응이 개선되고 있습니다.</span><time>1시간 전</time></p></div></section><section className="dash-section-card"><div className="dash-card-heading"><div><span>WEEKLY TREND</span><h2>이번 주 이슈 흐름</h2></div><button type="button">7일</button></div><div className="mini-chart">{[34, 56, 44, 71, 62, 88, 75].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><span>{["월", "화", "수", "목", "금", "토", "일"][index]}</span></div>)}</div></section></div>
  </DashboardLayout>;
}

function RiskDashboard() {
  return <DashboardLayout title="이슈 · 위험도 현황" subtitle="실시간으로 감지된 이슈의 위험도와 우선순위를 확인하세요." active="risk">
    <section className="risk-top-grid"><article className="overall-risk"><div><span>OVERALL RISK LEVEL</span><h2>전체 위험도</h2><p>관심 기업 전체의 종합 위험 신호입니다.</p></div><div className="risk-gauge"><strong>68</strong><span>주의</span></div><div className="risk-stats"><p><span>높음</span><b>4</b></p><p><span>주의</span><b>11</b></p><p><span>관찰</span><b>23</b></p></div></article><article className="risk-trend-card"><div className="dash-card-heading"><div><span>RISK TREND</span><h2>위험도 추이</h2></div><button type="button">최근 7일⌄</button></div><div className="trend-graph"><svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-label="위험도 추이 그래프"><path d="M0,108 C40,90 62,105 96,85 S145,66 178,75 S218,115 250,86 S300,45 340,62 S390,78 420,41 S470,25 500,38" fill="none" stroke="#1779df" strokeWidth="3"/><path d="M0,108 C40,90 62,105 96,85 S145,66 178,75 S218,115 250,86 S300,45 340,62 S390,78 420,41 S470,25 500,38 L500,150 L0,150Z" fill="url(#fill)"/><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#5aa9f5" stopOpacity=".3"/><stop offset="1" stopColor="#5aa9f5" stopOpacity="0"/></linearGradient></defs></svg><div><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span></div></div></article></section>
    <section className="dash-section-card"><div className="dash-card-heading"><div><span>PRIORITY ISSUES</span><h2>우선 확인이 필요한 이슈</h2></div><button type="button">필터 ⌄</button></div><div className="priority-list">{issues.map((issue) => <article key={issue.title}><b className={issue.color}>{issue.level}</b><div><h3>{issue.title}</h3><p>{issue.company} · 온라인 뉴스, 커뮤니티, SNS 분석</p></div><div className="issue-count"><span>언급량</span><strong>{issue.count}</strong></div><time>{issue.time}</time><button className="dash-chevron" aria-label={`${issue.title} 상세 보기`}>›</button></article>)}</div></section>
    <div className="dash-two-column"><section className="dash-section-card"><div className="dash-card-heading"><div><span>RISK BY COMPANY</span><h2>기업별 위험도</h2></div></div><div className="risk-ranking">{companies.map((company) => <div key={company.name}><CompanyMark item={company} /><span>{company.name}</span><i><b style={{ width: `${company.score}%` }} /></i><strong>{company.score}</strong></div>)}</div></section><section className="dash-section-card"><div className="dash-card-heading"><div><span>ISSUE CATEGORY</span><h2>이슈 유형 분포</h2></div></div><div className="category-list"><p><i className="c1" /><span>제품 · 서비스</span><b>36%</b></p><p><i className="c2" /><span>경영 · 재무</span><b>28%</b></p><p><i className="c3" /><span>ESG · 사회 이슈</span><b>21%</b></p><p><i className="c4" /><span>정책 · 규제</span><b>15%</b></p></div></section></div>
  </DashboardLayout>;
}

function DashboardLayout({ title, subtitle, active, children }) { return <div className="dashboard-page"><Header /><main className="dashboard-main"><div className="dashboard-title-row"><div><p>DASHBOARD</p><h1>{title}</h1><span>{subtitle}</span></div><div className="live-update"><i /> 실시간 업데이트 <small>방금 전</small></div></div><div className="dashboard-tabs"><a className={active === "watchlist" ? "active" : ""} href="/dashboard/watchlist">관심 기업 요약</a><a className={active === "risk" ? "active" : ""} href="/dashboard/issue-risk">이슈 · 위험도 현황</a></div>{children}</main></div>; }
export { WatchlistDashboard, RiskDashboard };
