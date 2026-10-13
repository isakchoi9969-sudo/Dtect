export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

// 실제 COMPANY_ALERT 데이터와 분리된 시연 전용 표시 데이터입니다.
// 시연 종료 후 VITE_DEMO_MODE를 끄면 이 데이터는 어떤 화면에도 표시되지 않습니다.
export const DEMO_RISK_SURGE_ALERTS = Object.freeze([
  {
    alertId: "demo-risk-001",
    companyId: 12,
    companyName: "SK텔레콤",
    riskScore: 68,
    riskLevel: "높음",
    previousRate: 52,
    currentRate: 68,
    changeRate: 16,
    detectedAt: "2026-10-13T09:30:00+09:00",
    emailSentAt: null,
    isDemo: true,
  },
  {
    alertId: "demo-risk-002",
    companyId: 27,
    companyName: "쿠팡",
    riskScore: 82,
    riskLevel: "심각",
    previousRate: 61,
    currentRate: 82,
    changeRate: 21,
    detectedAt: "2026-10-13T10:05:00+09:00",
    emailSentAt: null,
    isDemo: true,
  },
  {
    alertId: "demo-risk-003",
    companyId: 22,
    companyName: "삼성전자",
    riskScore: 54,
    riskLevel: "주의",
    previousRate: 39,
    currentRate: 54,
    changeRate: 15,
    detectedAt: "2026-10-13T10:40:00+09:00",
    emailSentAt: null,
    isDemo: true,
  },
]);
