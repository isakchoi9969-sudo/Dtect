# D:TECT

기업 뉴스와 온라인 데이터를 이슈 단위로 분석하고, 감성·리스크 인사이트를 제공하는 AI 기업 인텔리전스 플랫폼입니다.

## 디렉터리 구성

```text
dtect/
├── frontend/                 # React + Vite 웹 애플리케이션 (기존 구현물)
├── backend/                  # Node.js + Express API 서버
│   ├── src/
│   │   ├── config/           # 환경 설정
│   │   ├── controllers/      # HTTP 요청 처리
│   │   ├── middlewares/      # 인증·예외 처리 등 공통 미들웨어
│   │   ├── routes/           # API 라우트
│   │   └── services/         # 비즈니스 로직
│   └── tests/
├── ai-service/               # Python + FastAPI AI 분석 서버
│   ├── app/
│   │   ├── api/              # FastAPI 엔드포인트
│   │   ├── core/             # 환경 설정 및 공통 모듈
│   │   ├── models/           # 모델 로딩·추론
│   │   ├── pipelines/        # 수집·전처리·분석 파이프라인
│   │   ├── schemas/          # Pydantic 요청·응답 스키마
│   │   └── services/         # 분석 서비스
│   └── tests/
├── infrastructure/           # Docker 및 데이터 저장소 구성
│   ├── docker/
│   ├── mysql/
│   └── qdrant/
└── docs/                     # 아키텍처·API 문서
    ├── api/
    └── architecture/
```

## 실행

현재 구현된 프런트엔드는 프로젝트 루트에서 아래 명령으로 실행합니다.

```bash
npm run dev
```

의존성 설치가 필요한 경우에만 `cd frontend && npm install`을 실행하세요. 루트의 `build`, `lint`, `preview` 명령도 자동으로 `frontend/`에서 실행됩니다. 세부 사용 방법은 [frontend/README.md](frontend/README.md)를 참고하세요.

## 구현 현황

- `frontend/`: 랜딩 페이지 및 감성·리스크 분석 대시보드 구현 완료
- `backend/`, `ai-service/`, `infrastructure/`: 멘토링 기반 구현을 위한 초기 폴더 구조 생성 완료
Git collaboration test
