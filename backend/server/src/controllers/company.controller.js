const { pool } = require("../db/pool");

const { calculateSearchScore } = require("../services/companySearch.service");
const {
  fetchExchangeRate,
  fetchMarketIndexHistories,
  fetchMarketIndices,
  fetchStockChart,
  fetchStockQuote,
} = require("../services/stockQuote.service");
const {
  ABSOLUTE_MIN_RESULTS,
  LOOKBACK_DAYS,
  MAX_RESULTS,
  MIN_EXPANDED_ARTICLES,
  MIN_ARTICLES,
  MIN_PRESS_COUNT,
  MIN_TARGET_RESULTS,
  getRelatedCompanies,
} = require("../services/relatedCompany.service");

/**
 * GET /api/company
 * 회원가입 화면의 기업 선택 목록을 반환한다.
 */
async function getCompanies(_req, res) {
  try {
    const [companies] = await pool.query(`
      SELECT
        COMPANY_ID AS companyId,
        COMPANY_NAME AS companyName,
        CEO_NAME AS ceoName,
        INDUSTRY AS industry,
        COMPANY_INFO AS companyInfo,
        STOCK_CODE AS stockCode
      FROM COMPANY
      ORDER BY COMPANY_NAME ASC
    `);

    return res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("회사 목록 조회 실패:", error);

    return res.status(500).json({
      success: false,
      message: "회사 목록을 불러오지 못했습니다.",
    });
  }
}

/**
 * GET /api/company/search?keyword=삼성
 *
 * 검색 방식
 * 1. COMPANY 전체 조회
 * 2. 검색어와 기업명 비교
 * 3. 관련도 점수 계산
 * 4. 점수가 높은 기업부터 반환
 */
async function searchCompany(req, res) {
  const keyword = String(req.query.keyword || "").trim();

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "검색할 기업명을 입력해주세요.",
    });
  }

  try {
    // DB에서 기업 목록 조회
    const [companies] = await pool.query(`
      SELECT
        COMPANY_ID AS companyId,
        COMPANY_NAME AS companyName
      FROM COMPANY
    `);

    // 검색어와 기업명의 관련도 계산
    const scoredCompanies = companies
      .map((company) => {
        const score = calculateSearchScore(keyword, company.companyName);

        return {
          ...company,
          score,
        };
      })

      // 관련도가 너무 낮은 기업은 제외
      .filter((company) => company.score >= 0.4)

      // 관련도가 높은 기업부터 정렬
      .sort((a, b) => b.score - a.score)

      // 최대 10개
      .slice(0, 10);

    return res.json({
      success: true,
      data: scoredCompanies,
    });
  } catch (error) {
    console.error("회사 검색 실패:", error);

    return res.status(500).json({
      success: false,
      message: "회사 검색 중 오류가 발생했습니다.",
    });
  }
}

/** GET /api/company/:companyId/related */
async function getCompanyRelations(req, res) {
  const companyId = Number(req.params.companyId);

  if (!Number.isInteger(companyId) || companyId < 1) {
    return res.status(400).json({
      success: false,
      message: "올바른 기업 ID가 필요합니다.",
    });
  }

  try {
    const liveArticles = Array.isArray(req.body?.articles)
      ? req.body.articles.slice(0, 100)
      : [];
    const result = await getRelatedCompanies(companyId, liveArticles);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "기업을 찾을 수 없습니다.",
      });
    }

    return res.json({
      success: true,
      data: result.companies,
      mode: result.mode,
      criteria: {
        lookbackDays: LOOKBACK_DAYS,
        minimumArticles: MIN_ARTICLES,
        minimumPressCount: MIN_PRESS_COUNT,
        expandedMinimumArticles: MIN_EXPANDED_ARTICLES,
        absoluteMinimumResults: ABSOLUTE_MIN_RESULTS,
        minimumTargetResults: MIN_TARGET_RESULTS,
        maximumResults: MAX_RESULTS,
      },
    });
  } catch (error) {
    console.error("연관기업 조회 실패:", error);
    return res.status(500).json({
      success: false,
      message: "연관기업을 불러오지 못했습니다.",
    });
  }
}

/** GET /api/company/:companyId/quote */
async function getCompanyQuote(req, res) {
  const companyId = Number(req.params.companyId);

  if (!Number.isInteger(companyId) || companyId < 1) {
    return res.status(400).json({
      success: false,
      message: "올바른 기업 ID가 필요합니다.",
    });
  }

  try {
    const [companies] = await pool.query(
      `
        SELECT
          COMPANY_NAME AS companyName,
          STOCK_CODE AS stockCode
        FROM COMPANY
        WHERE COMPANY_ID = ?
        LIMIT 1
      `,
      [companyId],
    );
    const company = companies[0];

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "기업을 찾을 수 없습니다.",
      });
    }

    if (!/^\d{6}$/.test(String(company.stockCode || ""))) {
      return res.json({
        success: true,
        data: null,
        message: "조회 가능한 국내 상장 종목코드가 없습니다.",
      });
    }

    const quote = await fetchStockQuote(company.stockCode);
    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("기업 실시간 시세 조회 실패:", error.message);
    return res.status(502).json({
      success: false,
      message: "현재 주가를 불러오지 못했습니다.",
    });
  }
}

/** GET /api/company/:companyId/quote-history?period=1d|7d|1m */
async function getCompanyQuoteHistory(req, res) {
  const companyId = Number(req.params.companyId);
  const period = String(req.query.period || "1d").toLowerCase();

  if (!Number.isInteger(companyId) || companyId < 1) {
    return res.status(400).json({
      success: false,
      message: "올바른 기업 ID가 필요합니다.",
    });
  }

  if (!["1d", "7d", "1m"].includes(period)) {
    return res.status(400).json({
      success: false,
      message: "조회 기간은 1d, 7d, 1m 중 하나여야 합니다.",
    });
  }

  try {
    const [companies] = await pool.query(
      `
        SELECT STOCK_CODE AS stockCode
        FROM COMPANY
        WHERE COMPANY_ID = ?
        LIMIT 1
      `,
      [companyId],
    );
    const company = companies[0];

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "기업을 찾을 수 없습니다.",
      });
    }

    if (!/^\d{6}$/.test(String(company.stockCode || ""))) {
      return res.json({ success: true, data: [] });
    }

    const points = await fetchStockChart(company.stockCode, period);
    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      data: points,
      period,
    });
  } catch (error) {
    console.error("기업 주가 차트 조회 실패:", error.message);
    return res.status(502).json({
      success: false,
      message: "주가 그래프를 불러오지 못했습니다.",
    });
  }
}

/** GET /api/company/market-indices */
async function getMarketIndices(_req, res) {
  try {
    const [indices, histories, exchangeRate] = await Promise.all([
      fetchMarketIndices(),
      fetchMarketIndexHistories(),
      fetchExchangeRate(),
    ]);
    const historyByCode = new Map(
      histories.map((history) => [history.code, history.points]),
    );
    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      data: indices.map((index) => ({
        ...index,
        history: historyByCode.get(index.code) || [],
      })),
      exchangeRate,
    });
  } catch (error) {
    console.error("시장 지수 조회 실패:", error.message);
    return res.status(502).json({
      success: false,
      message: "시장 지수와 환율을 불러오지 못했습니다.",
    });
  }
}

module.exports = {
  getCompanyQuote,
  getCompanyQuoteHistory,
  getCompanyRelations,
  getCompanies,
  getMarketIndices,
  searchCompany,
};
