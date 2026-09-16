import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";

/* =========================================================
   관심기업 샘플 데이터
   - 나중에 백엔드 API 연결 시 이 부분을 API 데이터로 교체하면 됩니다.
========================================================= */

const defaultCompanies = [
  {
    id: 1,
    name: "삼성전자",
    englishName: "Samsung Electronics",
    ticker: "005930",
    description: "기술로 더 나은 일상을 만드는 글로벌 혁신 기업",
    category: "전자/IT",
    market: "KOSPI",
    marketCap: "473.3조원",
    employees: "124,000명",
    riskScore: 35,
    riskLevel: "낮음",
    riskChange: -12,
    sentimentTotal: 1248,

    riskTypes: [
      { name: "규제/정책", value: 40, color: "#4F8EF7" },
      { name: "시장/경쟁", value: 28, color: "#3BCB83" },
      { name: "재무/실적", value: 32, color: "#7B61FF" },
      { name: "평판/ESG", value: 48, color: "#F5A623" },
    ],

    sentiment: {
      positive: 46,
      neutral: 36,
      negative: 18,
    },

    sentimentTrend: [
      { date: "10.01", positive: 42, neutral: 28, negative: 12 },
      { date: "10.04", positive: 44, neutral: 31, negative: 14 },
      { date: "10.07", positive: 51, neutral: 34, negative: 15 },
      { date: "10.10", positive: 49, neutral: 36, negative: 18 },
      { date: "10.14", positive: 48, neutral: 33, negative: 16 },
      { date: "10.18", positive: 43, neutral: 29, negative: 13 },
      { date: "10.21", positive: 47, neutral: 25, negative: 12 },
      { date: "10.24", positive: 58, neutral: 29, negative: 15 },
      { date: "10.28", positive: 60, neutral: 31, negative: 14 },
    ],

    issues: [
      {
        date: "10.28",
        type: "부정",
        title: "미국 반도체 수출 규제 강화 가능성 제기",
        description:
          "미국 정부의 첨단 반도체 수출 규제 강화 가능성이 제기되며 관련 업계의 대응 필요성이 커지고 있습니다.",
      },
      {
        date: "10.24",
        type: "중립",
        title: "3분기 실적 발표, 시장 예상치 상회",
        description:
          "영업이익 10.4조원, 전년 대비 27% 증가하며 시장 예상치를 상회했습니다.",
      },
      {
        date: "10.18",
        type: "긍정",
        title: "AI 반도체 수요 확대에 따른 신규 투자 계획",
        description: "차세대 HBM 생산라인 증설 계획을 발표했습니다.",
      },
      {
        date: "10.12",
        type: "주의",
        title: "노사 임금협상 관련 이슈 지속",
        description: "일부 사업장에서 임금 관련 협의가 진행되고 있습니다.",
      },
      {
        date: "10.05",
        type: "중립",
        title: "글로벌 주요 고객사 장기 공급 계약 체결",
        description: "북미 네트워크 기업과 메모리 공급 계약을 확대했습니다.",
      },
    ],

    keywords: [
      { text: "#HBM", type: "blue" },
      { text: "#AI 반도체", type: "blue" },
      { text: "#실적", type: "green" },
      { text: "#수출 규제", type: "red" },
      { text: "#글로벌 수요", type: "green" },
      { text: "#신규 투자", type: "green" },
      { text: "#노사 이슈", type: "orange" },
      { text: "#ESG", type: "blue" },
    ],

    articles: [
      {
        source: "연합뉴스",
        title: "삼성전자, 3분기 영업이익 10.4조원…시장 예상치 상회",
        time: "2시간 전",
        icon: "Y",
      },
      {
        source: "한국경제",
        title: "美 AI 반도체 수출 규제 강화 움직임",
        time: "5시간 전",
        icon: "H",
      },
      {
        source: "매일경제",
        title: "삼성전자, 차세대 HBM 생산라인 증설…10조원 투자",
        time: "1일 전",
        icon: "M",
      },
      {
        source: "조선비즈",
        title: "삼성전자 노사 협상 난항…일부 사업장 파업 우려",
        time: "2일 전",
        icon: "C",
      },
      {
        source: "한겨레",
        title: "글로벌 네트워크, 삼성전자와 장기 공급 계약",
        time: "3일 전",
        icon: "H",
      },
    ],
  },

  {
    id: 2,
    name: "현대자동차",
    englishName: "Hyundai Motor Company",
    ticker: "005380",
    description: "스마트 모빌리티 시대를 선도하는 글로벌 자동차 기업",
    category: "자동차",
    market: "KOSPI",
    marketCap: "54.2조원",
    employees: "120,000명",
    riskScore: 42,
    riskLevel: "보통",
    riskChange: 5,
    sentimentTotal: 986,

    riskTypes: [
      { name: "규제/정책", value: 35, color: "#4F8EF7" },
      { name: "시장/경쟁", value: 42, color: "#3BCB83" },
      { name: "재무/실적", value: 31, color: "#7B61FF" },
      { name: "평판/ESG", value: 36, color: "#F5A623" },
    ],

    sentiment: {
      positive: 42,
      neutral: 38,
      negative: 20,
    },

    sentimentTrend: [
      { date: "10.01", positive: 40, neutral: 32, negative: 14 },
      { date: "10.04", positive: 42, neutral: 34, negative: 16 },
      { date: "10.07", positive: 45, neutral: 33, negative: 18 },
      { date: "10.10", positive: 43, neutral: 37, negative: 19 },
      { date: "10.14", positive: 40, neutral: 39, negative: 21 },
      { date: "10.18", positive: 44, neutral: 35, negative: 18 },
      { date: "10.21", positive: 47, neutral: 32, negative: 17 },
      { date: "10.24", positive: 45, neutral: 35, negative: 18 },
      { date: "10.28", positive: 46, neutral: 34, negative: 17 },
    ],

    issues: [
      {
        date: "10.28",
        type: "긍정",
        title: "전기차 신차 글로벌 판매량 증가",
        description: "신규 전기차 라인업 판매량이 전월 대비 증가했습니다.",
      },
      {
        date: "10.24",
        type: "중립",
        title: "미국 생산시설 투자 확대",
        description: "현지 생산시설 확대를 위한 투자 계획이 발표됐습니다.",
      },
      {
        date: "10.18",
        type: "주의",
        title: "원자재 가격 변동성 확대",
        description: "배터리 핵심 원자재 가격 변동성이 확대되고 있습니다.",
      },
      {
        date: "10.10",
        type: "긍정",
        title: "글로벌 판매량 회복세",
        description: "주요 해외 시장에서 판매량이 증가했습니다.",
      },
    ],

    keywords: [
      { text: "#전기차", type: "blue" },
      { text: "#자동차", type: "green" },
      { text: "#배터리", type: "blue" },
      { text: "#미국시장", type: "green" },
      { text: "#원자재", type: "orange" },
      { text: "#친환경", type: "green" },
    ],

    articles: [
      {
        source: "연합뉴스",
        title: "현대차 전기차 글로벌 판매량 증가",
        time: "1시간 전",
        icon: "Y",
      },
      {
        source: "한국경제",
        title: "현대차 미국 생산시설 투자 확대",
        time: "6시간 전",
        icon: "H",
      },
      {
        source: "매일경제",
        title: "자동차 업계 원자재 가격 변동성 확대",
        time: "1일 전",
        icon: "M",
      },
    ],
  },

  {
    id: 3,
    name: "네이버",
    englishName: "NAVER Corporation",
    ticker: "035420",
    description: "검색과 AI를 기반으로 새로운 연결을 만드는 플랫폼 기업",
    category: "인터넷/플랫폼",
    market: "KOSPI",
    marketCap: "36.8조원",
    employees: "4,500명",
    riskScore: 29,
    riskLevel: "낮음",
    riskChange: -7,
    sentimentTotal: 824,

    riskTypes: [
      { name: "규제/정책", value: 31, color: "#4F8EF7" },
      { name: "시장/경쟁", value: 25, color: "#3BCB83" },
      { name: "재무/실적", value: 22, color: "#7B61FF" },
      { name: "평판/ESG", value: 29, color: "#F5A623" },
    ],

    sentiment: {
      positive: 51,
      neutral: 34,
      negative: 15,
    },

    sentimentTrend: [
      { date: "10.01", positive: 45, neutral: 30, negative: 14 },
      { date: "10.04", positive: 47, neutral: 31, negative: 15 },
      { date: "10.07", positive: 50, neutral: 33, negative: 14 },
      { date: "10.10", positive: 48, neutral: 34, negative: 16 },
      { date: "10.14", positive: 52, neutral: 32, negative: 14 },
      { date: "10.18", positive: 54, neutral: 31, negative: 13 },
      { date: "10.21", positive: 55, neutral: 30, negative: 13 },
      { date: "10.24", positive: 53, neutral: 33, negative: 14 },
      { date: "10.28", positive: 51, neutral: 34, negative: 15 },
    ],

    issues: [
      {
        date: "10.28",
        type: "긍정",
        title: "생성형 AI 서비스 이용자 증가",
        description:
          "AI 기반 신규 서비스의 이용자 수가 지속적으로 증가하고 있습니다.",
      },
      {
        date: "10.21",
        type: "긍정",
        title: "광고 사업 부문 실적 개선",
        description: "광고 플랫폼 사업의 매출 성장세가 이어지고 있습니다.",
      },
      {
        date: "10.14",
        type: "중립",
        title: "플랫폼 규제 관련 논의 지속",
        description: "국내외 플랫폼 규제 관련 논의가 계속되고 있습니다.",
      },
    ],

    keywords: [
      { text: "#생성형AI", type: "blue" },
      { text: "#검색", type: "green" },
      { text: "#광고", type: "blue" },
      { text: "#플랫폼", type: "orange" },
      { text: "#클라우드", type: "green" },
    ],

    articles: [
      {
        source: "연합뉴스",
        title: "네이버 AI 서비스 이용자 증가세",
        time: "3시간 전",
        icon: "Y",
      },
      {
        source: "한국경제",
        title: "네이버 광고 사업 실적 개선",
        time: "8시간 전",
        icon: "H",
      },
    ],
  },
];

