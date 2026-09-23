import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import { useWatchlist } from "../hooks/useWatchlist";
import AnalysisLoader from "./AnalysisLoader";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";

const LOGO_DEV_TOKEN =
  import.meta.env.VITE_LOGO_DEV_TOKEN || "pk_LmDNVeHjR3Sh2eSen5P1yA";
const companyDomains = {
  BGF리테일: "bgfretail.com",
  CJ: "cj.net",
  CJ대한통운: "cjlogistics.com",
  CJ제일제당: "cj.co.kr",
  DL이앤씨: "dlenc.co.kr",
  GS: "gs.co.kr",
  GS건설: "gsenc.com",
  GS리테일: "gsretail.com",
  HD한국조선해양: "hd-ksoe.com",
  HD현대중공업: "hd-hhi.com",
  HLB: "hlbbio.co.kr",
  HL만도: "hlmando.com",
  HMM: "hmm21.com",
  "JYP Ent.": "jype.com",
  KB금융: "kbfg.com",
  KT: "kt.com",
  "KT&G": "ktng.com",
  LG디스플레이: "lgdisplay.com",
  LG생활건강: "lghnh.com",
  LG에너지솔루션: "lgensol.com",
  LG유플러스: "lguplus.com",
  LG이노텍: "lginnotek.com",
  LG전자: "lge.co.kr",
  LG화학: "lgchem.com",
  "LS ELECTRIC": "ls-electric.com",
  NAVER: "naver.com",
  OCI홀딩스: "oci-holdings.co.kr",
  POSCO홀딩스: "posco-inc.com",
  "S-OIL": "s-oil.com",
  SKC: "skc.kr",
  SK바이오팜: "skbp.com",
  SK스퀘어: "sksquare.com",
  SK온: "sk-on.com",
  SK이노베이션: "skinnovation.com",
  SK텔레콤: "sktelecom.com",
  SK하이닉스: "skhynix.com",
  SM: "smentertainment.com",
  SPC: "spc.co.kr",
  "YG PLUS": "ygplus.com",
  고려아연: "koreazinc.co.kr",
  금호석유화학: "kkpc.com",
  금호타이어: "kumhotire.com",
  기아: "kia.com",
  넷마블: "netmarble.com",
  농심: "nongshim.com",
  대웅제약: "daewoong.co.kr",
  대한항공: "koreanair.com",
  두산로보틱스: "doosanrobotics.com",
  두산밥캣: "doosanbobcat.com",
  두산에너빌리티: "doosanenerbility.com",
  롯데쇼핑: "lotteshoppingir.com",
  롯데에너지머티리얼즈: "lotteenergymaterials.com",
  롯데칠성음료: "lottechilsung.co.kr",
  롯데케미칼: "lottechem.com",
  메리츠금융지주: "meritzgroup.com",
  미래에셋증권: "securities.miraeasset.com",
  삼성SDI: "samsungsdi.co.kr",
  삼성물산: "samsungcnt.com",
  삼성바이오로직스: "samsungbiologics.com",
  삼성생명: "samsunglife.com",
  삼성엔지니어링: "samsungena.com",
  삼성전기: "samsungsem.com",
  삼성전자: "samsung.com",
  삼성중공업: "samsungshi.com",
  삼성화재: "samsungfire.com",
  삼양식품: "samyangfoods.com",
  셀트리온: "celltrion.com",
  신세계: "shinsegae.com",
  신한지주: "shinhangroup.com",
  아모레퍼시픽: "amorepacific.com",
  아시아나항공: "flyasiana.com",
  에코프로: "ecopro.co.kr",
  에코프로비엠: "ecoprobm.co.kr",
  엔씨소프트: "ncsoft.com",
  엘앤에프: "landf.co.kr",
  오뚜기: "ottogi.co.kr",
  오리온: "orionworld.com",
  우리금융: "woorifg.com",
  우리금융지주: "woorifg.com",
  유한양행: "yuhan.co.kr",
  이마트: "emart.com",
  제주항공: "jejuair.net",
  종근당: "ckdhc.com",
  카카오: "kakao.com",
  카카오게임즈: "kakaogames.com",
  코스맥스: "cosmax.com",
  쿠팡: "coupang.com",
  크래프톤: "krafton.com",
  펄어비스: "pearlabyss.com",
  포스코퓨처엠: "poscofuturem.com",
  하나금융: "hanafn.com",
  하나금융지주: "hanafn.com",
  하이브: "hybecorp.com",
  하이트진로: "hitejinro.com",
  한국가스공사: "kogas.or.kr",
  한국전력: "kepco.co.kr",
  한국콜마: "kolmar.co.kr",
  한국타이어앤테크놀로지: "hankooktire.com",
  한미약품: "hanmi.co.kr",
  한진칼: "hanjinkal.co.kr",
  한화솔루션: "hanwhasolutions.com",
  한화에어로스페이스: "hanwhaaerospace.com",
  한화오션: "hanwhaocean.com",
  현대건설: "hdec.kr",
  현대글로비스: "glovis.net",
  현대모비스: "mobis.com",
  현대백화점: "ehyundai.com",
  현대위아: "hyundai-wia.com",
  현대자동차: "hyundai.com",
  현대제철: "hyundai-steel.com",
  호텔신라: "hotelshilla.net",
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
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

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

function CompanyLogo({ companyName, size = 34 }) {
  const domain = companyDomains[companyName];
  const [imageFailed, setImageFailed] = useState(false);

  if (!domain || imageFailed) {
    return (
      <span aria-label={`${companyName} 글자 로고`} title={companyName}>
        {companyName.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      alt={`${companyName} 로고`}
      onError={() => setImageFailed(true)}
      src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=96&format=png`}
      style={{
        display: "block",
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
      }}
    />
  );
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
  const status = marketSession.state === "open"
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
          {change === 0 ? "변동 없음" : `${sign}${change.toLocaleString("ko-KR")}원`}
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
    const y = height - padding - ((value - minimum) / range) * (height - padding * 2);
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
  const changeRate = Number.isFinite(firstValue) && firstValue !== 0 &&
    Number.isFinite(lastValue)
    ? ((lastValue - firstValue) / firstValue) * 100
    : null;
  const directionValue = period === "1d" && Number.isFinite(Number(quoteChange))
    ? Number(quoteChange)
    : changeRate;
  const direction = directionValue > 0
    ? "up"
    : directionValue < 0
      ? "down"
      : "flat";

  return (
    <div className={`company-stock-chart company-stock-chart--${direction}`}>
      <div className="company-stock-chart-header">
        <span>주가 추이</span>
        <div className="company-stock-chart-periods" aria-label="주가 그래프 기간">
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
            <polygon className="company-stock-chart-area" points={sparkline.area} />
            <polyline className="company-stock-chart-line" points={sparkline.line} />
            <circle
              className="company-stock-chart-point"
              cx={sparkline.end[0]}
              cy={sparkline.end[1]}
              r="3"
            />
          </svg>
        ) : (
          <span>{loading ? "그래프 조회 중" : error ? "그래프 조회 불가" : "데이터 없음"}</span>
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
            const marketSession = loading || !marketIndex
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
            const direction = dailyChange > 0
              ? "up"
              : dailyChange < 0
                ? "down"
                : "flat";
            const sign = dailyChange > 0 ? "+" : "";
            const directionMark = dailyChange > 0 ? "▲" : dailyChange < 0 ? "▼" : "-";
            const history = marketIndex?.history || [];
            const sparkline = buildSparkline(history);
            const firstValue = Number(history[0]?.value);
            const lastValue = Number(history[history.length - 1]?.value);
            const periodRate = Number.isFinite(firstValue) && firstValue !== 0 &&
              Number.isFinite(lastValue)
              ? ((lastValue - firstValue) / firstValue) * 100
              : null;

            return (
              <article
                className={`market-index-card market-index-card--${direction} market-index-card--${code.toLowerCase()}`}
                key={code}
                title={marketIndex
                  ? `네이버 금융 시세 · ${formatQuoteTime(marketIndex.tradedAt)} 기준`
                  : undefined}
              >
                <div className="market-index-card-heading">
                  <strong>{marketIndex?.name || (code === "SP500" ? "S&P 500" : code)}</strong>
                  <div className="market-index-card-meta">
                    <span className={`market-session-badge market-session-badge--${marketSession.state}`}>
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
                      <polygon className="market-index-chart-area" points={sparkline.area} />
                      <polyline className="market-index-chart-line" points={sparkline.line} />
                      <circle
                        className="market-index-chart-point"
                        cx={sparkline.end[0]}
                        cy={sparkline.end[1]}
                        r="3"
                      />
                    </svg>
                  ) : (
                    <span>{loading ? "그래프를 불러오는 중입니다." : "그래프 데이터 없음"}</span>
                  )}
                </div>

                <div className="market-index-period">
                  <span>최근 3개월</span>
                  <strong className={periodRate > 0 ? "up" : periodRate < 0 ? "down" : "flat"}>
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

function RelatedCompanySidebar({ companies, companyName, error, loading, mode }) {
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
                    {companyName} 기준 · {mode === "news"
                      ? "뉴스 기반"
                      : mode === "hybrid"
                        ? "뉴스·동일 업종 혼합"
                        : "동일 업종 기반"}
                  </p>
                  <ul>
                    <li>최근 90일 기사에서 함께 언급된 기업을 분석합니다.</li>
                    <li>기본 기준은 서로 다른 기사 3건, 언론사 2곳 이상입니다.</li>
                    <li>제목 동시 언급과 최신 기사에 더 높은 점수를 부여합니다.</li>
                    <li>결과가 부족하면 뉴스 기준을 단계적으로 완화합니다.</li>
                    <li>최소 2개가 안 되면 동일 업종 기업으로 보완합니다.</li>
                    <li>현재 조회 중인 기업은 제외하며 최대 5개를 표시합니다.</li>
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
                  aria-label={isWatched(selectedCompany.id)
                    ? `${selectedCompany.name} 관심기업 해제`
                    : `${selectedCompany.name} 관심기업 등록`}
                  className={`company-watch-star${
                    isWatched(selectedCompany.id) ? " active" : ""
                  }`}
                  onClick={() => toggleCompany(selectedCompany.id)}
                  title={isWatched(selectedCompany.id)
                    ? "관심기업 해제"
                    : "관심기업 등록"}
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
