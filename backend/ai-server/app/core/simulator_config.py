"""과거 유사사례 시뮬레이터의 로컬 모델·벡터 DB 설정."""

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


AI_SERVER_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class SimulatorSettings:
    chroma_path: Path
    collection_name: str
    model_name: str


@lru_cache
def get_simulator_settings() -> SimulatorSettings:
    """환경변수 또는 프로젝트 기본값으로 시뮬레이터 설정을 반환한다."""
    configured_path = os.getenv("SIMULATOR_CHROMA_PATH", "data/news_vector_db")
    chroma_path = Path(configured_path)
    if not chroma_path.is_absolute():
        chroma_path = AI_SERVER_ROOT / chroma_path

    return SimulatorSettings(
        chroma_path=chroma_path,
        collection_name=os.getenv(
            "SIMULATOR_CHROMA_COLLECTION", "crisis_simulation_bge"
        ),
        model_name=os.getenv("SIMULATOR_MODEL_NAME", "BAAI/bge-m3"),
    )
