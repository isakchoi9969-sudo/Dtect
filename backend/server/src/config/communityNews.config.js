/**
 * 커뮤니티 "기업 신소식" 피드 정책입니다.
 *
 * 기업 상세 분석 뉴스와 달리, 이 설정은 산업 동향 탐색만을 위한 것입니다.
 * 감성 분석, 특정 기업 언급 횟수 검증, 기업 규모 구분, DB 저장에는 사용하지 않습니다.
 */
const { APPROVED_NEWS_SOURCES } = require("./approvedNewsSources");

const COMMUNITY_NEWS_INDUSTRIES = Object.freeze([
  "AI",
  "반도체",
  "배터리",
  "바이오",
  "로봇",
  "모빌리티",
  "방산",
  "조선",
  "에너지",
]);

// 한 단어 검색으로 인한 주제 쏠림을 줄이기 위해 산업별 복수 검색어를 사용합니다.
const COMMUNITY_NEWS_KEYWORDS = Object.freeze({
  AI: Object.freeze([
    "인공지능 기술",
    "생성형 AI",
    "피지컬 AI",
    "AI 반도체",
    "AI 서비스",
  ]),
  반도체: Object.freeze([
    "반도체 기술",
    "HBM",
    "반도체 공정",
    "파운드리",
    "반도체 수주",
  ]),
  배터리: Object.freeze([
    "이차전지 기술",
    "배터리 소재",
    "ESS 배터리",
    "배터리 공장",
    "배터리 수주",
  ]),
  바이오: Object.freeze([
    "바이오 기술",
    "신약 개발",
    "바이오 임상",
    "세포 치료제",
    "바이오 투자",
  ]),
  로봇: Object.freeze([
    "산업용 로봇",
    "휴머노이드 로봇",
    "협동로봇",
    "자율로봇",
    "로봇 기술",
  ]),
  모빌리티: Object.freeze([
    "전기차",
    "자율주행",
    "SDV 자동차",
    "모빌리티 기술",
    "전기차 충전",
  ]),
  방산: Object.freeze([
    "방산 수출",
    "방산 계약",
    "무기체계",
    "국방 기술",
    "방위산업",
  ]),
  조선: Object.freeze([
    "조선 수주",
    "선박 수주",
    "친환경 선박",
    "조선 기술",
  ]),
  에너지: Object.freeze([
    "신재생에너지",
    "태양광",
    "풍력",
    "수소 산업",
    "에너지 기술",
  ]),
});

// 검색어가 언론사명·요약문에만 걸려 무관한 기사가 섞이는 것을 막기 위해,
// 아래 단어 중 하나가 기사 제목에 있을 때만 해당 산업 기사로 인정합니다.
const COMMUNITY_NEWS_REQUIRED_TITLE_TERMS = Object.freeze({
  AI: Object.freeze(["AI", "인공지능", "생성형", "LLM", "피지컬 AI"]),
  반도체: Object.freeze(["반도체", "칩", "HBM", "메모리", "파운드리", "웨이퍼"]),
  배터리: Object.freeze(["배터리", "이차전지", "2차전지", "양극재", "음극재", "ESS"]),
  바이오: Object.freeze(["바이오", "신약", "임상", "제약", "치료제", "항체", "세포"]),
  로봇: Object.freeze(["로봇", "휴머노이드", "협동로봇", "AMR", "자율로봇"]),
  모빌리티: Object.freeze(["모빌리티", "전기차", "자율주행", "자동차", "차량", "SDV"]),
  방산: Object.freeze(["방산", "국방", "방위산업", "전투기", "미사일", "무기체계"]),
  조선: Object.freeze(["조선", "선박", "조선소", "LNG선", "해운"]),
  에너지: Object.freeze(["에너지", "태양광", "풍력", "수소", "원전", "발전", "전력", "SMR", "신재생"]),
});

// 산업별 기술·연구 성과 표현입니다. 아래 공통 표현과 함께 사용해, 기술 단어가
// 태그별 목록에 정확히 없더라도 실제 기술·현장 적용 기사를 놓치지 않습니다.
const COMMUNITY_NEWS_REQUIRED_TITLE_SECONDARY_TERMS = Object.freeze({
  AI: Object.freeze([
    "기술개발",
    "개발",
    "연구",
    "기술",
    "모델",
    "플랫폼",
    "솔루션",
    "신기술",
    "상용화",
    "실증",
    "특허",
  ]),
  반도체: Object.freeze([
    "개발",
    "연구",
    "기술",
    "공정",
    "양산",
    "설계",
    "패키징",
    "상용화",
    "실증",
    "특허",
  ]),
  배터리: Object.freeze([
    "개발",
    "연구",
    "기술",
    "소재",
    "양산",
    "상용화",
    "실증",
    "특허",
  ]),
  바이오: Object.freeze([
    "개발",
    "연구",
    "임상",
    "치료제",
    "플랫폼",
    "상용화",
    "특허",
  ]),
  로봇: Object.freeze([
    "개발",
    "연구",
    "기술",
    "솔루션",
    "플랫폼",
    "상용화",
    "실증",
    "특허",
  ]),
  모빌리티: Object.freeze([
    "개발",
    "연구",
    "기술",
    "플랫폼",
    "상용화",
    "실증",
    "특허",
  ]),
  방산: Object.freeze([
    "개발",
    "연구",
    "기술",
    "체계",
    "상용화",
    "실증",
    "특허",
  ]),
  조선: Object.freeze([
    "개발",
    "연구",
    "기술",
    "친환경",
    "스마트",
    "상용화",
    "실증",
    "특허",
  ]),
  에너지: Object.freeze([
    "개발",
    "연구",
    "기술",
    "친환경",
    "상용화",
    "실증",
    "특허",
  ]),
});

