"""네이버 뉴스 수집 및 감성분석 서비스."""

import html
import os
import re

import requests

from app.models.sentiment_model import analyze_sentiments


NAVER_NEWS_URL = (
    "https://naverapihub.apigw.ntruss.com/search/v1/news"
)

HTML_TAG_PATTERN = re.compile(r"<[^>]+>")


class NewsServiceError(Exception):
    """뉴스 수집 또는 분석 과정에서 발생하는 오류."""


def clean_naver_text(value: str) -> str:
    """
    네이버 검색 결과의 HTML 태그와 특수문자를 정리한다.

    예:
    <b>카카오</b> &quot;실적&quot;
    → 카카오 "실적"
    """
    decoded_text = html.unescape(value or "")

    cleaned_text = HTML_TAG_PATTERN.sub(
        "",
        decoded_text,
    )

    return cleaned_text.strip()


def calculate_percentages(
    sentiment_counts: dict,
) -> dict:
    """
    긍정·중립·부정 기사 개수를 백분율로 변환한다.

    최종 합계가 정확히 100이 되도록 부정 비율에서
    반올림 오차를 조정한다.
    """
    total = sum(sentiment_counts.values())

    if total == 0:
        return {
            "positive": 0,
            "neutral": 0,
            "negative": 0,
        }

    positive = round(
        sentiment_counts["positive"] / total * 100
    )

    neutral = round(
        sentiment_counts["neutral"] / total * 100
    )

    negative = 100 - positive - neutral

    return {
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
    }


def fetch_and_analyze_news(
    query: str,
    page: int = 1,
    per_page: int = 20,
) -> dict:
    """
    기업 관련 뉴스를 수집하고 감성분석 결과를 반환한다.
    """
    query = query.strip()

    if not query:
        raise NewsServiceError(
            "검색할 기업명을 입력해 주세요."
        )

    client_id = os.getenv(
        "NAVER_CLIENT_ID",
        "",
    ).strip()

    client_secret = os.getenv(
        "NAVER_CLIENT_SECRET",
        "",
    ).strip()

    if not client_id or not client_secret:
        raise NewsServiceError(
            "NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET이 "
            "설정되지 않았습니다."
        )

    start_index = (
        (page - 1) * per_page
    ) + 1

    if start_index > 1000:
        raise NewsServiceError(
            "네이버 뉴스 검색은 1000번째 결과까지만 "
            "조회할 수 있습니다."
        )

    headers = {
        "X-NCP-APIGW-API-KEY-ID": client_id,
        "X-NCP-APIGW-API-KEY": client_secret,
    }

    params = {
        "query": query,
        "display": per_page,
        "start": start_index,
        "sort": "date",
        "format": "json",
    }

    try:
        response = requests.get(
            NAVER_NEWS_URL,
            headers=headers,
            params=params,
            timeout=10,
        )

    except requests.RequestException as error:
        raise NewsServiceError(
            "네이버 뉴스 API에 연결하지 못했습니다."
        ) from error

    if response.status_code != 200:
        raise NewsServiceError(
            "네이버 뉴스 API 호출 실패 "
            f"({response.status_code}): "
            f"{response.text[:300]}"
        )

    try:
        response_data = response.json()

    except ValueError as error:
        raise NewsServiceError(
            "네이버 뉴스 API 응답을 읽지 못했습니다."
        ) from error

    news_items = response_data.get(
        "items",
        [],
    )

    prepared_articles = []
    analysis_texts = []

    for item in news_items:
        title = clean_naver_text(
            item.get("title", "")
        )

        description = clean_naver_text(
            item.get("description", "")
        )

        if not title and not description:
            continue

        prepared_articles.append(
            {
                "title": title,
                "description": description,
                "link": item.get("link", ""),
                "original_link": item.get(
                    "originallink",
                    "",
                ),
                "pub_date": item.get(
                    "pubDate",
                    "",
                ),
            }
        )

        # 제목만 분석하지 않고 제목과 요약문을 함께 분석한다.
        analysis_texts.append(
            f"{title}. {description}"
        )

    predictions = analyze_sentiments(
        analysis_texts
    )

    sentiment_counts = {
        "positive": 0,
        "neutral": 0,
        "negative": 0,
    }

    analyzed_news = []

    for article, prediction in zip(
        prepared_articles,
        predictions,
    ):
        sentiment = prediction["label"]
        score = prediction["score"]

        sentiment_counts[sentiment] += 1

        analyzed_news.append(
            {
                **article,
                "sentiment": sentiment,
                "score": round(score, 4),
            }
        )

    sentiment_percentages = (
        calculate_percentages(
            sentiment_counts
        )
    )

    return {
        "query": query,
        "page": page,
        "per_page": per_page,
        "total_results": response_data.get(
            "total",
            0,
        ),
        "analyzed_count": len(
            analyzed_news
        ),
        "sentiment_summary": sentiment_counts,
        "sentiment_percentages": (
            sentiment_percentages
        ),
        "news_list": analyzed_news,
    }