import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import AnalysisLoader from "./AnalysisLoader";
import { useWatchlist } from "../hooks/useWatchlist";
import { stripEvidenceMarkers } from "../utils/analysisText";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";
import { paginate } from "../utils/pagination";
import CompanyLogo from "./CompanyLogo";
import { communitySamplePosts } from "../data/communityPosts";

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
    <div className="analysis-unavailable" style={styles.analysisUnavailable}>
      <span className="analysis-unavailable-badge" style={styles.analysisUnavailableBadge}>{label}</span>
      <p>{description}</p>
    </div>
  );
}

function hasPoliteAnalysisTone(text) {
  if (typeof text !== "string" || !text.trim()) return false;
  if (
    /(?:하세요|하십시오|해야\s+합니다|하셔야\s+합니다|주의\s+바랍니다|착각하지)/u.test(
      text,
    )
  )
    return false;
  return text
    .trim()
    .split(/(?<=[.!?。？！])\s+/u)
    .every((sentence) => {
      const withoutCitation = sentence.replace(
        /\s*[[(]A\d+(?:\s*,\s*A\d+)*[\])](?=[.!?。？！…"'“”‘’」』）)]*\s*$)/u,
        "",
      );
      const normalized = withoutCitation
        .trim()
        .replace(/[.!?。？！…"'“”‘’」』）)\]}\s]+$/u, "");
      return normalized.endsWith("니다");
    });
}

function getAnalysisParagraphs(text) {
  const paragraphs = String(text || "")
    .split(/\r?\n+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  // Older API responses contain one long paragraph; split at polite sentence endings,
  // preserving decimal numbers, abbreviations and article references within sentences.
  return paragraphs
    .flatMap((part) => part.split(/(?<=니다[.!?。？！])\s*/u))
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildPoliteMetricSummary(assessment) {
  const count = Number(assessment?.articleCount) || 0;
  const negativePercent =
    Number(assessment?.signals?.negativeArticlePercent) || 0;
  const activeDays = Number(assessment?.signals?.negativeActiveDays) || 0;
  const score = Number.isFinite(Number(assessment?.riskScore))
    ? Number(assessment.riskScore)
    : null;
  const scoreSentence =
    score === null
      ? "현재는 종합 점수를 산출하지 않아 세부 지표만 안내해 드립니다."
      : `현재 뉴스 기반 종합 점수는 ${score}점이며, 수집 기사에서 확인된 위험 신호를 기준으로 산출했습니다.`;
  return [
    `최근 수집된 기사 ${count.toLocaleString()}건과 지표를 기준으로 안내해 드립니다.`,
    `관련 기사 중 부정 정서로 분류된 비율은 ${negativePercent}%이며, 최근 30일 동안 해당 기사가 확인된 날짜는 ${activeDays}일입니다.`,
    scoreSentence,
    "이 결과는 수집된 뉴스와 분류 결과에 한정된 참고 지표이며, 기업의 전반적인 재무 상태나 향후 주가를 단정하지 않습니다.",
    "최근 공시와 실적도 함께 살펴보시면 더 균형 있게 판단하실 수 있습니다.",
  ].join(" ");
}

function getRiskPresentation(assessment) {
  if (!assessment) return { score: null, level: "unknown", label: "평가 중" };
  if (assessment.status === "llm_unavailable") {
    return { score: null, level: "unknown", label: "평가 대기" };
  }
  const score =
    assessment.riskScore !== null &&
    assessment.riskScore !== undefined &&
    Number.isFinite(Number(assessment.riskScore))
      ? Number(assessment.riskScore)
      : null;
  if (score === null)
    return {
      score: null,
      level: assessment.riskLevel || "unknown",
      label: assessment.riskLevelLabel || "평가 중",
    };
  const level =
    score >= 75
      ? "critical"
      : score >= 50
        ? "high"
        : score >= 25
          ? "watch"
          : "low";
  const label = { low: "낮음", watch: "주의", high: "높음", critical: "심각" }[
    level
  ];
  return { score, level, label };
}

function formatQuoteTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시각 확인 중";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExchangeLabel(exchange) {
  if (exchange === "코스피" || exchange === "KOSPI") return "KOSPI";
  if (exchange === "코스닥" || exchange === "KOSDAQ") return "KOSDAQ";
  return exchange || "KRX";
}

function getMarketClock(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
    weekday: "short",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    isWeekday: !["Sat", "Sun"].includes(values.weekday),
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function getMarketSession(marketStatus, market) {
  const isUnitedStates = market === "US";
  const clock = getMarketClock(
    isUnitedStates ? "America/New_York" : "Asia/Seoul",
  );
  const openAt = isUnitedStates ? 9 * 60 + 30 : 9 * 60;
  const closeAt = isUnitedStates ? 16 * 60 : 15 * 60 + 30;
  const country = isUnitedStates ? "US" : "KR";

  if (!clock.isWeekday) {
    return { country, label: "휴장", state: "closed" };
  }
  if (clock.minutes < openAt) {
    return { country, label: "개장 전", state: "upcoming" };
  }
  if (clock.minutes >= closeAt) {
    return { country, label: "장 마감", state: "closed" };
  }
  if (marketStatus === "OPEN") {
    return { country, label: "장중", state: "open" };
  }
  return { country, label: "휴장", state: "closed" };
}

function StockQuote({ error, loading, quote }) {
  if (loading) {
    return (
      <div className="company-stock-quote company-stock-quote--loading">
        <span>현재가</span>
        <strong>시세 확인 중…</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-stock-quote company-stock-quote--error">
        <span>현재가</span>
        <strong>시세 조회 불가</strong>
      </div>
    );
  }

  if (!quote) return null;

  const change = Number(quote.change) || 0;
  const changeRate = Number(quote.changeRate) || 0;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const sign = change > 0 ? "+" : "";
  const directionMark = change > 0 ? "▲" : change < 0 ? "▼" : "-";
  const marketSession = getMarketSession(quote.marketStatus, "KR");
  const status =
    marketSession.state === "open"
      ? "정규장 · 15초 갱신"
      : marketSession.label.includes("개장 전")
        ? "정규장 개장 전"
        : marketSession.label.includes("장 마감")
          ? "정규장 마감"
          : "정규장 휴장";

  return (
    <div
      aria-live="polite"
      className={`company-stock-quote company-stock-quote--${direction}`}
      title={`네이버 금융 시세 · ${formatQuoteTime(quote.tradedAt)} 기준`}
    >
      <div className="company-stock-quote-meta">
        <span
          className={`company-stock-status${
            marketSession.state === "open" ? " company-stock-status--open" : ""
          }`}
        >
          <i />
          {status}
          <span className="company-stock-info-trigger">
            <button
              aria-describedby="company-stock-info-tooltip"
              aria-label="실시간 주가 갱신 기준 보기"
              type="button"
            >
              ?
            </button>
            <span
              className="company-stock-info-tooltip"
              id="company-stock-info-tooltip"
              role="tooltip"
            >
              화면은 15초마다 최신 시세를 확인합니다. 한국 정규장은
              09:00~15:30이며, 종료 후에도 시간외·NXT 거래로 가격이 갱신될 수
              있습니다. 상태 문구는 정규장 기준입니다.
            </span>
          </span>
        </span>
        <small className="company-stock-exchange">
          {getExchangeLabel(quote.exchange)}
        </small>
      </div>
      <strong className="company-stock-price">
        {Number(quote.price).toLocaleString("ko-KR")}원
      </strong>
      <div className="company-stock-change">
        <span>
          <i aria-hidden="true">{directionMark}</i>
          {change === 0
            ? "변동 없음"
            : `${sign}${change.toLocaleString("ko-KR")}원`}
        </span>
        <span>
          {change === 0 ? "0.00%" : `${sign}${changeRate.toFixed(2)}%`}
        </span>
        <small>{formatQuoteTime(quote.tradedAt)}</small>
      </div>
    </div>
  );
}

function buildSparkline(history, width = 184, height = 64) {
  const values = (history || []).map((point) => Number(point.value));
  if (values.length < 2 || values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const padding = 4;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const line = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - minimum) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return {
    area: `${padding},${height - padding} ${line.join(" ")} ${width - padding},${height - padding}`,
    end: line[line.length - 1].split(","),
    line: line.join(" "),
  };
}

function StockPriceChart({
  error,
  loading,
  onPeriodChange,
  period,
  points,
  quoteChange,
}) {
  const chartPoints = points || [];
  const sparkline = buildSparkline(chartPoints, 218, 70);
  const firstValue = Number(chartPoints[0]?.value);
  const lastValue = Number(chartPoints[chartPoints.length - 1]?.value);
  const changeRate =
    Number.isFinite(firstValue) &&
    firstValue !== 0 &&
    Number.isFinite(lastValue)
      ? ((lastValue - firstValue) / firstValue) * 100
      : null;
  const directionValue =
    period === "1d" && Number.isFinite(Number(quoteChange))
      ? Number(quoteChange)
      : changeRate;
  const direction =
    directionValue > 0 ? "up" : directionValue < 0 ? "down" : "flat";

  return (
    <div className={`company-stock-chart company-stock-chart--${direction}`}>
      <div className="company-stock-chart-header">
        <span>주가 추이</span>
        <div
          className="company-stock-chart-periods"
          aria-label="주가 그래프 기간"
        >
          {[
            ["1d", "1일"],
            ["7d", "7일"],
            ["1m", "1개월"],
          ].map(([value, label]) => (
            <button
              className={period === value ? "active" : ""}
              key={value}
              onClick={() => onPeriodChange(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="company-stock-chart-body">
        {sparkline && !loading && !error ? (
          <svg
            aria-label={`현재 주가 ${period} 추이`}
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 218 70"
          >
            <polygon
              className="company-stock-chart-area"
              points={sparkline.area}
            />
            <polyline
              className="company-stock-chart-line"
              points={sparkline.line}
            />
            <circle
              className="company-stock-chart-point"
              cx={sparkline.end[0]}
              cy={sparkline.end[1]}
              r="3"
            />
          </svg>
        ) : (
          <span>
            {loading
              ? "그래프 조회 중"
              : error
                ? "그래프 조회 불가"
                : "데이터 없음"}
          </span>
        )}
      </div>
    </div>
  );
}

function MarketIndexSidebar({ error, exchangeRate, indices, loading }) {
  const indexMap = new Map((indices || []).map((index) => [index.code, index]));

  return (
    <aside className="market-index-sidebar" aria-label="주요 시장 지수">
      <div className="market-index-panel">
        <div className="market-index-heading">
          <div>
            <span>MARKET</span>
            <h2>시장 지수</h2>
          </div>
          <span className="market-index-live market-index-live--guide">
            <i /> 시장별 상태
          </span>
        </div>

        <div className="market-index-list" aria-live="polite">
          {["KOSPI", "KOSDAQ", "NASDAQ", "SP500"].map((code) => {
            const marketIndex = indexMap.get(code);
            const marketSession =
              loading || !marketIndex
                ? {
                    country: ["NASDAQ", "SP500"].includes(code) ? "US" : "KR",
                    label: "확인 중",
                    state: "loading",
                  }
                : getMarketSession(
                    marketIndex.marketStatus,
                    ["NASDAQ", "SP500"].includes(code) ? "US" : "KR",
                  );
            const dailyChange = Number(marketIndex?.change) || 0;
            const changeRate = Number(marketIndex?.changeRate) || 0;
            const direction =
              dailyChange > 0 ? "up" : dailyChange < 0 ? "down" : "flat";
            const sign = dailyChange > 0 ? "+" : "";
            const directionMark =
              dailyChange > 0 ? "▲" : dailyChange < 0 ? "▼" : "-";
            const history = marketIndex?.history || [];
            const sparkline = buildSparkline(history);
            const firstValue = Number(history[0]?.value);
            const lastValue = Number(history[history.length - 1]?.value);
            const periodRate =
              Number.isFinite(firstValue) &&
              firstValue !== 0 &&
              Number.isFinite(lastValue)
                ? ((lastValue - firstValue) / firstValue) * 100
                : null;

            return (
              <article
                className={`market-index-card market-index-card--${direction} market-index-card--${code.toLowerCase()}`}
                key={code}
                title={
                  marketIndex
                    ? `네이버 금융 시세 · ${formatQuoteTime(marketIndex.tradedAt)} 기준`
                    : undefined
                }
              >
                <div className="market-index-card-heading">
                  <strong>
                    {marketIndex?.name || (code === "SP500" ? "S&P 500" : code)}
                  </strong>
                  <div className="market-index-card-meta">
                    <span
                      className={`market-session-badge market-session-badge--${marketSession.state}`}
                    >
                      <span className="market-session-flag" aria-hidden="true">
                        <img
                          alt=""
                          src={`/flags/${marketSession.country.toLowerCase()}.svg`}
                        />
                      </span>
                      {marketSession.label}
                    </span>
                    <small>{formatQuoteTime(marketIndex?.tradedAt)}</small>
                  </div>
                </div>
                <div className="market-index-quote">
                  <strong>
                    {loading || error || !marketIndex
                      ? "—"
                      : Number(marketIndex.value).toLocaleString("ko-KR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </strong>
                  <span>
                    {loading
                      ? "조회 중"
                      : error || !marketIndex
                        ? "조회 불가"
                        : `${directionMark} ${sign}${changeRate.toFixed(2)}%`}
                  </span>
                </div>

                <div className="market-index-chart">
                  {sparkline ? (
                    <svg
                      aria-label={`${code} 최근 3개월 추이`}
                      preserveAspectRatio="none"
                      role="img"
                      viewBox="0 0 184 64"
                    >
                      <polygon
                        className="market-index-chart-area"
                        points={sparkline.area}
                      />
                      <polyline
                        className="market-index-chart-line"
                        points={sparkline.line}
                      />
                      <circle
                        className="market-index-chart-point"
                        cx={sparkline.end[0]}
                        cy={sparkline.end[1]}
                        r="3"
                      />
                    </svg>
                  ) : (
                    <span>
                      {loading
                        ? "그래프를 불러오는 중입니다."
                        : "그래프 데이터 없음"}
                    </span>
                  )}
                </div>

                <div className="market-index-period">
                  <span>최근 3개월</span>
                  <strong
                    className={
                      periodRate > 0 ? "up" : periodRate < 0 ? "down" : "flat"
                    }
                  >
                    {periodRate === null
                      ? "—"
                      : `${periodRate > 0 ? "+" : ""}${periodRate.toFixed(2)}%`}
                  </strong>
                </div>
              </article>
            );
          })}
        </div>

        <ExchangeRateCard error={error} loading={loading} rate={exchangeRate} />
      </div>
    </aside>
  );
}

function ExchangeRateCard({ error, loading, rate }) {
  const change = Number(rate?.change) || 0;
  const changeRate = Number(rate?.changeRate) || 0;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const sign = change > 0 ? "+" : "";
  const mark = change > 0 ? "▲" : change < 0 ? "▼" : "-";

  return (
    <div className={`exchange-rate-card exchange-rate-card--${direction}`}>
      <div>
        <span>EXCHANGE</span>
        <strong>USD/KRW</strong>
      </div>
      <div>
        <strong>
          {loading || error || !rate
            ? "—"
            : `${Number(rate.value).toLocaleString("ko-KR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}원`}
        </strong>
        <small>
          {loading
            ? "조회 중"
            : error || !rate
              ? "조회 불가"
              : `${mark} ${sign}${change.toFixed(2)} (${sign}${changeRate.toFixed(2)}%)`}
        </small>
      </div>
    </div>
  );
}

function RelatedCompanySidebar({
  companies,
  companyName,
  error,
  loading,
  mode,
}) {
  const openCompany = (companyId) => {
    window.location.assign(`${ROUTES.COMPANY_DETAIL}?companyId=${companyId}`);
  };

  return (
    <aside className="related-company-sidebar" aria-label="연관기업">
      <div className="related-company-panel">
        <div className="related-company-heading">
          <div>
            <span>RELATED</span>
            <div className="related-company-title-row">
              <h2>연관기업</h2>
              <div className="related-company-info-trigger">
                <button
                  aria-describedby="related-company-tooltip"
                  aria-label="연관기업 표출 기준 보기"
                  className="related-company-info-button"
                  type="button"
                >
                  ?
                </button>
                <div
                  className="related-company-info-tooltip"
                  id="related-company-tooltip"
                  role="tooltip"
                >
                  <strong>연관기업 표출 기준</strong>
                  <p className="related-company-tooltip-context">
                    {companyName} 기준 ·{" "}
                    {mode === "news"
                      ? "뉴스 기반"
                      : mode === "hybrid"
                        ? "뉴스·동일 업종 혼합"
                        : "동일 업종 기반"}
                  </p>
                  <ul>
                    <li>최근 90일 기사에서 함께 언급된 기업을 분석합니다.</li>
                    <li>
                      기본 기준은 서로 다른 기사 3건, 언론사 2곳 이상입니다.
                    </li>
                    <li>
                      제목 동시 언급과 최신 기사에 더 높은 점수를 부여합니다.
                    </li>
                    <li>결과가 부족하면 뉴스 기준을 단계적으로 완화합니다.</li>
                    <li>최소 2개가 안 되면 동일 업종 기업으로 보완합니다.</li>
                    <li>
                      현재 조회 중인 기업은 제외하며 최대 5개를 표시합니다.
                    </li>
                  </ul>
                  {companies.length > 0 && (
                    <div className="related-company-tooltip-results">
                      <span>현재 표출 근거</span>
                      {companies.map((company) => (
                        <div key={company.companyId}>
                          <strong>{company.companyName}</strong>
                          <small>
                            {company.relationType === "news"
                              ? `기사 ${company.articleCount}건 · 언론사 ${company.pressCount}곳`
                              : "동일 업종"}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <span className="related-company-symbol" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        {loading && (
          <div className="related-company-state" role="status">
            연관기업을 찾고 있습니다…
          </div>
        )}
        {!loading && error && (
          <div className="related-company-state related-company-state--error">
            {error}
          </div>
        )}
        {!loading && !error && companies.length === 0 && (
          <div className="related-company-state">
            표시할 연관기업이 없습니다.
          </div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="related-company-list">
            {companies.map((company) => (
              <button
                className="related-company-item"
                key={company.companyId}
                onClick={() => openCompany(company.companyId)}
                type="button"
              >
                <span className="related-company-logo">
                  <CompanyLogo companyName={company.companyName} />
                </span>
                <span className="related-company-copy">
                  <strong>{company.companyName}</strong>
                </span>
                <span className="related-company-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

/* =========================================================
   메인 페이지
========================================================= */

export default function CompanyAnalysisPage() {
  const { isWatched, toggleCompany } = useWatchlist();

  // DB 기업 목록
  const [companies, setCompanies] = useState([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);

  // 뉴스 상태
  const [newsAnalysis, setNewsAnalysis] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [articlePage, setArticlePage] = useState(1);
  const newsRequestIdRef = useRef(0);

  // 연관기업 상태
  const [relatedCompanies, setRelatedCompanies] = useState([]);
  const [relatedCompanyMode, setRelatedCompanyMode] = useState("news");
  const [isRelatedCompanyLoading, setIsRelatedCompanyLoading] = useState(true);
  const [relatedCompanyError, setRelatedCompanyError] = useState("");

  // 실시간 주가 상태
  const [stockQuote, setStockQuote] = useState(null);
  const [isStockQuoteLoading, setIsStockQuoteLoading] = useState(true);
  const [stockQuoteError, setStockQuoteError] = useState("");
  const [stockChartPeriod, setStockChartPeriod] = useState("1d");
  const [stockChartPoints, setStockChartPoints] = useState([]);
  const [isStockChartLoading, setIsStockChartLoading] = useState(true);
  const [stockChartError, setStockChartError] = useState("");
  const [marketIndices, setMarketIndices] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isMarketIndicesLoading, setIsMarketIndicesLoading] = useState(true);
  const [marketIndicesError, setMarketIndicesError] = useState("");
  const [riskAssessmentResult, setRiskAssessmentResult] = useState(null);

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

  useEffect(() => {
    if (!selectedCompanyId || !/^\d{6}$/.test(selectedCompany?.ticker || "")) {
      return undefined;
    }

    const controller = new AbortController();
    let requestInFlight = false;

    const fetchStockQuote = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await api.get(
          `/api/company/${selectedCompanyId}/quote`,
          { signal: controller.signal },
        );
        setStockQuote(response.data.data || null);
        setStockQuoteError("");
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setStockQuoteError(
            getApiErrorMessage(error, "현재 주가를 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsStockQuoteLoading(false);
        requestInFlight = false;
      }
    };

    fetchStockQuote();
    const refreshTimer = window.setInterval(fetchStockQuote, 15_000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [selectedCompany?.ticker, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId || !/^\d{6}$/.test(selectedCompany?.ticker || "")) {
      return undefined;
    }

    const controller = new AbortController();
    let requestInFlight = false;

    const fetchStockChart = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await api.get(
          `/api/company/${selectedCompanyId}/quote-history`,
          {
            params: { period: stockChartPeriod },
            signal: controller.signal,
          },
        );
        setStockChartPoints(response.data.data || []);
        setStockChartError("");
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setStockChartError(
            getApiErrorMessage(error, "주가 그래프를 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsStockChartLoading(false);
        requestInFlight = false;
      }
    };

    fetchStockChart();
    const refreshTimer = window.setInterval(
      fetchStockChart,
      stockChartPeriod === "1d" ? 15_000 : 5 * 60_000,
    );

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [selectedCompany?.ticker, selectedCompanyId, stockChartPeriod]);

  const changeStockChartPeriod = (period) => {
    if (period === stockChartPeriod) return;
    setStockChartPeriod(period);
    setStockChartPoints([]);
    setStockChartError("");
    setIsStockChartLoading(true);
  };

  useEffect(() => {
    const controller = new AbortController();
    let requestInFlight = false;

    const fetchMarketIndices = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await api.get("/api/company/market-indices", {
          signal: controller.signal,
        });
        setMarketIndices(response.data.data || []);
        setExchangeRate(response.data.exchangeRate || null);
        setMarketIndicesError("");
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setMarketIndicesError(
            getApiErrorMessage(error, "시장 지수를 불러오지 못했습니다."),
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsMarketIndicesLoading(false);
        requestInFlight = false;
      }
    };

    fetchMarketIndices();
    const refreshTimer = window.setInterval(fetchMarketIndices, 15_000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (!selectedCompanyId || !newsAnalysis) return undefined;

    const controller = new AbortController();

    api
      .post(
        `/api/company/${selectedCompanyId}/related`,
        {
          articles: (newsAnalysis.news_list || []).map((article) => ({
            title: article.title,
            description: article.description,
            pub_date: article.pub_date,
            source: article.source,
          })),
        },
        { signal: controller.signal },
      )
      .then((response) => {
        setRelatedCompanies(response.data.data || []);
        setRelatedCompanyMode(response.data.mode || "news");
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setRelatedCompanies([]);
        setRelatedCompanyError(
          getApiErrorMessage(error, "연관기업을 불러오지 못했습니다."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRelatedCompanyLoading(false);
      });

    return () => controller.abort();
  }, [newsAnalysis, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId || !newsAnalysis) return undefined;
    const controller = new AbortController();

    api
      .post(
        `/api/company/${selectedCompanyId}/risk-assessment`,
        {
          articles: (newsAnalysis.news_list || []).map((article) => ({
            title: article.title,
            description: article.description,
            pub_date: article.pub_date,
            source: article.source,
            original_link: article.original_link,
            sentiment: article.sentiment,
            score: article.score,
          })),
        },
        { signal: controller.signal },
      )
      .then((response) =>
        setRiskAssessmentResult({
          companyId: selectedCompanyId,
          newsAnalysis,
          assessment: response.data.data || null,
          error: "",
        }),
      )
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setRiskAssessmentResult({
          companyId: selectedCompanyId,
          newsAnalysis,
          assessment: null,
          error: getApiErrorMessage(
            error,
            "종합 리스크 평가를 불러오지 못했습니다.",
          ),
        });
      });

    return () => controller.abort();
  }, [newsAnalysis, selectedCompanyId]);

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

        const analysis = response.data;

        setNewsAnalysis(analysis);
        setArticlePage(1);
        setNewsError("");

        // 관심기업일 때만 서버가 이력과 알림을 저장합니다.
        // 로그인하지 않은 경우는 화면 오류로 표시하지 않습니다.
        void api
          .post(`/api/company/${selectedCompanyId}/analysis-snapshots`, {
            // 모델 내부 결과값을 위험 신호 비율로 전달
            riskSignalRate: analysis.sentiment_percentages?.negative ?? 0,
            analyzedCount: analysis.analyzed_count ?? 0,
            analyzedAt: analysis.analyzed_at,
          })
          .catch((saveError) => {
            if (saveError.response?.status !== 401) {
              console.error("분석 이력 저장 실패:", saveError);
            }
          });
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
  const sentimentEntries = [
    {
      key: "positive",
      label: "긍정",
      color: "#35C98A",
      value: Number(sentiment.positive) || 0,
    },
    {
      key: "neutral",
      label: "중립",
      color: "#4F8EF7",
      value: Number(sentiment.neutral) || 0,
    },
    {
      key: "negative",
      label: "부정",
      color: "#FF6B6B",
      value: Number(sentiment.negative) || 0,
    },
  ];
  const leadingSentiment = sentimentEntries.reduce(
    (leading, entry) => (entry.value > leading.value ? entry : leading),
    sentimentEntries[0],
  );
  const hasCurrentRiskAssessment =
    riskAssessmentResult?.companyId === selectedCompanyId &&
    riskAssessmentResult?.newsAnalysis === newsAnalysis;
  const riskAssessment = hasCurrentRiskAssessment
    ? riskAssessmentResult.assessment
    : null;
  const cleanedAnalysis = stripEvidenceMarkers(
    riskAssessment?.analysisResult || "",
  );
  const analysisToneValid =
    riskAssessment?.status === "ready" &&
    hasPoliteAnalysisTone(cleanedAnalysis);
  const analysisResultToDisplay = analysisToneValid
    ? cleanedAnalysis
    : buildPoliteMetricSummary(riskAssessment);
  const riskAssessmentError = hasCurrentRiskAssessment
    ? riskAssessmentResult.error
    : "";
  const isRiskAssessmentLoading = Boolean(
    selectedCompanyId &&
    (isNewsLoading || (newsAnalysis && !hasCurrentRiskAssessment)),
  );
  const riskPresentation = getRiskPresentation(riskAssessment);
  const analyzedCount = newsAnalysis?.analyzed_count ?? 0;
  const fetchedCount = newsAnalysis?.fetched_count ?? 0;
  const relevantCount = newsAnalysis?.relevant_count ?? 0;
  const targetReached = newsAnalysis?.target_reached ?? false;
  const minimumKeywordMentions = newsAnalysis?.minimum_keyword_mentions ?? 2;
  const articles = newsAnalysis?.news_list ?? [];
  const companyDiscussionPosts = communitySamplePosts
    .filter((post) => post.code === String(selectedCompany?.ticker || ""))
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);
  const companyDiscussionUrl = `${ROUTES.COMMUNITY_STOCK}?company=${encodeURIComponent(selectedCompany?.name || "")}&code=${encodeURIComponent(selectedCompany?.ticker || "")}`;
  const articlesPerPage = 10;
  const articlePageCount = Math.ceil(articles.length / articlesPerPage);
  const currentArticlePage = Math.min(
    articlePage,
    Math.max(articlePageCount, 1),
  );
  const analyzedAt = formatDateTime(
    newsAnalysis?.analyzed_at,
    "분석 시각 확인 중",
  );
  const latestArticlePublishedAt = formatDateTime(
    newsAnalysis?.latest_article_published_at,
    "최신 기사 발행 시각 확인 중",
  );
  const visibleArticles = paginate(
    articles,
    currentArticlePage,
    articlesPerPage,
  );
  const realtimeAnalysisNotice = !newsAnalysis
    ? "최신 뉴스를 불러오면 기업 관련성 기준의 분석 현황이 표시됩니다."
    : relevantCount === 0
      ? `원본 기사 ${fetchedCount.toLocaleString()}건을 확인했지만 제목·본문 요약에서 기업명·별칭이 합산 ${minimumKeywordMentions}회 이상 언급된 기사가 없습니다.`
      : !targetReached
        ? `원본 기사 ${fetchedCount.toLocaleString()}건을 모두 확인해 관련 기사 ${relevantCount.toLocaleString()}건을 분석했습니다. 조건을 충족하는 기사가 100건보다 적을 수 있습니다.`
        : "최신 뉴스를 확인하며, 내용이 같은 기사의 감성분석 결과는 재사용합니다.";
  if (isCompanyLoading) {
    return <div className="company-analysis-empty" style={styles.emptyPage}>기업 정보를 불러오는 중입니다...</div>;
  }

  if (!selectedCompany) {
    return (
      <div className="company-analysis-empty" style={styles.emptyPage}>
        <div style={styles.emptyIcon}>☆</div>
        <h2>등록된 관심기업이 없습니다.</h2>
        <p>기업 검색에서 관심기업을 등록해주세요.</p>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="company-analysis-empty" style={styles.emptyPage}>
        <div style={styles.emptyIcon}>☆</div>
        <h2>등록된 관심기업이 없습니다.</h2>
        <p>기업 검색에서 관심기업을 등록해주세요.</p>
      </div>
    );
  }

  // 뉴스 분석 오류
  if (newsError) {
    return (
      <div className="company-analysis-empty" style={styles.emptyPage}>
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
        <RelatedCompanySidebar
          companies={relatedCompanies}
          companyName={selectedCompany.name}
          error={relatedCompanyError}
          loading={isRelatedCompanyLoading}
          mode={relatedCompanyMode}
        />
        <MarketIndexSidebar
          error={marketIndicesError}
          exchangeRate={exchangeRate}
          indices={marketIndices}
          loading={isMarketIndicesLoading}
        />
        <div className="company-analysis-canvas" style={styles.page}>
          {/* ===================================================
          기업 기본정보
      =================================================== */}

          <section
            className="analysis-detail-header"
            style={styles.companyHeader}
          >
            <div style={styles.companyLogo}>
              <CompanyLogo companyName={selectedCompany.name} size={46} />
            </div>

            <div style={styles.companyInfo}>
              <div style={styles.companyNameRow}>
                <h2 style={styles.companyName}>{selectedCompany.name}</h2>

                <span style={styles.ticker}>({selectedCompany.ticker})</span>

                <button
                  aria-label={
                    isWatched(selectedCompany.id)
                      ? `${selectedCompany.name} 관심기업 해제`
                      : `${selectedCompany.name} 관심기업 등록`
                  }
                  className={`company-watch-star${
                    isWatched(selectedCompany.id) ? " active" : ""
                  }`}
                  onClick={() => toggleCompany(selectedCompany.id)}
                  title={
                    isWatched(selectedCompany.id)
                      ? "관심기업 해제"
                      : "관심기업 등록"
                  }
                  type="button"
                >
                  {isWatched(selectedCompany.id) ? "★" : "☆"}
                </button>
              </div>

              <p style={styles.companyDescription}>
                {selectedCompany.description}
              </p>

              {(selectedCompany.category || stockQuote?.exchange) && (
                <div style={styles.companyTags}>
                  {selectedCompany.category && (
                    <span>{selectedCompany.category}</span>
                  )}
                  {stockQuote?.exchange && (
                    <span>{getExchangeLabel(stockQuote.exchange)}</span>
                  )}
                </div>
              )}
            </div>

            {/^\d{6}$/.test(selectedCompany.ticker || "") && (
              <div className="company-market-overview">
                <StockQuote
                  error={stockQuoteError}
                  loading={isStockQuoteLoading}
                  quote={stockQuote}
                />
                <StockPriceChart
                  error={stockChartError}
                  loading={isStockChartLoading}
                  onPeriodChange={changeStockChartPeriod}
                  period={stockChartPeriod}
                  points={stockChartPoints}
                  quoteChange={stockQuote?.change}
                />
              </div>
            )}
          </section>

          {/* ===================================================
          분석 카드
      =================================================== */}

          <section
            className="analysis-metrics-grid analysis-metrics-grid--combined"
            style={styles.threeColumnGrid}
          >
            <div className="risk-sentiment-combined-card">
              {/* 종합 리스크 */}
              <div className="overall-risk-assessment">
                <div style={styles.panelHeader}>
                  <h3>종합 리스크 점수</h3>
                  <span>
                    {riskAssessment?.status === "llm_unavailable"
                      ? "뉴스 지표"
                      : riskAssessment?.status === "ready"
                        ? "뉴스·정량 지표 통합 평가"
                        : "근거 기반 평가"}
                  </span>
                </div>
                {isRiskAssessmentLoading ? (
                  <div className="risk-assessment-loading">
                    <AnalysisUnavailable
                      label="분석 중"
                      description="최근 기사와 위험 지표를 살펴보고 있습니다. 잠시만 기다려 주세요."
                    />
                  </div>
                ) : ["ready", "llm_unavailable", "insufficient_data"].includes(
                    riskAssessment?.status,
                  ) ? (
                  <div className="risk-assessment-content">
                    <div
                      className={`risk-score-summary risk-level-${riskPresentation.level}`}
                    >
                      <div className="risk-score-primary">
                        <span className="risk-score-caption">
                          종합 지표 점수
                        </span>
                        <div className="risk-score-number">
                          <strong>{riskPresentation.score ?? "—"}</strong>
                          <span>/100</span>
                        </div>
                      </div>
                      <div className="risk-score-status">
                        <span className="risk-score-status-caption">
                          현재 위험 수준
                        </span>
                        <span className="risk-level-pill">
                          <i />
                          {riskPresentation.label}
                        </span>
                      </div>
                    </div>
                    <section
                      className={`risk-final-evaluation ${riskAssessment.status === "ready" ? "is-ready" : "is-pending"}`}
                    >
                      <div className="risk-final-evaluation-header">
                        <span
                          className="risk-final-evaluation-icon"
                          aria-hidden="true"
                        >
                          ✦
                        </span>
                        <strong>분석 결과</strong>
                        <span className="risk-final-evaluation-state">
                          {riskAssessment.status === "ready"
                            ? analysisToneValid &&
                              riskAssessment.analysisMode !== "metric_fallback"
                              ? "분석 완료"
                              : "뉴스 지표 요약"
                            : riskAssessment.status === "insufficient_data"
                              ? "자료 부족"
                              : "평가 대기"}
                        </span>
                      </div>
                      {riskAssessment.status === "ready" ? (
                        <div className="risk-analysis-narrative">
                          {getAnalysisParagraphs(analysisResultToDisplay).map(
                            (paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ),
                          )}
                        </div>
                      ) : (
                        <p>
                          {riskAssessment.status === "insufficient_data"
                            ? riskAssessment.evaluationMessage
                            : "최근 뉴스와 지표가 준비되면 이슈 및 긍정·부정 전망을 함께 표시합니다."}
                        </p>
                      )}
                    </section>
                    <div className="risk-signal-heading">
                      <strong>산출 지표</strong>
                      <span>각 항목의 강도 · 100점 기준</span>
                    </div>
                    <div className="risk-signal-list">
                      {[
                        [
                          "이슈 영향도",
                          riskAssessment.impactScore,
                          "기사에서 확인된 이슈가 회사 사업에 미칠 수 있는 영향의 크기입니다. 긍정·부정 방향과는 별도로 평가합니다.",
                        ],
                        [
                          "이슈 보도 확산도",
                          riskAssessment.signals?.scores
                            ?.negativeNewsAcceleration,
                          "관련 보도량과 보도처가 이전 기간보다 늘어난 정도를 살피고, 관련 기사 중 부정으로 분류된 비중을 반영합니다.",
                        ],
                        [
                          "보도 지속도",
                          riskAssessment.signals?.scores?.negativePersistence,
                          "부정으로 분류된 관련 기사가 나온 날짜 수를 기준으로 산출합니다. 여러 날에 걸쳐 보도될수록 점수가 높아집니다.",
                        ],
                        [
                          "기사 정서 지표",
                          riskAssessment.signals?.scores?.negativeSentiment,
                          "부정으로 분류된 기사 비율과 감성 분류 신뢰도, 분석 기사 수를 함께 반영합니다. 기사 수가 적으면 표본 영향을 낮춰 계산합니다.",
                        ],
                      ].map(([label, score, explanation], index) => (
                        <div className="risk-signal-row" key={label}>
                          <div className="risk-signal-row-top">
                            <span className="risk-signal-label">
                              {label}
                              <span className="risk-signal-info-trigger">
                                <button
                                  aria-describedby={`risk-signal-tooltip-${index}`}
                                  aria-label={`${label} 점수 설명`}
                                  className="risk-signal-info-button"
                                  type="button"
                                >
                                  ?
                                </button>
                                <span
                                  className="risk-signal-info-tooltip"
                                  id={`risk-signal-tooltip-${index}`}
                                  role="tooltip"
                                >
                                  <strong>{label}</strong>
                                  <span>{explanation}</span>
                                </span>
                              </span>
                            </span>
                            <div className="risk-signal-value">
                              <b>{score == null ? "—" : score}</b>
                              <small>
                                {score == null
                                  ? label === "이슈 영향도"
                                    ? "분석 대기"
                                    : "자료 없음"
                                  : "/100"}
                              </small>
                            </div>
                          </div>
                          <div
                            aria-label={`${label}: ${score == null ? "자료 없음" : `${score}점 / 100점`}`}
                            className={`risk-signal-track${score == null ? " is-empty" : ""}`}
                            role="img"
                          >
                            {score != null && (
                              <i
                                style={{
                                  width: `${Math.max(0, Math.min(100, Number(score) || 0))}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <AnalysisUnavailable
                    label={riskAssessmentError ? "연결 오류" : "평가 불가"}
                    description={
                      riskAssessmentError ||
                      riskAssessment?.evaluationMessage ||
                      "평가 결과를 불러오지 못했습니다."
                    }
                  />
                )}
              </div>

              {/* 감성 분석 */}
              <div className="sentiment-summary-pane">
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
                              제목·본문 요약에서 기업명·별칭을 합산해{" "}
                              {minimumKeywordMentions}회 이상 언급한 최신 뉴스
                              최대 100건
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

                {!newsAnalysis ? (
                  <AnalysisUnavailable
                    label={isNewsLoading ? "분석 중" : "조회 오류"}
                    description={
                      isNewsLoading
                        ? "최신 뉴스의 감성을 분석하고 있습니다. 기업 정보와 주가는 먼저 확인하실 수 있습니다."
                        : newsError || "뉴스를 다시 불러와 주세요."
                    }
                  />
                ) : (
                  <div className="sentiment-breakdown">
                    <div className="sentiment-breakdown-summary">
                      <span className="sentiment-breakdown-kicker">
                        기사 감성 분포
                      </span>
                      <strong>
                        {analyzedCount > 0
                          ? `${leadingSentiment.label} 기사 비중이 가장 높습니다`
                          : "분석된 기사가 없습니다"}
                      </strong>
                    </div>
                    <div
                      aria-label={`긍정 ${sentiment.positive}%, 중립 ${sentiment.neutral}%, 부정 ${sentiment.negative}%`}
                      className="sentiment-composition-bar"
                      role="img"
                    >
                      {sentimentEntries.map((entry) => (
                        <span
                          key={entry.key}
                          style={{
                            backgroundColor: entry.color,
                            width: `${Math.max(0, entry.value)}%`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="sentiment-breakdown-cards">
                      {sentimentEntries.map((entry) => (
                        <div
                          className={`sentiment-breakdown-card sentiment-${entry.key}`}
                          key={entry.key}
                        >
                          <span className="sentiment-breakdown-label">
                            <i aria-hidden="true" />
                            {entry.label}
                          </span>
                          <strong>
                            {entry.value}
                            <small>%</small>
                          </strong>
                          <span
                            className="sentiment-breakdown-track"
                            aria-hidden="true"
                          >
                            <i
                              style={{ width: `${Math.max(0, entry.value)}%` }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="sentiment-breakdown-note">
                      기업명·별칭 언급 기준을 통과한 최신 기사{" "}
                      {analyzedCount.toLocaleString()}건을 분류했습니다.
                    </p>
                  </div>
                )}
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
                  <span>
                    전체 {articles.length.toLocaleString()}건 ·{" "}
                    {currentArticlePage}/{Math.max(articlePageCount, 1)}페이지
                  </span>
                </div>
              </div>

              {isNewsLoading && (
                <p role="status">
                  최신 뉴스와 감성분석 결과를 불러오고 있습니다.
                </p>
              )}
              {newsError && <p role="alert">{newsError}</p>}
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
                          className={`analysis-article-sentiment analysis-article-sentiment--${article.sentiment || "unknown"}`}
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
                      제목·본문 요약에서 기업명 또는 별칭이 합산{" "}
                      {minimumKeywordMentions}회 이상 언급된 최신 기사가
                      없습니다.
                    </p>
                  )}
              </div>
              {articlePageCount > 1 && (
                <nav
                  aria-label="관련 기사 페이지"
                  className="article-pagination"
                >
                  <button
                    aria-label="이전 기사 페이지"
                    disabled={currentArticlePage === 1}
                    onClick={() =>
                      setArticlePage((page) => Math.max(1, page - 1))
                    }
                    type="button"
                  >
                    이전
                  </button>
                  {Array.from(
                    { length: articlePageCount },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      aria-current={
                        page === currentArticlePage ? "page" : undefined
                      }
                      aria-label={`${page}페이지 기사`}
                      className={page === currentArticlePage ? "is-active" : ""}
                      key={page}
                      onClick={() => setArticlePage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    aria-label="다음 기사 페이지"
                    disabled={currentArticlePage === articlePageCount}
                    onClick={() =>
                      setArticlePage((page) =>
                        Math.min(articlePageCount, page + 1),
                      )
                    }
                    type="button"
                  >
                    다음
                  </button>
                </nav>
              )}
            </div>

            {/* 해당 기업의 종목 토론 */}
            <div className="company-discussion-panel" style={styles.largePanel}>
              <div className="company-discussion-heading">
                <div>
                  <span className="company-discussion-eyebrow">COMMUNITY</span>
                  <h3>{selectedCompany.name} 종목토론방</h3>
                  <p>이 기업의 종목 코드와 연결된 게시글만 모았습니다.</p>
                </div>
                <a href={companyDiscussionUrl}>토론방 전체 보기 <span aria-hidden="true">›</span></a>
              </div>
              {companyDiscussionPosts.length ? (
                <div className="company-discussion-list">
                  {companyDiscussionPosts.map((post) => (
                    <a className="company-discussion-post" href={companyDiscussionUrl} key={post.id}>
                      <div className="company-discussion-post-meta">
                        <span>{post.author}</span><i>·</i><span>{post.time}</span>
                        <span className="company-discussion-post-sentiment">{post.sentiment}</span>
                      </div>
                      <strong>{post.title}</strong>
                      <span className="company-discussion-post-stats">조회 {post.views.toLocaleString()} · 댓글 {post.comments.toLocaleString()}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="company-discussion-empty">
                  <span aria-hidden="true">✦</span>
                  <strong>아직 이 종목에 등록된 글이 없습니다.</strong>
                  <p>토론방에서 {selectedCompany.name} 관련 의견을 확인해보세요.</p>
                  <a href={companyDiscussionUrl}>종목토론방 열기</a>
                </div>
              )}
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
