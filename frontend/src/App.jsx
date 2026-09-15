// 백엔드 연결 테스트를 위한 axios import 및 useEffect 추가
import React, { useEffect } from "react";
import axios from "axios";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import DashboardPreview from "./components/DashboardPreview";
import ProblemSection from "./components/ProblemSection";
import WorkflowSection from "./components/WorkflowSection";
import TestimonialSection from "./components/TestimonialSection";
import FinalCtaSection from "./components/FinalCtaSection";
import Footer from "./components/Footer";
import SentimentRiskDashboard from "./components/SentimentRiskDashboard";
import AuthPage from "./components/AuthPage";
import SearchPage from "./components/SearchPage";
import IssueTimelinePage from "./components/IssueTimelinePage";
import ResponseToolsPage from "./components/ResponseToolsPage";
import { WatchlistDashboard, RiskDashboard } from "./components/DashboardPages";
import { ROUTES } from "./config/routes";

function LandingPage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <DashboardPreview />
        <ProblemSection />
        <WorkflowSection />
        <TestimonialSection />
        <FinalCtaSection />
      </main>

      <Footer />
    </>
  );
}

function App() {
  // 백엔드 연결 테스트 코드 ---------------------
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/test")
      .then((response) => {
        console.log("백엔드 응답:", response.data.message);
      })
      .catch((error) => {
        console.error("백엔드 연결 실패:", error);
      });
  }, []);

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

  if (
    pathname === ROUTES.DASHBOARD ||
    pathname === ROUTES.DASHBOARD_WATCHLIST
  ) {
    return <WatchlistDashboard />;
  }

  if (pathname === ROUTES.DASHBOARD_ISSUE_RISK) {
    return <RiskDashboard />;
  }

  if (pathname === ROUTES.SENTIMENT_RISK) {
    return <SentimentRiskDashboard />;
  }

  if (pathname === ROUTES.SEARCH) {
    return <SearchPage />;
  }

  if (pathname === ROUTES.ISSUE_TIMELINE) {
    return <IssueTimelinePage mode="timeline" />;
  }

  if (pathname === ROUTES.RELATED_ARTICLES) {
    return <IssueTimelinePage mode="articles" />;
  }

  if (pathname === ROUTES.CASE_SIMULATOR) {
    return <ResponseToolsPage mode="simulator" />;
  }

  if (pathname === ROUTES.RESPONSE_GENERATOR) {
    return <ResponseToolsPage mode="generator" />;
  }

  if (pathname === ROUTES.LOGIN) {
    return <AuthPage mode="login" />;
  }

  if (pathname === ROUTES.SIGNUP) {
    return <AuthPage mode="signup" />;
  }

  return <LandingPage />;
}

export default App;
