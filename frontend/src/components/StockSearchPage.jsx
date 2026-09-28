import { useState, useEffect } from "react";

import { useWatchlist } from "../hooks/useWatchlist";

import { ROUTES } from "../config/routes";

import { api } from "../config/api";

import Header from "./Header";

const recommendedKeywords = [
  "삼성",
  "현대",
  "카카오",
  "식품",
  "IT",
  "반도체",
  "바이오",
  "2차전지",
  "자동차",
  "철강",
  "조선",
  "해운",
  "항공",
  "화학",
  "에너지",
  "금융",
  "건설",
  "유통",
  "엔터",
  "게임",
];

const LOGO_DEV_TOKEN = "pk_LmDNVeHjR3Sh2eSen5P1yA";

const companyDomains = {
  삼성SDI: "samsungsdi.co.kr",
  삼성물산: "samsungcnt.com",
  삼성바이오로직스: "samsungbiologics.com",
  삼성생명: "samsunglife.com",
  삼성엔지니어링: "samsungena.com",
  삼성전기: "samsungsem.com",
  삼성전자: "samsung.com",
  삼성중공업: "samsungcareers.com",
  삼성화재: "samsungfire.com",
  HD현대중공업: "hd-hhi.com",
  현대건설: "hdec.kr",
  현대글로비스: "glovis.net",
  현대모비스: "mobis.com",
  현대백화점: "ehyundai.com",
  현대위아: "hyundai-wia.com",
  현대자동차: "hyundai.com",
  현대제철: "hyundai-steel.com",
  카카오: "kakao.com",
  카카오게임즈: "kakaogames.com",
  SK바이오팜: "skbp.com",
  고려아연: "koreazinc.co.kr",
  하이브: "hybecorp.com",
  "JYP Ent.": "jype.com",
  "YG PLUS": "ygplus.com",
  SM: "smentertainment.com",
  하이트진로: "hitejinro.com",
  NAVER: "naver.com",
  이마트: "emart.com",
  금호석유화학: "recruit.kkpc.com",
  금호타이어: "kumhotire.com",
  미래에셋증권: "securities.miraeasset.com",
  LG디스플레이: "lgdisplay.com",
  LG생활건강: "lghnh.com",
  LG에너지솔루션: "lgensol.com",
  LG유플러스: "uplusumobile.com",
  LG이노텍: "lginnotek.com",
  LG전자: "lge.co.kr",
  LG화학: "lgchem.com",
  HMM: "hmm21.com",
  HD한국조선해양: "hd-ksoe.com",
  한국가스공사: "kogas.or.kr",
  한국전력: "kepco.co.kr",
  한국콜마: "kolmar.co.kr",
  한국타이어앤테크놀로지: "hankooktire.com",
  코스맥스: "cosmax.com",
  두산에너빌리티: "doosanenerbility.com",
  두산로보틱스: "doosanrobotics.com",
  두산밥캣: "doosanbobcat.com",
  롯데쇼핑: "lotteshoppingir.com",
  롯데에너지머티리얼즈: "lotteenergymaterials.com",
  롯데칠성음료: "company.lottechilsung.co.kr",
  롯데케미칼: "lottechem.com",
  CJ대한통운: "cjlogistics.com",
  대웅제약: "daewoong.co.kr",
  대한항공: "koreanair.com",
  아시아나항공: "flyasiana.com",
  제주항공: "jejuair.net",
  OCI홀딩스: "oci-holdings.co.kr",
  POSCO홀딩스: "posco-inc.com",
  SK스퀘어: "sksquare.com",
  SK하이닉스: "skhynix.com",
  펄어비스: "pearlabyss.com",
  BGF리테일: "bgfretail.com",
  CJ제일제당: "cj.co.kr",
  GS리테일: "gsretail.com",
  CJ: "cj.net",
  HLB: "hlbbio.co.kr",
  HL만도: "hlmando.com",
  에코프로비엠: "ecoprobm.com",
  포스코퓨처엠: "poscofuturem.com",
  하나금융: "hanafn.com",
  하나금융지주: "hanafn.com",
  KB금융: "kbfg.com",
  메리츠금융지주: "meritzgroup.com",
  우리금융: "woorifg.com",
  우리금융지주: "woorifg.com",
  농심: "nongshim.com",
  오뚜기: "otoki.com",
  신세계: "shinsegae.com",
  GS건설: "gsenc.com",
  기아: "kia.com",
  DB하이텍: "dbhitek.com",
  유한양행: "yuhan.co.kr",
  삼양식품: "samyangfoods.com",
  KG스틸: "kg-steel.co.kr",
};

