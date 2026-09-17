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
import AuthPage from "./components/AuthPage";
import CompanySearchPage from "./components/CompanySearchPage";
import WatchlistPage from "./components/WatchlistPage";
import ResponseToolsPage from "./components/ResponseToolsPage";
import CompanyAnalysisPage from "./components/CompanyAnalysisPage";
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
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/test")
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

  if (pathname === ROUTES.COMPANY_SEARCH) {
    return <CompanySearchPage />;
  }

  if (pathname === ROUTES.COMPANY_WATCHLIST) {
    return <WatchlistPage />;
  }

  if (pathname === ROUTES.COMPANY_DETAIL) {
    return <CompanyAnalysisPage />;
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
