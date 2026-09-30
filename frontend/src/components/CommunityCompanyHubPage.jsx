import { useEffect, useState } from "react";
import CommunitySharedLayout from "./CommunitySharedLayout";
import { PROMOTION_POSTS, RECRUITMENT_POSTS } from "../data/companyBoardDummy";
import { api } from "../config/api";

/** 실제 홍보·채용 데이터 연결 전, 탭형 화면의 공통 UI 진입점입니다. */
export default function CommunityCompanyHubPage() {
  const [activeTab, setActiveTab] = useState("promotion");
  const [selectedPost, setSelectedPost] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const posts = activeTab === "promotion" ? PROMOTION_POSTS : RECRUITMENT_POSTS;
  const tabLabel = activeTab === "promotion" ? "기업 홍보" : "채용 정보";
  const canWrite = currentUser?.userType === "COMPANY" && Boolean(currentUser?.companyId);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/auth/me", { signal: controller.signal })
      .then((response) => setCurrentUser(response.data.user || null))
      .catch(() => setCurrentUser(null))
      .finally(() => {
        if (!controller.signal.aborted) setUserLoading(false);
      });
    return () => controller.abort();
  }, []);

  const writeGuide = !currentUser
    ? "로그인한 소속 기업 회원만 작성할 수 있습니다."
    : currentUser.userType !== "COMPANY"
      ? "기업 홍보와 채용 정보는 기업회원만 작성할 수 있습니다."
      : !currentUser.companyId
        ? "글을 작성하려면 마이페이지에서 소속 기업을 연결해 주세요."
        : "";

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedPost(null);
  };

  return (
    <CommunitySharedLayout
      eyebrow="COMPANY BOARD"
      title="기업 홍보·채용"
      description="기업의 기술과 서비스 소식, 채용 정보를 확인할 수 있는 공간입니다."
    >
      <section className="company-board" aria-label="기업 홍보 및 채용 게시판">
        <div className="company-board-tabs" role="tablist" aria-label="게시판 종류">
          <button type="button" role="tab" aria-selected={activeTab === "promotion"} className={activeTab === "promotion" ? "is-active" : ""} onClick={() => changeTab("promotion")}>기업 홍보</button>
          <button type="button" role="tab" aria-selected={activeTab === "recruitment"} className={activeTab === "recruitment" ? "is-active" : ""} onClick={() => changeTab("recruitment")}>채용 정보</button>
        </div>
        {!selectedPost ? (
          <>
            <div className="company-board-list-heading"><div><span>{activeTab === "promotion" ? "COMPANY SPOTLIGHT" : "CAREERS"}</span><h2>{tabLabel}</h2></div><button type="button" onClick={() => setComposerOpen(true)} disabled={userLoading || !canWrite} title={writeGuide || undefined}>＋ 글 작성</button></div>
            {!userLoading && writeGuide && <p className="company-board-write-guide">{writeGuide}</p>}
            <div className="company-board-list">
              {posts.map((post) => (
                <button className="company-board-row" type="button" key={post.id} onClick={() => setSelectedPost(post)}>
                  {activeTab === "promotion" && <span className="company-board-image" aria-hidden="true">{post.imageLabel}</span>}
                  <span className="company-board-row-copy"><small>{post.company}</small><strong>{post.title}</strong>{activeTab === "recruitment" && <em>{[post.job, post.career, post.employment, post.location].join(" · ")}</em>}</span>
                  <span className="company-board-row-meta"><time>{activeTab === "promotion" ? post.date : `마감 ${post.deadline}`}</time><small>조회 {post.views}</small></span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <article className="company-board-detail">
            <button type="button" className="company-board-back" onClick={() => setSelectedPost(null)}>← 목록으로</button>
            {activeTab === "promotion" && <div className="company-board-detail-image">{selectedPost.imageLabel}</div>}
            <span>{selectedPost.company}</span><h2>{selectedPost.title}</h2>
            <div className="company-board-detail-meta"><time>{activeTab === "promotion" ? selectedPost.date : `마감일 ${selectedPost.deadline}`}</time><span>조회 {selectedPost.views}</span></div>
            {activeTab === "recruitment" && <dl className="company-job-details"><div><dt>직무</dt><dd>{selectedPost.job}</dd></div><div><dt>경력</dt><dd>{selectedPost.career}</dd></div><div><dt>고용형태</dt><dd>{selectedPost.employment}</dd></div><div><dt>근무지역</dt><dd>{selectedPost.location}</dd></div></dl>}
            <p>{selectedPost.body}</p>
            <a href={activeTab === "promotion" ? selectedPost.website : selectedPost.applyUrl} target="_blank" rel="noreferrer">{activeTab === "promotion" ? "기업 홈페이지 방문" : "지원 페이지로 이동"}</a>
          </article>
        )}
      </section>
      {composerOpen && <div className="company-board-modal-backdrop" role="presentation" onClick={() => setComposerOpen(false)}><section className="company-board-compose" role="dialog" aria-modal="true" aria-labelledby="company-board-compose-title" onClick={(event) => event.stopPropagation()}><header><div><span>UI DEMO</span><h2 id="company-board-compose-title">{tabLabel} 글 작성</h2></div><button type="button" onClick={() => setComposerOpen(false)}>×</button></header><label>기업명<input placeholder="기업명을 입력하세요" /></label><label>제목<input placeholder="제목을 입력하세요" /></label>{activeTab === "recruitment" && <label>직무<input placeholder="예: 백엔드 개발" /></label>}<label>내용<textarea placeholder="내용을 입력하세요" /></label><p>현재는 UI 검토 단계로 작성 내용은 저장되지 않습니다.</p><button type="button" onClick={() => { window.alert("UI 검토용 작성 화면입니다. 실제 저장 기능은 추후 연결됩니다."); setComposerOpen(false); }}>등록하기</button></section></div>}
    </CommunitySharedLayout>
  );
}
