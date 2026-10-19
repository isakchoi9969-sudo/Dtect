"""공식 대응자료 RAG 기반 대응 초안 API."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.dtect_response_generator import create_situation_draft


router = APIRouter(prefix="/api/ai", tags=["response-draft"])


class ResponseDraftRequest(BaseModel):
    company: str = Field(..., min_length=1, max_length=100)
    situation: str = Field(..., min_length=10, max_length=5000)
    document_type: str = "보도자료"
    current_actions: str = Field(default="", max_length=3000)
    additional_request: str = Field(default="", max_length=1000)


@router.post("/response-draft")
def create_response_draft(payload: ResponseDraftRequest):
    try:
        draft = create_situation_draft(
            company=payload.company,
            situation=payload.situation,
            document_type=payload.document_type,
            current_actions=payload.current_actions,
            additional_request=payload.additional_request,
        )
        return {
            "success": True,
            "data": {
                "documentType": draft["document_type"],
                "incidentType": draft["incident_type"],
                "draftResponse": draft["draft_response"],
                "generationStatus": draft["generation_status"],
                "referenceCases": draft["reference_cases"],
            },
        }
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"대응자료 생성 실패: {error}") from error
