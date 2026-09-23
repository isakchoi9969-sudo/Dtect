const axios = require("axios");

const NAVER_STOCK_QUOTE_URL =
  "https://polling.finance.naver.com/api/realtime/domestic/stock";
const NAVER_MARKET_INDEX_URL =
  "https://polling.finance.naver.com/api/realtime/domestic/index";
const NAVER_MARKET_INDEX_CHART_URL =
  "https://api.stock.naver.com/chart/domestic/index";
const NAVER_WORLD_INDEX_URL =
  "https://polling.finance.naver.com/api/realtime/worldstock/index";
const NAVER_WORLD_INDEX_CHART_URL =
  "https://api.stock.naver.com/chart/foreign/index";
const NAVER_EXCHANGE_URL =
  "https://api.stock.naver.com/marketindex/exchange";
const NAVER_STOCK_CHART_URL =
  "https://api.stock.naver.com/chart/domestic/item";
const QUOTE_CACHE_TTL_MS = 5_000;
const INDEX_HISTORY_CACHE_TTL_MS = 30 * 60 * 1_000;
const quoteCache = new Map();
const stockChartCache = new Map();
let marketIndexCache = null;
let marketIndexHistoryCache = null;
let exchangeRateCache = null;

const MARKET_INDEX_CONFIGS = [
  {
    code: "KOSPI",
    name: "KOSPI",
    quoteUrl: `${NAVER_MARKET_INDEX_URL}/KOSPI`,
    chartUrl: `${NAVER_MARKET_INDEX_CHART_URL}/KOSPI`,
  },
  {
    code: "KOSDAQ",
    name: "KOSDAQ",
    quoteUrl: `${NAVER_MARKET_INDEX_URL}/KOSDAQ`,
    chartUrl: `${NAVER_MARKET_INDEX_CHART_URL}/KOSDAQ`,
  },
  {
    code: "NASDAQ",
    name: "NASDAQ",
    quoteUrl: `${NAVER_WORLD_INDEX_URL}/.IXIC`,
    chartUrl: `${NAVER_WORLD_INDEX_CHART_URL}/.IXIC`,
  },
  {
    code: "SP500",
    name: "S&P 500",
    quoteUrl: `${NAVER_WORLD_INDEX_URL}/.INX`,
    chartUrl: `${NAVER_WORLD_INDEX_CHART_URL}/.INX`,
  },
];

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function normalizeQuote(data) {
  if (!data) return null;

  const price = toNumber(data.closePriceRaw ?? data.closePrice);
  if (price === null) return null;

  return {
    stockCode: data.itemCode || data.symbolCode,
    stockName: data.stockName || null,
    exchange: data.stockExchangeType?.nameKor || data.stockExchangeType?.name || null,
    price,
    change: toNumber(
      data.compareToPreviousClosePriceRaw ?? data.compareToPreviousClosePrice,
    ),
    changeRate: toNumber(data.fluctuationsRatioRaw ?? data.fluctuationsRatio),
    direction: data.compareToPreviousPrice?.name || "UNCHANGED",
    marketStatus: data.marketStatus || null,
    tradedAt: data.localTradedAt || null,
    delayMinutes: Number(data.stockExchangeType?.delayTime) || 0,
    currency: data.currencyType?.code || "KRW",
    source: "NAVER_FINANCE",
  };
}

function normalizeMarketIndex(data, fallbackCode) {
  if (!data) return null;

  const value = toNumber(data.closePriceRaw ?? data.closePrice);
  if (value === null) return null;

  return {
    code: data.itemCode || data.symbolCode || fallbackCode,
    name: data.stockName || data.indexName || fallbackCode,
    value,
    change: toNumber(
      data.compareToPreviousClosePriceRaw ?? data.compareToPreviousClosePrice,
    ),
    changeRate: toNumber(data.fluctuationsRatioRaw ?? data.fluctuationsRatio),
    direction: data.compareToPreviousPrice?.name || "UNCHANGED",
    marketStatus: data.marketStatus || null,
    tradedAt: data.localTradedAt || null,
    source: "NAVER_FINANCE",
  };
}

async function fetchStockQuote(stockCode) {
  const normalizedStockCode = String(stockCode || "").trim();
  if (!/^\d{6}$/.test(normalizedStockCode)) return null;

  const cached = quoteCache.get(normalizedStockCode);
  if (cached && Date.now() - cached.cachedAt < QUOTE_CACHE_TTL_MS) {
    return cached.quote;
  }

  const response = await axios.get(
    `${NAVER_STOCK_QUOTE_URL}/${normalizedStockCode}`,
    {
      timeout: 7_000,
      headers: {
        Accept: "application/json",
        Referer: "https://finance.naver.com/",
        "User-Agent": "DTECT/1.0 stock-quote",
      },
    },
  );
  const quote = normalizeQuote(response.data?.datas?.[0]);
  if (!quote) {
    throw new Error(`시세 응답에 ${normalizedStockCode} 가격 정보가 없습니다.`);
  }

  quoteCache.set(normalizedStockCode, {
    quote,
    cachedAt: Date.now(),
  });
  return quote;
}

