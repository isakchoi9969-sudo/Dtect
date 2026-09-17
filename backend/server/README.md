# D:TECT Server (Node.js + Express)

프론트엔드 서빙, 웹 라우팅, DB 통신을 담당하는 서버입니다.
AI(감성분석)는 이 서버가 직접 처리하지 않고, `../ai-server` (FastAPI) 에
내부 HTTP 요청으로 위임합니다.

## 담당 범위

| 라우트 | 설명 |
|---|---|
| `POST /api/auth/signup` | 회원가입 (임시 메모리 저장, 기존 동작 유지) |
| `POST /api/auth/login` | 로그인 (MySQL `USER` 테이블 조회 + bcrypt 검증) |
| `GET /api/news` | 네이버 뉴스 수집 → AI 서버에 감성분석 위임 → 결과 조합 |
| `GET /api/company/search` | 임시 하드코딩 기업 데이터 검색 |
| `GET /api/test`, `/api/health/db`, `/api/health/ai`, `/api/test/company-count` | 헬스체크 |

## 실행

```bash
cd server
npm install
cp .env.example .env
npm run dev   # nodemon (개발용, 자동 재시작)
# 또는
npm start     # 운영용
```

## AI 서버와의 연결

`GET /api/news` 처리 흐름:

1. 이 서버가 네이버 뉴스 API를 호출해 기사를 수집 (`src/services/naverNews.service.js`)
2. 수집한 텍스트를 AI 서버(`AI_SERVER_URL`)의 `/api/ai/sentiment` 로 전송 (`src/services/aiClient.service.js`)
3. 감성분석 결과를 기사와 합쳐 프론트에 응답

AI 서버가 꺼져 있으면 `/api/news` 요청은 500 에러를 반환합니다.
`GET /api/health/ai` 로 AI 서버 생존 여부를 먼저 확인할 수 있습니다.

## 이전 버전과 달라진 점 (통합 FastAPI → 이 서버)

- 회원 인증, DB 조회, 기업 검색, 뉴스 수집 로직을 FastAPI에서 이곳으로 이전
- 비밀번호 해싱/검증: `bcrypt` (Python) → `bcryptjs` (Node)
- DB 접속: `SQLAlchemy + PyMySQL` → `mysql2/promise`
- 정리(삭제)한 것: 전체가 주석 처리되어 있던 셀레니움 주가 크롤링 코드
  (`api/stock.py`, `tests/stock_test.py`) — 실사용되지 않는 죽은 코드였습니다.
  필요해지면 별도 스크립트로 다시 작성하는 것을 권장합니다.
- `company.py` 에서 실제로 쓰이지 않던 `news_service` import도 함께 정리했습니다.

## 다음 단계

1. `_fake_users_db`(회원가입 임시 저장)를 실제 DB INSERT로 교체
2. 비밀번호 저장 시 `bcryptjs.hash()` 적용
3. 프론트엔드 빌드 결과물을 이 서버에서 정적 서빙하려면 `src/index.js` 하단 주석 참고
