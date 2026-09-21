import { useEffect, useState } from "react";
import "./AnalysisLoader.css";

export default function AnalysisLoader({ companyName }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="analysis-loading-overlay">
      <div className="analysis-loading-card">
        <div className="analysis-loading-logo">D:TECT</div>

        <h2>AI가 기업을 분석하고 있습니다</h2>

        <p className="analysis-loading-company">{companyName}</p>

        <p className="analysis-loading-description">
          최신 뉴스와 기업 관련 정보를 분석하는 중입니다.
          <br />
          잠시만 기다려주세요.
        </p>

        <div className="analysis-loading-bar">
          <div className="analysis-loading-bar-fill" />
        </div>

        <p className="analysis-loading-status">기업 관련 뉴스 분석 중...</p>

        <p className="analysis-loading-time">{elapsed}초 경과</p>
      </div>
    </div>
  );
}
