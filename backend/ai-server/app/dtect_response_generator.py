"""D:TECT 기사 근거 기반 기자 대응자료 생성 모듈.

이 파일은 LoRA 학습 모델이 아닙니다. 뉴스 기사에서 확인 가능한 근거를 추출하고,
생성 AI가 그 근거 범위 안에서 기자 대응자료 초안을 만들도록 합니다.

사용 예시
---------
export OPENAI_API_KEY="..."
python dtect_response_generator.py \
  --input /content/drive/MyDrive/DTECT_news_2026/monthly/news.csv \
  --output /content/drive/MyDrive/DTECT_output/pr_response_drafts.csv

입력 CSV는 아래 열 가운데 일부를 포함하면 됩니다.
company, industry, title/document_title, content/original/body,
published_at/date, source_url/url, article_id/id
"""

from __future__ import annotations

import argparse
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Iterable

import pandas as pd


ISSUE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "사건·사고": ("사고", "화재", "붕괴", "사망", "부상", "침수", "재해"),
    "서비스·보안": ("장애", "오류", "먹통", "서비스 중단", "유출", "해킹", "개인정보"),
    "규제·법률": ("제재", "과징금", "조사", "수사", "소송", "공정위", "검찰"),
    "노사": ("파업", "노조", "노사", "분쟁", "임금"),
    "제품·소비자": ("리콜", "결함", "불량", "환불", "피해", "민원"),
    "경영·평판": ("논란", "의혹", "갑질", "불매", "실적 악화", "적자"),
}

ACTION_WORDS = (
    "사과", "유감", "확인", "조사", "점검", "조치", "복구", "정상화",
    "개선", "보완", "재발 방지", "대책", "지원", "보상", "회수",
)

SYSTEM_INSTRUCTIONS = """당신은 기업 위기 커뮤니케이션 담당자입니다.
제공된 뉴스 기사 근거만으로 한국어 대응자료 초안을 작성하세요.

기사에 없는 원인, 수치, 책임, 조치, 일정은 절대로 만들어 내지 마세요.
확정되지 않은 내용은 '현재 확인 중입니다'처럼 불확실성을 명시하세요.
특정 개인이나 기관을 비난하지 마세요.

가독성 규칙:
- 각 구역 제목은 반드시 '## 제목' 형식으로 작성하세요.
- 각 구역 제목 앞뒤에는 빈 줄을 한 줄씩 넣으세요.
- 핵심 내용은 한 문장씩 '- '로 시작하는 목록으로 작성하세요.
- 긴 문단을 작성하지 마세요.
- 초안 본문만 작성하고, 인사말·설명·코드 블록은 넣지 마세요."""

DOCUMENT_TYPE_INSTRUCTIONS: dict[str, str] = {
    "보도자료": """기자와 외부 이해관계자에게 제공하는 보도자료 형식입니다.
아래 순서와 제목을 반드시 그대로 사용하세요.

## 제목
- 이슈를 짧게 요약한 제목 한 줄

## 확인된 사항
- 기사에서 확인 가능한 사실만 2~3개

## 현재 대응
- 현재 확인·점검·복구 등 진행 중인 사항

## 향후 안내
- 추가 확인 결과를 안내한다는 내용""",
    "고객 안내문": """고객에게 제공하는 안내문 형식입니다.
어려운 표현을 피하고, 다음 네 구역을 반드시 유지하세요: 안내 제목, 현재 확인된 내용, 고객 안내, 추가 안내.
고객이 지금 해야 할 일이 기사 근거에 없으면 임의로 지시하지 마세요.""",
    "임직원 공지": """임직원에게 공유하는 내부 공지 형식입니다.
차분하고 명확하게 작성하고, 다음 네 구역을 반드시 유지하세요: 공지 제목, 현재 상황, 임직원 안내, 후속 공지.
사내 지시·일정·담당 부서는 기사 근거에 없으면 만들어 내지 마세요.""",
    "Q&A 문서": """예상 질문과 답변을 정리한 문서 형식입니다.
질문 3개와 답변 3개를 작성하세요. 각 답변은 기사 근거 안에서만 답하고,
확인되지 않은 내용에는 '현재 확인 중입니다'라고 명시하세요.""",
}


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()

def clean_generated_text(value: object) -> str:
    """AI가 만든 결과의 줄바꿈은 유지하고 불필요한 공백만 정리합니다."""
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")

    # 줄 내부의 연속 공백만 한 칸으로 정리
    text = re.sub(r"[ \t]+", " ", text)

    # 빈 줄이 너무 많이 생기지 않도록 최대 한 줄만 유지
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()

def first_present(row: pd.Series, names: Iterable[str]) -> str:
    for name in names:
        if name in row.index and clean(row[name]):
            return clean(row[name])
    return ""


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?。])\s+|(?<=다\.)\s+|(?<=니다\.)\s+", clean(text))
    return [part for part in parts if 20 <= len(part) <= 500]


def classify_risk(title: str, body: str) -> str:
    text = f"{title} {body}".lower()
    scores = {
        label: sum(keyword.lower() in text for keyword in keywords)
        for label, keywords in ISSUE_KEYWORDS.items()
    }
    label, score = max(scores.items(), key=lambda item: item[1])
    return label if score else "기타 이슈"


def select_evidence(title: str, body: str, limit: int = 5) -> str:
    """이슈·조치가 있는 문장을 우선 선택해 모델 입력을 짧고 검증 가능하게 유지합니다."""
    sentences = split_sentences(body)
    selected: list[str] = []
    keywords = tuple(word for values in ISSUE_KEYWORDS.values() for word in values) + ACTION_WORDS

    for sentence in sentences:
        if any(keyword.replace(" ", "") in sentence.replace(" ", "") for keyword in keywords):
            selected.append(sentence)
        if len(selected) >= limit:
            break

    if not selected:
        selected = sentences[:limit]

    evidence = "\n".join(f"- {sentence}" for sentence in selected)
    return evidence or f"- 기사 제목: {title}"


