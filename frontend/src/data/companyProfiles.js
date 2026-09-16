import { companies } from "./companies";

const overrides = {
  "005930": { marketCap: "473.3조원", employees: "124,000명", riskChange: -12, sentiment: [46, 36, 18], keywords: ["#HBM", "#AI 반도체", "#실적", "#수출 규제"], issue: "AI 반도체 수요와 수출 규제가 주요하게 언급되고 있습니다." },
  "028260": { marketCap: "24.1조원", employees: "9,000명", riskChange: 3, sentiment: [39, 41, 20], keywords: ["#건설", "#상사", "#수주", "#ESG"], issue: "해외 수주와 건설 경기 변화가 주요 이슈입니다." },
  "207940": { marketCap: "70.4조원", employees: "5,500명", riskChange: -5, sentiment: [51, 33, 16], keywords: ["#바이오", "#CDMO", "#수주", "#의약품"], issue: "글로벌 수주와 생산 역량 확대가 주목받고 있습니다." },
  "006400": { marketCap: "22.8조원", employees: "12,500명", riskChange: 6, sentiment: [34, 42, 24], keywords: ["#2차전지", "#전기차", "#배터리", "#수요"], issue: "전기차 수요와 배터리 시장 변동성이 주요 이슈입니다." },
  "032830": { marketCap: "24.6조원", employees: "5,700명", riskChange: -3, sentiment: [42, 40, 18], keywords: ["#보험", "#금리", "#자산운용", "#배당"], issue: "금리 변화와 자산운용 성과가 주요하게 언급되고 있습니다." },
  "035720": { marketCap: "16.2조원", employees: "3,900명", riskChange: 8, sentiment: [31, 39, 30], keywords: ["#플랫폼", "#규제", "#콘텐츠", "#AI"], issue: "플랫폼 규제와 사업 확장에 대한 시장 반응을 분석하고 있습니다." },
  "005380": { marketCap: "49.8조원", employees: "75,000명", riskChange: -7, sentiment: [47, 35, 18], keywords: ["#전기차", "#모빌리티", "#수출", "#실적"], issue: "전기차 전환과 글로벌 판매 흐름이 주요 이슈입니다." },
};

function makeProfile(company, index) {
  const override = overrides[company.id] ?? {};
  const [positive = 40, neutral = 40, negative = 20] = override.sentiment ?? [];
  const riskChange = override.riskChange ?? 0;
  const riskTypes = [
    ["규제/정책", 28 + index, "#4F8EF7"],
    ["시장/경쟁", 25 + index, "#35C98A"],
    ["재무/실적", 22 + index, "#7B61FF"],
    ["평판/ESG", 32 + index, "#F6B84B"],
  ].map(([name, value, color]) => ({ name, value, color }));

  return {
    ...company,
    marketCap: override.marketCap ?? "데이터 준비 중",
    employees: override.employees ?? "데이터 준비 중",
    analysis: {
      risk: { score: company.riskScore, level: company.riskLevel, change: riskChange, types: riskTypes },
      sentiment: {
        total: 800 + index * 137,
        positive,
        neutral,
        negative,
        trend: [
          { date: "10.01", positive: positive - 3, neutral: neutral + 1, negative: negative - 2 },
          { date: "10.10", positive: positive + 2, neutral, negative: negative + 1 },
          { date: "10.20", positive, neutral: neutral - 1, negative },
          { date: "10.30", positive: positive + 1, neutral, negative: negative - 1 },
        ],
      },
      keywords: (override.keywords ?? ["#시장동향", "#실적", "#산업"])
        .map((text, keywordIndex) => ({ text, type: ["blue", "green", "purple", "orange"][keywordIndex % 4] })),
      summary: override.issue ?? `${company.name} 관련 시장 신호와 주요 이슈를 분석하고 있습니다.`,
      issues: [
        { date: "10.28", type: riskChange > 0 ? "주의" : "중립", title: `${company.name} 관련 시장 동향`, description: override.issue ?? "최근 뉴스와 온라인 언급의 변화를 확인했습니다." },
        { date: "10.21", type: "중립", title: "실적 및 사업 전략 언급 증가", description: "사업 전망과 시장 반응에 대한 언급량이 증가했습니다." },
      ],
      articles: [
        { icon: "Y", source: "연합뉴스", title: `${company.name}, 최근 시장 동향에 주목`, time: "2시간 전" },
        { icon: "H", source: "한국경제", title: `${company.name} 사업 전략과 실적 전망`, time: "5시간 전" },
        { icon: "M", source: "매일경제", title: `${company.industry} 산업 관련 주요 이슈`, time: "1일 전" },
      ],
    },
  };
}

export const companyProfiles = companies.map(makeProfile);

export function findCompanyProfile(symbol) {
  return companyProfiles.find((company) => company.ticker === symbol);
}
