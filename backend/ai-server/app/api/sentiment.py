"""AI 서버 내부 API — 감성분석 전용.

Node.js 서버가 뉴스 텍스트 리스트를 보내면
KR-FinBERT 로 감성분석한 결과만 반환한다.
뉴스 수집(네이버 API 호출)이나 DB 조회는 이 서버에서 하지 않는다.
그 역할은 전부 Node.js 서버(../server)가 담당한다.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models.sentiment_model import analyze_sentiments

router = APIRouter(prefix="/api/ai", tags=["ai"])


class SentimentRequest(BaseModel):
    """POST /api/ai/sentiment 요청 본문."""

    texts: list[str] = Field(
        ...,
        min_length=1,
        description="감성분석할 텍스트 목록 (예: 뉴스 제목+요약)",
    )


class SentimentResult(BaseModel):
    label: str
    score: float


class SentimentResponse(BaseModel):
    results: list[SentimentResult]


@router.post("/sentiment", response_model=SentimentResponse)
def sentiment(payload: SentimentRequest):
    print("===== FastAPI 입력 텍스트 =====")
    print(payload.texts)
    print("==============================")
    """텍스트 리스트를 받아 순서를 유지한 채 감성분석 결과를 반환한다."""
    predictions = analyze_sentiments(payload.texts)
    print("===== FastAPI 결과 =====")
    print(predictions)
    print("=======================")
    return SentimentResponse(
        results=[SentimentResult(**p) for p in predictions]
    )
