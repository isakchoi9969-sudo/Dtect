import { useState } from "react";

import Header from "./Header";

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

  const filteredStories = stories.filter((story) => {
    const topicMatch = activeTopic === "전체" || story.category === activeTopic;

    const searchMatch =
      !search ||
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.description.toLowerCase().includes(search.toLowerCase());

    return topicMatch && searchMatch;
  });

  const featuredStory = stories.find((story) => story.featured);

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
        {/* =========================
            페이지 헤더
        ========================= */}
        <section
          style={{
            marginBottom: "34px",
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
            D:TECT COMMUNITY
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "30px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  lineHeight: 1.25,
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                }}
              >
                이모저모
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#6b7280",
                }}
              >
                기업과 산업에 관한 다양한 이야기를 가볍게 둘러보세요.
                <br />
                지금 주목받고 있는 이슈와 트렌드를 한곳에서 확인할 수 있습니다.
              </p>
            </div>

            {/* 검색 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "300px",
                height: "44px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "0 14px",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  marginRight: "9px",
                  fontSize: "16px",
                  color: "#9ca3af",
                }}
              >
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="이슈나 키워드를 검색해보세요"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "#111827",
                }}
              />
            </div>
          </div>
        </section>

        {/* =========================
            오늘의 핵심 이슈
        ========================= */}
        {featuredStory && (
          <section
            style={{
              marginBottom: "24px",
              borderRadius: "18px",
              overflow: "hidden",
              background: "#111827",
              color: "#ffffff",
              position: "relative",
            }}
          >
            <div
              style={{
                padding: "32px 34px",
                minHeight: "190px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginBottom: "18px",
                }}
              >
                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: "5px",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  TODAY
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#d1d5db",
                  }}
                >
                  오늘의 핵심 이슈
                </span>
              </div>

              <h2
                style={{
                  margin: 0,
                  maxWidth: "680px",
                  fontSize: "25px",
                  lineHeight: 1.4,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                }}
              >
                {featuredStory.title}
              </h2>

              <p
                style={{
                  margin: "12px 0 0",
                  maxWidth: "650px",
                  color: "#d1d5db",
                  fontSize: "13px",
                  lineHeight: 1.7,
                }}
              >
                {featuredStory.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginTop: "18px",
                  color: "#9ca3af",
                  fontSize: "11px",
                }}
              >
                <span>{featuredStory.time}</span>
                <span>·</span>
                <span>조회 {featuredStory.views}</span>
                <span>·</span>
                <span>댓글 {featuredStory.comments}</span>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: "42px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 0 0 25px rgba(255,255,255,0.025), 0 0 0 50px rgba(255,255,255,0.015)",
              }}
            />
          </section>
        )}

        {/* =========================
            주제 필터
        ========================= */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "22px",
            overflowX: "auto",
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
                  padding: "9px 16px",
                  borderRadius: "999px",
                  border: isActive ? "1px solid #111827" : "1px solid #e5e7eb",
                  background: isActive ? "#111827" : "#ffffff",
                  color: isActive ? "#ffffff" : "#4b5563",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {topic}
              </button>
            );
          })}
        </section>

        {/* =========================
            본문 2단 영역
        ========================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* =========================
              이야기 피드
          ========================= */}
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 24px",
                borderBottom: "1px solid #f0f1f3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  오늘의 이야기
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  {filteredStories.length}개의 이야기
                </p>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
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
                      justifyContent: "space-between",
                      gap: "20px",
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
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "5px",
                            background: "#f3f4f6",
                            color: "#4b5563",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {story.category}
                        </span>

                        <span
                          style={{
                            color: "#d1d5db",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {story.tag}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          lineHeight: 1.5,
                          fontWeight: 750,
                          color: "#111827",
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {story.title}
                      </h3>

                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "#6b7280",
                          fontSize: "12px",
                          lineHeight: 1.6,
                        }}
                      >
                        {story.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          marginTop: "12px",
                          color: "#9ca3af",
                          fontSize: "11px",
                        }}
                      >
                        <span>{story.time}</span>
                        <span>·</span>
                        <span>조회 {story.views}</span>
                        <span>·</span>
                        <span>댓글 {story.comments}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        alignSelf: "center",
                        fontSize: "20px",
                        color: "#c7cbd1",
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
                    fontSize: "13px",
                    color: "#9ca3af",
                  }}
                >
                  다른 키워드로 검색해보세요.
                </p>
              </div>
            )}
          </section>

          {/* =========================
              오른쪽 인기 키워드
          ========================= */}
          <aside>
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #f0f1f3",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  지금 많이 보는 키워드
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "11px",
                    color: "#9ca3af",
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
                      padding: "17px 20px",
                      borderBottom:
                        index === quickTopics.length - 1
                          ? "none"
                          : "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          width: "20px",
                          fontSize: "11px",
                          color: "#9ca3af",
                          fontWeight: 700,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        {topic.title}
                      </strong>

                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "11px",
                          color: "#9ca3af",
                        }}
                      >
                        {topic.count}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "6px 0 0 30px",
                        fontSize: "10px",
                        color: "#b0b4ba",
                      }}
                    >
                      {topic.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 커뮤니티 안내 */}
            <section
              style={{
                marginTop: "16px",
                padding: "18px",
                borderRadius: "14px",
                background: "#f1f3f5",
                color: "#6b7280",
                fontSize: "11px",
                lineHeight: 1.7,
              }}
            >
              <strong
                style={{
                  color: "#4b5563",
                  fontSize: "12px",
                }}
              >
                D:TECT 이모저모
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                }}
              >
                기업과 산업에 관한 다양한 소식과
                <br />
                이야기를 가볍게 확인해보세요.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
