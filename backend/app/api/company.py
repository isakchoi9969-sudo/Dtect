from fastapi import APIRouter

router = APIRouter()


TEMP_COMPANIES = {
    "카카오": {
        "symbol": "035720",
        "name": "카카오",
        "issueRisk": {
            "score": 68,
            "level": "주의",
            "trend": "상승"
        },
        "sentiment": {
            "positive": 32,
            "neutral": 41,
            "negative": 27
        },
        "keywords": [
            "확면에 잘 나오는지 확인용 테스트",
            "규제",
            "실적 우려",
            "수율",
            "불확실성",
            "경쟁 심화",
            "가격 하락",
            "투자 감소"
        ],
        "summary": {
            "headline": "공급망 불확실성과 글로벌 규제 이슈가 겹치며 리스크가 상승했습니다.",
            "description": "최근 관련 뉴스가 증가했고 부정 감성 비중도 상승했습니다.",
            "newsCount": 2616,
            "newsChange": 18,
            "negativeRate": 27,
            "negativeChange": 8.2,
            "spreadSpeed": 1.7
        },
        "issues": [
            {
                "level": "화면에 잘나오는 확인용 이슈",
                "title": "플랫폼 규제 관련 논의 확대",
                "source": "정책 · 규제",
                "mentions": "1,284",
                "time": "12분 전"
            },
            {
                "level": "주의",
                "title": "신규 사업 관련 시장 우려",
                "source": "경제 · 산업",
                "mentions": "826",
                "time": "38분 전"
            },
            {
                "level": "관찰",
                "title": "시장 경쟁 심화 가능성",
                "source": "시장 · 경쟁",
                "mentions": "542",
                "time": "1시간 전"
            }
        ]
    }
}


@router.get("/search")
def search_company(keyword: str):
    company = TEMP_COMPANIES.get(keyword)

    if not company:
        return {
            "success": False,
            "message": f"'{keyword}' 기업 데이터를 찾을 수 없습니다."
        }

    return {
        "success": True,
        "data": company
    }