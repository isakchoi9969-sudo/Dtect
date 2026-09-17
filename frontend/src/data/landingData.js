export const navigationItems = [
  {
    title: "기업 분석",
    href: "/company-analysis",
    children: ["기업 검색", "관심 기업"],
  },
  {
    title: "AI 대응센터",
    href: "/response-center",
    paidService: true,
    children: ["과거 사례 시뮬레이터", "대응자료 생성"],
  },
  {
    title: "알림",
    href: "/alerts",
    paidService: true,
    children: ["위험도 급상승 알림", "주요 이슈 발생 알림"],
  },
];

export const watchlist = ["Samsung Electronics", "SK Hynix", "Hyundai Motor"];

export const problemItems = [
  {
    number: "01",
    title: ["매일 반복되는", "수동 검색의 비효율"],
    description:
      "관심 기업이 늘어날수록 여러 브랜드와 채널의 뉴스를 반복해서 검색해야 합니다. D:TECT는 기업 관련 뉴스를 한곳에 모아 반복적인 탐색 과정을 줄여줍니다.",
  },
  {
    number: "02",
    title: ["중복 정보 속에 숨겨진", "진짜 이슈 탐색"],
    description:
      "수십 건의 기사가 쏟아져도 핵심 사건은 하나일 수 있습니다. D:TECT는 유사한 기사를 하나의 이슈로 묶어 사건의 흐름을 빠르게 파악하도록 돕습니다.",
  },
  {
    number: "03",
    title: ["다양한 상황에 맞춘", "대응자료 제작의 부담"],
    description:
      "이슈 발생 시 상황별 대응자료를 빠르게 준비해야 합니다. D:TECT는 분석 결과를 바탕으로 실무자가 검토하고 수정할 수 있는 대응자료 초안을 제공합니다.",
  },
];

export const testimonials = [
  {
    quote:
      "매일 아침 반복되던 자료 정리 시간이 크게 줄었습니다. 확보한 시간을 리스크 예방 전략을 검토하는 데 활용할 수 있게 되었습니다.",
    name: "김서현",
    role: "전략기획팀 대리",
  },
  {
    quote:
      "데이터에 기반한 위험도 지표 덕분에 보고 체계가 명확해졌습니다. 단순 뉴스 전달이 아니라 분석 리포트로 활용할 수 있습니다.",
    name: "박준호",
    role: "선임연구원",
  },
];
