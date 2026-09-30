import Header from "./Header";
import Footer from "./Footer";
/** 신규 커뮤니티 화면이 공통으로 사용하는 헤더·콘텐츠 레이아웃입니다. */
export default function CommunitySharedLayout({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="community-shared-page">
      <Header />
      <main className="community-shared-main">
        <header className="community-shared-heading">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </main>
      <Footer />
    </div>
  );
}
