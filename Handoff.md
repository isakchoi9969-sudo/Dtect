# D:TECT 인수인계

최종 갱신: 2026-09-02

## 현재 상태

- React/Vite 기반 랜딩 페이지와 감성·리스크 분석 대시보드가 구현되어 있습니다.
- 실제 뉴스 수집, API, AI 분석, 데이터베이스 연동은 아직 구현되지 않았습니다. 화면 수치와 이슈는 목업 데이터입니다.
- 이전 단일 프런트엔드 저장소를 멀티 서비스 구조로 정리했습니다.

## 프로젝트 구조와 책임

| 경로 | 상태 | 담당 영역 |
| --- | --- | --- |
| `frontend/` | 구현됨 | React UI, 정적 목업 데이터, Vite 설정 |
| `backend/` | 스캐폴드 | Node.js/Express API 서버 예정 |
| `ai-service/` | 스캐폴드 | FastAPI 기반 수집·NLP·리스크 분석 예정 |
| `infrastructure/` | 스캐폴드 | Docker, MySQL, Qdrant 구성 예정 |
| `docs/` | 스캐폴드 | API·아키텍처 문서 |

## 실행 및 검증

프로젝트 루트에서 실행합니다.

```bash
npm run dev
npm run build
npm run lint
```

루트 명령은 `frontend/`의 npm 스크립트로 전달됩니다. 의존성을 새로 설치해야 하면 `cd frontend && npm install`을 실행합니다.

2026-09-02 기준 `npm run build`, `npm run lint`가 통과했습니다.

## 핵심 파일

- `frontend/src/App.jsx`: URL 경로에 따라 랜딩 또는 분석 대시보드를 렌더링합니다.
- `frontend/src/config/routes.js`: 화면 경로 상수입니다.
- `frontend/src/components/SentimentRiskDashboard.jsx`: 기업 선택·기간 선택이 가능한 분석 대시보드입니다.
- `frontend/src/data/landingData.js`: 랜딩 페이지 목업 데이터입니다.
- `frontend/src/index.css`: 전역 및 화면 스타일입니다.
- `package.json`: 루트에서 프런트엔드 명령을 실행하는 프록시 스크립트입니다.

## 다음 작업 우선순위

1. `backend/`에 Express 서버, 환경 설정, 헬스 체크 API를 추가합니다.
2. `ai-service/`에 FastAPI 서버와 Pydantic 스키마를 추가합니다.
3. 뉴스 수집·전처리·감성/NER·이슈 군집화 파이프라인을 구현합니다.
4. MySQL/Qdrant 스키마와 Docker Compose를 `infrastructure/`에 구성합니다.
5. 프런트엔드 목업 데이터를 API 호출로 교체하고 오류·로딩 상태를 추가합니다.

## 주의 사항

- 백엔드·AI 서비스는 아직 빈 폴더입니다. 구현 전 존재하는 API나 데이터 모델을 가정하지 마세요.
- 프런트엔드 작업 파일은 반드시 `frontend/` 아래에 둡니다. Vite와 Oxlint도 해당 경로를 작업 디렉터리로 사용합니다.
- 빌드 산출물(`dist/`), 의존성(`node_modules/`), 환경 변수 파일은 Git 추적 대상이 아닙니다.
- 변경 후 관련 서비스의 빌드·린트를 실행하고, 이 문서의 상태와 검증 결과를 갱신합니다.
