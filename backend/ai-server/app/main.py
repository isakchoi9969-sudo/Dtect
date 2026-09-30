"""FastAPI 엔트리포인트 — AI 전용 서버.

[역할 분리 이후 구조]

  Node.js 서버 (server/, 포트 3000)         FastAPI 서버 (ai-server/, 포트 6000)
  ───────────────────────────────────────    ──────────────────────────────
  프론트엔드 정적 파일 서빙                    (없음)
  라우팅 (auth, company, news 등)             /api/ai/sentiment 하나만 노출
  MySQL 연결 및 쿼리                          (없음 - DB에 접근하지 않는다)
  네이버 뉴스 API 호출 (외부 웹통신)           (없음 - 뉴스 수집은 Node가 담당)
  뉴스 텍스트를 모아 AI 서버에 HTTP 요청  ───▶  KR-FinBERT 로 감성분석 후 결과만 반환

즉 이 서버는 순수하게 "텍스트를 넣으면 감성분석 결과를 돌려주는" 내부 AI 서비스다.
외부(브라우저)에서 직접 호출되지 않고, Node.js 서버를 통해서만 호출되는 것을 전제로
CORS 는 Node 서버 origin 만 허용한다.
"""

import logging
import os
from contextlib import asynccontextmanager
from threading import Thread

from dotenv import dotenv_values, load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.sentiment import router as sentiment_router
from app.api.simulator import router as simulator_router

# 대응자료 생성 API 라우터
from app.api.response_draft import router as response_draft_router
from app.api.risk_assessment import router as risk_assessment_router
from app.api.case_summary import router as case_summary_router

AI_ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
SHARED_ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(AI_ENV_PATH)
shared_ai_config = dotenv_values(SHARED_ENV_PATH)
for setting_name in ("OPENAI_API_KEY", "OPENAI_MODEL", "RISK_ASSESSMENT_MODEL"):
    if not os.getenv(setting_name) and shared_ai_config.get(setting_name):
        os.environ[setting_name] = str(shared_ai_config[setting_name])
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

# 브라우저가 아니라 Node 서버(내부망)만 호출하는 서버이므로
# origin 은 Node 서버 주소만 허용한다.
NODE_SERVER_ORIGIN = os.getenv("NODE_SERVER_ORIGIN", "http://localhost:3000")

@asynccontextmanager
async def lifespan(app):
    def warmup():
        try:
            from app.models.sentiment_model import get_sentiment_pipeline
            get_sentiment_pipeline()
        except Exception:
            logging.getLogger(__name__).exception("감성분석 모델 사전 로딩 실패; 요청 시 다시 시도합니다.")

    if os.getenv("SENTIMENT_WARMUP", "true").lower() == "true":
        Thread(target=warmup, name="sentiment-warmup", daemon=True).start()
    yield


app = FastAPI(title="D:TECT AI Server", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[NODE_SERVER_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sentiment_router)
app.include_router(simulator_router)
app.include_router(response_draft_router)  # 대응자료 생성 API 등록
app.include_router(risk_assessment_router)
app.include_router(case_summary_router)


@app.get("/api/ai/health")
def health_check():
    """Node 서버가 AI 서버 생존 확인용으로 호출하는 헬스체크."""
    return {"success": True, "message": "AI 서버 정상 동작 중"}
