"""공식 대응자료 사례를 근거로 상황별 대응 초안을 생성합니다.

이 모듈은 외부 뉴스나 다른 기업의 사실을 현재 사건의 근거로 사용하지 않습니다.
사용자가 입력한 상황과 현재 조치만 사실로 취급하고, CSV의 공개 대응자료는
문서 구성과 표현 범위를 찾는 RAG 참고 사례로만 사용합니다.
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from pathlib import Path

import pandas as pd


REFERENCE_CORPUS_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "official_response_corpus_v2.csv"
)

DOCUMENT_TYPE_INSTRUCTIONS: dict[str, str] = {
    "보도자료": """바로 배포 검토할 수 있는 자연스러운 보도자료로 작성하세요.
첫 줄은 반드시 '# '로 시작하는 기사형 제목 한 줄입니다. 제목 뒤에는 빈 줄을 넣으세요.
이후에는 제목이나 목록 기호 없이 2~4개의 완결된 문단만 작성하세요.
첫 문단은 반드시 '[기업명]은/는 ... 밝혔다.'처럼 기업명을 공식 발표 주체로 시작하세요.
둘째 문단에는 현재 조치를, 마지막 문단에는 후속 안내를 자연스럽게 서술하세요.
확인된 현재 상황과 현재 조치만 사용하고, 입력되지 않은 조치·일정·수치·보상은 만들지 마세요.""",
    "사과문": """공식 사과문으로 작성하세요.
첫 줄은 반드시 '# '로 시작하는 간결한 제목 한 줄입니다. 제목 뒤에는 빈 줄을 넣으세요.
이후에는 제목이나 목록 기호 없이 3~4개의 완결된 문단만 작성하세요.
첫 문단은 반드시 '[기업명]은/는 이번 사안으로 심려를 끼쳐드린 점 깊이 사과드립니다.'처럼 기업명과 명확한 사과 표현으로 시작하세요.
다음 문단에는 현재 확인된 사실과 현재 조치를 분리해 설명하고, 마지막 문단에는 추가 안내와 필요한 후속 조치 검토 의지를 담으세요.
법적 책임·피해 규모·보상·완료 시점처럼 입력되지 않은 사실은 단정하거나 약속하지 마세요.""",
    "고객 안내문": """## 안내 제목, ## 고객에게 알려드리는 내용, ## 이용 시 참고 사항, ## 추가 안내 순서로 작성하세요.
고객이 알아야 할 사실과 유의 사항만 간결히 작성하고, 기업명은 본문에 쓰지 마세요.""",
    "임직원 공지": """## 공지 제목, ## 상황 요약, ## 임직원 행동 기준, ## 후속 공유 순서로 작성하세요.
임직원에게 필요한 사실과 행동 기준만 작성하고, 기업명은 본문에 쓰지 마세요.""",
    "Q&A 문서": """## 예상 질문 1부터 ## 예상 질문 10까지, 총 10개의 질문과 답변을 작성하세요.
각 구역은 '- 질문:'과 '- 답변:' 한 쌍으로 구성하고, 기업명이나 회사 소개 문장을 쓰지 마세요.
질문은 확인된 상황, 영향 범위, 현재 조치, 고객 유의 사항, 추가 안내, 재발 방지 등 이해관계자가 실제로 물을 내용을 서로 겹치지 않게 구성하세요.
입력되지 않은 수치·일정·보상·조치에 대해서는 추정하지 말고, 사실 확인 또는 조사 중이라고 답하세요.""",
}

INCIDENT_TYPES: dict[str, tuple[str, ...]] = {
    "개인정보·보안": ("개인정보", "정보 유출", "유출", "해킹", "보안", "랜섬웨어", "계정"),
    "서비스 장애": ("서비스 장애", "서비스 중단", "장애", "오류", "먹통", "접속", "복구"),
    "안전사고": ("안전", "사고", "화재", "사망", "부상", "산업재해", "재해"),
    "리콜·품질": ("리콜", "결함", "불량", "품질", "회수", "환불"),
    "규제·법률": ("규제", "법률", "과징금", "제재", "조사", "수사", "소송", "공정위"),
    "노사": ("노사", "노조", "파업", "임금", "협력사"),
    "경영·평판": ("경영권", "논란", "의혹", "사과", "유감", "불매", "평판"),
}

QA_SECTION_PATTERN = re.compile(r"^##\s*예상 질문\s*(?:[1-9]|10)\s*$", re.MULTILINE)

SAFE_LABELS = {"학습가능", "사건참고자료", "일반보도자료", "고객 FAQ", "고객조치"}
SEARCH_PAGE_PATTERN = re.compile(r"검색\s*결과|search\s*results?", re.IGNORECASE)
GENERIC_NEWSROOM_PATTERN = re.compile(r"(?:^|\s)(?:news\s*room|뉴스룸)$", re.IGNORECASE)

SYSTEM_INSTRUCTIONS = """당신은 기업 위기 커뮤니케이션 담당자입니다.
사용자가 제공한 '현재 상황'과 '현재 조치'만 현재 기업의 사실로 취급해 한국어 대응자료 초안을 작성하세요.

