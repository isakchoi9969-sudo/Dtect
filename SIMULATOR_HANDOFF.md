# 과거 유사사례 시뮬레이터 작업 인수인계

최종 갱신: 2026-09-21

## 오늘 완료한 내용

- `ResponseToolsPage`에서 근거 없는 효과 예측 수치와 대응 적용 버튼을 제거했다.
- 사례 목록·상세 UI를 최종 API 응답 필드에 맞췄다.
- 로딩, 결과 없음, 오류 상태 UI를 추가했다.
- 리스크 코드, 날짜, 종합 점수, 의미 유사도 표시 형식을 정리했다.
- 현재 이슈명과 분석 텍스트 입력 UI를 추가했다.
- 프런트 린트 경고 4건을 모두 제거했다.
- 관심기업 토글에서 객체 대신 `companyId`를 넘기도록 수정했다.

변경 파일:

- `frontend/src/components/ResponseToolsPage.jsx`
- `frontend/src/components/CaseSimulator.css`
- `frontend/src/components/CompanyAnalysisPage.jsx`
- `frontend/src/components/MajorIssueAlert.jsx`
- `frontend/src/components/RiskAlert.jsx`
- `frontend/src/hooks/useWatchlist.js`

검증 결과:

```powershell
npm run lint   # 통과
npm run build  # 통과
```

## 현재 시뮬레이터 상태

UI만 준비된 상태다. `similarCases`는 임시 배열이고, `caseLoadStatus`는 항상 `success`다.
현재 이슈 입력값은 아직 API 호출에 연결되지 않았다.

아래는 아직 구현되지 않았다.

- `POST /api/case-simulator/similar-cases`
- Node의 case simulator route/controller/service
- FastAPI BGE-M3 임베딩 및 ChromaDB 서비스
- Colab v1의 후보 기사 필터링·군집화·점수 계산
- `ISSUE`, `CRISIS_CASE` 등의 MySQL 메타데이터 결합

## 내일 권장 순서

1. 실제 DB 스키마를 읽기 전용으로 확인한다.
   - `NEWS`의 날짜 컬럼명
   - `NEWS_PREPROCESS`의 `CLEAN_TITLE`, `CLEAN_CONTENT`, `ANALYSIS_TEXT`
   - `ISSUE`, `ISSUE_NEWS`, `CRISIS_CASE`, `COMPANY`의 실제 컬럼명과 저장 데이터
   - `CASE_ID`, `ISSUE_ID`를 코드에 하드코딩하지 않는다.

2. ChromaDB 운영 준비 상태를 확인한다.
   - Colab/Google Drive Chroma Persistent 폴더의 서비스용 절대경로
   - ChromaDB 버전 호환성
   - collection `crisis_simulation_bge` 존재 여부
   - cosine distance 설정과 `NEWS_ID` 문자열 ID 일치 여부

3. Node API 계약을 추가한다.
   - 외부 endpoint: `POST /api/case-simulator/similar-cases`
   - request: `currentIssue.name`, `currentIssue.analysisText`, 선택적으로 `companyId`, `riskType`, `industry`
   - route → controller → service 구조를 기존 뉴스 기능과 동일하게 유지한다.

4. FastAPI AI 컴포넌트를 추가한다.
   - BGE-M3와 Chroma PersistentClient를 서버 프로세스에서 한 번만 생성한다.
   - 환경변수: Chroma 경로, collection명, BGE 모델명, 알고리즘 threshold
   - FastAPI는 BGE/Chroma만 담당하고, MySQL 조회는 Node가 담당한다.

5. Colab v1 알고리즘을 분리된 서비스 함수로 이식한다.
   - Top 100 검색
   - article similarity 0.55 필터
   - alias·정규식 기반 핵심 기업 재판별
   - SHA-256 중복 제거
   - 10일 간격 군집화, 최소 기사 3건
   - issue pairwise similarity 0.70
   - centroid, case similarity 0.60, 최종 점수 60점, Top 3
   - `RISK_TYPE`의 현재 20점은 임시값임을 응답에 명시한다.

6. Node에서 DB 사례 정보와 결합해 프런트 응답을 만든다.
   - `caseId`, `issueId`, 기업, 업종, 날짜, 기사 수, 대표기사, DESCRIPTION을 포함한다.
   - 프런트 `similarCases` 더미를 실제 응답으로 교체한다.

7. 저장된 KT/SKT 개인정보 유출 3개 사례로 회귀 테스트한다.

## 별도 보류 항목

- `risk-surge`, `major-issue` 알림 API는 프런트 호출만 있고 Node endpoint가 없다. 현재는 보류한다.
- 대시보드 목업 데이터와 React Router 전환은 시뮬레이터 구현 이후로 미룬다.
- 운영 인증 비밀값 강제, DB 포트 기본값 통일, 테스트 추가는 배포 전 정리한다.
