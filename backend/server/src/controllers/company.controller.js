const { pool } = require("../db/pool");

const { calculateSearchScore } = require("../services/companySearch.service");

/**
 * GET /api/company
 * 회원가입 화면의 기업 선택 목록을 반환한다.
 */
async function getCompanies(_req, res) {
  try {
    const [companies] = await pool.query(`
      SELECT
        COMPANY_ID AS companyId,
        COMPANY_NAME AS companyName
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
      .filter((company) => company.score >= 0.6)

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

module.exports = {
  getCompanies,
  searchCompany,
};
