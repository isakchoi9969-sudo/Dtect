import { useMemo, useState } from "react";
import { ROUTES } from "../config/routes";
const searchItems = [
  {
    type: "기업",
    name: "삼성전자",
    englishName: "Samsung Electronics",
    description: "반도체 · 전자제품",
    ceo: "전영현",
    score: 76,
    change: "+4.2",
    initials: "SE",
    tone: "blue",
    code: "005930",
  },
  {
    type: "브랜드",
    name: "갤럭시",
    englishName: "Galaxy",
    description: "삼성전자 모바일 브랜드",
    ceo: "전영현",
    score: 69,
    change: "+2.8",
    initials: "G",
    tone: "violet",
  },
  {
    type: "CEO",
    name: "전영현",
    englishName: "Young Hyun Jun",
    description: "삼성전자 대표이사",
    ceo: "삼성전자",
    score: 76,
    change: "+4.2",
    initials: "전",
    tone: "navy",
  },
  {
    type: "기업",
    name: "현대자동차",
    englishName: "Hyundai Motor Company",
    description: "자동차 · 모빌리티",
    ceo: "장재훈",
    score: 82,
    change: "+1.6",
    initials: "H",
    tone: "sky",
    code: "005380",
  },
  {
    type: "브랜드",
    name: "아이오닉",
    englishName: "IONIQ",
    description: "현대자동차 전기차 브랜드",
    ceo: "장재훈",
    score: 84,
    change: "+3.1",
    initials: "I",
    tone: "mint",
  },
  {
    type: "CEO",
    name: "김범수",
    englishName: "Beom-su Kim",
    description: "카카오 창업자",
    ceo: "카카오",
    score: 61,
    change: "-1.4",
    initials: "김",
    tone: "orange",
  },
  {
    type: "기업",
    name: "카카오",
    englishName: "Kakao",
    description: "인터넷 · 플랫폼",
    ceo: "정신아",
    score: 61,
    change: "-5.8",
    initials: "K",
    tone: "orange",
    code: "035720",
  },
  {
    type: "기업",
    name: "SK하이닉스",
    englishName: "SK hynix",
    description: "반도체",
    ceo: "곽노정",
    score: 71,
    change: "+2.3",
    initials: "SK",
    tone: "violet",
    code: "000660",
  },
];

const watchlistData = [
  {
    name: "삼성전자",
    code: "005930",
    initials: "SE",
    tone: "blue",
    issues: 12,
    score: 76,
    change: "+4.2",
  },
  {
    name: "현대자동차",
    code: "005380",
    initials: "H",
    tone: "sky",
    issues: 7,
    score: 82,
    change: "+1.6",
  },
  {
    name: "카카오",
    code: "035720",
    initials: "K",
    tone: "orange",
    issues: 19,
    score: 61,
    change: "-5.8",
  },
  {
    name: "SK하이닉스",
    code: "000660",
    initials: "SK",
    tone: "violet",
    issues: 9,
    score: 71,
    change: "+2.3",
  },
];

