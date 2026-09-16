import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";

const periods = {
  "7일": [28, 34, 30, 46, 53, 65, 72],
  "30일": [22, 27, 24, 32, 29, 38, 43, 47, 44, 52, 58, 55, 62, 68, 72],
  "3개월": [18, 22, 25, 23, 31, 35, 38, 44, 41, 47, 53, 57, 61, 66, 72],
};

function Sparkline({ points }) {
  const coords = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 54 - (value / 100) * 48;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="sr-sparkline"
      viewBox="0 0 100 58"
      preserveAspectRatio="none"
      aria-label="리스크 추이 그래프"
    >
      <defs>
        <linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d79ef" stopOpacity=".22" />
          <stop offset="1" stopColor="#2d79ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${coords.replaceAll(" ", " L ")} L 100,58 L 0,58 Z`}
        fill="url(#riskArea)"
      />
      <polyline
        points={coords}
        fill="none"
        stroke="#2474e8"
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="100"
        cy={54 - (points.at(-1) / 100) * 48}
        r="2.2"
        fill="#2474e8"
      />
    </svg>
  );
}

function SentimentRiskDashboard() {
  const [period, setPeriod] = useState("30일");

  // 백엔드에서 받아온 기업 분석 데이터
  const [company, setCompany] = useState(null);

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 에러 메시지
  const [error, setError] = useState("");

  /*
   * 검색 결과를 기준으로 백엔드에서 기업 분석 데이터를 가져온다.
   *
   * 예:
   * /company-analysis/sentiment-risk?company=카카오
   *
   * → keyword = 카카오
   * → GET /api/company/search?keyword=카카오
   */
  useEffect(() => {
    const fetchCompanyAnalysis = async () => {
      try {
        console.log("1. 기업 분석 요청 시작");

        setLoading(true);

        const params = new URLSearchParams(window.location.search);
        const keyword = params.get("company") || "카카오";

        console.log("2. 검색 기업:", keyword);

        const response = await axios.get(
          "http://localhost:5000/api/company/search",
          {
            params: {
              keyword: keyword,
            },

            // 10초 이상 응답이 없으면 오류 처리
            timeout: 10000,
          },
        );

        console.log("3. 백엔드 응답:", response.data);

        if (!response.data.success) {
          throw new Error(
            response.data.message || "기업 데이터를 찾을 수 없습니다.",
          );
        }

        setCompany(response.data.data);
      } catch (error) {
        console.error("기업 분석 데이터 조회 실패:", error);

        if (error.code === "ECONNABORTED") {
          setError("백엔드 응답 시간이 초과되었습니다.");
        } else if (error.response) {
          setError(`백엔드 오류: ${error.response.status}`);
        } else if (error.request) {
          setError("백엔드 서버에 응답이 없습니다.");
        } else {
          setError(error.message || "기업 분석 데이터를 불러오지 못했습니다.");
        }
      } finally {
        console.log("4. 로딩 종료");
        setLoading(false);
      }
    };

    fetchCompanyAnalysis();
  }, []);

  /*
   * 리스크 추이 그래프
   * 현재는 그래프 값만 임시 데이터.
   * 추후 백엔드의 trend 데이터를 연결하면 된다.
   */
  const chartPoints = useMemo(() => {
    return periods[period];
  }, [period]);

  // 로딩
  if (loading) {
    return (
      <div className="sr-app">
        <main className="sr-main">
          <p>기업 분석 데이터를 불러오는 중...</p>
        </main>
      </div>
    );
  }

  // 에러
  if (error || !company) {
    return (
      <div className="sr-app">
        <main className="sr-main">
          <p>{error || "기업 데이터가 없습니다."}</p>
        </main>
      </div>
    );
  }

  // 백엔드 데이터
  const score = company.issueRisk.score;

  const positive = company.sentiment.positive;
  const neutral = company.sentiment.neutral;
  const negative = company.sentiment.negative;

  return (
    <div className="sr-app">
      {/* ================================
          Header
      ================================= */}
      <header className="sr-header">
        <a className="sr-brand" href="/" aria-label="D:TECT 홈">
          D<span>:</span>TECT
        </a>

        <nav aria-label="주요 메뉴">
          <a href="#overview">대시보드</a>

          <a className="active" href="#analysis">
            기업 분석
          </a>

          <a href="#response">AI 대응센터</a>

          <a href="#alerts">알림</a>
        </nav>

        <div className="sr-header-actions">
          <ThemeToggle />

          <button className="sr-icon-button" type="button" aria-label="알림">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            <i />
          </button>

          <div className="sr-avatar">김</div>

          <span className="sr-user">김지훈 님</span>
        </div>
      </header>

      <div className="sr-layout">
        {/* ================================
            Sidebar
        ================================= */}
        <aside className="sr-sidebar">
          <div className="sr-side-heading">
            <span>WATCHLIST</span>
            <button type="button" aria-label="기업 추가">
              +
            </button>
          </div>

          <div className="sr-company-list">
            {/* 현재는 테스트용으로 검색된 기업 하나만 보여준다 */}
            <button type="button" className="selected">
              <span className="sr-company-mark">{company.name[0]}</span>

              <span>
                <strong>{company.name}</strong>

                <small>{company.symbol} · KOSPI</small>
              </span>

              <i>{company.issueRisk.trend}</i>
            </button>
          </div>

          <button className="sr-add-company" type="button">
            <span>+</span> 관심 기업 추가
          </button>

          <div className="sr-side-footer">
            <a href="#settings">설정</a>

            <a href="#help">도움말</a>
          </div>
        </aside>

        {/* ================================
            Main
        ================================= */}
        <main className="sr-main" id="analysis">
          {/* 페이지 제목 */}
          <div className="sr-title-row">
            <div>
              <p className="sr-kicker">CORPORATE ANALYSIS</p>

              <h1>감성·리스크 분석</h1>
              <p className="sr-subtitle">
                뉴스와 온라인 여론을 분석해 기업의 잠재 리스크를 빠르게
                파악합니다.
              </p>
            </div>

            <div className="sr-live">
              <i />
              실시간 업데이트
              <span>방금 전</span>
            </div>
          </div>

          {/* ================================
              기업 정보
          ================================= */}
          <section className="sr-company-bar">
            <div className="sr-company-logo">{company.name[0]}</div>

            <div>
              <strong>{company.name}</strong>

              <span>{company.symbol} · KOSPI</span>
            </div>

            <span className="sr-industry">기업 분석</span>

            <button type="button">
              기업 상세
              <span>→</span>
            </button>
          </section>

          {/* ================================
              핵심 지표
          ================================= */}
          <section className="sr-metric-grid" aria-label="핵심 지표">
            {/* 종합 리스크 */}
            <article className="sr-card sr-score-card">
              <div className="sr-card-head">
                <span>종합 리스크 지수</span>
                <button title="산정 기준" type="button">
                  i
                </button>
              </div>

              <div className="sr-score-content">
                <div
                  className="sr-gauge"
                  style={{
                    "--score": `${score * 3.6}deg`,
                  }}
                >
                  <div>
                    <strong>{score}</strong>

                    <span>/ 100</span>
                  </div>
                </div>

                <div className="sr-score-copy">
                  <b>{company.issueRisk.level}</b>

                  <p>
                    현재 분석 결과
                    <br />
                    <strong>{company.issueRisk.trend}</strong>
                  </p>
                </div>
              </div>

              <div className="sr-risk-legend">
                <span>낮음</span>
                <span>보통</span>
                <span>주의</span>
                <span>높음</span>
              </div>
            </article>

            {/* 감성 분포 */}
            <article className="sr-card sr-sentiment-card">
              <div className="sr-card-head">
                <span>감성 분포</span>

                <small>
                  긍정 {positive}% · 중립 {neutral}% · 부정 {negative}%
                </small>
              </div>

              <div
                className="sr-donut"
                aria-label={`부정 ${negative}%, 중립 ${neutral}%, 긍정 ${positive}%`}
              >
                <div>
                  <strong>{negative}%</strong>

                  <span>부정</span>
                </div>
              </div>

              <div className="sr-sentiment-legend">
                <p>
                  <i className="negative" />

                  <span>부정</span>

                  <strong>{negative}%</strong>

                  <small>{negative}%</small>
                </p>

                <p>
                  <i className="neutral" />

                  <span>중립</span>

                  <strong>{neutral}%</strong>

                  <small>{neutral}%</small>
                </p>

                <p>
                  <i className="positive" />

                  <span>긍정</span>

                  <strong>{positive}%</strong>

                  <small>{positive}%</small>
                </p>
              </div>
            </article>

            {/* 부정 키워드 */}
            <article className="sr-card sr-keyword-card">
              <div className="sr-card-head">
                <span>부정 감성 주요 키워드</span>

                <small>언급량 기준</small>
              </div>

              <div className="sr-keywords">
                {company.keywords.map((keyword, index) => {
                  let sizeClass = "sm";

                  if (index === 0) {
                    sizeClass = "xl";
                  } else if (index < 2) {
                    sizeClass = "lg";
                  } else if (index < 5) {
                    sizeClass = "md";
                  }

                  return (
                    <span className={sizeClass} key={keyword}>
                      {keyword}
                    </span>
                  );
                })}
              </div>
            </article>
          </section>

          {/* ================================
              AI 현재 상황 요약
          ================================= */}
          <section
            className="sr-card sr-summary-card"
            aria-labelledby="situation-summary-title"
          >
            <div className="sr-summary-top">
              <div className="sr-summary-label">
                <span className="sr-ai-mark" aria-hidden="true">
                  AI
                </span>
                <div>
                  <span>AI CURRENT SITUATION</span>

                  <h2 id="situation-summary-title">현재 상황 요약</h2>
                </div>
              </div>

              <span className="sr-analysis-range">
                최근 30일 분석 · 오늘 기준
              </span>
            </div>

            <div className="sr-summary-body">
              <div className="sr-summary-copy">
                <strong>
                  {company.summary.headline} <em>{score}점</em>
                </strong>

                <p>{company.summary.description}</p>
              </div>

              <div className="sr-summary-facts" aria-label="핵심 분석 결과">
                <div>
                  <span>분석 뉴스</span>

                  <strong>
                    {company.summary.newsCount.toLocaleString()}
                    <small>건</small>
                  </strong>

                  <i className="up">+{company.summary.newsChange}%</i>
                </div>

                <div>
                  <span>부정 감성</span>

                  <strong>
                    {company.summary.negativeRate}
                    <small>%</small>
                  </strong>

                  <i className="up">+{company.summary.negativeChange}%p</i>
                </div>

                <div>
                  <span>확산 속도</span>

                  <strong>
                    {company.summary.spreadSpeed}
                    <small>배</small>
                  </strong>

                  <i className="up">빠른 확산</i>
                </div>
              </div>
            </div>

            <div className="sr-summary-bottom">
              <div className="sr-summary-topic">
                <span>리스크 상승 핵심 요인</span>

                {company.keywords.slice(0, 3).map((keyword, index) => (
                  <p key={keyword}>
                    <b>{String(index + 1).padStart(2, "0")}</b>

                    {keyword}
                  </p>
                ))}
              </div>

              <div className="sr-watch-point">
                <span>향후 관찰 포인트</span>

                <p>
                  주요 뉴스와 온라인 여론의 변화에 따라 리스크가 추가 상승할 수
                  있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* ================================
              리스크 추이
          ================================= */}
          <section className="sr-card sr-trend-card">
            <div className="sr-card-head">
              <div>
                <span>리스크 추이</span>

                <small>뉴스·커뮤니티 언급량과 부정 감성 기반</small>
              </div>

              <div className="sr-period-tabs">
                {Object.keys(periods).map((item) => (
                  <button
                    type="button"
                    className={period === item ? "active" : ""}
                    onClick={() => setPeriod(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="sr-chart-wrap">
              <div className="sr-chart-y">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="sr-chart">
                <Sparkline points={chartPoints} />

                <div className="sr-chart-x">
                  <span>8월 1일</span>
                  <span>8월 8일</span>
                  <span>8월 15일</span>
                  <span>8월 22일</span>
                  <span>오늘</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================================
              주요 리스크 이슈
          ================================= */}
          <section className="sr-card sr-issues-card">
            <div className="sr-card-head">
              <div>
                <span>주요 리스크 이슈</span>

                <small>감성 악화에 영향을 준 핵심 이슈입니다.</small>
              </div>

              <button className="sr-view-all" type="button">
                전체 보기 →
              </button>
            </div>
            <div className="sr-issue-list">
              {company.issues.map((issue) => (
                <button type="button" key={issue.title}>
                  <b className={`level-${issue.level}`}>{issue.level}</b>

                  <span className="sr-issue-title">
                    <strong>{issue.title}</strong>

                    <small>{issue.source}</small>
                  </span>

                  <span className="sr-mentions">
                    <small>관련 언급</small>

                    <strong>{issue.mentions}건</strong>
                  </span>

                  <time>{issue.time}</time>

                  <i>›</i>
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
