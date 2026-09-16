# D:TECT Backend — Node.js(Express) → FastAPI 전환

`backend/server.js` 를 동일한 기능으로 FastAPI 로 옮긴 버전입니다.
엔드포인트 경로, 요청/응답 JSON 모양, 포트(5000)를 그대로 유지해서
**프론트엔드 코드는 수정하지 않아도 됩니다.**

## 구조

```
app/
  main.py         FastAPI 앱 생성, CORS, 라우터 등록 (server.js 의 껍데기 부분)
  api/auth.py     signup/login 로직 (server.js 의 두 app.post 부분)
  schemas/auth.py 요청/응답 형태 정의 (Express 에는 없던 개념 — 아래 설명 참고)
run.py            서버 실행 (server.js 의 app.listen 부분)
```

## 실행

```bash
pip install -r requirements.txt
cp .env.example .env
python run.py
# http://localhost:5000/docs 에서 Swagger UI로 바로 테스트 가능
```

## 무엇이 달라졌는가

| 항목 | Express (기존) | FastAPI (변경) |
|---|---|---|
| 요청 검증 | 함수 안에서 직접 `if (!email)` 같은 검사 | `schemas/auth.py` 의 Pydantic 모델이 진입 전에 자동 검증 |
| 이메일 형식 | 검증 없음 (문자열이면 통과) | `EmailStr` 타입으로 형식이 틀리면 자동 422 |
| 라우팅 | `app.post("/api/auth/login", ...)` 한 파일에 나열 | `APIRouter` 로 `api/auth.py` 에 분리, `main.py` 에서 `include_router` |
| 서버 실행 | `app.listen(PORT)` | `uvicorn.run(...)` (run.py) |
| 자동 재시작 | nodemon | `uvicorn(reload=True)` 이 내장 |
| API 문서 | 없음 | `/docs` 자동 생성 (Swagger UI) |

## 그대로 유지한 것 (의도적으로)

- **메모리 임시 저장 + 하드코딩 관리자 계정**: 원본 Node 코드도 DB 연동이 안 되어 있었기 때문에,
  구조만 옮기고 로직은 그대로 뒀습니다. `_fake_users_db` 는 서버 재시작 시 초기화됩니다.
- **CORS 허용 origin**: `http://localhost:5173` 그대로.
- **응답 JSON 모양**: `{success, message, user?}` 그대로 → `AuthPage.jsx` 수정 불필요.

## 확인해주셔야 할 것 (원본 저장소에 있던 불일치)

`frontend/src/config/api.js` 는 baseURL 을 `8080` 으로 잡아뒀는데,
`AuthPage.jsx` 는 실제로 `axios.post("http://localhost:5000/...")` 로 5000번에 직접 요청합니다.
즉 `api.js` 의 axios 인스턴스(`api`)는 현재 auth 요청에 쓰이고 있지 않습니다.
이번 변환에서는 원본 동작을 그대로 재현하기 위해 포트 5000을 유지했는데,
장기적으로는 `api.js` 의 8080 으로 통일하고 `AuthPage.jsx` 도 `api.post(...)` 로 바꾸는 걸 권합니다.

## 다음 단계 (DB 연동 시)

1. `infrastructure/mysql` 스키마 확정 후 SQLAlchemy 모델 추가
2. `_fake_users_db` 를 실제 DB 조회로 교체
3. 비밀번호를 평문 비교하지 말고 `passlib` 로 해싱 저장/검증
4. `Handoff.md` 의 "다음 작업 우선순위" 1번 항목 갱신
