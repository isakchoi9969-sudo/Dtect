import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from app.api.risk_assessment import (
    RiskAssessmentRequest,
    _assess_news_risk,
    build_polite_metric_fallback,
    has_polite_formal_endings,
)


class PoliteFormalEndingTests(unittest.TestCase):
    def test_accepts_complete_polite_sentences(self):
        text = "현재 기사에서는 관련 사업 확대 소식이 확인됩니다. 다만 실제 성과 여부는 더 살펴보시면 좋겠습니다."
        self.assertTrue(has_polite_formal_endings(text))
        self.assertTrue(has_polite_formal_endings("관련 사실이 확인되었습니다(A1). 향후 상황을 지켜보시면 좋겠습니다."))

    def test_rejects_plain_report_style_and_mixed_tone(self):
        self.assertFalse(has_polite_formal_endings("관련 사실은 확인되지 않았다. 위험도는 낮다."))
        self.assertFalse(has_polite_formal_endings("관련 사실은 확인되었습니다. 위험도는 낮다."))
        self.assertFalse(has_polite_formal_endings(
            "입찰 결과는 기사에서 확인되지 않았다. 기술 경쟁력은 높아질 것으로 관측된다."
        ))
        self.assertFalse(has_polite_formal_endings("반드시 추가 정보를 확인해야 합니다."))

    def test_rejects_non_polite_analysis_like_the_reported_screen(self):
        text = (
            "최근 기사들은 핵심 이슈로 제3차 입찰 참여와 기술 제휴를 제시하고 있다. "
            "회사는 관련 사업을 적극적으로 추진하고 있다(확인 근거: A1, A2). "
            "종합하면 현재 위험은 제한적이라고 판단된다."
        )
        self.assertFalse(has_polite_formal_endings(text))

    def test_rejects_empty_or_sentence_fragment(self):
        self.assertFalse(has_polite_formal_endings(""))
        self.assertFalse(has_polite_formal_endings("사업 확대 관련 보도."))

    def test_model_failure_fallback_is_polite_and_uses_observed_metrics(self):
        payload = RiskAssessmentRequest.model_validate({
            "company": {"name": "테스트 기업"},
            "signals": {
                "analyzedArticleCount": 100,
                "databaseRecentArticleCount": 100,
                "databaseBaselineMonthlyArticleAverage": 100,
                "databaseRecentPressCount": 10,
                "negativeArticleShare": 0.05,
                "negativeActiveDays": 3,
                "negativeArticleCount": 5,
                "negativeArticlePercent": 5,
                "scores": {"negativeSentiment": 4},
            },
            "articles": [
                {"id": f"A{i}", "title": f"기사 {i}"} for i in range(1, 4)
            ],
        })
        fallback = build_polite_metric_fallback(payload)
        self.assertIn("기사 100건", fallback)
        self.assertIn("비율은 5%", fallback)
        self.assertIn("날짜는 3일", fallback)
        self.assertTrue(has_polite_formal_endings(fallback))

    def test_primary_and_rewrite_prompts_use_the_same_paragraph_rule(self):
        payload = RiskAssessmentRequest.model_validate({
            "company": {"name": "테스트 기업"},
            "signals": {
                "analyzedArticleCount": 3,
                "databaseRecentArticleCount": 3,
                "databaseBaselineMonthlyArticleAverage": 2,
                "databaseRecentPressCount": 2,
                "negativeArticleShare": 0.33,
                "negativeActiveDays": 1,
                "negativeArticleCount": 1,
                "negativeArticlePercent": 33,
                "scores": {"negativeSentiment": 20},
            },
            "articles": [{"id": f"A{i}", "title": f"기사 {i}"} for i in range(1, 4)],
        })
        first_response = {
            "issue_impact": 20,
            "analysis_result": "간결한 보고다.",
            "analysis_evidence_ids": [],
            "key_drivers": [],
            "watch_items": [],
            "confidence": "low",
            "data_limitations": [],
        }
        rewrite_response = {
            "analysis_result": "첫 문단입니다.\n\n둘째 문단입니다.\n\n셋째 문단입니다."
        }
        with patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"}), patch(
            "app.api.risk_assessment.OpenAI"
        ) as openai_client:
            create = openai_client.return_value.responses.create
            create.side_effect = [
                SimpleNamespace(output_text=json.dumps(first_response)),
                SimpleNamespace(output_text=json.dumps(rewrite_response)),
            ]
            result = _assess_news_risk(payload)

        main_prompt = create.call_args_list[0].kwargs["instructions"]
        rewrite_prompt = create.call_args_list[1].kwargs["instructions"]
        self.assertIn("정확히 3개의 짧은 한국어 문단", main_prompt)
        self.assertIn("전체가 3~6문장", main_prompt)
        self.assertNotIn("3~5문장", main_prompt)
        self.assertIn("확인되지 않은 내용", main_prompt)
        self.assertIn("조건부 위험", main_prompt)
        self.assertIn("정확히 3개의 짧은 문단", rewrite_prompt)
        self.assertNotIn("3~4개의", rewrite_prompt)
        self.assertFalse(result["tone_fallback"])
        self.assertEqual(result["analysis_result"], rewrite_response["analysis_result"])


if __name__ == "__main__":
    unittest.main()
