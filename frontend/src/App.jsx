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
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";

  if (pathname === ROUTES.SENTIMENT_RISK) {
    return <SentimentRiskDashboard />;
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