참고 사례는 다른 기업의 공개 대응자료입니다. 사례의 문서 구조, 표현의 범위, 안내 항목만 참고하고,
다른 기업명·날짜·수치·피해 규모·원인·보상·조치·연락처를 현재 초안에 절대로 옮기지 마세요.
사용자가 제공하지 않은 사실은 만들지 말고 '현재 확인 중입니다' 또는 '추가 확인 후 안내하겠습니다'처럼 명시하세요.
특정 개인이나 기관을 비난하지 말고, 초안 본문만 작성하세요.

문서 유형별 형식 지침을 가장 우선해 따르세요.
인사말, 작성 과정 설명, 코드 블록은 넣지 마세요."""

_reference_corpus: pd.DataFrame | None = None


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def company_subject(company: str) -> str:
    """한국어 기업명에 맞는 주격 보조사를 붙입니다."""
    if not company:
        return "기업은"
    last_code = ord(company[-1])
    has_final_consonant = 0xAC00 <= last_code <= 0xD7A3 and (last_code - 0xAC00) % 28 != 0
    return f"{company}{'은' if has_final_consonant else '는'}"


def load_reference_corpus() -> pd.DataFrame:
    """검색에 안전한 공식 대응자료만 서버 실행 중 한 번 적재합니다."""
    global _reference_corpus

    if _reference_corpus is not None:
        return _reference_corpus
    if not REFERENCE_CORPUS_PATH.exists():
        print(f"[대응자료 RAG] 참고 CSV를 찾지 못했습니다: {REFERENCE_CORPUS_PATH}")
        _reference_corpus = pd.DataFrame()
        return _reference_corpus

    corpus = pd.read_csv(REFERENCE_CORPUS_PATH, encoding="utf-8-sig").fillna("")
    required_columns = {
        "company", "document_title", "official_response_text", "published_at", "source_url",
        "issue_type_original", "response_type_rule", "ai_label", "ai_response_type", "selection_status",
    }
    missing_columns = required_columns - set(corpus.columns)
    if missing_columns:
        raise ValueError(f"공식 대응자료 CSV에 필요한 열이 없습니다: {', '.join(sorted(missing_columns))}")

    corpus = corpus[
        corpus["ai_label"].isin(SAFE_LABELS)
        & (corpus["selection_status"] != "검토 후보")
        & ~corpus["document_title"].astype(str).str.contains(SEARCH_PAGE_PATTERN, na=False)
        & ~corpus["document_title"].astype(str).str.contains(GENERIC_NEWSROOM_PATTERN, na=False)
        & corpus["official_response_text"].astype(str).str.strip().ne("")
    ].copy()
    corpus["search_text"] = corpus.apply(
        lambda row: clean(" ".join([
            row["issue_type_original"], row["response_type_rule"], row["ai_response_type"],
            row["document_title"], str(row["official_response_text"])[:1600],
        ])).lower(),
        axis=1,
    )
    _reference_corpus = corpus
    print(f"[대응자료 RAG] 검색 가능한 공식 대응자료 {len(corpus)}건을 불러왔습니다.")
    return _reference_corpus


def classify_incident(situation: str, current_actions: str = "") -> str:
    """사용자 상황을 정해진 사건 유형으로 분류합니다."""
    source = clean(f"{situation} {current_actions}").lower()
    scores = {
        incident_type: sum(keyword.lower() in source for keyword in keywords)
        for incident_type, keywords in INCIDENT_TYPES.items()
    }
    incident_type, score = max(scores.items(), key=lambda item: item[1])
    return incident_type if score else "기타 이슈"


def _document_score(document_type: str, row: pd.Series) -> int:
    context = clean(f"{row['ai_label']} {row['ai_response_type']} {row['response_type_rule']}")
    if document_type == "고객 안내문":
        return 5 if any(word in context for word in ("고객", "FAQ", "보상", "안내")) else 0
    if document_type == "Q&A 문서":
        return 5 if any(word in context for word in ("FAQ", "해명", "입장", "정정")) else 0
    if document_type == "임직원 공지":
        return 3 if any(word in context for word in ("조사", "점검", "재발 방지", "대책")) else 0
    return 3 if any(word in context for word in ("보도자료", "해명", "입장", "대응")) else 0


def find_reference_cases(
    situation: str,
    incident_type: str,
    document_type: str,
    limit: int = 5,
) -> list[dict[str, str]]:
    """현재 상황에 유사한 공식 대응사례를 우선순위로 반환합니다."""
    corpus = load_reference_corpus()
    if corpus.empty:
        return []

    situation_words = set(re.findall(r"[가-힣A-Za-z0-9]{2,}", clean(situation).lower()))
    incident_keywords = INCIDENT_TYPES.get(incident_type, ())
    ranked: list[tuple[int, pd.Series]] = []

    for _, row in corpus.iterrows():
        search_text = row["search_text"]
        score = _document_score(document_type, row)
        score += 4 * sum(keyword.lower() in search_text for keyword in incident_keywords)
        score += sum(word in search_text for word in situation_words)
        if row["ai_label"] in {"학습가능", "사건참고자료", "고객 FAQ", "고객조치"}:
            score += 2
        if row["ai_response_type"] != "해당없음":
            score += 1
        if score > 0:
            ranked.append((score, row))

    ranked.sort(key=lambda item: (item[0], str(item[1]["published_at"])), reverse=True)
    return [
        {
            "company": clean(row["company"]),
            "title": clean(row["document_title"]),
            "responseType": clean(row["ai_response_type"]) or clean(row["ai_label"]),
            "publishedAt": clean(row["published_at"]),
            "url": clean(row["source_url"]),
            "excerpt": clean(row["official_response_text"])[:700],
        }
        for _, row in ranked[:limit]
    ]


def build_user_prompt(
    company: str,
    situation: str,
    current_actions: str,
    document_type: str,
    additional_request: str,
    incident_type: str,
    reference_cases: list[dict[str, str]],
) -> str:
    case_text = "\n\n".join(
        "\n".join([
            "[공식 대응사례 참고]",
            f"유형: {case['responseType']}",
            f"제목: {case['title']}",
            f"본문 일부: {case['excerpt']}",
        ])
        for case in reference_cases
    ) or "적합한 참고 사례가 없습니다."
    return f"""다음 기업 상황에 대한 {document_type} 완성 초안을 작성하세요.

