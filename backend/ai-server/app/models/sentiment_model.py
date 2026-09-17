"""KR-FinBERT 감성분석 모델 로딩 및 실행."""

import logging
import os
from threading import Lock

logger = logging.getLogger(__name__)

_sentiment_pipeline = None
_model_lock = Lock()


def get_sentiment_pipeline():
    """
    KR-FinBERT 모델을 최초 한 번만 불러온다.

    첫 분석 요청:
    Hugging Face에서 모델 다운로드 후 메모리에 저장

    이후 분석 요청:
    이미 로딩된 모델 재사용
    """
    global _sentiment_pipeline

    if _sentiment_pipeline is not None:
        return _sentiment_pipeline

    with _model_lock:
        if _sentiment_pipeline is None:
            # 서버 실행 자체는 가능하게 하고,
            # 실제 분석 시점에 transformers를 불러온다.
            from transformers import pipeline

            model_name = os.getenv(
                "SENTIMENT_MODEL_NAME",
                "snunlp/KR-FinBERT-SC",
            )

            logger.info("감성분석 모델 로딩 시작: %s", model_name)

            _sentiment_pipeline = pipeline(
                "text-classification",
                model=model_name,
            )

            logger.info("감성분석 모델 로딩 완료")

    return _sentiment_pipeline


def normalize_label(label: str) -> str:
    """모델 결과를 positive, neutral, negative로 통일한다."""

    label_map = {
        "positive": "positive",
        "neutral": "neutral",
        "negative": "negative",
        "긍정": "positive",
        "중립": "neutral",
        "부정": "negative",
    }

    normalized = label.strip().lower()

    if normalized not in label_map:
        raise ValueError(
            f"지원하지 않는 감성 라벨입니다: {label}"
        )

    return label_map[normalized]


def analyze_sentiments(texts: list[str]) -> list[dict]:
    """
    여러 기사를 한꺼번에 감성분석한다.

    한 건씩 반복 호출하는 것보다 배치 분석이 빠르다.
    """
    if not texts:
        return []

    model = get_sentiment_pipeline()

    batch_size = int(
        os.getenv("SENTIMENT_BATCH_SIZE", "8")
    )

    results = model(
        texts,
        truncation=True,
        max_length=512,
        batch_size=batch_size,
    )

    return [
        {
            "label": normalize_label(result["label"]),
            "score": float(result["score"]),
        }
        for result in results
    ]
