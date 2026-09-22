# Node 서버가 보낸 이슈 내용을 DataFrame 형태로 바꾼 뒤
# dtect_response_generator.py의 create_drafts 함수를 호출하는 API입니다.

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# 현재 넣으신 모델 파일의 실제 함수명은 create_drafts 입니다.
from app.dtect_response_generator import create_drafts

router = APIRouter(prefix="/api/ai", tags=["response-draft"])


class ResponseDraftRequest(BaseModel):
    # 프론트에서 선택한 문서 유형
    document_type: str = "보도자료"

    # 이슈명과 핵심 상황은 필수 입력값
    issue_name: str = Field(..., min_length=2)
    analysis_text: str = Field(..., min_length=10)

    # 현재 화면에는 없어도 비워 둔 채 전송 가능합니다.
    company: str = ""
    industry: str = ""


@router.post("/response-draft")
def create_response_draft(payload: ResponseDraftRequest):
    try:
        # create_drafts는 여러 기사 DataFrame을 처리하는 함수입니다.
        # 화면에서 입력한 한 건을 기사 한 건처럼 만들어 전달합니다.
        input_df = pd.DataFrame(
            [
                {
                    "company": payload.company,
                    "industry": payload.industry,
                    "title": payload.issue_name,
                    "content": payload.analysis_text,
                }
            ]
        )

        result_df = create_drafts(
            input_df=input_df,
            model="gpt-5-mini",
            use_api=True,
            document_type=payload.document_type,
        )

        # 본문 또는 제목이 비어 있을 때 생성 결과가 없을 수 있습니다.
        if result_df.empty:
            raise ValueError("초안 생성에 필요한 이슈 내용이 부족합니다.")

        draft = result_df.iloc[0]

        return {
            "success": True,
            "data": {
                "documentType": draft["document_type"],
                "draftResponse": draft["draft_response"],
                "riskType": draft["risk_type"],
                "generationStatus": draft["generation_status"],
            },
        }

    except Exception as error:
        # 실제 오류를 Node 서버에 전달합니다.
        raise HTTPException(
            status_code=500,
            detail=f"대응자료 생성 실패: {str(error)}",
        )