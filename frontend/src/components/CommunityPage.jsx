import { useEffect, useState } from "react";

import Header from "./Header";
import Footer from "./Footer";

const PRIMARY = "#2563EB";

const topics = [
  "전체",
  "오늘의 이슈",
  "기업 뉴스",
  "산업 트렌드",
  "시장 이야기",
];

const stories = [
  {
    id: 1,
    category: "오늘의 이슈",
    tag: "HOT",
    title: "오늘 기업 시장에서 가장 많이 언급된 이슈는?",
    description:
      "주요 기업 뉴스와 시장 반응을 한눈에 살펴보고 오늘의 핵심 이슈를 확인해보세요.",
    time: "10분 전",
    views: 1248,
    comments: 36,
    featured: true,
  },
  {
    id: 2,
    category: "기업 뉴스",
    tag: "NEWS",
    title: "삼성전자, 최근 반도체 시장 변화에 주목",
    description:
      "최근 반도체 업계에서 주목받고 있는 변화와 관련 기업들의 움직임을 정리했습니다.",
    time: "32분 전",
    views: 842,
    comments: 21,
    featured: false,
  },
  {
    id: 3,
    category: "산업 트렌드",
    tag: "TREND",
    title: "AI 산업, 올해 가장 주목해야 할 변화는?",
    description:
      "AI 기술 확산과 함께 변화하고 있는 산업 구조와 기업들의 대응을 살펴봅니다.",
    time: "1시간 전",
    views: 756,
    comments: 18,
    featured: false,
  },
  {
    id: 4,
    category: "시장 이야기",
    tag: "MARKET",
    title: "최근 투자자들이 관심을 보이는 산업은?",
    description:
      "최근 뉴스와 커뮤니티에서 자주 언급되는 산업들을 중심으로 흐름을 살펴봤습니다.",
    time: "2시간 전",
    views: 621,
    comments: 14,
    featured: false,
  },
  {
    id: 5,
    category: "기업 뉴스",
    tag: "NEWS",
    title: "자동차 업계 주요 기업들의 새로운 움직임",
    description:
      "국내 자동차 산업에서 나타나고 있는 주요 변화와 기업별 대응을 정리했습니다.",
    time: "3시간 전",
    views: 514,
    comments: 9,
    featured: false,
  },
  {
    id: 6,
    category: "산업 트렌드",
    tag: "TREND",
    title: "2차전지 시장에서 새롭게 떠오르는 키워드",
    description:
      "최근 2차전지 관련 뉴스에서 반복적으로 등장하는 주요 키워드를 살펴봅니다.",
    time: "4시간 전",
    views: 478,
    comments: 11,
    featured: false,
  },
];

const quickTopics = [
  {
    title: "반도체",
    count: "128",
    description: "최근 24시간 언급",
  },
  {
    title: "AI",
    count: "96",
    description: "최근 24시간 언급",
  },
  {
    title: "2차전지",
    count: "74",
    description: "최근 24시간 언급",
  },
  {
    title: "자동차",
    count: "61",
    description: "최근 24시간 언급",
  },
];

