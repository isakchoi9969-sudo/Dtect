"""FastAPI 엔트리포인트.

[server.js 전체와의 대응관계]

  Express (server.js)                         FastAPI (여기)
  ───────────────────────────────────────     ──────────────────────────────
  const app = express();                      app = FastAPI()
  app.use(cors({ origin: ... }))              app.add_middleware(CORSMiddleware, ...)
  app.use(express.json())                     (필요 없음 — Pydantic이 body 파싱 겸 검증)
  app.get("/api/test", ...)                   @app.get("/api/test")
  app.post("/api/auth/signup", ...)           app/api/auth.py 의 router 로 분리
  app.post("/api/auth/login", ...)            app/api/auth.py 의 router 로 분리
  app.listen(PORT, () => ...)                 uvicorn 이 대신 실행 (run.py 참고)

라우트를 왜 파일 하나(server.js)에 다 안 넣고 app/api/auth.py 로 분리했는가:
  - 지금은 auth 뿐이지만 뒤에 news/user 라우트가 늘어나면 main.py 가 비대해진다.
  - FastAPI 의 APIRouter 는 Express 의 express.Router() 와 동일한 개념이다.
    (app.use('/api/auth', authRouter) 를 FastAPI 식으로 쓴 것이 include_router)
"""
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.company import router as company_router
# from app.api.stock import router as stock_router

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app = FastAPI(title="D:TECT Backend API", version="1.0.0")

# Express: cors({ origin: "http://localhost:5173", credentials: true })
# FastAPI: 동일한 의미의 미들웨어. allow_credentials=True 면 origin 에 "*" 사용 불가
#          (쿠키/인증 헤더를 주고받으려면 origin을 정확히 명시해야 브라우저가 허용한다)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Express: app.use("/api/auth", authRouter) 와 동일.
# auth.py 의 router 에 이미 prefix="/api/auth" 가 붙어 있으므로
# 여기서는 등록만 하면 /api/auth/signup, /api/auth/login 이 그대로 열린다.
app.include_router(auth_router)

app.include_router(
    company_router,
    prefix="/api/company"
)

# app.include_router(
#     stock_router,
#     prefix="/api/stocks"
# )

@app.get("/api/test")
def test_connection():
    """프론트-백엔드 연결 확인용. Express 의 app.get('/api/test') 그대로."""
    return {"message": "프론트엔드와 백엔드 연결 성공!"}
