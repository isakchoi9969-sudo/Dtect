import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import { useWatchlist } from "../hooks/useWatchlist";
import AnalysisLoader from "./AnalysisLoader";
import { api } from "../config/api";

const LOGO_DEV_TOKEN = "pk_LmDNVeHjR3Sh2eSen5P1yA";
const companyDomains = {
  삼성SDI: "samsungsdi.co.kr",
  삼성물산: "samsungcnt.com",
  삼성바이오로직스: "samsungbiologics.com",
  삼성생명: "samsunglife.com",
  삼성엔지니어링: "samsungena.com",
  삼성전기: "samsungsem.com",
  삼성전자: "samsung.com",
  삼성중공업: "samsungcareers.com",
  삼성화재: "samsungfire.com",
  HD현대중공업: "hd-hhi.com",
  현대건설: "hdec.kr",
  현대글로비스: "glovis.net",
  현대모비스: "mobis.com",
  현대백화점: "ehyundai.com",
  현대위아: "hyundai-wia.com",
  현대자동차: "hyundai.com",
  현대제철: "hyundai-steel.com",
  카카오: "kakao.com",
  카카오게임즈: "kakaogames.com",
  SK바이오팜: "skbp.com",
  고려아연: "koreazinc.co.kr",
  하이브: "hybecorp.com",
  "JYP Ent.": "jype.com",
  "YG PLUS": "ygplus.com",
  SM: "smentertainment.com",
  하이트진로: "hitejinro.com",
  NAVER: "naver.com",
  이마트: "emart.com",
  금호석유화학: "recruit.kkpc.com",
  금호타이어: "kumhotire.com",
  미래에셋증권: "securities.miraeasset.com",
  LG디스플레이: "lgdisplay.com",
  LG생활건강: "lghnh.com",
  LG에너지솔루션: "lgensol.com",
  LG유플러스: "uplusumobile.com",
  LG이노텍: "lginnotek.com",
  LG전자: "lge.co.kr",
  LG화학: "lgchem.com",
  HMM: "www.hmm21.com",
  HD한국조선해양: "hd-ksoe.com",
  한국가스공사: "kogas.or.kr",
  한국전력: "kepco.co.kr",
  한국콜마: "kolmar.co.kr",
  한국타이어앤테크놀로지: "hankooktire.com",
  코스맥스: "cosmax.com",
  두산에너빌리티: "doosanenerbility.com",
  두산로보틱스: "doosanrobotics.com",
  두산밥캣: "doosanbobcat.com",
  롯데쇼핑: "lotteshoppingir.com",
  롯데에너지머티리얼즈: "lotteenergymaterials.com",
  롯데칠성음료: "company.lottechilsung.co.kr",
  롯데케미칼: "lottechem.com",
  CJ대한통운: "cjlogistics.com",
  대웅제약: "daewoong.co.kr",
  대한항공: "koreanair.com",
  아시아나항공: "flyasiana.com",
  제주항공: "jejuair.net",
  OCI홀딩스: "oci-holdings.co.kr",
  POSCO홀딩스: "posco-inc.com",
  SK스퀘어: "sksquare.com",
  SK하이닉스: "skhynix.com",
  펄어비스: "pearlabyss.com",
  BGF리테일: "bgfretail.com",
  CJ제일제당: "www.cj.co.kr",
  GS리테일: "gsretail.com",
  CJ: "cj.net",
  HLB: "hlbbio.co.kr",
  HL만도: "hlmando.com",
  에코프로비엠: "ecoprobm.com",
};
/* =========================================================
   유틸
========================================================= */

const sentimentLabels = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정",
};

