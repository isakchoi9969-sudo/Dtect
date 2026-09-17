import React, { useMemo, useState } from "react";
import Header from "./Header";
import { useWatchlist } from "../hooks/useWatchlist";
import { companyProfiles } from "../data/companyProfiles";
import { api } from "../config/api";

/* =========================================================
   관심기업 샘플 데이터
   - 나중에 백엔드 API 연결 시 이 부분을 API 데이터로 교체하면 됩니다.
========================================================= */

const defaultCompanies = companyProfiles.map((company) => ({
  ...company,
  id: Number(company.ticker),
  category: company.industry,
  riskScore: company.analysis.risk.score,
  riskLevel: company.analysis.risk.level,
  riskChange: company.analysis.risk.change,
  riskTypes: company.analysis.risk.types,
  sentimentTotal: company.analysis.sentiment.total,
  sentiment: {
    positive: company.analysis.sentiment.positive,
    neutral: company.analysis.sentiment.neutral,
    negative: company.analysis.sentiment.negative,
  },
  sentimentTrend: company.analysis.sentiment.trend,
  keywords: company.analysis.keywords,
  issues: company.analysis.issues,
  articles: company.analysis.articles,
}));
/* =========================================================
   유틸
========================================================= */

const sentimentLabels = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정",
};

function getArticleSource(article) {
  try {
    const hostname = new URL(article.original_link || article.link).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "뉴스";
  }
}

