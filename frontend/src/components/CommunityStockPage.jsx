import { useEffect, useMemo, useState } from "react";

import Header from "./Header";
import Footer from "./Footer";

const PRIMARY = "#2563EB";

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
  const [isDark, setIsDark] = useState(false);

  const handleWriteClick = () => {
    alert("로그인 후 이용 가능합니다.");
  };

  // Header의 ThemeToggle이 사용하는 data-theme을 감지
  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const colors = {
    pageBg: isDark ? "#0B1120" : "#F7F9FC",
    cardBg: isDark ? "#111827" : "#FFFFFF",
    cardBgHover: isDark ? "#172033" : "#F8FAFF",
    border: isDark ? "#25324A" : "#E5EAF2",
    borderSoft: isDark ? "#1E293B" : "#EEF2F7",

    text: isDark ? "#F8FAFC" : "#111827",
    textStrong: isDark ? "#FFFFFF" : "#111827",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    textLight: isDark ? "#64748B" : "#94A3B8",

    inputBg: isDark ? "#0F172A" : "#FFFFFF",

    softBlue: isDark ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF",
    softBlueBorder: isDark ? "rgba(96, 165, 250, 0.25)" : "#DBEAFE",

    guideBg: isDark ? "#111827" : "#F1F5F9",
  };

  const filteredPosts = useMemo(() => {
    let result = samplePosts.filter((post) => {
      const companyMatch =
        selectedCompany === "전체 종목" || post.company === selectedCompany;

      const searchKeyword = search.trim().toLowerCase();

      const searchMatch =
        !searchKeyword ||
        post.title.toLowerCase().includes(searchKeyword) ||
        post.company.toLowerCase().includes(searchKeyword) ||
        post.author.toLowerCase().includes(searchKeyword);

      return companyMatch && searchMatch;
    });

    if (activeTab === "인기") {
      result = [...result].sort((a, b) => b.views - a.views);
    }

    if (activeTab === "댓글 많은 순") {
      result = [...result].sort((a, b) => b.comments - a.comments);
    }

    return result;
  }, [selectedCompany, search, activeTab]);

  const getSentimentStyle = (sentiment) => {
    if (sentiment === "긍정") {
      return {
        background: isDark ? "rgba(34, 197, 94, 0.12)" : "#ECFDF3",
        color: isDark ? "#4ADE80" : "#15803D",
      };
    }

    if (sentiment === "주의") {
      return {
        background: isDark ? "rgba(249, 115, 22, 0.12)" : "#FFF7ED",
        color: isDark ? "#FB923C" : "#C2410C",
      };
    }

    return {
      background: isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9",
      color: isDark ? "#CBD5E1" : "#64748B",
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        color: colors.text,
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Header />

      <main
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "54px 28px 90px",
          boxSizing: "border-box",
        }}
      >
        {/* =========================
            페이지 상단
        ========================= */}
        <section
          style={{
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              marginBottom: "12px",
              padding: "6px 10px",
              borderRadius: "999px",
              background: colors.softBlue,
              border: `1px solid ${colors.softBlueBorder}`,
              color: PRIMARY,
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: PRIMARY,
                boxShadow: `0 0 0 4px ${
                  isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)"
                }`,
              }}
            />
            STOCK COMMUNITY
          </div>

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
                  fontWeight: 850,
                  letterSpacing: "-0.045em",
                  color: colors.textStrong,
                }}
              >
                종목 토론방
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: colors.textMuted,
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                관심 종목의 이슈와 뉴스를 공유하고 다양한 의견을 나눠보세요.
              </p>
            </div>

            <button
              type="button"
              onClick={handleWriteClick}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#2563EB",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              글쓰기
            </button>
          </div>
        </section>

        {/* =========================
            종목 필터
        ========================= */}
        <section
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: "14px",
            padding: "14px",
            marginBottom: "18px",
            boxShadow: isDark ? "none" : "0 5px 18px rgba(15, 23, 42, 0.035)",
            transition: "background 0.25s ease, border 0.25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              scrollbarWidth: "none",
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
                      ? `1px solid ${PRIMARY}`
                      : `1px solid ${colors.border}`,
                    borderRadius: "999px",
                    padding: "8px 14px",
                    background: isActive ? PRIMARY : colors.cardBg,
                    color: isActive ? "#FFFFFF" : colors.textMuted,
                    fontSize: "12px",
                    fontWeight: isActive ? 750 : 550,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(37, 99, 235, 0.18)"
                      : "none",
                  }}
                >
                  {company}
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================
            게시글 영역
        ========================= */}
        <section
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: isDark ? "none" : "0 8px 28px rgba(15, 23, 42, 0.045)",
            transition: "background 0.25s ease, border 0.25s ease",
          }}
        >
          {/* 게시글 상단 */}
          <div
            style={{
              padding: "20px 22px 0",
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 800,
                      color: colors.textStrong,
                    }}
                  >
                    {selectedCompany === "전체 종목"
                      ? "전체 토론"
                      : `${selectedCompany} 토론방`}
                  </p>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "22px",
                      height: "20px",
                      padding: "0 6px",
                      boxSizing: "border-box",
                      borderRadius: "999px",
                      background: colors.softBlue,
                      color: PRIMARY,
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    {filteredPosts.length}
                  </span>
                </div>

                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: colors.textLight,
                    fontSize: "11px",
                  }}
                >
                  관심 종목에 대한 다양한 의견을 확인해보세요.
                </span>
              </div>

              {/* 검색 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "230px",
                    height: "38px",
                    padding: "0 11px",
                    boxSizing: "border-box",
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "9px",
                    transition: "border 0.18s ease",
                  }}
                >
                  <span
                    style={{
                      marginRight: "7px",
                      color: colors.textLight,
                      fontSize: "15px",
                    }}
                  >
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="종목 또는 게시글 검색"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: colors.text,
                      fontSize: "12px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    height: "38px",
                    padding: "0 13px",
                    border: `1px solid ${PRIMARY}`,
                    borderRadius: "9px",
                    background: colors.cardBg,
                    color: PRIMARY,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = PRIMARY;
                    event.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = colors.cardBg;
                    event.currentTarget.style.color = PRIMARY;
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
                marginTop: "20px",
                borderBottom: `1px solid ${colors.borderSoft}`,
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
                      position: "relative",
                      border: "none",
                      background: "transparent",
                      padding: "0 1px 12px",
                      color: isActive ? PRIMARY : colors.textLight,
                      fontSize: "12px",
                      fontWeight: isActive ? 800 : 550,
                      cursor: "pointer",
                    }}
                  >
                    {tab}

                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: "-1px",
                          height: "2px",
                          borderRadius: "2px",
                          background: PRIMARY,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 게시글 목록 */}
          <div>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                const sentimentStyle = getSentimentStyle(post.sentiment);

                return (
                  <article
                    key={post.id}
                    onClick={() =>
                      alert(`"${post.title}" 로그인 후 이용가능 합니다.`)
                    }
                    style={{
                      position: "relative",
                      padding: "20px 22px",
                      borderBottom:
                        index === filteredPosts.length - 1
                          ? "none"
                          : `1px solid ${colors.borderSoft}`,
                      cursor: "pointer",
                      background: "transparent",
                      transition: "background 0.18s ease, transform 0.18s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = colors.cardBgHover;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "transparent";
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
                        {/* 종목 / 코드 / 분위기 */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            marginBottom: "9px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: colors.softBlue,
                              color: PRIMARY,
                              fontSize: "10px",
                              fontWeight: 800,
                            }}
                          >
                            {post.company}
                          </span>

                          <span
                            style={{
                              color: colors.textLight,
                              fontSize: "10px",
                              fontWeight: 500,
                            }}
                          >
                            {post.code}
                          </span>

                          <span
                            style={{
                              padding: "4px 7px",
                              borderRadius: "5px",
                              background: sentimentStyle.background,
                              color: sentimentStyle.color,
                              fontSize: "9px",
                              fontWeight: 750,
                            }}
                          >
                            {post.sentiment}
                          </span>
                        </div>

                        {/* 제목 */}
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            lineHeight: 1.5,
                            fontWeight: 750,
                            color: colors.textStrong,
                            letterSpacing: "-0.015em",
                          }}
                        >
                          {post.title}
                        </h2>

                        {/* 작성자 / 시간 */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            marginTop: "9px",
                            color: colors.textLight,
                            fontSize: "11px",
                          }}
                        >
                          <span>{post.author}</span>
                          <span>·</span>
                          <span>{post.time}</span>
                        </div>
                      </div>

                      {/* 조회수 / 댓글 / 화살표 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          color: colors.textLight,
                          fontSize: "10px",
                          whiteSpace: "nowrap",
                          paddingTop: "28px",
                        }}
                      >
                        <span>조회 {post.views}</span>
                        <span>댓글 {post.comments}</span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "25px",
                            height: "25px",
                            borderRadius: "50%",
                            background: colors.softBlue,
                            color: PRIMARY,
                            fontSize: "16px",
                            fontWeight: 500,
                            transition: "transform 0.18s ease",
                          }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div
                style={{
                  padding: "75px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    marginBottom: "13px",
                    borderRadius: "50%",
                    background: colors.softBlue,
                    color: PRIMARY,
                    fontSize: "21px",
                  }}
                >
                  ⌕
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: colors.textStrong,
                  }}
                >
                  검색 결과가 없습니다.
                </strong>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: colors.textMuted,
                    fontSize: "12px",
                  }}
                >
                  다른 종목이나 검색어를 입력해보세요.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            이용 안내
        ========================= */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "16px",
            padding: "15px 18px",
            borderRadius: "12px",
            background: colors.guideBg,
            border: `1px solid ${colors.borderSoft}`,
            color: colors.textMuted,
            fontSize: "11px",
            lineHeight: 1.6,
            transition: "background 0.25s ease, border 0.25s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: "24px",
              height: "24px",
              borderRadius: "7px",
              background: colors.softBlue,
              color: PRIMARY,
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            i
          </span>

          <div>
            <strong
              style={{
                color: colors.text,
                fontSize: "11px",
              }}
            >
              커뮤니티 이용 안내
            </strong>

            <span
              style={{
                marginLeft: "8px",
                color: colors.textMuted,
              }}
            >
              종목 및 기업과 관련된 정보를 자유롭게 공유할 수 있습니다. 투자
              판단은 본인의 책임이며 게시글의 내용은 D:TECT의 공식 의견이
              아닙니다.
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
