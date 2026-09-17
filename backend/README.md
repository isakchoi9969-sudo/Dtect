# D:TECT — 서버 분리 구조 (Node.js + FastAPI)

기존에 FastAPI 하나로 통합되어 있던 백엔드를 역할별로 2개 서버로 분리했습니다.

```
                 브라우저(프론트엔드)
                        │
                        ▼
        ┌───────────────────────────────┐
        │   server/  (Node.js/Express)   │   포트 3000
        │   - 프론트 서빙 / 웹 라우팅      │
        │   - 회원 인증                   │
        │   - MySQL 통신                  │
        │   - 네이버 뉴스 API 호출         │
        └───────────────┬────────────────┘
                        │ 내부 HTTP (감성분석 텍스트 전송)
                        ▼
        ┌───────────────────────────────┐
        │  ai-server/  (FastAPI)         │   포트 6000
        │  - KR-FinBERT 감성분석 전용     │
        └───────────────────────────────┘
                        │
                        ▼
                    MySQL DB
              (Node 서버만 직접 접근)
```

## 폴더 구조

```
dtect-project/
├── server/         Node.js/Express — 프론트, 웹 라우팅, DB, 외부 API 통신
└── ai-server/       FastAPI — 감성분석 AI 전용
```

각 폴더의 상세 실행 방법과 담당 범위는 `server/README.md`, `ai-server/README.md` 를 참고하세요.

## 실행 순서

```bash
# 1) AI 서버 먼저 실행 (Node 서버가 이 서버를 호출하므로)
cd ai-server
pip install -r requirements.txt
cp .env.example .env
python run.py            # http://localhost:6000

# 2) 새 터미널에서 Node 서버 실행
cd server
npm install
cp .env.example .env     # AI_SERVER_URL, DB 정보, 네이버 API 키 입력
npm run dev               # http://localhost:3000
```

프론트엔드는 기존처럼 `http://localhost:3000` 으로 요청하면 됩니다
(엔드포인트 경로와 응답 JSON 모양은 기존과 동일하게 유지했습니다).

## 정리한 불필요 파일/폴더

기존 통합 FastAPI 프로젝트(`backend/backend`)에서 아래는 이번 재구성본에 포함하지 않았습니다.

| 대상                                                 | 사유                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `app/__pycache__/`, `app/**/__pycache__/`            | 파이썬 빌드 캐시. 버전관리 불필요 (`.gitignore` 처리)                |
| `app/api/stock.py`                                   | 전체가 주석 처리된 셀레니움 크롤링 코드, `main.py`에서도 비활성 상태 |
| `tests/stock_test.py`                                | 위와 동일한 내용의 중복 스크립트, 전체 주석 처리                     |
| `app/api/company.py` 내 미사용 `news_service` import | 실제로 호출되지 않던 죽은 import                                     |

필요 시 셀레니움 주가 크롤링 기능은 별도 스크립트나 배치 작업으로 재작성하는 것을 권장합니다
(브라우저 자동화는 API 서버 요청-응답 흐름과 맞지 않는 경우가 많습니다).

## 이번 분리에서 고려한 것

- **왜 뉴스 수집(네이버 API 호출)을 Node로 옮겼나**: 외부 웹 API와의 통신이라 "웹 통신"에 해당하고,
  AI 서버는 순수하게 "텍스트 → 감성분석 결과"만 담당하도록 역할을 명확히 분리했습니다.
- **두 서버 간 통신**: 내부 HTTP(REST) 호출 방식. AI 서버는 브라우저에서 직접 호출되지 않고
  Node 서버의 origin만 CORS로 허용합니다. 운영 환경에서는 두 서버를 같은 내부망(VPC)에 두고,
  필요하면 공유 시크릿 토큰으로 인증을 추가하는 것을 권장합니다.
- **응답 형식 유지**: 프론트엔드 코드 수정을 최소화하기 위해 기존 엔드포인트 경로와
  JSON 응답 구조를 그대로 유지했습니다.