function getArticleSource(article) {
  const sourceName = article.source?.name?.trim();
  if (sourceName) return sourceName;

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

  const elapsedMinutes = Math.floor(
    (Date.now() - publishedAt.getTime()) / 60000,
  );
  if (elapsedMinutes < 1) return "방금 전";
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}시간 전`;
  if (elapsedMinutes < 10080)
    return `${Math.floor(elapsedMinutes / 1440)}일 전`;

  return publishedAt.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function formatDateTime(value, fallback) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

/* =========================================================
   메인 페이지
========================================================= */

export default function CompanyAnalysisPage() {
  const { isWatched, toggleCompany, count, limit } = useWatchlist();

  // DB 기업 목록
  const [companies, setCompanies] = useState([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);

  // 뉴스 상태
  const [newsAnalysis, setNewsAnalysis] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const newsRequestIdRef = useRef(0);

  // DB에서 기업 목록 가져오기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/api/company");

        if (response.data.success) {
          const dbCompanies = response.data.data.map((company) => ({
            id: company.companyId,
            name: company.companyName,
            ticker: company.stockCode,
            category: company.industry,
            description: company.companyInfo,
            ceo: company.ceoName,
          }));

          setCompanies(dbCompanies);
        }
      } catch (error) {
        console.error("기업 목록 조회 실패:", error);
      } finally {
        setIsCompanyLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const selectedCompanyId = useMemo(() => {
    const companyId = new URLSearchParams(window.location.search).get(
      "companyId",
    );

    return Number(companyId) || companies[0]?.id;
  }, [companies]);

  // 선택된 기업
  const selectedCompany = useMemo(() => {
    return companies.find((company) => company.id === selectedCompanyId);
  }, [companies, selectedCompanyId]);

  // 선택된 기업의 뉴스 조회
  useEffect(() => {
    if (!selectedCompany?.name) return undefined;

    const controller = new AbortController();
    const requestId = newsRequestIdRef.current + 1;
    newsRequestIdRef.current = requestId;

    api
      .get("/api/news", {
        params: {
          query: selectedCompany.name,
          per_page: 100,
        },
        signal: controller.signal,
      })
      .then((response) => {
        if (newsRequestIdRef.current !== requestId) return;

        setNewsAnalysis(response.data);
        setNewsError("");
      })
      .catch((error) => {
        if (
          error.code === "ERR_CANCELED" ||
          newsRequestIdRef.current !== requestId
        ) {
          return;
        }

        setNewsError(
          getApiErrorMessage(
            error,
            "최신 뉴스 분석 결과를 불러오지 못했습니다.",
          ),
        );
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          newsRequestIdRef.current === requestId
        ) {
          setIsNewsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedCompany?.name, retryCount]);

  const retryNewsAnalysis = () => {
    setIsNewsLoading(true);
    setNewsError("");
    setRetryCount((count) => count + 1);
  };

  const sentiment = newsAnalysis?.sentiment_percentages ?? {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  const analyzedCount = newsAnalysis?.analyzed_count ?? 0;
  const fetchedCount = newsAnalysis?.fetched_count ?? 0;
  const relevantCount = newsAnalysis?.relevant_count ?? 0;
  const targetReached = newsAnalysis?.target_reached ?? false;
  const minimumKeywordMentions = newsAnalysis?.minimum_keyword_mentions ?? 3;
  const articles = newsAnalysis?.news_list ?? [];
  const analyzedAt = formatDateTime(
    newsAnalysis?.analyzed_at,
    "분석 시각 확인 중",
  );
  const latestArticlePublishedAt = formatDateTime(
    newsAnalysis?.latest_article_published_at,
    "최신 기사 발행 시각 확인 중",
  );
  const visibleArticles = articles.slice(0, 10);
  const realtimeAnalysisNotice = !newsAnalysis
    ? "최신 뉴스를 불러오면 기업 관련성 기준의 분석 현황이 표시됩니다."
    : relevantCount === 0
      ? `원본 기사 ${fetchedCount.toLocaleString()}건을 확인했지만 기업명 또는 별칭이 합계 ${minimumKeywordMentions}회 이상 언급된 기사가 없습니다.`
      : !targetReached
        ? `원본 기사 ${fetchedCount.toLocaleString()}건을 모두 확인해 관련 기사 ${relevantCount.toLocaleString()}건을 분석했습니다. 조건을 충족하는 기사가 100건보다 적을 수 있습니다.`
        : "새로고침 또는 기업 변경 시 최신 기사 기준으로 다시 분석됩니다. 이전 분석 결과는 저장하지 않습니다.";
  if (isCompanyLoading) {
    return <div>기업 정보를 불러오는 중입니다...</div>;
  }

  if (!selectedCompany) {
    return (
      <div style={styles.emptyPage}>
        <div style={styles.emptyIcon}>☆</div>
        <h2>등록된 관심기업이 없습니다.</h2>
        <p>기업 검색에서 관심기업을 등록해주세요.</p>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div style={styles.emptyPage}>
        <div style={styles.emptyIcon}>☆</div>
        <h2>등록된 관심기업이 없습니다.</h2>
        <p>기업 검색에서 관심기업을 등록해주세요.</p>
      </div>
    );
  }

  // 뉴스 분석 오류
  if (newsError) {
    return (
      <div style={styles.emptyPage}>
        <div style={styles.emptyIcon}>!</div>
        <h2>AI 분석 결과를 불러오지 못했습니다.</h2>
        <p>{newsError}</p>
        <button onClick={retryNewsAnalysis}>다시 분석하기</button>
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

          <section
            className="analysis-detail-header"
            style={styles.companyHeader}
          >
            <div style={styles.companyLogo}>
              {companyDomains[selectedCompany.name] ? (
                <img
                  src={`https://img.logo.dev/${
                    companyDomains[selectedCompany.name]
                  }?token=${LOGO_DEV_TOKEN}&size=128&format=png`}
                  alt={`${selectedCompany.name} 로고`}
                  style={{
                    width: "46px",
                    height: "46px",
                    maxWidth: "46px",
                    maxHeight: "46px",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                    margin: 0,
                    padding: 0,
                  }}
                />
              ) : (
                <span>{selectedCompany.name.slice(0, 2)}</span>
              )}
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
              </div>
            </div>

            <button
              style={styles.watchButton}
              onClick={() => {
                toggleCompany(selectedCompany.id);
              }}
            >
              {isWatched(selectedCompany.id) ? "★ 관심기업" : "☆ 관심기업"} (
              {count}/{limit})
            </button>
          </section>

          {/* ===================================================
          분석 카드
      =================================================== */}

          <section
            className="analysis-metrics-grid"
            style={styles.threeColumnGrid}
          >
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
                <div style={styles.panelTitleWithInfo}>
                  <h3>감성 분석 요약</h3>
                  <div className="sentiment-info-trigger">
                    <button
                      aria-describedby="sentiment-news-tooltip"
                      aria-label="최신 뉴스 감성 현황 보기"
                      className="sentiment-info-button"
                      type="button"
                    >
                      ?
                    </button>
                    <div
                      className="sentiment-info-tooltip"
                      id="sentiment-news-tooltip"
                      role="tooltip"
                    >
                      <strong style={styles.tooltipTitle}>
                        최신 뉴스 감성 현황
                      </strong>
                      <div style={styles.liveNewsDetails}>
                        <div style={styles.liveNewsDetailRow}>
                          <span style={styles.liveNewsDetailLabel}>
                            분석 기준
                          </span>
                          <strong>
                            기업명·별칭 합계 {minimumKeywordMentions}회 이상
                            언급된 최신 뉴스 최대 100건
                          </strong>
                        </div>
                        <div style={styles.liveNewsDetailRow}>
                          <span style={styles.liveNewsDetailLabel}>
                            수집 현황
                          </span>
                          <strong>
                            원본 {fetchedCount.toLocaleString()}건 확인 · 관련
                            기사 {relevantCount.toLocaleString()}건
                          </strong>
                        </div>
                        <div style={styles.liveNewsDetailRow}>
                          <span style={styles.liveNewsDetailLabel}>
                            분석 시각
                          </span>
                          <strong>{analyzedAt}</strong>
                        </div>
                        <div style={styles.liveNewsDetailRow}>
                          <span style={styles.liveNewsDetailLabel}>
                            가장 최신 기사
                          </span>
                          <strong>{latestArticlePublishedAt}</strong>
                        </div>
                        <p style={styles.tooltipNotice}>
                          {realtimeAnalysisNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <span>전체 {analyzedCount.toLocaleString()}건</span>
              </div>

              <div style={styles.sentimentContent}>
                <div
                  style={{
                    ...styles.donut,
                    background: `conic-gradient(
                   #35C98A 0 ${sentiment.positive}%,
                   #4F8EF7 ${sentiment.positive}% ${
                     sentiment.positive + sentiment.neutral
                   }%,
                   #FF6B6B ${sentiment.positive + sentiment.neutral}% 100%
                )`,
                  }}
                >
                  <div style={styles.donutInner}>
                    <span>전체</span>
                    <strong>{analyzedCount.toLocaleString()}건</strong>
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
          </section>

          {/* ===================================================
          하단 이슈 및 관련 기사
      =================================================== */}

          <section
            className="analysis-support-grid analysis-support-grid--articles"
            style={styles.bottomGrid}
          >
            {/* 관련 기사 */}
            <div style={styles.mediumPanel}>
              <div style={styles.panelHeader}>
                <h3>관련 기사</h3>
                <div style={styles.articleHeaderActions}>
                  <span>최신 10건</span>
                  <button
                    disabled={isNewsLoading}
                    onClick={retryNewsAnalysis}
                    style={{
                      ...styles.articleRefreshButton,
                      ...(isNewsLoading
                        ? styles.articleRefreshButtonDisabled
                        : {}),
                    }}
                    type="button"
                  >
                    {isNewsLoading ? "분석 중" : "새로고침"}
                  </button>
                </div>
              </div>

              <div className="analysis-article-grid" style={styles.articleList}>
                {visibleArticles.map((article, index) => {
                  const source = getArticleSource(article);
                  const articleUrl = article.original_link || article.link;

                  return (
                    <div
                      className="analysis-article-item"
                      key={`${articleUrl}-${index}`}
                      style={{
                        ...styles.articleItem,
                        gridColumn: index < 5 ? 1 : 2,
                        gridRow: (index % 5) + 1,
                      }}
                    >
                      <div style={styles.articleSourceIcon}>
                        {source.slice(0, 1).toUpperCase()}
                      </div>

                      <div style={styles.articleInfo}>
                        <strong>{source}</strong>
                        {articleUrl ? (
                          <a
                            href={articleUrl}
                            rel="noreferrer"
                            style={styles.articleTitle}
                            target="_blank"
                          >
                            {article.title}
                          </a>
                        ) : (
                          <p style={styles.articleTitle}>{article.title}</p>
                        )}
                        <span
                          style={{
                            ...styles.articleSentiment,
                            ...sentimentStyles[article.sentiment],
                          }}
                        >
                          {sentimentLabels[article.sentiment] ??
                            "분석 결과 없음"}
                          {Number.isFinite(article.score) &&
                            ` · 신뢰도 ${Math.round(article.score * 100)}%`}
                        </span>
                      </div>

                      <span style={styles.articleTime}>
                        {formatArticleTime(article.pub_date)}
                      </span>
                    </div>
                  );
                })}
                {!isNewsLoading &&
                  !newsError &&
                  newsAnalysis &&
                  articles.length === 0 && (
                    <p style={styles.articleEmpty}>
                      기업명 또는 별칭이 합계 {minimumKeywordMentions}회 이상
                      언급된 최신 기사가 없습니다.
                    </p>
                  )}
              </div>
            </div>

            {/* 주요 이슈 타임라인 */}
            <div style={styles.largePanel}>
              <div style={styles.panelHeader}>
                <h3>주요 이슈 타임라인</h3>
              </div>
              <AnalysisUnavailable description="유사 기사를 묶어 주요 이슈와 발생 시점을 만드는 기능을 준비하고 있습니다." />
            </div>
          </section>
        </div>
      </main>
      {isNewsLoading && <AnalysisLoader companyName={selectedCompany.name} />}
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

  liveNewsDetails: {
    display: "grid",
    gap: "10px",
    paddingTop: "12px",
    color: "#718198",
    fontSize: "11px",
  },

  liveNewsDetailRow: {
    display: "grid",
    gap: "3px",
  },

  liveNewsDetailLabel: {
    color: "#8A9AAF",
    fontSize: "10px",
  },

  tooltipTitle: {
    display: "block",
    color: "#1E3554",
    fontSize: "13px",
  },

  tooltipNotice: {
    margin: "2px 0 0",
    paddingTop: "9px",
    borderTop: "1px solid #E8EEF5",
    color: "#718198",
    fontWeight: 500,
    lineHeight: 1.55,
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },

  panelHeaderH3: {},

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "2.15fr 1.3fr",
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

  panelTitleWithInfo: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  articleHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  articleRefreshButton: {
    padding: "4px 8px",
    border: "1px solid #C9DCEF",
    borderRadius: "5px",
    background: "#FFFFFF",
    color: "#2473BE",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  articleRefreshButtonDisabled: {
    color: "#91A1B3",
    cursor: "not-allowed",
    opacity: 0.7,
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
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "24px",
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
    gridColumn: "1 / -1",
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
