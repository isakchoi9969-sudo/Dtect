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
];

function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [recent, setRecent] = useState(["삼성전자", "현대자동차", "김범수"]);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      searchItems.filter((item) => {
        const matchesTab = activeTab === "전체" || item.type === activeTab;
        const matchesQuery =
          !normalizedQuery ||
          [item.name, item.englishName, item.description, item.ceo]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesTab && matchesQuery;
      }),
    [activeTab, normalizedQuery],
  );
  const search = (value = query) => {
    const term = value.trim();
    if (term && !recent.includes(term))
      setRecent((items) => [term, ...items].slice(0, 5));
    setQuery(term);
  };

  return (
    <main className="search-page">
      <header className="search-header">
        <a href={ROUTES.HOME} className="search-logo">
          D:TECT
        </a>
        <nav aria-label="주요 메뉴">
          <a href={ROUTES.DASHBOARD}>대시보드</a>
          <a href={ROUTES.SEARCH} className="active">
            기업 분석
          </a>
          <a href="#response">AI 대응센터</a>
          <a href={ROUTES.ALERTS}>알림</a>
        </nav>
        <a href={ROUTES.LOGIN} className="search-login">
          로그인
        </a>
      </header>
      <section className="search-hero">
        <p>SEARCH INTELLIGENCE</p>
        <h1>
          어떤 기업의 신호를
          <br />
          찾고 계신가요?
        </h1>
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault();
            search();
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="기업명, 브랜드명 또는 CEO를 검색하세요"
            aria-label="기업, 브랜드, CEO 검색"
          />
          <button type="submit">검색</button>
        </form>
        <div className="popular-keywords">
          <span>인기 검색어</span>
          {["삼성전자", "현대자동차", "카카오", "이재용"].map((term) => (
            <button key={term} type="button" onClick={() => search(term)}>
              {term}
            </button>
          ))}
        </div>
      </section>
      <section className="search-content">
        <aside className="search-sidebar">
          <div className="recent-heading">
            <span>최근 검색어</span>
            {recent.length > 0 && (
              <button type="button" onClick={() => setRecent([])}>
                전체 삭제
              </button>
            )}
          </div>
          {recent.length > 0 ? (
            <ul>
              {recent.map((term) => (
                <li key={term}>
                  <button type="button" onClick={() => search(term)}>
                    <span>◷</span>
                    {term}
                  </button>
                  <button
                    type="button"
                    aria-label={`${term} 삭제`}
                    onClick={() =>
                      setRecent((items) =>
                        items.filter((item) => item !== term),
                      )
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-recent">최근 검색어가 없습니다.</p>
          )}
          <div className="search-guide">
            <span>TIP</span>
            <strong>더 정확한 결과가 필요하신가요?</strong>
            <p>기업명, 브랜드명, CEO 이름을 함께 검색해 보세요.</p>
          </div>
        </aside>
        <div className="search-results">
          <div className="result-title">
            <div>
              <p>
                {normalizedQuery ? (
                  <>
                    <b>“{query}”</b> 검색 결과
                  </>
                ) : (
                  "추천 검색 결과"
                )}
              </p>
              <span>{results.length}개의 결과</span>
            </div>
          </div>
          <div className="search-tabs">
            {["전체", "기업", "브랜드", "CEO"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="result-list">
            {results.length ? (
              results.map((item) => (
                <article
                  className="search-result-card"
                  key={`${item.type}-${item.name}`}
                >
                  <div className={`result-mark ${item.tone}`}>
                    {item.initials}
                  </div>
                  <div className="result-copy">
                    <span className="result-type">{item.type}</span>
                    <h2>
                      {item.name} <small>{item.englishName}</small>
                    </h2>
                    <p>
                      {item.description} <i /> 대표 · {item.ceo}
                    </p>
                  </div>
                  <div className="risk-score">
                    <span>리스크 신호</span>
                    <strong>{item.score}</strong>
                    <em className={item.change.startsWith("-") ? "down" : ""}>
                      {item.change.startsWith("-") ? "↓" : "↑"}{" "}
                      {item.change.replace("-", "+")}%
                    </em>
                  </div>
                  <button
                    className="result-arrow"
                    aria-label={`${item.name} 상세 보기`}
                  >
                    ›
                  </button>
                </article>
              ))
            ) : (
              <div className="no-results">
                <strong>검색 결과가 없습니다.</strong>
                <p>다른 키워드로 다시 검색해 보세요.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
export default SearchPage;
