const TEMP_COMPANIES = require("../db/pool.js");

/**
 * GET /api/company/search?keyword=카카오
 */
function searchCompany(req, res) {
  const keyword = req.query.keyword;
  const company = TEMP_COMPANIES[keyword];

  if (!company) {
    return res.json({
      success: false,
      message: `'${keyword}' 기업 데이터를 찾을 수 없습니다.`,
    });
  }

  return res.json({ success: true, data: company });
}

module.exports = { searchCompany };