const keywordCompanies = {
  삼성: [
    "삼성전자",
    "삼성SDI",
    "삼성물산",
    "삼성바이오로직스",
    "삼성생명",
    "삼성화재",
    "삼성전기",
    "삼성중공업",
    "삼성엔지니어링",
  ],
  현대: [
    "현대자동차",
    "현대모비스",
    "현대건설",
    "현대제철",
    "현대글로비스",
    "현대위아",
    "현대백화점",
    "HD현대중공업",
    "HD한국조선해양",
  ],
  카카오: ["카카오", "카카오게임즈"],
  식품: [
    "CJ제일제당",
    "농심",
    "오뚜기",
    "하이트진로",
    "롯데칠성음료",
    "신세계",
    "이마트",
    "BGF리테일",
    "GS리테일",
    "삼양식품",
  ],
  IT: [
    "NAVER",
    "카카오",
    "삼성전자",
    "LG전자",
    "SK하이닉스",
    "LG유플러스",
    "LG이노텍",
    "LG디스플레이",
    "SK스퀘어",
    "두산로보틱스",
  ],
  반도체: ["삼성전자", "SK하이닉스", "삼성전기", "LG이노텍", "DB하이텍"],
  바이오: [
    "삼성바이오로직스",
    "SK바이오팜",
    "HLB",
    "대웅제약",
    "한국콜마",
    "코스맥스",
    "유한양행",
  ],
  "2차전지": [
    "삼성SDI",
    "LG에너지솔루션",
    "LG화학",
    "포스코퓨처엠",
    "에코프로비엠",
    "롯데에너지머티리얼즈",
    "POSCO홀딩스",
  ],
  자동차: [
    "현대자동차",
    "현대모비스",
    "현대위아",
    "기아",
    "HL만도",
    "현대글로비스",
    "금호타이어",
    "한국타이어앤테크놀로지",
  ],
  철강: ["POSCO홀딩스", "현대제철", "고려아연", "KG스틸"],
  조선: ["HD한국조선해양", "HD현대중공업", "삼성중공업"],
  해운: ["HMM", "현대글로비스"],
  항공: ["대한항공", "아시아나항공", "제주항공"],
  화학: ["LG화학", "롯데케미칼", "금호석유화학", "OCI홀딩스", "LG생활건강"],
  에너지: [
    "한국전력",
    "한국가스공사",
    "두산에너빌리티",
    "OCI홀딩스",
    "POSCO홀딩스",
  ],
  금융: [
    "KB금융",
    "하나금융지주",
    "우리금융지주",
    "메리츠금융지주",
    "미래에셋증권",
    "하나금융",
  ],
  건설: ["현대건설", "GS건설", "삼성엔지니어링", "두산에너빌리티"],
  유통: ["이마트", "신세계", "롯데쇼핑", "현대백화점", "BGF리테일", "GS리테일"],
  엔터: ["하이브", "JYP Ent.", "SM", "YG PLUS", "카카오"],
  게임: ["카카오게임즈", "펄어비스"],
};

