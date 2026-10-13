import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../config/api";
import { ROUTES } from "../config/routes";
import { DEMO_RISK_SURGE_ALERTS, isDemoMode } from "../config/demo";

const POLLING_INTERVAL = 60 * 1000; // 1분마다 새 알림 확인
const AUTO_CLOSE_DELAY = 8000; // 8초 후 팝업 자동 닫힘
const DEMO_TOAST_VISIBLE_DELAY = 10000;
const DEMO_TOAST_INTERVAL = 3000;

function isRiskAlertPage() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  return pathname === ROUTES.RISK_ALERT;
}

export default function RiskSurgeToast({ enabled }) {
  const [toast, setToast] = useState(null);
  const [demoToasts, setDemoToasts] = useState([]);

  // 페이지를 처음 열었을 때 이미 존재하던 알림을 기억합니다.
  const knownAlertIdsRef = useRef(new Set());
  const initializedRef = useRef(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    // 실제 알림은 로그인한 사용자만 확인하고, 시연 알림은 알림 페이지에서만 표시합니다.
    if (!enabled && !isDemoMode) {
      initializedRef.current = false;
      knownAlertIdsRef.current = new Set();
      setToast(null);
      setDemoToasts([]);
      return undefined;
    }

    if (isDemoMode) {
      if (!isRiskAlertPage()) {
        setDemoToasts([]);
        return undefined;
      }

      let isActive = true;
      const timerIds = [];

      DEMO_RISK_SURGE_ALERTS.forEach((alert, index) => {
        timerIds.push(
          window.setTimeout(() => {
            if (!isActive) return;

            setDemoToasts((currentToasts) => [
              ...currentToasts.filter(
                (currentToast) => currentToast.alertId !== alert.alertId,
              ),
              alert,
            ]);

            timerIds.push(
              window.setTimeout(() => {
                if (!isActive) return;
                setDemoToasts((currentToasts) =>
                  currentToasts.filter(
                    (currentToast) => currentToast.alertId !== alert.alertId,
                  ),
                );
              }, DEMO_TOAST_VISIBLE_DELAY),
            );
          }, index * DEMO_TOAST_INTERVAL),
        );
      });

      return () => {
        isActive = false;
        timerIds.forEach((timerId) => window.clearTimeout(timerId));
        setDemoToasts([]);
      };
    }

    let isActive = true;

    const closeToast = () => {
      setToast(null);
      window.clearTimeout(closeTimerRef.current);
    };

    const showToast = (alert) => {
      window.clearTimeout(closeTimerRef.current);
      setToast(alert);

      // 카카오톡 PC 알림처럼 잠시 뒤 자동으로 닫습니다.
      closeTimerRef.current = window.setTimeout(closeToast, AUTO_CLOSE_DELAY);
    };

    const checkNewAlerts = async () => {
      try {
        const response = await api.get("/api/company/risk-surge", {
          params: { hours: 24 },
        });

        if (!isActive) return;

        const alerts = response.data.data || [];

        // 이미 표시 중인 팝업이 있다면 최신 메일 발송 상태를 반영합니다.
        setToast((currentToast) => {
          if (!currentToast) return null;

          return (
            alerts.find(
              (alert) => String(alert.alertId) === String(currentToast.alertId),
            ) || currentToast
          );
        });

        const currentIds = new Set(
          alerts.map((alert) => String(alert.alertId)),
        );

        // 첫 조회에서는 기존 알림을 기준값으로만 저장합니다.
        // 페이지를 열자마자 이전 알림이 팝업으로 뜨는 것을 막습니다.
        if (!initializedRef.current) {
          knownAlertIdsRef.current = currentIds;
          initializedRef.current = true;
          return;
        }

        // 이전 조회에는 없었던 가장 최신 알림을 찾습니다.
        const newAlert = alerts.find(
          (alert) => !knownAlertIdsRef.current.has(String(alert.alertId)),
        );

        knownAlertIdsRef.current = currentIds;

        if (newAlert) {
          showToast(newAlert);
        }
      } catch (error) {
        // 로그인 상태가 아니거나 네트워크 오류일 때 팝업을 띄우지 않습니다.
        if (error.response?.status !== 401) {
          console.error("새 위험도 알림 확인 실패:", error);
        }
      }
    };

    void checkNewAlerts();
    const intervalId = window.setInterval(checkNewAlerts, POLLING_INTERVAL);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.clearTimeout(closeTimerRef.current);
    };
  }, [enabled]);

  const toasts = isDemoMode ? demoToasts : toast ? [toast] : [];

  if (!toasts.length) return null;

  const handleOpenAlertPage = () => {
    window.location.assign(ROUTES.RISK_ALERT);
  };

  return createPortal(
    <div className="risk-surge-toast-stack" aria-live="polite">
      {toasts.map((currentToast) => (
        <aside
          className="risk-surge-toast"
          key={currentToast.alertId}
          role="status"
          aria-label="위험도 급상승 알림"
        >
          <button
            type="button"
            className="risk-surge-toast-close"
            onClick={() => {
              if (currentToast.isDemo) {
                setDemoToasts((currentToasts) =>
                  currentToasts.filter(
                    (item) => item.alertId !== currentToast.alertId,
                  ),
                );
                return;
              }

              setToast(null);
            }}
            aria-label={`${currentToast.companyName} 알림 닫기`}
          >
            ×
          </button>

          <div className="risk-surge-toast-icon" aria-hidden="true">
            !
          </div>

          <div className="risk-surge-toast-copy">
            <p>위험도 급상승 감지</p>
            <strong>{currentToast.companyName}</strong>
            <span>
              종합 리스크 {currentToast.riskLevel} ·{" "}
              {Number(currentToast.riskScore ?? 0).toFixed(0)}점
            </span>

            {/* 메일 발송에 성공한 경우에만 안내 문구를 표시합니다. */}
            {currentToast.emailSentAt && (
              <span className="risk-surge-toast-email">
                ✉ 회원가입 이메일로 알림을 발송했습니다.
              </span>
            )}

            {!currentToast.isDemo && (
              <button
                type="button"
                className="risk-surge-toast-link"
                onClick={handleOpenAlertPage}
              >
                알림 보기
              </button>
            )}
          </div>
        </aside>
      ))}
    </div>,
    document.body,
  );
}