export default function CommunityPage() {
  const [activeTopic, setActiveTopic] = useState("전체");
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark",
  );

  /*
   * ThemeToggle에서 data-theme이 바뀌는 것을 감지합니다.
   * 별도의 CSS 파일 없이 CommunityPage 자체가 다크모드에 대응합니다.
   */
  useEffect(() => {
    const target = document.documentElement;

    const updateTheme = () => {
      setIsDark(target.getAttribute("data-theme") === "dark");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(target, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const filteredStories = stories.filter((story) => {
    const topicMatch = activeTopic === "전체" || story.category === activeTopic;

    const searchText = search.trim().toLowerCase();

    const searchMatch =
      !searchText ||
      story.title.toLowerCase().includes(searchText) ||
      story.description.toLowerCase().includes(searchText) ||
      story.category.toLowerCase().includes(searchText);

    return topicMatch && searchMatch;
  });

  const featuredStory = stories.find((story) => story.featured);

  const colors = {
    page: isDark ? "#0B1220" : "#F7F9FC",
    surface: isDark ? "#111827" : "#FFFFFF",
    surfaceSoft: isDark ? "#172033" : "#F8FAFC",
    surfaceHover: isDark ? "#1A263A" : "#F8FAFF",
    border: isDark ? "#263247" : "#E5EAF1",
    borderSoft: isDark ? "#202C3E" : "#EEF1F5",
    text: isDark ? "#F8FAFC" : "#111827",
    textSecondary: isDark ? "#CBD5E1" : "#4B5563",
    textMuted: isDark ? "#94A3B8" : "#9CA3AF",
    textFaint: isDark ? "#64748B" : "#B0B7C3",
    input: isDark ? "#0F172A" : "#FFFFFF",
    blueSoft: isDark ? "rgba(37,99,235,0.16)" : "#EFF6FF",
    blueBorder: isDark ? "rgba(59,130,246,0.35)" : "#DBEAFE",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.page,
        color: colors.text,
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Header />

      <main
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "48px 24px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <section
          style={{
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "24px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "9px",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: PRIMARY,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: PRIMARY,
                    boxShadow: `0 0 0 4px ${
                      isDark ? "rgba(37,99,235,0.14)" : "rgba(37,99,235,0.10)"
                    }`,
                  }}
                />
                D:TECT COMMUNITY
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  lineHeight: 1.2,
                  fontWeight: 850,
                  letterSpacing: "-0.045em",
                  color: colors.text,
                }}
              >
                이모저모
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: colors.textSecondary,
                }}
              >
                기업과 산업에 관한 다양한 이야기를 가볍게 둘러보세요.
              </p>
            </div>

            {/* 검색 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "290px",
                height: "42px",
                background: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: "11px",
                padding: "0 13px",
                boxSizing: "border-box",
                boxShadow: isDark ? "none" : "0 3px 12px rgba(15,23,42,0.03)",
                transition:
                  "border-color 0.2s ease, box-shadow 0.2s ease, background 0.25s ease",
              }}
            >
              <span
                style={{
                  marginRight: "8px",
                  fontSize: "17px",
                  lineHeight: 1,
                  color: PRIMARY,
                }}
              >
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="이슈나 키워드 검색"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "12px",
                  color: colors.text,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            TODAY FEATURE
        ====================================================== */}
        {featuredStory && (
          <section
            style={{
              position: "relative",
              marginBottom: "20px",
              minHeight: "196px",
              borderRadius: "17px",
              overflow: "hidden",
              background: isDark
                ? "linear-gradient(135deg, #172554 0%, #101827 62%, #0B1220 100%)"
                : "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 68%)",
              border: `1px solid ${
                isDark ? "rgba(59,130,246,0.24)" : "#DBEAFE"
              }`,
              boxSizing: "border-box",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              boxShadow: isDark
                ? "0 12px 30px rgba(0,0,0,0.18)"
                : "0 10px 28px rgba(37,99,235,0.07)",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-2px)";
              event.currentTarget.style.boxShadow = isDark
                ? "0 16px 36px rgba(0,0,0,0.25)"
                : "0 15px 34px rgba(37,99,235,0.11)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow = isDark
                ? "0 12px 30px rgba(0,0,0,0.18)"
                : "0 10px 28px rgba(37,99,235,0.07)";
            }}
          >
            {/* 배경 장식 */}
            <div
              style={{
                position: "absolute",
                right: "-35px",
                top: "-65px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                border: `1px solid ${
                  isDark ? "rgba(96,165,250,0.13)" : "rgba(37,99,235,0.09)"
                }`,
                boxShadow: `0 0 0 28px ${
                  isDark ? "rgba(59,130,246,0.035)" : "rgba(37,99,235,0.025)"
                }, 0 0 0 56px ${
                  isDark ? "rgba(59,130,246,0.02)" : "rgba(37,99,235,0.015)"
                }`,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "26px 30px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "5px",
                    background: PRIMARY,
                    color: "#FFFFFF",
                    fontSize: "9px",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                  }}
                >
                  TODAY
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.textSecondary,
                  }}
                >
                  오늘의 핵심 이슈
                </span>
              </div>

              <h2
                style={{
                  margin: 0,
                  maxWidth: "680px",
                  fontSize: "23px",
                  lineHeight: 1.4,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: colors.text,
                }}
              >
                {featuredStory.title}
              </h2>

              <p
                style={{
                  margin: "9px 0 0",
                  maxWidth: "650px",
                  color: colors.textSecondary,
                  fontSize: "12px",
                  lineHeight: 1.65,
                }}
              >
                {featuredStory.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  marginTop: "14px",
                  color: colors.textMuted,
                  fontSize: "10px",
                }}
              >
                <span>{featuredStory.time}</span>
                <span>·</span>
                <span>조회 {featuredStory.views}</span>
                <span>·</span>
                <span>댓글 {featuredStory.comments}</span>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            TOPIC FILTER
        ====================================================== */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "18px",
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          {topics.map((topic) => {
            const isActive = activeTopic === topic;

            return (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                style={{
                  flexShrink: 0,
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: isActive
                    ? `1px solid ${PRIMARY}`
                    : `1px solid ${colors.border}`,
                  background: isActive ? PRIMARY : colors.surface,
                  color: isActive ? "#FFFFFF" : colors.textSecondary,
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition:
                    "transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
                }}
                onMouseEnter={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.transform = "translateY(-1px)";
                    event.currentTarget.style.borderColor = PRIMARY;
                    event.currentTarget.style.color = PRIMARY;
                  }
                }}
                onMouseLeave={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.borderColor = colors.border;
                    event.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                {topic}
              </button>
            );
          })}
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 270px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* =====================================================
              STORY FEED
          ====================================================== */}
          <section
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: isDark ? "none" : "0 5px 18px rgba(15,23,42,0.025)",
              transition: "background 0.25s ease, border-color 0.25s ease",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: `1px solid ${colors.borderSoft}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: colors.text,
                    }}
                  >
                    오늘의 이야기
                  </h2>

                  <span
                    style={{
                      padding: "3px 6px",
                      borderRadius: "4px",
                      background: colors.blueSoft,
                      color: PRIMARY,
                      fontSize: "9px",
                      fontWeight: 800,
                    }}
                  >
                    {filteredStories.length}
                  </span>
                </div>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "10px",
                    color: colors.textMuted,
                  }}
                >
                  지금 주목받고 있는 기업·산업 이야기
                </p>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  color: colors.textMuted,
                }}
              >
                최신순
              </span>
            </div>

            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <article
                  key={story.id}
                  onClick={() =>
                    alert(`"${story.title}" 콘텐츠는 준비 중입니다.`)
                  }
                  style={{
                    padding: "18px 20px",
                    borderBottom: `1px solid ${colors.borderSoft}`,
                    cursor: "pointer",
                    transition:
                      "background 0.18s ease, transform 0.18s ease, padding-left 0.18s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = colors.surfaceHover;
                    event.currentTarget.style.paddingLeft = "23px";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = colors.surface;
                    event.currentTarget.style.paddingLeft = "20px";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "18px",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {/* 카테고리 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 7px",
                            borderRadius: "5px",
                            background: colors.blueSoft,
                            border: `1px solid ${colors.blueBorder}`,
                            color: PRIMARY,
                            fontSize: "9px",
                            fontWeight: 700,
                          }}
                        >
                          {story.category}
                        </span>

                        <span
                          style={{
                            fontSize: "9px",
                            color: colors.textFaint,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {story.tag}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: 1.5,
                          fontWeight: 750,
                          color: colors.text,
                          letterSpacing: "-0.018em",
                        }}
                      >
                        {story.title}
                      </h3>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: colors.textSecondary,
                          fontSize: "11px",
                          lineHeight: 1.55,
                        }}
                      >
                        {story.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "10px",
                          color: colors.textMuted,
                          fontSize: "10px",
                        }}
                      >
                        <span>{story.time}</span>
                        <span>·</span>
                        <span>조회 {story.views}</span>
                        <span>·</span>
                        <span>댓글 {story.comments}</span>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <span
                      style={{
                        flexShrink: 0,
                        alignSelf: "center",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: colors.surfaceSoft,
                        color: colors.textMuted,
                        fontSize: "17px",
                        transition:
                          "transform 0.18s ease, background 0.18s ease, color 0.18s ease",
                      }}
                    >
                      ›
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div
                style={{
                  padding: "70px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: colors.blueSoft,
                    color: PRIMARY,
                    fontSize: "18px",
                  }}
                >
                  ⌕
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: colors.text,
                  }}
                >
                  검색 결과가 없습니다.
                </strong>

                <p
                  style={{
                    margin: "7px 0 0",
                    fontSize: "11px",
                    color: colors.textMuted,
                  }}
                >
                  다른 키워드로 검색해보세요.
                </p>
              </div>
            )}
          </section>

          {/* =====================================================
              RIGHT SIDEBAR
          ====================================================== */}
          <aside>
            {/* 트렌딩 키워드 */}
            <section
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: isDark ? "none" : "0 5px 18px rgba(15,23,42,0.025)",
                transition: "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              <div
                style={{
                  padding: "18px 18px 15px",
                  borderBottom: `1px solid ${colors.borderSoft}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: PRIMARY,
                    }}
                  />

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 800,
                      color: colors.text,
                    }}
                  >
                    트렌딩 키워드
                  </h2>
                </div>

                <p
                  style={{
                    margin: "5px 0 0 13px",
                    fontSize: "10px",
                    color: colors.textMuted,
                  }}
                >
                  최근 24시간 기준
                </p>
              </div>

              <div>
                {quickTopics.map((topic, index) => (
                  <div
                    key={topic.title}
                    style={{
                      padding: "14px 18px",
                      borderBottom:
                        index === quickTopics.length - 1
                          ? "none"
                          : `1px solid ${colors.borderSoft}`,
                      cursor: "pointer",
                      transition: "background 0.18s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background =
                        colors.surfaceHover;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = colors.surface;
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                      }}
                    >
                      <span
                        style={{
                          width: "18px",
                          fontSize: "9px",
                          color: index === 0 ? PRIMARY : colors.textFaint,
                          fontWeight: 800,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong
                        style={{
                          fontSize: "13px",
                          color: colors.text,
                        }}
                      >
                        {topic.title}
                      </strong>

                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "10px",
                          color: PRIMARY,
                          fontWeight: 700,
                        }}
                      >
                        {topic.count}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "4px 0 0 27px",
                        fontSize: "9px",
                        color: colors.textMuted,
                      }}
                    >
                      {topic.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* D:TECT 안내 카드 */}
            <section
              style={{
                marginTop: "14px",
                padding: "17px",
                borderRadius: "14px",
                background: isDark
                  ? "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))"
                  : "linear-gradient(135deg, #EFF6FF, #F8FAFC)",
                border: `1px solid ${
                  isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE"
                }`,
                color: colors.textSecondary,
                fontSize: "10px",
                lineHeight: 1.65,
                transition: "background 0.25s ease, border-color 0.25s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "7px",
                    background: PRIMARY,
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  D
                </span>

                <strong
                  style={{
                    color: colors.text,
                    fontSize: "11px",
                  }}
                >
                  D:TECT 이모저모
                </strong>
              </div>

              <p
                style={{
                  margin: 0,
                }}
              >
                기업과 산업에 관한 다양한 소식과
                <br />
                이야기를 한곳에서 확인해보세요.
              </p>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
