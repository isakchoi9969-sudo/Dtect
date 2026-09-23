"""과거 유사사례 시뮬레이터용 요청·응답 계약.

이 단계에서는 BGE/Chroma 검색에 필요한 최소 데이터만 정의한다.
실제 DB의 ISSUE, CRISIS_CASE 매핑과 화면용 상세 데이터 조립은
Node 서버 단계에서 담당한다.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.simulator_service import find_similar_news


router = APIRouter(prefix="/api/ai/simulator", tags=["simulator"])


def simulator_data_unavailable(error: FileNotFoundError) -> HTTPException:
    """벡터 DB가 준비되지 않은 환경임을 Node 서버가 구분할 수 있게 한다."""
    return HTTPException(status_code=503, detail=str(error))


class SimilarNewsSearchRequest(BaseModel):
    """현재 발생 이슈를 유사 뉴스 검색용 텍스트로 전달한다."""

    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(default="", max_length=20_000)


class SimilarNewsItem(BaseModel):
    """Chroma에서 반환한 뉴스 한 건의 최소 정보."""

    news_id: int = Field(..., ge=1)
    similarity: float = Field(..., ge=0, le=1)


class SimilarNewsSearchResponse(BaseModel):
    """유사 뉴스 검색 결과. similarity는 cosine similarity다."""

    results: list[SimilarNewsItem]


class NewsEmbeddingsRequest(BaseModel):
    """군집 내부 유사도 계산에 필요한 뉴스 ID 목록."""

    news_ids: list[int] = Field(..., min_length=1, max_length=100)


class NewsEmbeddingItem(BaseModel):
    news_id: int = Field(..., ge=1)
    embedding: list[float]


class NewsEmbeddingsResponse(BaseModel):
    results: list[NewsEmbeddingItem]


class CurrentIssueEmbeddingResponse(BaseModel):
    """현재 이슈의 정규화된 BGE-M3 벡터."""

    embedding: list[float]


@router.post("/search", response_model=SimilarNewsSearchResponse)
def search_similar_news(
    payload: SimilarNewsSearchRequest,
) -> SimilarNewsSearchResponse:
    """현재 이슈 텍스트와 유사한 과거 뉴스 상위 100건을 반환한다."""
    try:
        matches = find_similar_news(payload.title, payload.content)
    except FileNotFoundError as error:
        raise simulator_data_unavailable(error) from error
    return SimilarNewsSearchResponse(
        results=[
            SimilarNewsItem(news_id=match.news_id, similarity=match.similarity)
            for match in matches
        ]
    )


@router.post("/embeddings", response_model=NewsEmbeddingsResponse)
def get_similar_news_embeddings(
    payload: NewsEmbeddingsRequest,
) -> NewsEmbeddingsResponse:
    """군집화에 필요한 기존 뉴스의 BGE-M3 벡터를 반환한다."""
    from app.services.simulator_service import get_news_embeddings

    try:
        embeddings_by_news_id = get_news_embeddings(payload.news_ids)
    except FileNotFoundError as error:
        raise simulator_data_unavailable(error) from error
    return NewsEmbeddingsResponse(
        results=[
            NewsEmbeddingItem(news_id=news_id, embedding=embedding)
            for news_id, embedding in embeddings_by_news_id.items()
        ]
    )


@router.post("/embed", response_model=CurrentIssueEmbeddingResponse)
def embed_current_issue(
    payload: SimilarNewsSearchRequest,
) -> CurrentIssueEmbeddingResponse:
    """현재 이슈를 과거 사례 centroid 비교용 BGE-M3 벡터로 변환한다."""
    from app.services.simulator_service import encode_query

    try:
        embedding = encode_query(payload.title, payload.content)
    except FileNotFoundError as error:
        raise simulator_data_unavailable(error) from error

    return CurrentIssueEmbeddingResponse(embedding=embedding)