const getCompanyLogo = (companyName) => {
  const domain = companyDomains[companyName];
  if (!domain) return null;
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128`;
};

export default function StockSearchPage() {
  const [selectedKeyword, setSelectedKeyword] = useState("삼성");
  const { isWatched, toggleWatch } = useWatchlist();
  const companyNames = keywordCompanies[selectedKeyword] || [];

  // 다크모드 감지 (prefers-color-scheme + html.dark 클래스 모두 지원)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const hasDarkDataTheme =
        document.documentElement.getAttribute("data-theme") === "dark";

      setIsDark(hasDarkClass || hasDarkDataTheme);
    };

    checkDark();

    // class 변경도 감지 (next-themes 등 토글용)
    const observer = new MutationObserver(checkDark);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCompanyClick = async (companyName) => {
    try {
      const response = await api.get("/api/company/search", {
        params: { keyword: companyName },
      });

      const companies = response.data.data || [];

      const company = companies.find(
        (item) =>
          item.companyName?.trim().toLowerCase() ===
          companyName.trim().toLowerCase(),
      );

      if (!company?.companyId) {
        alert(`"${companyName}" 기업 정보를 찾을 수 없습니다.`);
        return;
      }

      window.location.assign(
        `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
      );
    } catch (error) {
      console.error("기업 검색 실패:", error);
      alert("기업 정보를 불러오지 못했습니다.");
    }
  };

  // 다크모드 전용 색상 팔레트 (이미지와 유사하게)
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const cardBorder = isDark ? "#1e293b" : "#e5e7eb";
  const cardBorderHover = isDark ? "#334155" : "#d1d5db";

  const cardShadowHover = isDark
    ? "0 4px 12px rgba(0,0,0,0.3)"
    : "0 4px 12px rgba(0,0,0,0.04)";

  const logoBg = isDark ? "#1e293b" : "#f9fafb";
  const logoBorder = isDark ? "#334155" : "#f3f4f6";

  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#9ca3af";
  const fallbackText = isDark ? "#f1f5f9" : "#111827";

  const watchBtnBorder = (watched) =>
    watched ? (isDark ? "#e2e8f0" : "#111827") : isDark ? "#334155" : "#e5e7eb";

  const watchBtnBg = (watched) =>
    watched ? (isDark ? "#e2e8f0" : "#111827") : isDark ? "#0f172a" : "#ffffff";

  const watchBtnColor = (watched) =>
    watched ? (isDark ? "#0f172a" : "#ffffff") : isDark ? "#94a3b8" : "#6b7280";

  const watchBtnHoverBg = isDark ? "#1e293b" : "#f9fafb";
  const watchBtnHoverBorder = isDark ? "#475569" : "#d1d5db";

  return (
    <div className="company-search-page">
      <Header />

      <main className="company-search-main">
        {/* 페이지 소개 */}
        <section
          className="company-search-intro"
          style={{ marginBottom: "28px" }}
        >
          <p className="company-search-eyebrow" style={{ marginBottom: "6px" }}>
            COMPANY INTELLIGENCE
          </p>

          <div className="company-search-logo" style={{ marginBottom: "8px" }}>
            D<span>:</span>TECT
          </div>

          <h1
            style={{
              marginBottom: "8px",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            관심 있는 기업을 찾아보세요.
          </h1>

          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.5 }}>
            관심 있는 기업이나 산업 분야를 선택하면
            <br />
            관련 기업을 확인하고 주요 이슈를 분석할 수 있습니다.
          </p>
        </section>

        {/* 키워드 버튼 */}
        <section
          className="company-search-workspace"
          style={{ marginBottom: "28px" }}
        >
          <p
            className="company-search-eyebrow"
            style={{ marginBottom: "10px" }}
          >
            RECOMMENDED KEYWORDS
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {recommendedKeywords.map((keyword) => {
              const isSelected = selectedKeyword === keyword;

              return (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setSelectedKeyword(keyword)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: isSelected
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                    background: isSelected ? "#111827" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#374151",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.background = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "#ffffff";
                    }
                  }}
                >
                  {keyword}
                </button>
              );
            })}
          </div>
        </section>

        {/* 기업 결과 */}
        <section className="company-search-results">
          <div
            className="company-search-results-heading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "12px",
            }}
          >
            <p style={{ margin: 0, fontSize: "15px" }}>
              <b>{selectedKeyword}</b> 관련 기업
            </p>

            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
              {companyNames.length}개 기업
            </span>
          </div>

          <div
            className="company-result-list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {companyNames.map((companyName) => {
              const logoUrl = getCompanyLogo(companyName);
              const watched = isWatched(companyName);

              return (
                <article
                  className="company-result"
                  key={companyName}
                  style={{
                    borderRadius: "10px",
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    transition:
                      "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = cardShadowHover;
                    e.currentTarget.style.borderColor = cardBorderHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = cardBorder;
                  }}
                >
                  <div
                    className="company-result-main"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCompanyClick(companyName)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleCompanyClick(companyName);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    }}
                  >
                    {/* 기업 로고 */}
                    <span
                      className="company-result-mark"
                      style={{
                        width: "40px",
                        height: "40px",
                        minWidth: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        background: logoBg,
                        border: `1px solid ${logoBorder}`,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${companyName} 로고`}
                          style={{
                            width: "28px",
                            height: "28px",
                            objectFit: "contain",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            const fallback =
                              event.currentTarget.nextElementSibling;

                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <span
                        style={{
                          display: logoUrl ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: fallbackText,
                        }}
                      >
                        {companyName.charAt(0)}
                      </span>

                      {logoUrl && (
                        <span
                          style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: fallbackText,
                          }}
                        >
                          {companyName.charAt(0)}
                        </span>
                      )}
                    </span>

                    {/* 기업명 */}
                    <span
                      className="company-result-copy"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: textPrimary,
                        }}
                      >
                        {companyName}
                      </strong>

                      <em
                        style={{
                          fontSize: "12px",
                          color: textSecondary,
                          fontStyle: "normal",
                        }}
                      >
                        기업 정보 및 주요 이슈
                      </em>
                    </span>

                    {/* 관심기업 버튼 */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleWatch(companyName);
                      }}
                      style={{
                        border: `1px solid ${watchBtnBorder(watched)}`,
                        background: watchBtnBg(watched),
                        color: watchBtnColor(watched),
                        borderRadius: "7px",
                        padding: "5px 9px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.18s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!watched) {
                          e.currentTarget.style.borderColor =
                            watchBtnHoverBorder;
                          e.currentTarget.style.background = watchBtnHoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!watched) {
                          e.currentTarget.style.borderColor =
                            watchBtnBorder(false);
                          e.currentTarget.style.background = watchBtnBg(false);
                        }
                      }}
                    >
                      {watched ? "관심기업" : "관심등록"}
                    </button>

                    {/* 화살표 */}
                    <span
                      className="company-result-arrow"
                      style={{
                        fontSize: "18px",
                        color: textSecondary,
                        transition: "transform 0.18s ease, color 0.18s ease",
                        flexShrink: 0,
                      }}
                    >
                      ›
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