function DashboardWithSearch() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [isSearching, setIsSearching] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return searchItems.filter((item) => {
      const matchesTab = activeTab === "전체" || item.type === activeTab;
      const matchesQuery = [
        item.name,
        item.englishName,
        item.description,
        item.ceo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesTab && matchesQuery;
    });
  }, [activeTab, normalizedQuery]);

  const handleSearch = (value = query) => {
    const term = value.trim();
    if (!term) {
      setIsSearching(false);
      setQuery("");
      return;
    }
    setQuery(term);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setQuery("");
    setIsSearching(false);
    setActiveTab("전체");
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif; background: #f8fafc; color: #0f172a; }

        /* ─── 헤더 ─── */
        .global-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 60px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .header-nav {
          display: flex;
          gap: 32px;
        }
        .header-nav a {
          font-size: 14px;
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
        }
        .header-nav a.active {
          color: #0f172a;
          font-weight: 600;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-btn {
          padding: 7px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
        }
        .login-btn:hover { background: #f8fafc; }

        .dashboard-layout {
          display: flex;
          min-height: calc(100vh - 60px);
          background: #f8fafc;
        }

        /* ─── Sidebar ─── */
        .sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #e2e8f0;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .add-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 18px;
          cursor: pointer;
          color: #64748b;
        }
        .watchlist-mini {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .watch-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .watch-item:hover { background: #f1f5f9; }
        .watch-item .info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .watch-item .info strong { font-size: 13px; font-weight: 600; }
        .watch-item .info span { font-size: 11px; color: #94a3b8; }
        .watch-item .up { color: #16a34a; font-size: 12px; font-weight: 600; }
        .watch-item .down { color: #dc2626; font-size: 12px; font-weight: 600; }

        .add-company-btn {
          margin-top: 8px;
          padding: 10px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
        }
        .add-company-btn:hover { background: #f8fafc; }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .sidebar-footer a {
          font-size: 13px;
          color: #64748b;
          text-decoration: none;
        }

        /* ─── Main ─── */
        .main-content {
          flex: 1;
          padding: 28px 32px;
          max-width: 1100px;
        }

        .page-header {
          margin-bottom: 20px;
        }
        .page-header h1 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .page-header p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .page-tabs {
          display: flex;
          gap: 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        .page-tabs button {
          background: none;
          border: none;
          padding: 10px 0;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          position: relative;
        }
        .page-tabs button.active {
          color: #2563eb;
          font-weight: 600;
        }
        .page-tabs button.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #2563eb;
        }

        /* ─── Search Bar ─── */
        .search-section {
          margin: 24px 0 20px;
        }
        .dashboard-search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px 6px 6px 16px;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .search-icon {
          color: #94a3b8;
          font-size: 18px;
        }
        .dashboard-search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          background: transparent;
          padding: 8px 0;
        }
        .clear-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: #94a3b8;
          cursor: pointer;
          padding: 0 6px;
        }
        .search-submit {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
        .search-submit:hover { background: #1d4ed8; }

        .popular-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .popular-row > span {
          font-size: 13px;
          color: #64748b;
        }
        .popular-row button {
          background: #f1f5f9;
          border: none;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
        }
        .popular-row button:hover { background: #e2e8f0; }

        /* ─── Summary Cards ─── */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }
        .card .label {
          font-size: 13px;
          color: #64748b;
          display: block;
          margin-bottom: 6px;
        }
        .card .value {
          font-size: 28px;
          font-weight: 700;
          display: block;
          margin-bottom: 6px;
        }
        .card .value.warning { color: #ea580c; }
        .card p {
          font-size: 13px;
          color: #64748b;
        }
        .card .up { color: #16a34a; font-weight: 600; }

        /* ─── Content Panel ─── */
        .content-panel {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .panel-header h2 {
          font-size: 16px;
          font-weight: 700;
        }
        .panel-header span {
          font-size: 13px;
          color: #64748b;
          margin-left: 8px;
        }
        .ghost-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
        }
        .ghost-btn:hover { background: #f1f5f9; }

        .result-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
        }
        .result-tabs button {
          padding: 6px 14px;
          border-radius: 20px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          cursor: pointer;
        }
        .result-tabs button.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }

        /* ─── Company Row ─── */
        .company-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 4px;
          border-bottom: 1px solid #f1f5f9;
        }
        .company-row:last-child { border-bottom: none; }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 13px;
          flex-shrink: 0;
        }
        .avatar.blue { background: #3b82f6; }
        .avatar.sky { background: #0ea5e9; }
        .avatar.orange { background: #f97316; }
        .avatar.violet { background: #8b5cf6; }
        .avatar.mint { background: #14b8a6; }
        .avatar.navy { background: #1e3a5f; }

        .company-info { flex: 1; min-width: 0; }
        .name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .name-row strong { font-size: 15px; font-weight: 600; }
        .code { font-size: 12px; color: #94a3b8; }
        .type-badge {
          font-size: 11px;
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .company-info p {
          font-size: 13px;
          color: #64748b;
        }

        .metrics {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .issue-count {
          text-align: center;
          min-width: 50px;
        }
        .issue-count span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
        }
        .issue-count strong {
          font-size: 14px;
        }

        .score-block {
          min-width: 90px;
        }
        .score-block span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .score-block strong {
          font-size: 16px;
          margin-right: 6px;
        }
        .bar {
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }
        .bar .fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 2px;
        }

        .change {
          font-size: 13px;
          font-weight: 600;
          min-width: 60px;
          text-align: right;
        }
        .change.up { color: #16a34a; }
        .change.down { color: #dc2626; }

        .arrow {
          background: none;
          border: none;
          font-size: 20px;
          color: #94a3b8;
          cursor: pointer;
          padding: 0 4px;
        }

        .empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #64748b;
        }
        .empty-state strong {
          display: block;
          font-size: 16px;
          margin-bottom: 6px;
          color: #334155;
        }

        /* ─── Bottom Grid ─── */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .recent-signals, .weekly-trend {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header h3 {
          font-size: 14px;
          font-weight: 700;
        }
        .badge {
          font-size: 12px;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          color: #64748b;
        }
        .recent-signals ul {
          list-style: none;
        }
        .recent-signals li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          line-height: 1.4;
        }
        .recent-signals li:last-child { border-bottom: none; }
        .recent-signals time {
          margin-left: auto;
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .dot.red { background: #ef4444; }
        .dot.orange { background: #f97316; }
        .dot.blue { background: #3b82f6; }

        .chart-placeholder {
          height: 140px;
          background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
          border-radius: 10px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          padding: 16px 12px 8px;
        }
        .chart-placeholder::before {
          content: "";
          width: 18px;
          height: 40%;
          background: #93c5fd;
          border-radius: 4px 4px 0 0;
        }
        .chart-placeholder::after {
          content: "";
          width: 18px;
          height: 70%;
          background: #3b82f6;
          border-radius: 4px 4px 0 0;
        }
      `}</style>

      {/* ─── 전역 헤더 ─── */}
      <header className="global-header">
        <a href="/" className="logo">
          D:TECT
        </a>
        <nav className="header-nav">
          <a href="#" className="active">
            기업 분석
          </a>
          <a href="#">AI 대응센터</a>
          <a href="#">알림</a>
        </nav>
        <div className="header-right">
          <button className="login-btn">로그인</button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>WATCHLIST</span>
            <button className="add-btn">+</button>
          </div>

          <ul className="watchlist-mini">
            {watchlistData.map((item) => (
              <li key={item.code} className="watch-item">
                <div className={`avatar ${item.tone}`}>{item.initials}</div>
                <div className="info">
                  <strong>{item.name}</strong>
                  <span>{item.code} · KOSPI</span>
                </div>
                <span className={item.change.startsWith("-") ? "down" : "up"}>
                  {item.change}%
                </span>
              </li>
            ))}
          </ul>

          <button className="add-company-btn">+ 관심 기업 추가</button>

          <div className="sidebar-footer">
            <a href="#settings">설정</a>
            <a href="#help">도움말</a>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <header className="page-header">
            <h1>관심 기업 요약</h1>
            <p>등록한 관심 기업의 주요 신호와 변화를 한눈에 확인하세요.</p>
            <nav className="page-tabs">
              <button className="active">관심 기업 요약</button>
              <button>이슈 · 위험도 현황</button>
            </nav>
          </header>

          {/* Search */}
          <section className="search-section">
            <form
              className="dashboard-search-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <span className="search-icon">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="기업명, 브랜드명 또는 CEO를 검색하세요"
              />
              {query && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearSearch}
                >
                  ×
                </button>
              )}
              <button type="submit" className="search-submit">
                검색
              </button>
            </form>

            {!isSearching && (
              <div className="popular-row">
                <span>인기 검색어</span>
                {["삼성전자", "현대자동차", "카카오", "이재용"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Summary Cards */}
          {!isSearching && (
            <section className="summary-cards">
              <article className="card">
                <span className="label">관심 기업</span>
                <strong className="value">12개</strong>
                <p>이번 주 2개 기업을 추가했어요.</p>
              </article>
              <article className="card">
                <span className="label">주의가 필요한 기업</span>
                <strong className="value warning">3개</strong>
                <p>지난주 대비 1개 증가했어요.</p>
              </article>
              <article className="card">
                <span className="label">오늘 감지된 이슈</span>
                <strong className="value">47건</strong>
                <p>
                  <span className="up">↑ 18%</span> 어제 대비 언급량이 늘었어요.
                </p>
              </article>
            </section>
          )}

          {/* Content Panel */}
          <section className="content-panel">
            {isSearching ? (
              <>
                <div className="panel-header">
                  <div>
                    <h2>
                      “{query}” 검색 결과
                      <span>{results.length}개의 결과</span>
                    </h2>
                  </div>
                  <button className="ghost-btn" onClick={clearSearch}>
                    관심 기업으로 돌아가기
                  </button>
                </div>

                <div className="result-tabs">
                  {["전체", "기업", "브랜드", "CEO"].map((tab) => (
                    <button
                      key={tab}
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div>
                  {results.length > 0 ? (
                    results.map((item) => (
                      <article
                        key={`${item.type}-${item.name}`}
                        className="company-row"
                      >
                        <div className={`avatar ${item.tone}`}>
                          {item.initials}
                        </div>
                        <div className="company-info">
                          <div className="name-row">
                            <strong>{item.name}</strong>
                            {item.code && (
                              <span className="code">{item.code}</span>
                            )}
                            <span className="type-badge">{item.type}</span>
                          </div>
                          <p>
                            {item.description} · 대표 · {item.ceo}
                          </p>
                        </div>
                        <div className="metrics">
                          <div className="score-block">
                            <span>리스크 신호</span>
                            <strong>{item.score}</strong>
                            <div className="bar">
                              <div
                                className="fill"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={
                              item.change.startsWith("-")
                                ? "change down"
                                : "change up"
                            }
                          >
                            {item.change.startsWith("-") ? "↓" : "↑"}{" "}
                            {item.change}%
                          </span>
                        </div>
                        <button className="arrow">›</button>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <strong>검색 결과가 없습니다.</strong>
                      <p>다른 키워드로 다시 검색해 보세요.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="panel-header">
                  <h2>WATCHLIST · 관심 기업 현황</h2>
                  <button className="ghost-btn">기업 관리 +</button>
                </div>

                <div>
                  {watchlistData.map((item) => (
                    <article key={item.code} className="company-row">
                      <div className={`avatar ${item.tone}`}>
                        {item.initials}
                      </div>
                      <div className="company-info">
                        <div className="name-row">
                          <strong>
                            {item.name} {item.code}
                          </strong>
                        </div>
                        <p>감성·위험도 분석 결과</p>
                      </div>
                      <div className="metrics">
                        <div className="issue-count">
                          <span>새 이슈</span>
                          <strong>{item.issues}건</strong>
                        </div>
                        <div className="score-block">
                          <span>리스크 신호</span>
                          <strong>{item.score}</strong>
                          <div className="bar">
                            <div
                              className="fill"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={
                            item.change.startsWith("-")
                              ? "change down"
                              : "change up"
                          }
                        >
                          {item.change.startsWith("-") ? "↓" : "↑"}{" "}
                          {item.change}%
                        </span>
                      </div>
                      <button className="arrow">›</button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Bottom */}
          {!isSearching && (
            <section className="bottom-grid">
              <article className="recent-signals">
                <div className="section-header">
                  <h3>RECENT SIGNALS · 최근 감지된 신호</h3>
                  <button className="ghost-btn">전체 보기</button>
                </div>
                <ul>
                  <li>
                    <span className="dot red" />
                    카카오 · 개인정보 보호 논의가 빠르게 증가하고 있습니다.
                    <time>12분 전</time>
                  </li>
                  <li>
                    <span className="dot orange" />
                    삼성전자 · 반도체 공급망 관련 언급을 확인하세요.
                    <time>38분 전</time>
                  </li>
                  <li>
                    <span className="dot blue" />
                    현대자동차 · 전기차 시장 반응이 개선되고 있습니다.
                    <time>1시간 전</time>
                  </li>
                </ul>
              </article>

              <article className="weekly-trend">
                <div className="section-header">
                  <h3>WEEKLY TREND · 이번 주 이슈 흐름</h3>
                  <span className="badge">7일</span>
                </div>
                <div className="chart-placeholder" />
              </article>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default DashboardWithSearch;
