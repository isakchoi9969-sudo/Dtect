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
  "노동·노사": { defaultMode: CLUSTER_MODE.COMPANY },
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
  };
}

module.exports = {
  CATEGORY_CONFIG,
  CLUSTER_MODE,
  getCategoryRule,
};
