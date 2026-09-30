import unittest

from app.api.risk_assessment import (
    RiskAssessmentRequest,
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


if __name__ == "__main__":
    unittest.main()
