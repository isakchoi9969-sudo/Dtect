import unittest
from unittest.mock import Mock, patch
from concurrent.futures import ThreadPoolExecutor
from threading import Event

from app.services.inference_cache import InferenceCache
from app.models import sentiment_model as sentiment
from app.api import risk_assessment as risk


class ReuseTests(unittest.TestCase):
    def test_expiry_eviction_and_copy_isolation(self):
        now = [0]
        cache = InferenceCache(1, 5, lambda: now[0])
        compute = Mock(return_value={"value": [1]})
        value, _ = cache.get_or_compute("a", compute)
        value["value"].append(2)
        self.assertEqual(cache.get_or_compute("a", compute), ({"value": [1]}, "hit"))
        now[0] = 5
        cache.get_or_compute("a", compute)
        cache.get_or_compute("b", compute)
        cache.get_or_compute("a", compute)
        self.assertEqual(compute.call_count, 4)

    def test_failures_and_fallback_are_not_cached(self):
        cache = InferenceCache()
        compute = Mock(side_effect=[ValueError("failed"), {}, {}])
        with self.assertRaises(ValueError):
            cache.get_or_compute("a", compute)
        cache.get_or_compute("a", compute, cache_if=lambda _: False)
        cache.get_or_compute("a", compute)
        self.assertEqual(compute.call_count, 3)

    def test_concurrent_identical_work_runs_once(self):
        cache = InferenceCache()
        started, release = Event(), Event()
        def work():
            started.set()
            release.wait(3)
            return {"value": 1}
        compute = Mock(side_effect=work)
        with ThreadPoolExecutor(2) as pool:
            first = pool.submit(cache.get_or_compute, "a", compute)
            self.assertTrue(started.wait(3))
            second = pool.submit(cache.get_or_compute, "a", compute)
            release.set()
            self.assertEqual(first.result()[0], second.result()[0])
        self.assertEqual(compute.call_count, 1)

    def test_sentiment_only_infers_new_text_and_preserves_order(self):
        sentiment._prediction_cache.clear()
        model = Mock(side_effect=lambda texts, **kw: [
            {"label": "positive" if t == "a" else "negative", "score": 0.9} for t in texts])
        with patch.object(sentiment, "get_sentiment_pipeline", return_value=model):
            first = sentiment.analyze_sentiments(["a", "b", "a"])
            self.assertEqual([x["label"] for x in first], ["positive", "negative", "positive"])
            self.assertEqual(model.call_args.args[0], ["a", "b"])
            sentiment.analyze_sentiments(["b", "a"])
            self.assertEqual(model.call_count, 1)
            sentiment.analyze_sentiments(["b", "changed"])
            self.assertEqual(model.call_args.args[0], ["changed"])
        sentiment._prediction_cache.clear()

    def test_endpoint_reuses_exact_input_but_invalidates_changed_input(self):
        payload = risk.RiskAssessmentRequest(company={"name": "기업"}, signals={
            "analyzedArticleCount": 3, "databaseRecentArticleCount": 3,
            "databaseBaselineMonthlyArticleAverage": 3, "databaseRecentPressCount": 1,
            "negativeArticleShare": 0, "negativeActiveDays": 0,
            "negativeArticleCount": 0, "negativeArticlePercent": 0, "scores": {},
        }, articles=[{"id": f"A{i}", "title": f"기사 {i}"} for i in range(1, 4)])
        with patch.object(risk, "_risk_cache", InferenceCache()), patch.object(
            risk, "_assess_news_risk", return_value={"analysis_result": "확인됩니다."}
        ) as compute:
            risk.assess_news_risk(payload)
            risk.assess_news_risk(payload)
            self.assertEqual(compute.call_count, 1)
            changed = payload.model_copy(update={"signals": payload.signals.model_copy(update={"negativeActiveDays": 1})})
            risk.assess_news_risk(changed)
            with patch.object(risk, "PROMPT_VERSION", "next"):
                risk.assess_news_risk(payload)
            self.assertEqual(compute.call_count, 3)

    def test_citation_removal_preserves_content_and_paragraphs(self):
        self.assertEqual(risk.strip_evidence_markers("확인됩니다 (A1, A6).\n\n살펴봅니다(근거: A2~A7)."),
                         "확인됩니다.\n\n살펴봅니다.")
        self.assertEqual(risk.strip_evidence_markers("A1 제품 (A1 제품) [IPO]"), "A1 제품 (A1 제품) [IPO]")


if __name__ == "__main__":
    unittest.main()
