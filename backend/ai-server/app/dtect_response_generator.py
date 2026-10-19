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

# 문서 유형마다 제목뿐 아니라 목적과 전달 대상이 다르게 보이도록 설정
DOCUMENT_TYPE_INSTRUCTIONS: dict[str, str] = {
    "보도자료": """언론 및 외부 이해관계자에게 배포하는 공식 보도자료입니다.
고객 안내문이나 내부 공지 형식의 '확인된 사항·현재 대응·향후 안내' 제목은 절대 사용하지 마세요.

아래 순서와 제목을 반드시 그대로 사용하세요.

## 제목
- 기사 근거의 핵심 사실을 담은 공식 발표형 제목 한 줄

## 배포 내용
- 이 보도자료가 다루는 상황을 2~3문장으로 요약
- 회사명·날짜·수치 등 기사에서 확인되지 않은 정보는 만들지 마세요

## 주요 내용
- 기사 근거로 확인된 사실과 회사의 대응 방향을 2~3개로 정리
- 확인되지 않은 조치, 일정, 피해 규모를 단정하지 마세요

## 회사 입장
- 기업의 공식 입장이 기사에서 확인된 경우에만 작성
- 근거가 없으면 '관련 사실을 확인 중이며, 확인되는 내용은 신속히 안내하겠습니다.'라고 작성
- 가상의 담당자 이름, 직책, 인용문은 만들지 마세요

## 문의
- 실제 연락처는 만들지 말고 '문의처는 추후 안내 예정입니다.'라고 작성""",

    "고객 안내문": """서비스 이용 고객에게 전달하는 안내문입니다.
쉽고 친절한 표현을 사용하고, 고객이 알아야 할 영향과 행동만 안내하세요.
보도자료식 배포 문구, 회사 입장, 인용문은 넣지 마세요.

고객에게 보내는 실제 공지문처럼 작성하세요.
기사 건수, 기술보고서명, 제도·표준의 세부 내용처럼 고객이 이해하기 어려운 분석 문구는 넣지 마세요.
기업명이 제공된 경우에만 '안녕하세요. 기업명입니다.'로 시작하세요.
기업명이 없으면 인사말 없이 바로 안내 제목부터 작성하세요.
'미확인입니다'라는 표현은 절대 사용하지 마세요.
고객에게 영향이 있는지, 고객이 할 일이 있는지, 이후 안내를 어떻게 받을 수 있는지를 쉬운 말로 안내하세요.
'당사는', '보도자료', '최근 30일간', '보도가 확인되었습니다' 같은 분석·대외발표 문구는 사용하지 마세요.

아래 순서와 제목을 반드시 그대로 사용하세요.

## 안내 제목
- 고객이 상황을 바로 이해할 수 있는 제목 한 줄

## 고객에게 알려드리는 내용
- 고객에게 직접 관련된 사실만 2~3개로 안내하세요.
- 기사 수, 보도 건수, '기사 기준', 언론 보도 여부, 국제 표준·기술보고서명·회의명 같은 분석용 정보는 절대 넣지 마세요.
- 고객 영향이 확인되지 않았다면 '현재 서비스 이용에 미치는 영향 여부를 확인하고 있습니다.'라고만 작성하세요.
- 고객이 별도로 해야 할 일이 확인되지 않았다면 '현재 고객님께서 별도로 취하실 조치는 없습니다.'라고 안내하세요.

## 이용 시 참고 사항
- 고객이 확인하거나 유의할 사항만 작성
- 근거가 없으면 '현재 고객이 별도로 취해야 할 조치는 확인 중입니다.'라고 작성

## 추가 안내
- 추가 확인 결과가 있을 경우 안내하겠다는 내용만 작성""",

    "임직원 공지": """임직원에게 공유하는 내부 공지입니다.
차분하고 명확한 내부 커뮤니케이션 톤으로 작성하세요.
고객 안내문처럼 사과하거나, 보도자료처럼 대외 발표 형식으로 작성하지 마세요.

아래 순서와 제목을 반드시 그대로 사용하세요.

## 공지 제목
- 내부 공유 목적이 드러나는 제목 한 줄

## 상황 요약
- 기사 근거로 확인된 현재 상황을 2~3개로 정리

## 임직원 행동 기준
- 외부 문의에는 확인된 사실만 안내한다는 원칙을 포함
- 추측성 발언, 개인 의견 공유를 피하도록 안내
- 담당 부서, 지시, 마감일은 근거가 없으면 만들지 마세요

## 후속 공유
- 추가 확인 사항이 생기면 내부 공지하겠다는 내용만 작성""",

    "Q&A 문서": """예상 질문과 표준 답변을 정리하는 대응 Q&A 문서입니다.
질문과 답변 외의 설명 문단이나 안내문 형식의 제목은 작성하지 마세요.

아래 형식을 반드시 그대로 사용하여 질문 3개와 답변 3개를 작성하세요.

## 예상 질문 1
- 질문: 가장 핵심적인 우려 사항을 질문형으로 작성
- 답변: 기사 근거 안에서만 답변

## 예상 질문 2
- 질문: 고객·언론·이해관계자가 물을 수 있는 질문
- 답변: 기사 근거 안에서만 답변

## 예상 질문 3
- 질문: 향후 조치 또는 영향 관련 질문
- 답변: 근거가 없으면 '현재 확인 중이며, 확인되는 내용은 신속히 안내하겠습니다.'라고 답변

가상의 수치, 보상, 일정, 담당자 발언은 만들지 마세요.""",
}

