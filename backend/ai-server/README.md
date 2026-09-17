# D:TECT AI Server (FastAPI)

감성분석(KR-FinBERT) 전용 내부 서버입니다.
프론트 서빙, 라우팅, DB 통신, 외부 API(네이버 뉴스) 호출은 전부
`../server` (Node.js/Express) 로 이동했습니다.

## 담당 범위

- `POST /api/ai/sentiment` : 텍스트 목록을 받아 감성분석 결과(label, score) 반환
- `GET /api/ai/health` : Node 서버의 생존 확인용 헬스체크

## 실행

```bash
cd ai-server
pip install -r requirements.txt
cp .env.example .env
python run.py
# http://localhost:6000/docs 에서 Swagger UI 확인 가능
```

## 이전 버전과 달라진 점

| 항목 | 이전 (통합 FastAPI) | 지금 (AI 전용) |
|---|---|---|
| 뉴스 수집 (네이버 API) | `services/news_service.py` 내부에서 처리 | Node 서버로 이동 |
| 감성분석 | 뉴스 수집과 한 함수에서 같이 처리 | `/api/ai/sentiment` 로 독립된 엔드포인트 |
| DB 연결 | SQLAlchemy + PyMySQL | 없음 (DB 접근 안 함) |
| 회원 인증 | `api/auth.py` | Node 서버로 이동 |
| 의존성 | requests, SQLAlchemy, PyMySQL, bcrypt 포함 | AI 관련 패키지만 유지 |

## 다음 단계 (선택)

- 지금은 Node 서버만 호출한다고 가정하고 CORS로만 접근을 제한합니다.
  운영 환경에서는 `Authorization` 헤더에 공유 시크릿 토큰을 넣어
  Node 서버 외의 요청을 막는 것을 권장합니다.
- 모델 로딩이 느리다면 서버 기동 시 `get_sentiment_pipeline()` 을
  미리 한 번 호출해 warm-up 하는 것을 고려하세요.
