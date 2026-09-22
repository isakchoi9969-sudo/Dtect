"""BGE-M3 임베딩을 이용한 과거 유사사례 검색 서비스."""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from app.core.simulator_config import get_simulator_settings


SIMILAR_NEWS_LIMIT = 100


@dataclass(frozen=True)
class SimilarNewsMatch:
    """Chroma 검색에서 찾은 뉴스와 cosine similarity."""

    news_id: int
    similarity: float


def build_query_text(title: str, content: str) -> str:
    """현재 이슈의 제목과 본문을 BGE 검색용 단일 문장으로 결합한다."""
    return f"{title.strip()}\n{content.strip()}"


@lru_cache(maxsize=1)
def get_embedding_model():
    """BGE-M3를 최초 검색 시 한 번만 로드하고 이후 재사용한다."""
    from sentence_transformers import SentenceTransformer

    settings = get_simulator_settings()
    return SentenceTransformer(settings.model_name)


@lru_cache(maxsize=1)
def get_news_collection():
    """로컬 Chroma 컬렉션을 최초 검색 시 한 번만 연다."""
    import chromadb

    settings = get_simulator_settings()
    if not settings.chroma_path.is_dir():
        raise FileNotFoundError(
            f"시뮬레이터 Chroma 경로를 찾을 수 없습니다: {settings.chroma_path}"
        )

    client = chromadb.PersistentClient(path=str(Path(settings.chroma_path)))
    return client.get_collection(name=settings.collection_name)


def encode_query(title: str, content: str) -> list[float]:
    """현재 이슈를 정규화된 BGE-M3 1024차원 벡터로 변환한다."""
    model = get_embedding_model()
    vector = model.encode(
        build_query_text(title, content),
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return vector.tolist()


def find_similar_news(title: str, content: str) -> list[SimilarNewsMatch]:
    """현재 이슈와 유사한 과거 뉴스 상위 100건을 조회한다."""
    query_result = get_news_collection().query(
        query_embeddings=[encode_query(title, content)],
        n_results=SIMILAR_NEWS_LIMIT,
        include=["distances"],
    )

    news_ids = query_result["ids"][0]
    distances = query_result["distances"][0]
    return [
        SimilarNewsMatch(
            news_id=int(news_id),
            similarity=max(0.0, min(1.0, 1.0 - float(distance))),
        )
        for news_id, distance in zip(news_ids, distances, strict=True)
    ]


def get_news_embeddings(news_ids: list[int]) -> dict[int, list[float]]:
    """Chroma에 저장된 뉴스 ID별 BGE-M3 임베딩을 읽어 반환한다."""
    query_result = get_news_collection().get(
        ids=[str(news_id) for news_id in news_ids],
        include=["embeddings"],
    )

    return {
        int(news_id): embedding.tolist()
        if hasattr(embedding, "tolist")
        else list(embedding)
        for news_id, embedding in zip(
            query_result["ids"], query_result["embeddings"], strict=True
        )
    }