async function fetchStockChart(stockCode, period = "1d") {
  const normalizedStockCode = String(stockCode || "").trim();
  const normalizedPeriod = ["1d", "7d", "1m"].includes(period) ? period : "1d";
  if (!/^\d{6}$/.test(normalizedStockCode)) return [];

  const cacheKey = `${normalizedStockCode}:${normalizedPeriod}`;
  const cacheTtl = normalizedPeriod === "1d" ? 15_000 : 30 * 60 * 1_000;
  const cached = stockChartCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < cacheTtl) {
    return cached.points;
  }

  const periodType = normalizedPeriod === "1d" ? "day" : "dayCandle";
  const response = await axios.get(
    `${NAVER_STOCK_CHART_URL}/${normalizedStockCode}`,
    {
      params: { periodType },
      timeout: 10_000,
      headers: {
        Accept: "application/json",
        Referer: "https://finance.naver.com/",
        "User-Agent": "DTECT/1.0 stock-chart",
      },
    },
  );
  let points;

  if (normalizedPeriod === "1d") {
    points = (response.data?.priceInfos || [])
      .map((point) => ({
        date: String(point.localDateTime || ""),
        value: toNumber(point.currentPrice),
      }))
      .filter((point) => point.date && point.value !== null);
  } else {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (normalizedPeriod === "7d" ? 7 : 31));
    const cutoffKey = Number(
      `${cutoff.getFullYear()}${String(cutoff.getMonth() + 1).padStart(2, "0")}${String(cutoff.getDate()).padStart(2, "0")}`,
    );
    points = (response.data?.priceInfos || [])
      .filter((point) => Number(point.localDate) >= cutoffKey)
      .map((point) => ({
        date: String(point.localDate || ""),
        value: toNumber(point.closePrice),
      }))
      .filter((point) => point.date && point.value !== null);
  }

  stockChartCache.set(cacheKey, { points, cachedAt: Date.now() });
  return points;
}

async function fetchMarketIndices() {
  if (
    marketIndexCache &&
    Date.now() - marketIndexCache.cachedAt < QUOTE_CACHE_TTL_MS
  ) {
    return marketIndexCache.indices;
  }

  const responses = await Promise.all(
    MARKET_INDEX_CONFIGS.map((config) =>
      axios.get(config.quoteUrl, {
        timeout: 7_000,
        headers: {
          Accept: "application/json",
          Referer: "https://finance.naver.com/",
          "User-Agent": "DTECT/1.0 market-index",
        },
      }),
    ),
  );
  const indices = responses.map((response, index) => {
    const config = MARKET_INDEX_CONFIGS[index];
    const normalized = normalizeMarketIndex(
      response.data?.datas?.[0],
      config.code,
    );
    if (!normalized) {
      throw new Error(`${config.code} 지수 정보가 없습니다.`);
    }
    return {
      ...normalized,
      code: config.code,
      name: config.name,
    };
  });

  marketIndexCache = {
    indices,
    cachedAt: Date.now(),
  };
  return indices;
}

async function fetchMarketIndexHistories() {
  if (
    marketIndexHistoryCache &&
    Date.now() - marketIndexHistoryCache.cachedAt < INDEX_HISTORY_CACHE_TTL_MS
  ) {
    return marketIndexHistoryCache.histories;
  }

  const responses = await Promise.all(
    MARKET_INDEX_CONFIGS.map((config) =>
      axios.get(config.chartUrl, {
        params: { periodType: "dayCandle" },
        timeout: 10_000,
        headers: {
          Accept: "application/json",
          Referer: "https://finance.naver.com/",
          "User-Agent": "DTECT/1.0 market-index-chart",
        },
      }),
    ),
  );
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  const cutoffKey = Number(
    `${cutoff.getFullYear()}${String(cutoff.getMonth() + 1).padStart(2, "0")}${String(cutoff.getDate()).padStart(2, "0")}`,
  );
  const histories = responses.map((response, index) => ({
    code: MARKET_INDEX_CONFIGS[index].code,
    points: (response.data?.priceInfos || [])
      .filter((point) => Number(point.localDate) >= cutoffKey)
      .map((point) => ({
        date: String(point.localDate),
        value: toNumber(point.closePrice),
      }))
      .filter((point) => point.value !== null),
  }));

  marketIndexHistoryCache = {
    histories,
    cachedAt: Date.now(),
  };
  return histories;
}

async function fetchExchangeRate() {
  if (
    exchangeRateCache &&
    Date.now() - exchangeRateCache.cachedAt < 60_000
  ) {
    return exchangeRateCache.rate;
  }

  const response = await axios.get(
    `${NAVER_EXCHANGE_URL}/FX_USDKRW`,
    {
      timeout: 7_000,
      headers: {
        Accept: "application/json",
        Referer: "https://finance.naver.com/",
        "User-Agent": "DTECT/1.0 exchange-rate",
      },
    },
  );
  const data = response.data?.exchangeInfo;
  const value = toNumber(data?.closePrice);
  if (!data || value === null) {
    throw new Error("달러/원 환율 정보가 없습니다.");
  }

  const rate = {
    code: "USDKRW",
    name: "USD/KRW",
    value,
    change: toNumber(data.fluctuations),
    changeRate: toNumber(data.fluctuationsRatio),
    direction: data.fluctuationsType?.name || "UNCHANGED",
    marketStatus: data.marketStatus || null,
    tradedAt: data.localTradedAt || null,
    unit: data.unit || "KRW",
    source: "NAVER_FINANCE",
  };
  exchangeRateCache = { rate, cachedAt: Date.now() };
  return rate;
}

module.exports = {
  INDEX_HISTORY_CACHE_TTL_MS,
  NAVER_MARKET_INDEX_CHART_URL,
  NAVER_MARKET_INDEX_URL,
  NAVER_EXCHANGE_URL,
  NAVER_STOCK_QUOTE_URL,
  NAVER_STOCK_CHART_URL,
  QUOTE_CACHE_TTL_MS,
  fetchExchangeRate,
  fetchMarketIndexHistories,
  fetchMarketIndices,
  fetchStockChart,
  fetchStockQuote,
  normalizeMarketIndex,
  normalizeQuote,
  toNumber,
};