function formatArticleTime(pubDate) {
  const publishedAt = new Date(pubDate);
  if (Number.isNaN(publishedAt.getTime())) return "발행일 미상";

  const elapsedMinutes = Math.floor((Date.now() - publishedAt.getTime()) / 60000);
  if (elapsedMinutes < 1) return "방금 전";
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}시간 전`;
  if (elapsedMinutes < 10080) return `${Math.floor(elapsedMinutes / 1440)}일 전`;

  return publishedAt.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error.response?.data?.detail ??
    error.response?.data?.message ??
    fallbackMessage
  );
}

function AnalysisUnavailable({ description, label = "준비 중" }) {
  return (
    <div style={styles.analysisUnavailable}>
      <span style={styles.analysisUnavailableBadge}>{label}</span>
      <p>{description}</p>
    </div>
  );
}

function makeChartPoints(data, key) {
  if (data.length < 2) return "";

  const width = 400;
  const height = 150;

  return data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (item[key] / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

/* =========================================================
   메인 페이지
========================================================= */

export default function CompanyAnalysisPage() {
  const [companies] = useState(defaultCompanies);
  const selectedCompanyId = useMemo(() => {
    const symbol = new URLSearchParams(window.location.search).get("symbol");
    return companies.find((company) => company.ticker === symbol)?.id ?? companies[0].id;
  }, [companies]);
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  const selectedCompany = useMemo(() => {
    return (
      companies.find((company) => company.id === selectedCompanyId) ||
      companies[0]
    );
  }, [companies, selectedCompanyId]);
  const [newsAnalysis, setNewsAnalysis] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [trendDays, setTrendDays] = useState(30);
  const [sentimentTrend, setSentimentTrend] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState("");

  React.useEffect(() => {
    if (!selectedCompany?.name) return undefined;

    const controller = new AbortController();

    api
      .get("/api/news", {
        params: {
          query: selectedCompany.name,
          per_page: 20,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setNewsAnalysis(response.data);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;

        setNewsError(
          getApiErrorMessage(
            error,
            "최신 뉴스 분석 결과를 불러오지 못했습니다.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsNewsLoading(false);
      });

    return () => controller.abort();
  }, [selectedCompany?.name, retryCount]);

  const retryNewsAnalysis = () => {
    setIsNewsLoading(true);
    setNewsError("");
    setNewsAnalysis(null);
    setRetryCount((count) => count + 1);
  };

  React.useEffect(() => {
    if (!selectedCompany?.name) return undefined;

    const controller = new AbortController();

    api
      .get("/api/news/trend", {
        params: {
          query: selectedCompany.name,
          days: trendDays,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setSentimentTrend(response.data.trend ?? []);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;

        setTrendError(
          getApiErrorMessage(
            error,
            "감성 추이 데이터를 불러오지 못했습니다.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTrendLoading(false);
      });

    return () => controller.abort();
  }, [selectedCompany?.name, trendDays]);

  const changeTrendDays = (event) => {
    setIsTrendLoading(true);
    setTrendError("");
    setSentimentTrend([]);
    setTrendDays(Number(event.target.value));
  };

  const sentiment = newsAnalysis?.sentiment_percentages ?? {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  const analyzedCount = newsAnalysis?.analyzed_count ?? 0;
  const articles = newsAnalysis?.news_list ?? [];

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
      <main className="company-analysis-detail">
      <div className="company-analysis-canvas" style={styles.page}>
        {/* ===================================================
          기업 기본정보
      =================================================== */}

        <section className="analysis-detail-header" style={styles.companyHeader}>
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
              toggleCompany(selectedCompany.ticker);
            }}
          >
            {isWatched(selectedCompany.ticker) ? "★ 관심기업" : "☆ 관심기업"} ({count}/{limit})
          </button>
        </section>

        <div aria-live="polite" role="status" style={styles.newsStatus}>
          {isNewsLoading && "최신 뉴스와 감성 분석 결과를 불러오는 중입니다."}
          {newsError && (
            <>
              <span>{newsError}</span>
              <button
                onClick={retryNewsAnalysis}
                style={styles.retryButton}
                type="button"
              >
                다시 시도
              </button>
            </>
          )}
          {newsAnalysis && !isNewsLoading && (
            <span>최신 뉴스 {newsAnalysis.analyzed_count}건 분석을 완료했습니다.</span>
          )}
        </div>

        {/* ===================================================
          상단 요약 카드
      =================================================== */}

        <section className="analysis-summary-grid" style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div>
              <div style={styles.cardTitle}>현재 위험도</div>
              <div style={styles.summaryPending}>실시간 산정 준비 중</div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div>
              <div style={styles.cardTitle}>최근 7일 변화</div>
              <div style={styles.summaryPending}>일별 분석 데이터 수집 예정</div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ width: "100%" }}>
              <div style={styles.cardTitle}>주요 리스크 유형</div>
              <div style={styles.summaryPending}>이슈 분류 모델 연동 예정</div>
            </div>
          </div>
        </section>

        {/* ===================================================
          분석 카드 3개
      =================================================== */}

        <section className="analysis-metrics-grid" style={styles.threeColumnGrid}>
          {/* 종합 리스크 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>종합 리스크 점수</h3>
              <span>분석 모델 준비 중</span>
            </div>
            <AnalysisUnavailable description="뉴스 감성, 이슈 유형, 언급량을 결합한 리스크 점수를 준비하고 있습니다." />
          </div>

          {/* 감성 분석 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>감성 분석 요약</h3>
              <span>
                전체 {analyzedCount.toLocaleString()}건
              </span>
            </div>

            <div style={styles.sentimentContent}>
              <div
                style={{
                  ...styles.donut,
                  background: `conic-gradient(
                   #35C98A 0 ${sentiment.positive}%,
                   #4F8EF7 ${sentiment.positive}% ${
                     sentiment.positive +
                     sentiment.neutral
                   }%,
                   #FF6B6B ${
                     sentiment.positive + sentiment.neutral
                   }% 100%
                )`,
                }}
              >
                <div style={styles.donutInner}>
                  <span>전체</span>
                  <strong>
                    {analyzedCount.toLocaleString()}건
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
                  <strong>{sentiment.positive}%</strong>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.legendDot,
                      background: "#4F8EF7",
                    }}
                  />
                  <span>중립</span>
                  <strong>{sentiment.neutral}%</strong>
                </div>

                <div>
                  <span
                    style={{
                      ...styles.legendDot,
                      background: "#FF6B6B",
                    }}
                  />
                  <span>부정</span>
                  <strong>{sentiment.negative}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 감성 추이 */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>감성 추이</h3>
              <select
                onChange={changeTrendDays}
                style={styles.periodSelect}
                value={trendDays}
              >
                <option value={30}>최근 1개월</option>
                <option value={90}>최근 3개월</option>
                <option value={180}>최근 6개월</option>
              </select>
            </div>
            {isTrendLoading && (
              <AnalysisUnavailable
                description="저장된 뉴스 분석 이력을 불러오고 있습니다."
                label="불러오는 중"
              />
            )}
            {!isTrendLoading && trendError && (
              <AnalysisUnavailable description={trendError} label="불러오기 실패" />
            )}
            {!isTrendLoading && !trendError && sentimentTrend.length < 2 && (
              <AnalysisUnavailable
                description="추이를 표시하려면 서로 다른 날짜의 뉴스 분석 이력이 더 필요합니다."
                label="이력 축적 중"
              />
            )}
            {!isTrendLoading && !trendError && sentimentTrend.length >= 2 && (
              <>
                <div style={styles.lineChart}>
                  <div style={styles.yAxis}>
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  <div style={styles.chartBody}>
                    <div style={styles.chartGridLine} />
                    <div style={{ ...styles.chartGridLine, top: "25%" }} />
                    <div style={{ ...styles.chartGridLine, top: "50%" }} />
                    <div style={{ ...styles.chartGridLine, top: "75%" }} />
                    <div style={{ ...styles.chartGridLine, top: "100%" }} />

                    <svg preserveAspectRatio="none" style={styles.svg} viewBox="0 0 400 170">
                      <polyline fill="none" points={makeChartPoints(sentimentTrend, "positive")} stroke="#35C98A" strokeWidth="3" />
                      <polyline fill="none" points={makeChartPoints(sentimentTrend, "neutral")} stroke="#4F8EF7" strokeWidth="3" />
                      <polyline fill="none" points={makeChartPoints(sentimentTrend, "negative")} stroke="#FF6B6B" strokeWidth="3" />
                    </svg>
                  </div>
                </div>

                <div style={styles.chartLegend}>
                  <span><i style={{ background: "#35C98A" }} />긍정</span>
                  <span><i style={{ background: "#4F8EF7" }} />중립</span>
                  <span><i style={{ background: "#FF6B6B" }} />부정</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ===================================================
          하단 3컬럼
      =================================================== */}

        <section className="analysis-support-grid" style={styles.bottomGrid}>
          {/* 주요 이슈 타임라인 */}
          <div style={styles.largePanel}>
            <div style={styles.panelHeader}>
              <h3>주요 이슈 타임라인</h3>
            </div>
            <AnalysisUnavailable description="유사 기사를 묶어 주요 이슈와 발생 시점을 만드는 기능을 준비하고 있습니다." />
          </div>

          {/* 핵심 키워드 */}
          <div style={styles.mediumPanel}>
            <div style={styles.panelHeader}>
              <h3>핵심 키워드</h3>
            </div>
            <AnalysisUnavailable description="기사 본문에서 기업별 핵심 키워드를 추출하는 기능을 준비하고 있습니다." />
          </div>

          {/* 관련 기사 */}
          <div style={styles.mediumPanel}>
            <div style={styles.panelHeader}>
              <h3>관련 기사</h3>
              <button style={styles.moreButton}>전체보기 ›</button>
            </div>

            <div style={styles.articleList}>
              {articles.map((article, index) => {
                const source = getArticleSource(article);
                const articleUrl = article.original_link || article.link;

                return (
                  <div key={`${articleUrl}-${index}`} style={styles.articleItem}>
                    <div style={styles.articleSourceIcon}>{source.slice(0, 1).toUpperCase()}</div>

                    <div style={styles.articleInfo}>
                      <strong>{source}</strong>
                      {articleUrl ? (
                        <a href={articleUrl} rel="noreferrer" style={styles.articleTitle} target="_blank">
                          {article.title}
                        </a>
                      ) : (
                        <p style={styles.articleTitle}>{article.title}</p>
                      )}
                      <span style={{ ...styles.articleSentiment, ...sentimentStyles[article.sentiment] }}>
                        {sentimentLabels[article.sentiment] ?? "분석 결과 없음"}
                        {Number.isFinite(article.score) && ` · 신뢰도 ${Math.round(article.score * 100)}%`}
                      </span>
                    </div>

                    <span style={styles.articleTime}>{formatArticleTime(article.pub_date)}</span>
                  </div>
                );
              })}
              {!isNewsLoading && !newsError && newsAnalysis && articles.length === 0 && (
                <p style={styles.articleEmpty}>표시할 최신 기사가 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </div>
      </main>
    </>
  );
}

/* =========================================================
   스타일
========================================================= */

const sentimentStyles = {
  positive: {
    color: "#16845B",
    background: "#EAF9F2",
  },
  neutral: {
    color: "#2877D6",
    background: "#EEF6FF",
  },
  negative: {
    color: "#D84A5A",
    background: "#FFF0F1",
  },
};

const styles = {
  page: {
    width: "min(calc(100% - 48px), var(--container))",
    margin: "0 auto",
    background: "transparent",
    padding: "32px 0 60px",
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

  newsStatus: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "22px",
    margin: "-4px 0 18px",
    color: "#66768A",
    fontSize: "13px",
  },

  retryButton: {
    padding: "5px 9px",
    border: "1px solid #BFD6ED",
    borderRadius: "6px",
    color: "#176FC5",
    background: "#FFFFFF",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
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

  summaryPending: {
    color: "#9AA6B5",
    fontSize: "12px",
    fontWeight: 600,
  },

  analysisUnavailable: {
    display: "flex",
    minHeight: "190px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "20px",
    color: "#718198",
    textAlign: "center",
  },

  analysisUnavailableBadge: {
    padding: "4px 8px",
    borderRadius: "999px",
    color: "#4A78AA",
    background: "#EEF4FB",
    fontSize: "10px",
    fontWeight: 800,
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

  panelHeaderH3: {},

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

  articleTitle: {
    display: "block",
    overflow: "hidden",
    margin: "3px 0 5px",
    color: "#263B5A",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: 1.45,
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  articleSentiment: {
    display: "inline-block",
    padding: "2px 5px",
    borderRadius: "4px",
    fontSize: "9px",
    fontWeight: 700,
  },

  articleTime: {
    fontSize: "9px",
    color: "#9AA6B5",
    whiteSpace: "nowrap",
  },

  articleEmpty: {
    margin: 0,
    padding: "16px 0",
    color: "#8090A5",
    fontSize: "12px",
    textAlign: "center",
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

