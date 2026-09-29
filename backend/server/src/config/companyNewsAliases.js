/**
 * 뉴스에서 정식 회사명 대신 자주 사용되는 표기다.
 *
 * 정식 회사명은 호출부에서 항상 검색어에 포함하므로 여기에는 별칭만 적는다.
 * 한 회사의 정식명과 별칭은 모두 합산해 관련 기사 기준을 판정한다.
 */
const COMPANY_NEWS_ALIASES = Object.freeze({
  HD한국조선해양: ["한국조선해양"],
  HD현대중공업: ["현대중공업", "HD현대중"],
  HLB: ["에이치엘비"],
  HL만도: ["만도"],
  HMM: ["현대상선"],
  "JYP Ent.": ["JYP", "JYP엔터", "JYP엔터테인먼트"],
  KB금융: ["KB금융지주"],
  LG디스플레이: ["LGD"],
  LG생활건강: ["LG생건"],
  LG에너지솔루션: ["LG엔솔"],
  LG유플러스: ["LGU+", "LG U+"],
  LG전자: ["엘전"],
  "LS ELECTRIC": ["LS일렉트릭", "LS일렉", "LS산전"],
  NAVER: ["네이버"],
  POSCO홀딩스: ["포스코홀딩스"],
  "S-OIL": ["에쓰오일", "S-Oil"],
  SK이노베이션: ["SK이노"],
  SK텔레콤: ["SKT"],
  SK하이닉스: ["하이닉스", "SK하닉"],
  SM: ["SM엔터", "SM엔터테인먼트", "에스엠"],
  SPC: ["SPC그룹"],
  "YG PLUS": ["YG플러스"],
  금호석유화학: ["금호석화"],
  금호타이어: ["금타"],
  기아: ["기아차", "기아자동차"],
  두산로보틱스: ["두산로보"],
  두산에너빌리티: ["두산에너", "두산중공업"],
  롯데에너지머티리얼즈: ["일진머티리얼즈"],
  롯데칠성음료: ["롯데칠성"],
  메리츠금융지주: ["메리츠금융"],
  미래에셋증권: ["미래에셋대우"],
  삼성물산: ["삼물"],
  삼성바이오로직스: ["삼성바이오", "삼바"],
  삼성생명: ["삼생"],
  삼성엔지니어링: ["삼성E&A", "삼성이앤에이"],
  삼성전자: ["삼전"],
  삼성중공업: ["삼중", "삼성重"],
  삼성화재: ["삼화"],
  셀트리온: ["셀트"],
  신한지주: ["신한금융", "신한금융지주"],
  아모레퍼시픽: ["아모레"],
  아시아나항공: ["아시아나"],
  엔씨소프트: ["엔씨", "NC소프트"],
  우리금융지주: ["우리금융"],
  카카오게임즈: ["카겜"],
  하나금융지주: ["하나금융"],
  한국가스공사: ["가스공사"],
  한국전력: ["한전"],
  한국콜마: ["콜마"],
  한국타이어앤테크놀로지: ["한국타이어", "한타"],
  한화솔루션: ["한화케미칼"],
  한화에어로스페이스: ["한화에어로"],
  한화오션: ["대우조선해양", "대우조선"],
  현대건설: ["현건"],
  현대백화점: ["현백"],
  현대자동차: ["현대차"],
});

function getCompanyNewsTerms(companyName) {
  const canonicalName = String(companyName || "").trim();
  if (!canonicalName) return [];

  const terms = [canonicalName, ...(COMPANY_NEWS_ALIASES[canonicalName] || [])];
  const seenTerms = new Set();

  return terms.filter((term) => {
    const normalizedTerm = term.toLocaleLowerCase("ko-KR");
    if (seenTerms.has(normalizedTerm)) return false;

    seenTerms.add(normalizedTerm);
    return true;
  });
}

module.exports = { COMPANY_NEWS_ALIASES, getCompanyNewsTerms };