def build_user_prompt(
    company: str,
    industry: str,
    title: str,
    risk_type: str,
    evidence: str,
    document_type: str = "보도자료",
) -> str:
    document_instruction = DOCUMENT_TYPE_INSTRUCTIONS.get(
        document_type,
        DOCUMENT_TYPE_INSTRUCTIONS["보도자료"],
    )
    return f"""다음 뉴스 기사 근거를 바탕으로 {document_type} 초안을 작성하세요.

문서 유형: {document_type}
문서 형식 지침:
{document_instruction}

기업: {company or '미확인'}
산업: {industry or '미분류'}
리스크 유형: {risk_type}
기사 제목: {title}

기사 근거:
{evidence}

주의: 기사 근거에 없는 내용을 추가하지 마세요."""


def fallback_draft(
    company: str,
    title: str,
    evidence: str,
    document_type: str = "보도자료",
) -> str:
    """API 호출이 불가능할 때도 DB 적재 및 화면 연동을 확인할 수 있는 안전한 초안입니다."""
    return f"""[{document_type} 초안]
제목: {company or '관련 기업'} 관련 보도에 대한 안내

1. 확인된 사항
{evidence}

2. 현재 대응
- 현재 보도 내용과 관련 사실을 확인하고 있습니다.
- 확인되지 않은 사항에 대해서는 단정적 안내를 드리지 않겠습니다.

3. 향후 안내
- 추가로 확인되는 내용은 신속하고 정확하게 안내하겠습니다.
- 필요한 경우 관련 절차와 관리 체계를 점검하겠습니다.
""".strip()


def generate_with_openai(model: str, prompt: str) -> str:
    """OpenAI Responses API 호출."""

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")

    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=model,
        instructions=SYSTEM_INSTRUCTIONS,
        input=prompt,
    )

    # 결과 줄바꿈을 유지하여 화면에서 구역별로 표시합니다.
    result = clean_generated_text(response.output_text)

    if not result:
        raise RuntimeError("AI 응답이 비어 있습니다.")

    return result
    """OpenAI Responses API 호출."""

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")

    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=model,
        instructions=SYSTEM_INSTRUCTIONS,
        input=prompt,
    )

    # 결과 줄바꿈을 유지하여 화면에서 구역별로 표시합니다.
    result = clean_generated_text(response.output_text)

    if not result:
        raise RuntimeError("AI 응답이 비어 있습니다.")

    return result

def create_drafts(
    input_df: pd.DataFrame,
    model: str,
    use_api: bool,
    document_type: str = "보도자료",
) -> pd.DataFrame:
    rows: list[dict[str, str]] = []

    for index, row in input_df.iterrows():
        # 기사 DB 변환 파일과 동일한 규칙을 사용해야 외래키로 연결됩니다.
        article_id = first_present(row, ("article_id", "id", "news_id")) or f"DTECT-{index + 1:08d}"
        company = first_present(row, ("company", "company_name", "기업명"))
        industry = first_present(row, ("industry", "산업", "industry_name"))
        title = first_present(row, ("title", "document_title", "기사제목"))
        body = first_present(row, ("content", "original", "body", "article_body", "본문"))
        published_at = first_present(row, ("published_at", "date", "published_date", "작성일"))
        source_url = first_present(row, ("source_url", "url", "link", "기사링크"))

        if not title or not body:
            continue

        risk_type = classify_risk(title, body)
        evidence = select_evidence(title, body)
        prompt = build_user_prompt(
            company, industry, title, risk_type, evidence, document_type
        )
        status = "fallback"

        if use_api:
            try:
                draft = generate_with_openai(model, prompt)
                status = "generated"
            except Exception as error:
                draft = fallback_draft(company, title, evidence, document_type)
                status = f"fallback: {clean(error)[:120]}"
        else:
            draft = fallback_draft(company, title, evidence, document_type)

        rows.append({
            "response_id": str(uuid.uuid4()),
            "document_type": document_type,
            "article_id": article_id,
            "company": company,
            "industry": industry,
            "article_title": title,
            "published_at": published_at,
            "source_url": source_url,
            "risk_type": risk_type,
            "evidence_text": evidence,
            "draft_response": draft,
            "generation_status": status,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

    return pd.DataFrame(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="D:TECT 기자 대응자료 초안 생성")
    parser.add_argument("--input", required=True, help="분석 대상 기사 CSV 경로")
    parser.add_argument("--output", required=True, help="DB 적재용 결과 CSV 경로")
    parser.add_argument("--model", default="gpt-5-mini", help="사용할 생성 모델")
    parser.add_argument(
        "--document-type",
        default="보도자료",
        choices=tuple(DOCUMENT_TYPE_INSTRUCTIONS),
        help="생성할 문서 유형",
    )
    parser.add_argument("--max-rows", type=int, default=0, help="테스트용 최대 처리 건수(0은 전체)")
    parser.add_argument("--dry-run", action="store_true", help="API 호출 없이 안전한 템플릿 초안 생성")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    df = pd.read_csv(input_path, encoding="utf-8-sig").fillna("")
    if args.max_rows:
        df = df.head(args.max_rows).copy()

    result = create_drafts(
        df,
        model=args.model,
        use_api=not args.dry_run,
        document_type=args.document_type,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"입력 기사: {len(df):,}건")
    print(f"생성 초안: {len(result):,}건")
    print(f"저장 위치: {output_path}")
    if not result.empty:
        print(result[["company", "article_title", "risk_type", "generation_status"]].head())


if __name__ == "__main__":
    main()