def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()

# 공식 대응자료 CSV 위치
REFERENCE_CORPUS_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "official_response_corpus_v2.csv"
)

# 현재 이슈 분류와 공식 대응자료의 이슈 표현을 연결합니다.
REFERENCE_KEYWORDS = {
    "사건·사고": ("안전", "사고", "산업재해", "환경", "화재"),
    "서비스·보안": ("서비스", "장애", "개인정보", "보안", "복구", "보호"),
    "규제·법률": ("규제", "법률", "공정거래", "과징금", "제재", "해명"),
    "노사": ("노사", "파업", "인력", "협력사"),
    "제품·소비자": ("품질", "결함", "리콜", "고객", "보상", "소비자"),
    "경영·평판": ("입장", "유감", "사과", "평판", "경영권"),
}

_reference_corpus: pd.DataFrame | None = None


def load_reference_corpus() -> pd.DataFrame:
    """공식 대응자료를 서버 실행 중 한 번만 읽습니다."""
    global _reference_corpus

    if _reference_corpus is not None:
        return _reference_corpus

    if not REFERENCE_CORPUS_PATH.exists():
        print(f"[대응자료 RAG] 참고 CSV를 찾지 못했습니다: {REFERENCE_CORPUS_PATH}")
        _reference_corpus = pd.DataFrame()
        return _reference_corpus

    corpus = pd.read_csv(REFERENCE_CORPUS_PATH, encoding="utf-8-sig").fillna("")

    # 실제 대응 표현으로 분류된 자료를 우선 사용합니다.
    corpus = corpus[
        corpus["ai_label"].isin([
            "학습가능",
            "사건참고자료",
            "일반보도자료",
            "고객 FAQ",
            "고객조치",
        ])
    ].copy()

    corpus["search_text"] = (
        corpus["issue_type_original"].astype(str)
        + " "
        + corpus["response_type_rule"].astype(str)
        + " "
        + corpus["ai_response_type"].astype(str)
        + " "
        + corpus["document_title"].astype(str)
        + " "
        + corpus["official_response_text"].astype(str).str[:1200]
    )

    _reference_corpus = corpus
    print(f"[대응자료 RAG] 공식 대응자료 {len(corpus)}건을 불러왔습니다.")
    return _reference_corpus


