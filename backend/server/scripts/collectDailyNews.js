const {
  newsCollectionCompanies,
  newsCollectionPerPage,
} = require("../src/config/env");
const { analyzeCompanyNews } = require("../src/services/newsAnalysis.service");

async function main() {
  if (!newsCollectionCompanies.length) {
    console.error("NEWS_COLLECTION_COMPANIES에 수집할 기업명을 설정해 주세요.");
    return 1;
  }

  const failures = [];

  for (const company of newsCollectionCompanies) {
    try {
      const result = await analyzeCompanyNews(
        company,
        1,
        newsCollectionPerPage,
      );
      console.log(
        `일일 뉴스 수집 완료: company=${company} analyzed_count=${result.analyzed_count}`,
      );
    } catch (error) {
      failures.push(company);
      console.error(`일일 뉴스 수집 실패: company=${company}`, error.message);
    }
  }

  if (failures.length) {
    console.error(`수집 실패 기업: ${failures.join(", ")}`);
    return 1;
  }

  console.log(`일일 뉴스 수집 작업 완료: companies=${newsCollectionCompanies.length}`);
  return 0;
}

if (require.main === module) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  });
}

module.exports = { main };
