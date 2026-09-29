import { useState, useEffect } from "react";

import { useWatchlist } from "../hooks/useWatchlist";

import { ROUTES } from "../config/routes";

import { api } from "../config/api";

import Header from "./Header";
import CompanyLogo from "./CompanyLogo";

const recommendedKeywords = [
  "2차전지·배터리",
  "콘텐츠·게임·엔터테인먼트",
  "금융·보험·증권",
  "바이오·제약",
  "식품·음료",
  "에너지·화학·정유",
  "유통·이커머스",
  "자동차·부품·타이어",
  "건설·플랜트",
  "운송·물류",
  "전자·디스플레이·부품",
  "화장품·생활소비재",
  "IT·통신·플랫폼",
  "지주·투자",
  "철강·금속·소재",
  "방산·기계",
  "조선",
  "반도체",
  "전체",
];

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

export default function StockSearchPage() {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [industryCompanies, setIndustryCompanies] = useState([]);
  const [isIndustryLoading, setIsIndustryLoading] = useState(false);
  const { isWatched, toggleCompany } = useWatchlist();

  useEffect(() => {
    if (!selectedKeyword) {
      setIndustryCompanies([]);
      setIsIndustryLoading(false);
      return undefined;
    }

    let isActive = true;

    const fetchIndustryCompanies = async () => {
      setIsIndustryLoading(true);
      try {
        const response = selectedKeyword === "전체"
          ? await api.get("/api/company")
          : await api.get("/api/company/search", {
              params: { keyword: selectedKeyword, scope: "industry" },
            });
        if (isActive) {
          setIndustryCompanies(response.data.data || []);
        }
      } catch (error) {
        console.error("산업별 기업 검색 실패:", error);
        if (isActive) setIndustryCompanies([]);
      } finally {
        if (isActive) setIsIndustryLoading(false);
      }
    };

    void fetchIndustryCompanies();

    return () => {
      isActive = false;
    };
  }, [selectedKeyword]);

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

  const handleCompanyClick = (company) => {
    window.location.assign(
      `${ROUTES.COMPANY_DETAIL}?companyId=${company.companyId}`,
    );
  };

  // 다크모드 전용 색상 팔레트 (이미지와 유사하게)
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const cardBorder = isDark ? "#2b394b" : "#dfe7f0";
  const cardBorderHover = isDark ? "#334155" : "#d1d5db";

  const cardShadowHover = isDark
    ? "0 4px 12px rgba(0,0,0,0.3)"
    : "0 4px 12px rgba(0,0,0,0.04)";

  const logoBg = isDark ? "#1e293b" : "#f9fafb";
  const logoBorder = isDark ? "#334155" : "#f3f4f6";

  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#9ca3af";

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
          style={{ marginBottom: "16px" }}
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
            관심 있는 산업 분야를 선택하면
            <br />
            관련 기업을 확인하고 주요 이슈를 분석할 수 있습니다.
          </p>
        </section>

        {/* 키워드 버튼 */}
        <section
          className="company-search-workspace industry-search-workspace"
          style={{ marginBottom: "20px" }}
        >
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
                  onClick={() =>
                    setSelectedKeyword((currentKeyword) =>
                      currentKeyword === keyword ? null : keyword,
                    )
                  }
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
        {selectedKeyword && (
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
              <b>{selectedKeyword}</b>{selectedKeyword === "전체" ? " 기업" : " 관련 기업"}
            </p>

            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
              {isIndustryLoading ? "기업을 불러오는 중..." : `${industryCompanies.length}개 기업`}
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
            {industryCompanies.map((company) => {
              const watched = isWatched(company.companyId);

              return (
                <article
                  className="company-result"
                  key={company.companyId}
                  style={{
                    borderRadius: "13px",
                    border: `1px solid ${isDark ? "#2b394b" : "#dfe7f0"}`,
                    backgroundColor: isDark ? "#111a27" : "#ffffff",
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
                    onClick={() => handleCompanyClick(company)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleCompanyClick(company);
                      }
                    }}
                    style={{
                      display: "grid",
                      gridColumn: "1 / -1",
                      gridTemplateColumns: "52px minmax(0, 1fr) 14px 30px",
                      alignItems: "center",
                      gap: "12px",
                      padding: 0,
                      cursor: "pointer",
                      backgroundColor: isDark ? "#111a27" : "#ffffff",
                    }}
                  >
                    {/* 기업 로고 */}
                    <span
                      className="company-result-mark"
                      style={{
                        width: "52px",
                        height: "52px",
                        minWidth: "52px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "14px",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <CompanyLogo companyName={company.companyName} size={34} />
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
                        {company.companyName}
                        {company.stockCode && (
                          <small style={{ marginLeft: "4px", color: textSecondary, fontSize: "10px" }}>
                            {company.stockCode}
                          </small>
                        )}
                      </strong>

                      <em
                        style={{
                          fontSize: "12px",
                          color: textSecondary,
                          fontStyle: "normal",
                        }}
                      >
                        {company.industry || "업종 정보 없음"}
                      </em>
                      <span style={{ display: "block", marginTop: "3px", color: textSecondary, fontSize: "11px" }}>
                        {company.companyInfo || "기업 정보가 준비 중입니다."}
                      </span>
                    </span>

                    {/* 관심기업 버튼 */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleCompany(company.companyId);
                      }}
                      style={{
                        width: "30px",
                        height: "30px",
                        padding: 0,
                        border: `1px solid ${isDark ? "#486986" : "#b6cadb"}`,
                        background: watched
                          ? isDark ? "#1c344b" : "#fff"
                          : "transparent",
                        color: watched
                          ? isDark ? "#fff" : "#1d5f91"
                          : isDark ? "#fff" : "#54718a",
                        borderRadius: "9px",
                        fontSize: "16px",
                        order: 4,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.18s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {watched ? "★" : "☆"}
                    </button>

                    {/* 화살표 */}
                    <span
                      className="company-result-arrow"
                      style={{
                        fontSize: "18px",
                        order: 3,
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
        )}
      </main>
    </div>
  );
}