문서 형식 지침:
{DOCUMENT_TYPE_INSTRUCTIONS.get(document_type, DOCUMENT_TYPE_INSTRUCTIONS['보도자료'])}

{f'기업명(반드시 본문에 공식 발표 주체로 사용): {company}' if document_type in ('보도자료', '사과문') else '기업명은 이력 저장용 내부 정보입니다. 본문에는 절대 쓰지 마세요.'}
AI 분류 사건 유형: {incident_type}
현재 상황(현재 사건의 사실):
{situation}

현재 조치(현재 사건의 사실, 비어 있으면 별도 조치를 추정하지 마세요):
{current_actions or '입력된 조치 없음'}

추가 요청(사실을 추가하는 요청이 아니라 문체·구성 요청으로만 반영):
{additional_request or '없음'}

공식 대응사례:
{case_text}

중요:
- 현재 기업의 사실은 '현재 상황'과 '현재 조치'에 있는 내용만 사용하세요.
- 참고 사례의 구체 사실은 절대 현재 기업의 사실로 쓰지 마세요."""


def clean_generated_text(value: object) -> str:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def validate_document_format(document_type: str, draft: str) -> None:
    """문서 유형별로 화면에 보여 줄 최소 형식을 보장합니다."""
    if document_type == "Q&A 문서":
        question_count = len(QA_SECTION_PATTERN.findall(draft))
        if question_count != 10:
            raise RuntimeError(f"Q&A 문항 수가 10개가 아닙니다. (현재 {question_count}개)")


def generate_with_openai(model: str, prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")
    from openai import OpenAI
    response = OpenAI(api_key=api_key).responses.create(
        model=model, instructions=SYSTEM_INSTRUCTIONS, input=prompt,
    )
    result = clean_generated_text(response.output_text)
    if not result:
        raise RuntimeError("AI 응답이 비어 있습니다.")
    return result


def fallback_draft(company: str, situation: str, current_actions: str, document_type: str) -> str:
    """API 호출 실패 시에도 사용자가 입력한 사실만 담는 안전한 초안을 만듭니다."""
    action_text = current_actions or "현재 추가 사실과 조치를 확인 중입니다."
    if document_type == "보도자료":
        subject = company_subject(company)
        return f"""# {company}, 관련 상황 확인…사실관계 조사 진행

{subject} {situation}

{subject} {action_text}

추가로 확인되는 내용은 신속하고 정확하게 안내하겠습니다."""
    if document_type == "사과문":
        subject = company_subject(company)
        return f"""# 사과의 말씀