def find_reference_examples(
    document_type: str,
    title: str,
    risk_type: str,
    evidence: str,
    limit: int = 2,
) -> list[str]:
    """현재 이슈와 가까운 공식 대응자료를 최대 2건 찾습니다."""
    corpus = load_reference_corpus()

    if corpus.empty:
        return []

    query = clean(f"{title} {risk_type} {evidence}")
    keywords = REFERENCE_KEYWORDS.get(risk_type, ())

    ranked: list[tuple[int, pd.Series]] = []

    for _, row in corpus.iterrows():
        search_text = clean(row["search_text"])
        score = sum(keyword in search_text for keyword in keywords)

        # 현재 기사에 실제 등장한 핵심 표현이 대응자료에도 있으면 점수를 더합니다.
        for keyword in ("개인정보", "보안", "장애", "유출", "사고", "리콜", "파업", "과징금"):
            if keyword in query and keyword in search_text:
                score += 2

        # 원문은 모두 공개 공식자료입니다. 따라서 '문서유형'은 원문 자체의
        # 형식이 아니라, 초안 작성에 참고할 수 있는 목적을 뜻합니다.
        # 실제 사내 공지가 아닌 자료를 사내 공지 원문이라고 잘못 표기하지 않습니다.
        response_type = clean(row["ai_response_type"])
        issue_type = clean(row["issue_type_original"])
        response_rule = clean(row["response_type_rule"])
        type_context = f"{response_type} {issue_type} {response_rule} {search_text}"

        if document_type == "보도자료":
            if row["ai_label"] == "일반보도자료":
                score += 2
            if any(word in type_context for word in ("공식", "입장", "발표", "대응")):
                score += 1

        elif document_type == "고객 안내문":
            if row["ai_label"] in ("고객 FAQ", "고객조치"):
                score += 7

            if response_type in ("고객 안내문", "고객조치", "FAQ"):
                score += 5
          
            if "고객조치" in response_type:
                score += 4
            if any(word in type_context for word in (
                "서비스 장애", "개인정보", "보안", "보상", "리콜", "회수", "복구", "점검",
            )):
                score += 2

        elif document_type == "임직원 공지":
            # 공개 자료의 상황 요약·조사·재발방지 내용을 내부 공지의
            # 사실/행동 기준 근거로만 활용합니다.
            if any(word in type_context for word in (
                "조사", "점검", "재발 방지", "개선", "보완", "대책", "안전", "사고", "규제", "노사",
            )):
                score += 3

        elif document_type == "Q&A 문서":
            if "해명·입장" in response_type:
                score += 4
            if any(word in type_context for word in ("해명", "입장", "정정", "사실무근", "확인")):
                score += 2

        if score > 0:
            ranked.append((score, row))

    ranked.sort(key=lambda item: item[0], reverse=True)

    examples = []
    for _, row in ranked[:limit]:
        examples.append(
            f"""[공식 대응자료 참고]
        기업: {row["company"]}
        유형: {row["ai_response_type"]}
        제목: {row["document_title"]}
        본문 일부: {clean(row["official_response_text"])[:600]}"""
        )

    return examples

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
    reference_examples: list[str] | None = None,
) -> str:
    document_instruction = DOCUMENT_TYPE_INSTRUCTIONS.get(
        document_type,
        DOCUMENT_TYPE_INSTRUCTIONS["보도자료"],
    )

    example_text = "\n\n".join(reference_examples or [])

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

공식 대응자료 참고 예시:
{example_text or '적합한 참고 예시가 없습니다.'}

중요:
- 공식 대응자료 예시는 문체와 구성만 참고하세요.
- 예시에 나온 기업명, 날짜, 수치, 사건, 조치를 현재 초안에 옮기지 마세요.
- 현재 기사 근거에 없는 내용을 추가하지 마세요."""


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

        # 현재 이슈와 가까운 공식 대응자료를 최대 2건 검색합니다.
        reference_examples = find_reference_examples(
            document_type=document_type,
            title=title,
            risk_type=risk_type,
            evidence=evidence,
        )

        # 기사 근거와 공식 대응자료 예시를 함께 전달해 초안을 생성합니다.
        prompt = build_user_prompt(
            company,
            industry,
            title,
            risk_type,
            evidence,
            document_type,
            reference_examples,
        )
        status = "fallback"

        if use_api:
            try:
                draft = generate_with_openai(model, prompt)
                status = "generated"
            except Exception as error:
                print(f"OpenAI 초안 생성 실패: {clean(error)}")
                draft = fallback_draft(company, title, evidence, document_type)
                status = "fallback"
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
