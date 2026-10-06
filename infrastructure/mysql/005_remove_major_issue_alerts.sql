-- 폐기된 주요 이슈 발생 알림 데이터만 제거합니다.
-- 위험도 급상승 알림(risk_surge)과 분석 이력은 유지됩니다.
DELETE FROM COMPANY_ALERT
WHERE ALERT_TYPE = 'major_issue';
