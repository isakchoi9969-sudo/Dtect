import { useState } from "react";

import Header from "./Header";

const samplePosts = [
  {
    id: 1,
    company: "삼성전자",
    code: "005930",
    title: "삼성전자 3분기 실적 관련해서 어떻게 보시나요?",
    author: "반도체관심",
    time: "10분 전",
    views: 128,
    comments: 12,
    sentiment: "긍정",
  },
  {
    id: 2,
    company: "현대차",
    code: "005380",
    title: "현대차 최근 뉴스 보신 분 계신가요?",
    author: "주식초보",
    time: "24분 전",
    views: 86,
    comments: 7,
    sentiment: "중립",
  },
  {
    id: 3,
    company: "카카오",
    code: "035720",
    title: "카카오 관련해서 새로운 이슈가 있나요?",
    author: "개미투자자",
    time: "41분 전",
    views: 214,
    comments: 18,
    sentiment: "주의",
  },
  {
    id: 4,
    company: "삼성바이오로직스",
    code: "207940",
    title: "바이오 관련 최근 뉴스 정리해봤습니다",
    author: "바이오맨",
    time: "1시간 전",
    views: 174,
    comments: 9,
    sentiment: "긍정",
  },
  {
    id: 5,
    company: "NAVER",
    code: "035420",
    title: "네이버 AI 사업 관련해서 의견 나눠봐요",
    author: "테크주주",
    time: "2시간 전",
    views: 95,
    comments: 5,
    sentiment: "중립",
  },
];

const companies = [
  "전체 종목",
  "삼성전자",
  "현대차",
  "카카오",
  "NAVER",
  "삼성바이오로직스",
];

export default function CommunityStockPage() {
  const [selectedCompany, setSelectedCompany] = useState("전체 종목");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("최신");

  const filteredPosts = samplePosts.filter((post) => {
    const companyMatch =
      selectedCompany === "전체 종목" || post.company === selectedCompany;

    const searchMatch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.company.toLowerCase().includes(search.toLowerCase());

    return companyMatch && searchMatch;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        color: "#111827",
      }}
    >
      <Header />

      <main
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "58px 28px 100px",
        }}
      >
        {/* 페이지 상단 */}
        <section
          style={{
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#6b7280",
            }}
          >
            STOCK COMMUNITY
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  lineHeight: 1.25,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                종목 토론방
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#6b7280",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                관심 종목의 이슈와 뉴스를 공유하고 다양한 의견을 나눠보세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert("글쓰기 기능은 준비 중입니다.")}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                background: "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + 글쓰기
            </button>
          </div>
        </section>

        {/* 종목 필터 */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              overflowX: "auto",
            }}
          >
            {companies.map((company) => {
              const isActive = selectedCompany === company;

              return (
                <button
                  key={company}
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  style={{
                    flexShrink: 0,
                    border: isActive
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                    borderRadius: "999px",
                    padding: "9px 16px",
                    background: isActive ? "#111827" : "#ffffff",
                    color: isActive ? "#ffffff" : "#4b5563",
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {company}
                </button>
              );
            })}
          </div>
        </section>

        {/* 게시글 영역 */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* 게시글 상단 */}
          <div
            style={{
              padding: "22px 24px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 800,
                  }}
                >
                  {selectedCompany === "전체 종목"
                    ? "전체 토론"
                    : `${selectedCompany} 토론방`}
                </p>

                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  {filteredPosts.length}개의 게시글
                </span>
              </div>

              {/* 검색 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="종목 또는 게시글 검색"
                  style={{
                    width: "230px",
                    height: "40px",
                    padding: "0 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "9px",
                    outline: "none",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  type="button"
                  style={{
                    height: "40px",
                    padding: "0 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "9px",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  검색
                </button>
              </div>
            </div>

            {/* 정렬 탭 */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "22px",
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: "12px",
              }}
            >
              {["최신", "인기", "댓글 많은 순"].map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "0 2px",
                      fontSize: "13px",
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? "#111827" : "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 게시글 목록 */}
          <div>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() =>
                    alert(`"${post.title}" 게시글은 준비 중입니다.`)
                  }
                  style={{
                    padding: "22px 24px",
                    borderBottom: "1px solid #f0f1f3",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#fafafa";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    {/* 게시글 내용 */}
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {/* 종목 / 종목코드 / 분위기 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "5px 9px",
                            borderRadius: "6px",
                            background: "#f3f4f6",
                            color: "#374151",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {post.company}
                        </span>

                        <span
                          style={{
                            color: "#9ca3af",
                            fontSize: "11px",
                          }}
                        >
                          {post.code}
                        </span>

                        <span
                          style={{
                            padding: "4px 7px",
                            borderRadius: "5px",
                            background:
                              post.sentiment === "긍정"
                                ? "#ecfdf3"
                                : post.sentiment === "주의"
                                  ? "#fff7ed"
                                  : "#f3f4f6",
                            color:
                              post.sentiment === "긍정"
                                ? "#15803d"
                                : post.sentiment === "주의"
                                  ? "#c2410c"
                                  : "#6b7280",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {post.sentiment}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          lineHeight: 1.5,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {post.title}
                      </h2>

                      {/* 작성자 / 시간 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "10px",
                          color: "#9ca3af",
                          fontSize: "12px",
                        }}
                      >
                        <span>{post.author}</span>
                        <span>·</span>
                        <span>{post.time}</span>
                      </div>
                    </div>

                    {/* 조회수 / 댓글 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        color: "#9ca3af",
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>조회 {post.views}</span>
                      <span>댓글 {post.comments}</span>

                      <span
                        style={{
                          fontSize: "20px",
                          color: "#c4c7cc",
                        }}
                      >
                        ›
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              /* 검색 결과 없음 */
              <div
                style={{
                  padding: "80px 20px",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "15px",
                    color: "#374151",
                  }}
                >
                  검색 결과가 없습니다.
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  다른 종목이나 검색어를 입력해보세요.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 이용 안내 */}
        <section
          style={{
            marginTop: "18px",
            padding: "18px 20px",
            borderRadius: "12px",
            background: "#f1f3f5",
            color: "#6b7280",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          <strong
            style={{
              color: "#4b5563",
            }}
          >
            커뮤니티 이용 안내
          </strong>
          <br />
          종목 및 기업과 관련된 정보를 자유롭게 공유할 수 있습니다. 투자 판단은
          본인의 책임이며 게시글의 내용은 D:TECT의 공식 의견이 아닙니다.
        </section>
      </main>
    </div>
  );
}
