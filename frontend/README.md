# D:TECT Frontend

기업 관련 뉴스와 온라인 데이터를 하나의 이슈로 정리하고, 감성·리스크 분석 결과를 바탕으로 대응 인사이트를 제공하는 **AI 기업 인텔리전스 플랫폼**의 프런트엔드 프로토타입입니다. 전체 프로젝트 구조는 [루트 README](../README.md)를 참고하세요.

현재 저장소는 서비스 소개 랜딩 페이지와 감성·리스크 분석 대시보드 화면을 구현합니다. 분석 수치와 이슈는 UI 시연을 위한 정적 목업 데이터이며, 실제 데이터 수집·AI 분석 서버는 아직 연동되어 있지 않습니다.

## 주요 화면

- **랜딩 페이지** (`/`): 서비스 가치, 문제 해결 방식, 워크플로, 고객 후기, CTA를 소개합니다.
- **감성·리스크 분석 대시보드** (`/company-analysis/sentiment-risk`): 관심 기업을 선택하고, 기간별 리스크 점수·감성 분포·핵심 키워드·주요 이슈를 확인합니다.
- **테마 전환**: 라이트/다크 테마를 지원합니다.

## 기술 스택

### 현재 구현

| 구분 | 기술 |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Styling | CSS |
| Lint | Oxlint |

### 멘토링 기반 확장 아키텍처

`기술멘토링 내용.txt`의 제안을 바탕으로, 실제 서비스에서는 다음 구성을 적용할 수 있습니다. 아래 항목은 현재 이 저장소에 구현된 의존성이 아니라 확장 계획입니다.

| 영역 | 제안 기술 | 역할 |
| --- | --- | --- |
| 웹 서버 | Node.js, Express | API 제공 및 서비스 서버 |
| AI 서버 | Python, FastAPI, Pydantic, Uvicorn | 분석 요청·응답 검증 및 AI 처리 |
| 데이터 수집 | Axios, Cheerio 또는 rss-parser | 뉴스 수집 및 검색 |
| 데이터 처리 | Pandas, NumPy, `re`, kiwipiepy, KoNLPy | 전처리와 한국어 텍스트 분석 |
| NLP | PyTorch, Hugging Face Transformers, KLUE-RoBERTa 또는 KoELECTRA | 감성 분석, 리스크 유형 분류, NER |
| 이슈 군집화 | Sentence-Transformers, HDBSCAN | 유사 기사 임베딩 및 이슈 단위 군집화 |
| RAG/LLM | OpenAI API, Qdrant | 과거 사례 검색 및 대응 자료 생성 |
| 저장소 | MySQL, Qdrant | 서비스 데이터 및 벡터 데이터 관리 |
| 배치/인프라 | node-cron, Docker, Docker Compose, AWS 또는 Naver Cloud | 주기적 분석 실행과 배포 |

## 프로젝트 구조

```text
frontend/
├── public/                    # 파비콘 및 SVG 에셋
├── src/
│   ├── components/            # 랜딩/대시보드 UI 컴포넌트
│   │   ├── SentimentRiskDashboard.jsx
│   │   └── ...
│   ├── config/routes.js       # 화면 경로 상수
│   ├── data/landingData.js    # 랜딩 페이지 목업 데이터
│   ├── App.jsx                # 경로에 따른 화면 렌더링
│   ├── index.css              # 전역 스타일
│   └── main.jsx               # React 진입점
├── index.html
├── package.json
└── vite.config.js
```

## 시작하기

### 요구 사항

- Node.js 20.19 이상 또는 22.12 이상
- npm

### 설치 및 실행

```bash
npm install
npm run dev
```

실행 후 터미널에 출력되는 로컬 주소(기본값: `http://localhost:5173`)를 브라우저에서 엽니다.

## 사용 가능한 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 번들 생성 (`dist/`) |
| `npm run preview` | 생성된 번들을 로컬에서 미리 보기 |
| `npm run lint` | Oxlint로 코드 검사 |

## 향후 연동 흐름

```text
뉴스/온라인 데이터 수집
        ↓
텍스트 전처리 · 임베딩 · 감성/NER 분석
        ↓
유사 기사 군집화 → 이슈 및 리스크 점수 산출
        ↓
MySQL/Qdrant 저장 → FastAPI/Express API
        ↓
React 대시보드 · RAG 기반 대응 자료
```

## 참고

- 화면의 기업명, 리스크 점수, 이슈 건수 및 분석 결과는 데모용 정적 데이터입니다.
- 별도 SPA 라우터 라이브러리 없이 `window.location.pathname`과 `src/config/routes.js`를 이용해 화면을 분기합니다. 백엔드 연동 단계에서 React Router와 API 클라이언트 도입을 검토할 수 있습니다.