{subject} 이번 사안으로 심려를 끼쳐드린 점 깊이 사과드립니다.

현재 확인된 사항은 다음과 같습니다. {situation}

{subject} {action_text}

추가로 확인되는 내용은 신속하고 정확하게 안내하겠으며, 필요한 후속 조치를 검토하겠습니다."""
    if document_type == "Q&A 문서":
        return f"""## 예상 질문 1
- 질문: 현재 어떤 상황이 확인되었나요?
- 답변: {situation}

## 예상 질문 2
- 질문: 현재 어떤 조치가 진행 중인가요?
- 답변: {action_text}

## 예상 질문 3
- 질문: 추가 안내는 언제 받을 수 있나요?
- 답변: 추가로 확인되는 내용은 신속하고 정확하게 안내하겠습니다.

## 예상 질문 4
- 질문: 영향 범위는 확인되었나요?
- 답변: 현재 확인된 사실을 바탕으로 영향 범위를 조사하고 있습니다. 확인되지 않은 범위는 추정하지 않겠습니다.

## 예상 질문 5
- 질문: 이용자 또는 고객이 지금 해야 할 일이 있나요?
- 답변: 현재 안내할 추가 행동 사항은 확인 중입니다. 필요한 사항이 확인되면 신속하게 안내하겠습니다.

## 예상 질문 6
- 질문: 문의는 어디로 하면 되나요?
- 답변: 문의 채널과 운영 방식은 확인되는 대로 안내하겠습니다.

## 예상 질문 7
- 질문: 서비스 이용에 제한이 있나요?
- 답변: 이용 제한 여부는 현재 입력된 사실로 확인되지 않았습니다. 확인되는 내용이 있으면 안내하겠습니다.

## 예상 질문 8
- 질문: 피해 보상 또는 지원 계획이 있나요?
- 답변: 보상 또는 지원 계획은 현재 확인 중이며, 확정되지 않은 내용을 안내하지 않겠습니다.

## 예상 질문 9
- 질문: 재발 방지 대책은 마련되나요?
- 답변: 조사 결과를 바탕으로 필요한 후속 조치를 검토하겠습니다. 구체적인 대책은 확인 후 안내하겠습니다.

## 예상 질문 10
- 질문: 이후 정보는 어떻게 확인할 수 있나요?
- 답변: 추가로 확인되는 내용은 신속하고 정확하게 안내하겠습니다."""
    if document_type == "임직원 공지":
        return f"""## 공지 제목
- 현재 상황 공유

## 상황 요약
- {situation}

## 임직원 행동 기준
- {action_text}
- 외부 문의에는 확인된 사실만 안내하고 추측성 발언은 삼가 주세요.

## 후속 공유
- 추가 확인 사항은 내부 공지를 통해 공유하겠습니다."""
    return f"""## 안내 제목
- 현재 상황 안내

## 고객에게 알려드리는 내용
- {situation}

## 이용 시 참고 사항
- {action_text}

## 추가 안내
- 추가로 확인되는 내용은 신속하고 정확하게 안내하겠습니다."""


def create_situation_draft(
    company: str,
    situation: str,
    document_type: str,
    current_actions: str = "",
    additional_request: str = "",
    model: str = "gpt-5-mini",
    use_api: bool = True,
) -> dict[str, object]:
    """상황 입력과 공식 대응사례를 결합해 초안과 참고사례를 반환합니다."""
    company, situation = clean(company), clean(situation)
    current_actions, additional_request = clean(current_actions), clean(additional_request)
    if not company or not situation:
        raise ValueError("기업명과 현재 상황을 입력해주세요.")
    if document_type not in DOCUMENT_TYPE_INSTRUCTIONS:
        raise ValueError("지원하지 않는 문서 유형입니다.")

    incident_type = classify_incident(situation, current_actions)
    reference_cases = find_reference_cases(situation, incident_type, document_type)
    prompt = build_user_prompt(
        company, situation, current_actions, document_type, additional_request,
        incident_type, reference_cases,
    )
    status = "fallback"
    try:
        draft = generate_with_openai(model, prompt) if use_api else fallback_draft(
            company, situation, current_actions, document_type,
        )
        validate_document_format(document_type, draft)
        status = "generated" if use_api else "fallback"
    except Exception as error:
        print(f"OpenAI 초안 생성 실패: {clean(error)}")
        draft = fallback_draft(company, situation, current_actions, document_type)

    return {
        "document_type": document_type,
        "incident_type": incident_type,
        "draft_response": draft,
        "generation_status": status,
        "reference_cases": reference_cases,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
