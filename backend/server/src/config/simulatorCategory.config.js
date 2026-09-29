const CLUSTER_MODE = Object.freeze({
  COMPANY: "COMPANY",
  HYBRID: "HYBRID",
  TOPIC: "TOPIC",
  MARKET_HYBRID: "MARKET_HYBRID",
});

/**
 * 시뮬레이터 카테고리별 군집 규칙.
 * 대분류 기본값을 사용하고, 필요한 소분류만 override 한다.
 * aliases는 다음 단계에서 Chroma 검색 recall을 보완하는 데 사용한다.
 */
const CATEGORY_CONFIG = Object.freeze({
  "화재·폭발": { defaultMode: CLUSTER_MODE.HYBRID },
  "산업재해·안전": { defaultMode: CLUSTER_MODE.HYBRID },
  "IT·서비스 장애": { defaultMode: CLUSTER_MODE.HYBRID },
  "보안·개인정보": { defaultMode: CLUSTER_MODE.COMPANY },
  "제품·품질": { defaultMode: CLUSTER_MODE.COMPANY },
  "환경": { defaultMode: CLUSTER_MODE.HYBRID },
  "노동·노사": {
    // 파업·노사 분쟁 기사는 기업명이 제목에 없는 경우가 흔하므로 주제 경로도 보존한다.
    defaultMode: CLUSTER_MODE.HYBRID,
    subcategoryOverrides: {
      "파업": {
        aliases: ["노조 파업", "쟁의행위", "총파업", "부분파업", "파업 돌입", "파업 예고"],
      },
      "노사 갈등": { aliases: ["노사분규", "노사 협상", "노조 갈등", "노사 대립"] },
      "임금 체불": { aliases: ["체불 임금", "임금 미지급", "급여 체불"] },
      "부당해고 논란": { aliases: ["부당 해고", "해고 논란", "해고 무효"] },
      "직장 내 괴롭힘": { aliases: ["직장내 괴롭힘", "괴롭힘 신고", "갑질 논란"] },
      "장시간 노동 논란": { aliases: ["장시간 근로", "과로", "연장근로 논란"] },
      "노동환경 논란": { aliases: ["근로환경", "작업 환경", "노동 조건"] },
    },
  },
  "법률·수사": { defaultMode: CLUSTER_MODE.COMPANY },
  "공정거래·규제": { defaultMode: CLUSTER_MODE.COMPANY },
  "소비자·고객": { defaultMode: CLUSTER_MODE.COMPANY },
  "경영·재무": { defaultMode: CLUSTER_MODE.COMPANY },
  "경영권·지배구조": { defaultMode: CLUSTER_MODE.COMPANY },
  "공급망·생산": { defaultMode: CLUSTER_MODE.COMPANY },
  "사회·평판": { defaultMode: CLUSTER_MODE.COMPANY },
  "기술·사업": { defaultMode: CLUSTER_MODE.COMPANY },
  "금융·시장": {
    defaultMode: CLUSTER_MODE.MARKET_HYBRID,
    subcategoryOverrides: {
      // 시장 전체 흐름 기사도 사례 후보로 남겨야 하므로 기업 미확인 경로를 함께 사용한다.
      "주가 급락": { mode: CLUSTER_MODE.MARKET_HYBRID },
      "거래정지": { mode: CLUSTER_MODE.COMPANY },
      "상장폐지 위기": { mode: CLUSTER_MODE.COMPANY },
      "회계감사 의견 문제": { mode: CLUSTER_MODE.COMPANY },
      "신용등급 하락": { mode: CLUSTER_MODE.COMPANY },
      "채무불이행": { mode: CLUSTER_MODE.COMPANY },
    },
  },
  "외부환경": {
    defaultMode: CLUSTER_MODE.TOPIC,
    subcategoryOverrides: {
      "감염병·가축전염병 확산": {
        aliases: [
          "감염병",
          "전염병",
          "조류독감",
          "조류인플루엔자",
          "아프리카돼지열병",
          "ASF",
          "구제역",
          "코로나19",
        ],
      },
    },
  },
});

function getCategoryRule(majorCategory, minorCategory) {
  const category = CATEGORY_CONFIG[majorCategory] || {};
  const override = category.subcategoryOverrides?.[minorCategory] || {};

  return {
    mode: override.mode || category.defaultMode || CLUSTER_MODE.COMPANY,
    aliases: override.aliases || [],
    // 소분류만으로 검색하면 짧은 쿼리의 cosine 점수가 낮아지는 특성을 보완한다.
    articleSimilarityCut: override.articleSimilarityCut
      || (minorCategory ? 0.5 : undefined),
  };
}

module.exports = {
  CATEGORY_CONFIG,
  CLUSTER_MODE,
  getCategoryRule,
};