/* =========================================================
   유틸
========================================================= */

const getIssueColor = (type) => {
  switch (type) {
    case "긍정":
      return "#35C98A";
    case "부정":
      return "#FF6B6B";
    case "주의":
      return "#F6B84B";
    case "중립":
    default:
      return "#4F8EF7";
  }
};

/* =========================================================
   메인 페이지
========================================================= */

export default function IssueTimelinePage({ mode = "timeline" }) {
  const [companies, setCompanies] = useState(defaultCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState(1);
  const [period, setPeriod] = useState("최근 1개월");

  /* -------------------------------------------------------
     localStorage 관심기업 불러오기

     현재 프로젝트에서 관심기업을 localStorage에 저장하고 있다면
     아래 키를 "watchlistCompanies"로 맞춰서 사용할 수 있습니다.
  ------------------------------------------------------- */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("watchlistCompanies");

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        /*
         * 저장된 데이터가 이름만 가지고 있는 경우에도
         * 기본 샘플 데이터와 연결되도록 처리
         */
        const savedCompanies = parsed
          .map((item) => {
            if (typeof item === "string") {
              return defaultCompanies.find((company) => company.name === item);
            }

            return (
              defaultCompanies.find(
                (company) =>
                  company.name === item.name || company.ticker === item.ticker,
              ) || item
            );
          })
          .filter(Boolean);

        if (savedCompanies.length > 0) {
          setCompanies(savedCompanies);
          setSelectedCompanyId(savedCompanies[0].id);
        }
      }
    } catch (error) {
      console.log("관심기업 데이터를 불러오지 못했습니다.", error);
    }
  }, []);

  const selectedCompany = useMemo(() => {
    return (
      companies.find((company) => company.id === selectedCompanyId) ||
      companies[0]
    );
  }, [companies, selectedCompanyId]);

  if (!selectedCompany) {
    return (
      <div style={styles.emptyPage}>
        <div style={styles.emptyIcon}>☆</div>
        <h2>등록된 관심기업이 없습니다.</h2>
        <p>기업 검색에서 관심기업을 등록해주세요.</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={styles.page}>
        {/* ===================================================
          상단 기업 선택 영역
      =================================================== */}

        <div style={styles.companySelectorArea}>
          <div>
            <div style={styles.pageEyebrow}>MY WATCHLIST</div>
            <h1 style={styles.pageTitle}>관심기업 분석</h1>
            <p style={styles.pageDescription}>
              관심기업의 주요 이슈와 리스크 변화를 한눈에 확인하세요.
            </p>
          </div>

          <div style={styles.companySelector}>
            <span style={styles.selectorLabel}>관심기업</span>

            <select
              value={selectedCompany.id}
              onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              style={styles.select}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.ticker})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================================================
          기업 기본정보
      =================================================== */}

        <section style={styles.companyHeader}>
          <div style={styles.companyLogo}>
            {selectedCompany.name.slice(0, 2)}
          </div>

          <div style={styles.companyInfo}>
            <div style={styles.companyNameRow}>
              <h2 style={styles.companyName}>{selectedCompany.name}</h2>

              <span style={styles.ticker}>({selectedCompany.ticker})</span>
            </div>

            <p style={styles.companyDescription}>
              {selectedCompany.description}
            </p>

            <div style={styles.companyTags}>
              <span>{selectedCompany.category}</span>
              <span>{selectedCompany.market}</span>
              <span>시가총액 {selectedCompany.marketCap}</span>
              <span>직원 수 {selectedCompany.employees}</span>
            </div>
          </div>

          <button
            style={styles.watchButton}
            onClick={() => {
              alert(
                `${selectedCompany.name}은 관심기업으로 등록되어 있습니다.`,
              );
            }}
          >
            ★ 관심기업
          </button>
        </section>

        {/* ===================================================
          상단 요약 카드
      =================================================== */}

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div>
              <div style={styles.cardTitle}>현재 위험도</div>

              <div style={styles.riskValueRow}>
                <span
                  style={{
                    ...styles.riskDot,
                    background:
                      selectedCompany.riskScore >= 60
                        ? "#FF6B6B"
                        : selectedCompany.riskScore >= 40
                          ? "#F6B84B"
                          : "#35C98A",
                  }}
                />

                <strong style={styles.riskText}>
                  {selectedCompany.riskLevel}
                </strong>
              </div>
            </div>

            <div style={styles.infoIcon}>i</div>
          </div>

          <div style={styles.summaryCard}>
            <div>
              <div style={styles.cardTitle}>최근 7일 변화</div>

              <div
                style={{
                  ...styles.changeValue,
                  color: selectedCompany.riskChange > 0 ? "#FF6B6B" : "#2E7DE9",
                }}
              >
                {selectedCompany.riskChange > 0 ? "▲" : "▼"}{" "}
                {Math.abs(selectedCompany.riskChange)}%
              </div>

              <div style={styles.smallText}>
                위험도 {selectedCompany.riskChange > 0 ? "증가" : "감소"}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ width: "100%" }}>
              <div style={styles.cardTitle}>주요 리스크 유형</div>

              <div style={styles.riskMiniList}>
                {selectedCompany.riskTypes
                  .slice()
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((risk) => (
                    <div key={risk.name} style={styles.riskMiniItem}>
                      <span
                        style={{
                          ...styles.miniDot,
                          background: risk.color,
                        }}
                      />
                      <span>{risk.name}</span>
                      <strong>{risk.value}</strong>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
          분석 카드 3개
      =================================================== */}

        <section style={styles.threeColumnGrid}>
          {/* 종합 리스크 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>종합 리스크 점수</h3>
              <span>100점 기준</span>
            </div>

            <div style={styles.riskChartArea}>
              <div
                style={{
                  ...styles.riskCircle,
                  background: `conic-gradient(
                  ${
                    selectedCompany.riskScore >= 60
                      ? "#FF6B6B"
                      : selectedCompany.riskScore >= 40
                        ? "#F6B84B"
                        : "#35C98A"
                  } ${selectedCompany.riskScore * 3.6}deg,
                  #edf2f7 ${selectedCompany.riskScore * 3.6}deg
                )`,
                }}
              >
                <div style={styles.riskCircleInner}>
                  <strong>{selectedCompany.riskScore}</strong>
                  <span>
                    {selectedCompany.riskScore >= 60
                      ? "높음"
                      : selectedCompany.riskScore >= 40
                        ? "보통"
                        : "낮음"}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.riskBreakdown}>
              {selectedCompany.riskTypes.map((risk) => (
                <div key={risk.name} style={styles.riskRow}>
                  <div style={styles.riskRowName}>
                    <span
                      style={{
                        ...styles.miniDot,
                        background: risk.color,
                      }}
                    />
                    {risk.name}
                  </div>

                  <strong>{risk.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* 감성 분석 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>감성 분석 요약</h3>
              <span>
                전체 {selectedCompany.sentimentTotal.toLocaleString()}건
              </span>
            </div>

            <div style={styles.sentimentContent}>
              <div
                style={{
                  ...styles.donut,
                  background: `conic-gradient(
                  #35C98A 0 ${selectedCompany.sentiment.positive}%,
                  #4F8EF7 ${selectedCompany.sentiment.positive}% ${
                    selectedCompany.sentiment.positive +
                    selectedCompany.sentiment.neutral
                  }%,
                  #FF6B6B ${
                    selectedCompany.sentiment.positive +
                    selectedCompany.sentiment.neutral
                  }% 100%
                )`,
                }}
              >
                <div style={styles.donutInner}>
                  <span>전체</span>
                  <strong>
                    {selectedCompany.sentimentTotal.toLocaleString()}건
                  </strong>
                </div>
              </div>

              <div style={styles.sentimentLegend}>
                <div>
                  <span
                    style={{
                      ...styles.legendDot,
                      background: "#35C98A",
                    }}
                  />
                  <span>긍정</span>
                  <strong>{selectedCompany.sentiment.positive}%</strong>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.legendDot,
                      background: "#4F8EF7",
                    }}
                  />
                  <span>중립</span>
                  <strong>{selectedCompany.sentiment.neutral}%</strong>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.legendDot,
                      background: "#FF6B6B",
                    }}
                  />
                  <span>부정</span>
                  <strong>{selectedCompany.sentiment.negative}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 감성 추이 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>감성 추이</h3>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={styles.periodSelect}
              >
                <option>최근 1개월</option>
                <option>최근 3개월</option>
                <option>최근 6개월</option>
              </select>
            </div>

            <div style={styles.lineChart}>
              <div style={styles.yAxis}>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              <div style={styles.chartBody}>
                <div style={styles.chartGridLine} />
                <div style={{ ...styles.chartGridLine, top: "33%" }} />
                <div style={{ ...styles.chartGridLine, top: "66%" }} />
                <div style={{ ...styles.chartGridLine, top: "100%" }} />

                <svg
                  viewBox="0 0 400 170"
                  preserveAspectRatio="none"
                  style={styles.svg}
                >
                  <polyline
                    fill="none"
                    stroke="#35C98A"
                    strokeWidth="3"
                    points={makeChartPoints(
                      selectedCompany.sentimentTrend,
                      "positive",
                    )}
                  />

                  <polyline
                    fill="none"
                    stroke="#4F8EF7"
                    strokeWidth="3"
                    points={makeChartPoints(
                      selectedCompany.sentimentTrend,
                      "neutral",
                    )}
                  />

                  <polyline
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="3"
                    points={makeChartPoints(
                      selectedCompany.sentimentTrend,
                      "negative",
                    )}
                  />
                </svg>
              </div>
            </div>

            <div style={styles.chartLegend}>
              <span>
                <i style={{ background: "#35C98A" }} />
                긍정
              </span>
              <span>
                <i style={{ background: "#4F8EF7" }} />
                중립
              </span>
              <span>
                <i style={{ background: "#FF6B6B" }} />
                부정
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
          하단 3컬럼
      =================================================== */}

        <section style={styles.bottomGrid}>
          {/* 주요 이슈 타임라인 */}
          <div style={styles.largePanel}>
            <div style={styles.panelHeader}>
              <h3>주요 이슈 타임라인</h3>
              <button style={styles.moreButton}>전체보기 ›</button>
            </div>

            <div style={styles.timeline}>
              {selectedCompany.issues.map((issue, index) => (
                <div key={`${issue.date}-${index}`} style={styles.timelineItem}>
                  <div style={styles.timelineDate}>{issue.date}</div>

                  <div style={styles.timelineLine}>
                    <span
                      style={{
                        ...styles.timelineDot,
                        background: getIssueColor(issue.type),
                      }}
                    />

                    {index !== selectedCompany.issues.length - 1 && (
                      <span style={styles.verticalLine} />
                    )}
                  </div>

                  <div style={styles.timelineContent}>
                    <div style={styles.issueTitleRow}>
                      <span
                        style={{
                          ...styles.issueType,
                          color: getIssueColor(issue.type),
                          background: `${getIssueColor(issue.type)}15`,
                        }}
                      >
                        {issue.type}
                      </span>

                      <strong>{issue.title}</strong>
                    </div>

                    <p>{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 핵심 키워드 */}
          <div style={styles.mediumPanel}>
            <div style={styles.panelHeader}>
              <h3>핵심 키워드</h3>
              <button style={styles.moreButton}>전체보기 ›</button>
            </div>

            <div style={styles.keywordContainer}>
              {selectedCompany.keywords.map((keyword) => (
                <span
                  key={keyword.text}
                  style={{
                    ...styles.keyword,
                    ...keywordStyles[keyword.type],
                  }}
                >
                  {keyword.text}
                </span>
              ))}
            </div>

            {/* 간단한 AI 분석 영역 */}
            <div style={styles.analysisBox}>
              <div style={styles.analysisIcon}>✦</div>

              <div>
                <strong>이슈 분석 요약</strong>

                <p>
                  최근 {selectedCompany.name} 관련 기사에서는{" "}
                  <b>{selectedCompany.keywords[0]?.text.replace("#", "")}</b>와
                  관련된 내용이 주요하게 언급되고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 관련 기사 */}
          <div style={styles.mediumPanel}>
            <div style={styles.panelHeader}>
              <h3>관련 기사</h3>
              <button style={styles.moreButton}>전체보기 ›</button>
            </div>

            <div style={styles.articleList}>
              {selectedCompany.articles.map((article, index) => (
                <div key={index} style={styles.articleItem}>
                  <div style={styles.articleSourceIcon}>{article.icon}</div>

                  <div style={styles.articleInfo}>
                    <strong>{article.source}</strong>
                    <p>{article.title}</p>
                  </div>

                  <span style={styles.articleTime}>{article.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* =========================================================
   감성 추이 그래프 좌표 생성
========================================================= */

function makeChartPoints(data, key) {
  const width = 400;
  const height = 150;

  if (!data || data.length === 0) return "";

  return data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (item[key] / 60) * height;

      return `${x},${y}`;
    })
    .join(" ");
}

/* =========================================================
   스타일
========================================================= */

const keywordStyles = {
  blue: {
    color: "#2877D6",
    background: "#EEF6FF",
  },

  green: {
    color: "#1FA66A",
    background: "#ECFAF3",
  },

  red: {
    color: "#E45656",
    background: "#FFF0F0",
  },

  orange: {
    color: "#D99420",
    background: "#FFF7E8",
  },
};

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#F5F8FC",
    padding: "32px 42px 60px",
    boxSizing: "border-box",
    color: "#172B4D",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',
  },

  companySelectorArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "22px",
  },

  pageEyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#4385D6",
    letterSpacing: "1.5px",
    marginBottom: "5px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    color: "#172B4D",
  },

  pageDescription: {
    margin: "7px 0 0",
    color: "#8090A5",
    fontSize: "13px",
  },

  companySelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  selectorLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748B",
  },

  select: {
    minWidth: "210px",
    padding: "11px 35px 11px 14px",
    border: "1px solid #DDE5EF",
    borderRadius: "9px",
    background: "#FFFFFF",
    color: "#263B5A",
    fontSize: "13px",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
  },

  companyHeader: {
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "14px",
    padding: "20px 22px",
    marginBottom: "14px",
    boxShadow: "0 2px 10px rgba(31, 61, 96, 0.03)",
  },

  companyLogo: {
    width: "72px",
    height: "72px",
    borderRadius: "12px",
    background: "#F5F9FD",
    border: "1px solid #E4EBF3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1D72D8",
    fontWeight: 900,
    fontSize: "17px",
    marginRight: "18px",
  },

  companyInfo: {
    flex: 1,
  },

  companyNameRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "7px",
  },

  companyName: {
    margin: 0,
    fontSize: "23px",
    fontWeight: 800,
    color: "#182D4D",
  },

  ticker: {
    color: "#52708F",
    fontSize: "13px",
    fontWeight: 600,
  },

  companyDescription: {
    margin: "5px 0 10px",
    color: "#718198",
    fontSize: "13px",
  },

  companyTags: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  watchButton: {
    border: "1px solid #D9E7F8",
    background: "#F5F9FF",
    color: "#337ACD",
    borderRadius: "8px",
    padding: "10px 15px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.4fr",
    gap: "14px",
    marginBottom: "14px",
  },

  summaryCard: {
    minHeight: "85px",
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "12px",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },

  cardTitle: {
    fontSize: "12px",
    color: "#718198",
    fontWeight: 700,
    marginBottom: "8px",
  },

  riskValueRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  riskDot: {
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    display: "inline-block",
  },

  riskText: {
    fontSize: "18px",
    color: "#223956",
  },

  infoIcon: {
    width: "17px",
    height: "17px",
    border: "1px solid #B9C5D5",
    borderRadius: "50%",
    color: "#7C8CA1",
    fontSize: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  changeValue: {
    fontSize: "20px",
    fontWeight: 800,
  },

  smallText: {
    color: "#93A0B1",
    fontSize: "11px",
    marginTop: "3px",
  },

  riskMiniList: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  },

  riskMiniItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "#66778D",
  },

  miniDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },

  threeColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.25fr",
    gap: "14px",
    marginBottom: "14px",
  },

  panel: {
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "13px",
    padding: "18px",
    boxSizing: "border-box",
    minHeight: "315px",
    boxShadow: "0 2px 10px rgba(31, 61, 96, 0.025)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  panelHeaderH3: {},

  panelHeaderTitle: {},

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  panel: {
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "13px",
    padding: "18px",
    boxSizing: "border-box",
    minHeight: "315px",
    boxShadow: "0 2px 10px rgba(31, 61, 96, 0.025)",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1.15fr",
    gap: "14px",
  },

  largePanel: {
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "13px",
    padding: "18px",
    boxSizing: "border-box",
  },

  mediumPanel: {
    background: "#FFFFFF",
    border: "1px solid #E5EBF3",
    borderRadius: "13px",
    padding: "18px",
    boxSizing: "border-box",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  panelHeaderTitle: {
    margin: 0,
  },

  moreButton: {
    border: "none",
    background: "transparent",
    color: "#7D8EA4",
    fontSize: "11px",
    cursor: "pointer",
  },

  periodSelect: {
    border: "1px solid #E2E9F1",
    background: "#FFFFFF",
    borderRadius: "6px",
    padding: "5px 8px",
    fontSize: "11px",
    color: "#66778D",
  },

  riskChartArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px 0 12px",
  },

  riskCircle: {
    width: "116px",
    height: "116px",
    borderRadius: "50%",
    padding: "9px",
    boxSizing: "border-box",
  },

  riskCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  riskBreakdown: {
    borderTop: "1px solid #EEF2F6",
    paddingTop: "10px",
  },

  riskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
    fontSize: "12px",
    color: "#64748B",
  },

  riskRowName: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  sentimentContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: "22px",
  },

  donut: {
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    padding: "14px",
    boxSizing: "border-box",
  },

  donutInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  sentimentLegend: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minWidth: "100px",
  },

  legendDot: {
    width: "9px",
    height: "9px",
    display: "inline-block",
    borderRadius: "50%",
    marginRight: "7px",
  },

  lineChart: {
    height: "205px",
    display: "flex",
    paddingTop: "12px",
  },

  yAxis: {
    width: "25px",
    height: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#A0ACBB",
    fontSize: "9px",
  },

  chartBody: {
    position: "relative",
    flex: 1,
    height: "150px",
  },

  chartGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderTop: "1px dashed #E8EDF3",
  },

  svg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "150px",
    overflow: "visible",
  },

  chartLegend: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    fontSize: "10px",
    color: "#75869A",
  },

  timeline: {
    position: "relative",
  },

  timelineItem: {
    display: "grid",
    gridTemplateColumns: "48px 20px 1fr",
    gap: "7px",
    minHeight: "73px",
  },

  timelineDate: {
    color: "#8A98AA",
    fontSize: "11px",
    paddingTop: "3px",
  },

  timelineLine: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },

  timelineDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    marginTop: "4px",
    zIndex: 2,
    boxShadow: "0 0 0 3px #FFFFFF",
  },

  verticalLine: {
    position: "absolute",
    width: "1px",
    background: "#DCE5EF",
    top: "14px",
    bottom: "-7px",
  },

  timelineContent: {
    paddingBottom: "14px",
  },

  issueTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  issueType: {
    padding: "3px 7px",
    borderRadius: "10px",
    fontSize: "9px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  timelineContentP: {},

  keywordContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    padding: "5px 0 20px",
  },

  keyword: {
    display: "inline-flex",
    padding: "8px 11px",
    borderRadius: "7px",
    fontSize: "11px",
    fontWeight: 700,
  },

  analysisBox: {
    display: "flex",
    gap: "10px",
    padding: "14px",
    background: "#F6F9FD",
    borderRadius: "9px",
    border: "1px solid #E8EEF5",
    marginTop: "10px",
  },

  analysisIcon: {
    width: "27px",
    height: "27px",
    borderRadius: "7px",
    background: "#E8F2FF",
    color: "#3B82D0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  articleList: {
    display: "flex",
    flexDirection: "column",
  },

  articleItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 0",
    borderBottom: "1px solid #EEF2F6",
  },

  articleSourceIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#EEF4FB",
    color: "#4A78AA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: 800,
    flexShrink: 0,
  },

  articleInfo: {
    flex: 1,
    minWidth: 0,
  },

  articleTime: {
    fontSize: "9px",
    color: "#9AA6B5",
    whiteSpace: "nowrap",
  },

  emptyPage: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#64748B",
  },

  emptyIcon: {
    fontSize: "45px",
    color: "#B5C2D1",
    marginBottom: "10px",
  },
};
