"""네이버 뉴스 수집 및 감성분석 API."""

from fastapi import APIRouter, HTTPException, Query

from app.services.news_service import (
    NewsServiceError,
    fetch_and_analyze_news,
)


router = APIRouter(
    prefix="/api/news",
    tags=["news"],
)


@router.get("")
def get_company_news(
    query: str = Query(
        ...,
        min_length=1,
        description="검색할 기업명",
    ),
    page: int = Query(
        1,
        ge=1,
        description="페이지 번호",
    ),
    per_page: int = Query(
        20,
        ge=1,
        le=100,
        description="페이지당 기사 수",
    ),
):
    """
    기업명을 검색해 최신 뉴스를 수집하고
    KR-FinBERT 감성분석 결과를 반환한다.
    """
    try:
        return fetch_and_analyze_news(
            query=query,
            page=page,
            per_page=per_page,
        )

    except NewsServiceError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except (
        ImportError,
        OSError,
        ValueError,
    ) as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "감성분석 모델을 실행하지 못했습니다: "
                f"{error}"
            ),
        ) from error