const COMMUNITY_NEWS_COMMON_TECH_ACTIVITY_TERMS = Object.freeze([
  "개발",
  "연구",
  "기술",
  "모델",
  "플랫폼",
  "솔루션",
  "신기술",
  "특허",
  "상용화",
  "실증",
  "출시",
  "도입",
  "적용",
  "구축",
]);

// 기업 상세 분석과 동일한 40개 허용 언론사를 사용합니다.
// 독립 복사본으로 보관해 커뮤니티 코드가 공통 설정을 변경하지 않도록 합니다.
const COMMUNITY_NEWS_SOURCES = Object.freeze(
  APPROVED_NEWS_SOURCES.map((source) =>
    Object.freeze({
      ...source,
      domains: Object.freeze([...source.domains]),
    }),
  ),
);

// 보도자료·신제품·계약 기사는 유지하고, 명백한 판촉성 제목만 제외합니다.
const COMMUNITY_NEWS_EXCLUDED_TITLE_TERMS = Object.freeze([
  "브랜드대상",
  "소비자선정",
  "이벤트",
  "할인",
  "프로모션",
  "체험단",
  // 산업명만 우연히 포함한 정치·입시성 기사는 기업·기술 동향 피드에서 제외합니다.
  "대통령",
  "국회",
  "국감",
  "여야",
  "민주당",
  "국민의힘",
  "선거",
  "검찰",
  "판결",
  "경쟁률",
  "수시모집",
  "입시",
  "교육청",
  "대학",
  "실무교육",
  "교육",
  "연수",
  "강의",
  "세미나",
  "아카데미",
  "수강",
  "교육과정",
  "인재 양성",
  "대표이사",
  "사장",
  "임원",
  "취임",
  "승진",
  "선임",
  "주가",
  "상한가",
  "급등",
  "급락",
]);

const COMMUNITY_NEWS_DEFAULT_LIMIT = 25;
const COMMUNITY_NEWS_MAX_LIMIT = 25;
const COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY = 30;
const COMMUNITY_NEWS_MAX_SEARCH_RESULT_OFFSET = 1000;
const COMMUNITY_NEWS_MAX_PAGES_PER_QUERY = Math.ceil(
  COMMUNITY_NEWS_MAX_SEARCH_RESULT_OFFSET /
    COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY,
);
const COMMUNITY_NEWS_RECENT_DAYS = 3;
const COMMUNITY_NEWS_FALLBACK_RECENT_DAYS = 30;
const COMMUNITY_NEWS_MAX_ARTICLES_PER_SOURCE = 5;
const COMMUNITY_NEWS_CACHE_TTL_MS = 10 * 60 * 1000;
const COMMUNITY_NEWS_MAX_CONCURRENT_REQUESTS = 4;

module.exports = {
  COMMUNITY_NEWS_INDUSTRIES,
  COMMUNITY_NEWS_KEYWORDS,
  COMMUNITY_NEWS_REQUIRED_TITLE_TERMS,
  COMMUNITY_NEWS_REQUIRED_TITLE_SECONDARY_TERMS,
  COMMUNITY_NEWS_COMMON_TECH_ACTIVITY_TERMS,
  COMMUNITY_NEWS_SOURCES,
  COMMUNITY_NEWS_EXCLUDED_TITLE_TERMS,
  COMMUNITY_NEWS_DEFAULT_LIMIT,
  COMMUNITY_NEWS_MAX_LIMIT,
  COMMUNITY_NEWS_DEFAULT_DISPLAY_PER_QUERY,
  COMMUNITY_NEWS_MAX_SEARCH_RESULT_OFFSET,
  COMMUNITY_NEWS_MAX_PAGES_PER_QUERY,
  COMMUNITY_NEWS_RECENT_DAYS,
  COMMUNITY_NEWS_FALLBACK_RECENT_DAYS,
  COMMUNITY_NEWS_MAX_ARTICLES_PER_SOURCE,
  COMMUNITY_NEWS_CACHE_TTL_MS,
  COMMUNITY_NEWS_MAX_CONCURRENT_REQUESTS,
};
