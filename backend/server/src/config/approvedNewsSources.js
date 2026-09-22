/**
 * 뉴스 분석에 사용할 언론사 원문 도메인 목록이다.
 *
 * - Naver 검색 결과의 `originallink` 호스트와 비교한다.
 * - 하위 도메인도 같은 언론사로 인정한다. 예: news.kbs.co.kr → kbs.co.kr
 */
const APPROVED_NEWS_SOURCES = [
  // 통신사
  { id: "yonhap", name: "연합뉴스", domains: ["yna.co.kr"] },
  { id: "news1", name: "뉴스1", domains: ["news1.kr"] },
  { id: "newsis", name: "뉴시스", domains: ["newsis.com"] },

  // 방송·종합 뉴스
  { id: "kbs", name: "KBS", domains: ["kbs.co.kr"] },
  { id: "mbc", name: "MBC", domains: ["imbc.com"] },
  { id: "sbs", name: "SBS", domains: ["sbs.co.kr"] },
  { id: "ytn", name: "YTN", domains: ["ytn.co.kr"] },
  { id: "jtbc", name: "JTBC", domains: ["jtbc.co.kr"] },

  // 전국 종합일간지
  { id: "khan", name: "경향신문", domains: ["khan.co.kr"] },
  { id: "kmib", name: "국민일보", domains: ["kmib.co.kr"] },
  { id: "donga", name: "동아일보", domains: ["donga.com"] },
  { id: "munhwa", name: "문화일보", domains: ["munhwa.com"] },
  { id: "seoul", name: "서울신문", domains: ["seoul.co.kr"] },
  { id: "segye", name: "세계일보", domains: ["segye.com"] },
  { id: "chosun", name: "조선일보", domains: ["chosun.com"] },
  { id: "joongang", name: "중앙일보", domains: ["joongang.co.kr"] },
  { id: "hani", name: "한겨레", domains: ["hani.co.kr"] },
  { id: "hankookilbo", name: "한국일보", domains: ["hankookilbo.com"] },

  // 경제지
  { id: "mk", name: "매일경제", domains: ["mk.co.kr"] },
  { id: "moneytoday", name: "머니투데이", domains: ["mt.co.kr"] },
  { id: "sedaily", name: "서울경제", domains: ["sedaily.com"] },
  { id: "asiae", name: "아시아경제", domains: ["asiae.co.kr"] },
  { id: "edaily", name: "이데일리", domains: ["edaily.co.kr"] },
  { id: "fnnews", name: "파이낸셜뉴스", domains: ["fnnews.com"] },
  { id: "hankyung", name: "한국경제", domains: ["hankyung.com"] },
  { id: "herald", name: "헤럴드경제", domains: ["heraldcorp.com"] },
];

/**
 * 원문 URL이 허용된 언론사에 속하면 해당 언론사 정보를 반환한다.
 * URL이 없거나 주소 형식이 올바르지 않으면 분석 대상에서 제외할 수 있도록 null을 반환한다.
 */
function getApprovedNewsSource(url) {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

    return (
      APPROVED_NEWS_SOURCES.find((source) =>
        source.domains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        ),
      ) || null
    );
  } catch {
    return null;
  }
}

module.exports = { APPROVED_NEWS_SOURCES, getApprovedNewsSource };
