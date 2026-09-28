import { useState } from "react";

import Header from "./Header";

// 업종 / 사업 분야별 종목
const stockCategories = {
  IT: [
    {
      name: "삼성전자",
      code: "005930",
      market: "KOSPI",
    },
    {
      name: "SK하이닉스",
      code: "000660",
      market: "KOSPI",
    },
    {
      name: "NAVER",
      code: "035420",
      market: "KOSPI",
    },
    {
      name: "카카오",
      code: "035720",
      market: "KOSPI",
    },
    {
      name: "LG전자",
      code: "066570",
      market: "KOSPI",
    },
  ],

  식품: [
    {
      name: "CJ제일제당",
      code: "097950",
      market: "KOSPI",
    },
    {
      name: "농심",
      code: "004370",
      market: "KOSPI",
    },
    {
      name: "오뚜기",
      code: "007310",
      market: "KOSPI",
    },
    {
      name: "하이트진로",
      code: "000080",
      market: "KOSPI",
    },
    {
      name: "삼양식품",
      code: "003230",
      market: "KOSPI",
    },
  ],

  자동차: [
    {
      name: "현대차",
      code: "005380",
      market: "KOSPI",
    },
    {
      name: "기아",
      code: "000270",
      market: "KOSPI",
    },
    {
      name: "현대모비스",
      code: "012330",
      market: "KOSPI",
    },
    {
      name: "현대위아",
      code: "011210",
      market: "KOSPI",
    },
  ],

  금융: [
    {
      name: "KB금융",
      code: "105560",
      market: "KOSPI",
    },
    {
      name: "신한지주",
      code: "055550",
      market: "KOSPI",
    },
    {
      name: "하나금융지주",
      code: "086790",
      market: "KOSPI",
    },
    {
      name: "우리금융지주",
      code: "316140",
      market: "KOSPI",
    },
    {
      name: "메리츠금융지주",
      code: "138040",
      market: "KOSPI",
    },
  ],

  바이오: [
    {
      name: "삼성바이오로직스",
      code: "207940",
      market: "KOSPI",
    },
    {
      name: "셀트리온",
      code: "068270",
      market: "KOSPI",
    },
    {
      name: "SK바이오팜",
      code: "326030",
      market: "KOSPI",
    },
    {
      name: "HLB",
      code: "028300",
      market: "KOSDAQ",
    },
  ],

  "2차전지": [
    {
      name: "LG에너지솔루션",
      code: "373220",
      market: "KOSPI",
    },
    {
      name: "삼성SDI",
      code: "006400",
      market: "KOSPI",
    },
    {
      name: "포스코퓨처엠",
      code: "003670",
      market: "KOSPI",
    },
    {
      name: "에코프로비엠",
      code: "247540",
      market: "KOSDAQ",
    },
  ],

  반도체: [
    {
      name: "삼성전자",
      code: "005930",
      market: "KOSPI",
    },
    {
      name: "SK하이닉스",
      code: "000660",
      market: "KOSPI",
    },
    {
      name: "DB하이텍",
      code: "000990",
      market: "KOSPI",
    },
    {
      name: "한미반도체",
      code: "042700",
      market: "KOSPI",
    },
  ],

  건설: [
    {
      name: "현대건설",
      code: "000720",
      market: "KOSPI",
    },
    {
      name: "GS건설",
      code: "006360",
      market: "KOSPI",
    },
    {
      name: "DL이앤씨",
      code: "375500",
      market: "KOSPI",
    },
    {
      name: "대우건설",
      code: "047040",
      market: "KOSPI",
    },
  ],

  엔터테인먼트: [
    {
      name: "하이브",
      code: "352820",
      market: "KOSPI",
    },
    {
      name: "JYP Ent.",
      code: "035900",
      market: "KOSDAQ",
    },
    {
      name: "SM",
      code: "041510",
      market: "KOSDAQ",
    },
    {
      name: "YG PLUS",
      code: "037270",
      market: "KOSPI",
    },
  ],
};

const categoryList = Object.keys(stockCategories);

export default function StockSearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("IT");

  const stocks = stockCategories[selectedCategory] || [];

  const openStock = (stock) => {
    console.log("선택한 종목:", stock);

    // 추후 종목 상세 페이지를 만들 경우
    // 이곳에서 상세 페이지로 이동시키면 됩니다.
  };

  return (
    <div className="company-search-page">
      <Header />

      <main className="company-search-main">
        {/* 상단 소개 */}
        <section className="company-search-intro">
          <p className="company-search-eyebrow">STOCK INTELLIGENCE</p>

          <div className="company-search-logo">
            D<span>:</span>TECT
          </div>

          <h1>관심 있는 업종의 종목을 찾아보세요.</h1>

          <p>
            기업의 주요 사업 분야를 기준으로 종목을 분류했습니다.
            <br />
            관심 있는 분야를 선택해 관련 종목을 확인해보세요.
          </p>
        </section>

        {/* 카테고리 선택 */}
        <section
          className="company-search-workspace"
          aria-label="종목 분야 선택"
        >
          <p className="company-search-eyebrow">INDUSTRY CATEGORY</p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {categoryList.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: "11px 18px",
                    borderRadius: "999px",
                    border: isSelected
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                    background: isSelected ? "#111827" : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* 선택한 분야의 종목 */}
        <section className="company-search-results">
          <div className="company-search-results-heading">
            <div>
              <p>
                <b>{selectedCategory}</b> 관련 종목
              </p>

              <span>{stocks.length}개 종목</span>
            </div>
          </div>

          {stocks.length > 0 ? (
            <div className="company-result-list">
              {stocks.map((stock) => (
                <article className="company-result" key={stock.code}>
                  <button
                    className="company-result-main"
                    type="button"
                    onClick={() => openStock(stock)}
                  >
                    {/* 종목 코드 */}
                    <span
                      className="company-result-mark"
                      style={{
                        width: "52px",
                        height: "52px",
                        minWidth: "52px",
                        minHeight: "52px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        borderRadius: "14px",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        boxSizing: "border-box",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {stock.code}
                    </span>

                    {/* 종목 정보 */}
                    <span className="company-result-copy">
                      <strong>{stock.name}</strong>

                      <em>종목코드 {stock.code}</em>

                      <span>{stock.market}</span>
                    </span>

                    {/* 오른쪽 화살표 */}
                    <span className="company-result-arrow">›</span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="company-search-empty">
              <strong>등록된 종목이 없습니다.</strong>

              <p>다른 업종을 선택해 주세요.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
