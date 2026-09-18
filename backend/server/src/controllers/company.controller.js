const { pool } = require("../db/pool");

/**
 * GET /api/company
 * 회원가입 화면의 기업 선택 목록을 반환한다.
 */
async function getCompanies(_req, res) {
  try {
    const [companies] = await pool.query(`
      SELECT COMPANY_ID AS companyId, COMPANY_NAME AS companyName
      FROM COMPANY
      ORDER BY COMPANY_NAME ASC
    `);

    return res.json({ success: true, data: companies });
  } catch (error) {
    console.error("회사 목록 조회 실패:", error);
    return res.status(500).json({
      success: false,
      message: "회사 목록을 불러오지 못했습니다.",
    });
  }
}

/**
 * GET /api/company/search?keyword=카카오
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
    const [companies] = await pool.query(
      `
        SELECT COMPANY_ID AS companyId, COMPANY_NAME AS companyName
        FROM COMPANY
        WHERE COMPANY_NAME LIKE ?
        ORDER BY COMPANY_NAME ASC
      `,
      [`%${keyword}%`],
    );

    return res.json({ success: true, data: companies });
  } catch (error) {
    console.error("회사 검색 실패:", error);
    return res.status(500).json({
      success: false,
      message: "회사 검색 중 오류가 발생했습니다.",
    });
  }
}

module.exports = { getCompanies, searchCompany };
