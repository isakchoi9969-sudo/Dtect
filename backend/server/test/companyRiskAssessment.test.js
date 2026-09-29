const assert = require("node:assert/strict");
const test = require("node:test");
const {
  SCORE_WEIGHTS,
  calculateRiskSignals,
  calculateWeightedRiskScore,
  getRiskLevel,
} = require("../src/services/companyRiskAssessment.service");

const completeSignals = {
  issueImpact: 50,
  negativeSentiment: 50,
  negativeNewsAcceleration: 50,
  negativePersistence: 50,
};

test("risk weights sum to 100% and complete inputs keep their weighted mean", () => {
  assert.ok(Math.abs(Object.values(SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
  assert.deepEqual(calculateWeightedRiskScore(completeSignals), { score: 50, coverage: 1 });
  assert.deepEqual(calculateWeightedRiskScore({
    issueImpact: 100,
    negativeSentiment: 100,
    negativeNewsAcceleration: 100,
    negativePersistence: 100,
  }), { score: 100, coverage: 1 });
  assert.deepEqual(calculateWeightedRiskScore({
    issueImpact: 0,
    negativeSentiment: 0,
    negativeNewsAcceleration: 0,
    negativePersistence: 0,
  }), { score: 0, coverage: 1 });
});

test("missing, blank, non-finite and unknown components never redistribute weight", () => {
  assert.deepEqual(calculateWeightedRiskScore({
    issueImpact: 100,
    negativeSentiment: null,
    negativeNewsAcceleration: "",
    negativePersistence: Number.NaN,
    marketResponse: 100,
    toString: 100,
  }), { score: 40, coverage: 0.4 });
  assert.deepEqual(calculateWeightedRiskScore({ negativeSentiment: 100 }), { score: 30, coverage: 0.3 });
  assert.deepEqual(calculateWeightedRiskScore({ issueImpact: -10 }), { score: 0, coverage: 0.4 });
  assert.deepEqual(calculateWeightedRiskScore({ issueImpact: 120 }), { score: 40, coverage: 0.4 });
  assert.deepEqual(calculateWeightedRiskScore({ issueImpact: Infinity }), { score: null, coverage: 0 });
});

test("each component is monotonic: increasing one risk signal cannot lower the total", () => {
  for (const key of Object.keys(SCORE_WEIGHTS)) {
    let previous = null;
    for (let value = 0; value <= 100; value += 1) {
      const result = calculateWeightedRiskScore({ ...completeSignals, [key]: value }).score;
      if (previous !== null) assert.ok(result >= previous, `${key} lowered score at ${value}`);
      previous = result;
    }
  }
});

test("risk grade cutoffs are stable at every boundary", () => {
  assert.equal(getRiskLevel(null), "unknown");
  assert.equal(getRiskLevel(Number.NaN), "unknown");
  assert.equal(getRiskLevel(""), "unknown");
  assert.equal(getRiskLevel(24), "low");
  assert.equal(getRiskLevel(25), "watch");
  assert.equal(getRiskLevel(49), "watch");
  assert.equal(getRiskLevel(50), "high");
  assert.equal(getRiskLevel(74), "high");
  assert.equal(getRiskLevel(75), "critical");
  assert.equal(getRiskLevel(100), "critical");
});

test("news-signal edge cases stay bounded and market inputs no longer exist", () => {
  const empty = calculateRiskSignals([], {
    recentArticleCount: 0,
    previousArticleCount: 0,
    previousPressCount: 0,
    recentPressCount: 0,
  });
  assert.equal(empty.scores.negativeSentiment, null);
  assert.equal(empty.scores.negativePersistence, null);
  assert.equal(empty.scores.negativeNewsAcceleration, null);
  assert.equal("marketResponse" in empty.scores, false);
  assert.equal("excessReturn" in empty, false);

  const negativeAcrossDays = Array.from({ length: 7 }, (_, index) => ({
    sentiment: "negative",
    sentimentConfidence: 1,
    publishedAt: `2026-09-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
  }));
  const history = {
    recentArticleCount: 10000,
    previousArticleCount: 0,
    previousPressCount: 0,
    recentPressCount: 10000,
  };
  const saturated = calculateRiskSignals(negativeAcrossDays, history);
  assert.equal(saturated.scores.negativePersistence, 47);
  assert.equal(saturated.scores.negativeNewsAcceleration, 100);
  assert.equal(saturated.scores.negativeSentiment, 58);
  for (const value of Object.values(saturated.scores)) {
    assert.ok(value === null || (value >= 0 && value <= 100));
  }
});

test("negative-report persistence uses distinct days and saturates at 15 active days", () => {
  const history = {
    recentArticleCount: 100,
    previousArticleCount: 100,
    previousPressCount: 10,
    recentPressCount: 10,
  };
  const articlesForDays = (days) => days.map((day) => ({
    sentiment: "negative",
    sentimentConfidence: 1,
    publishedAt: `2026-09-${String(day).padStart(2, "0")}T12:00:00.000Z`,
  }));

  assert.equal(calculateRiskSignals(articlesForDays([1]), history).scores.negativePersistence, 7);
  assert.equal(calculateRiskSignals(articlesForDays([1, 5, 10, 15, 20]), history).scores.negativePersistence, 33);
  assert.equal(calculateRiskSignals(articlesForDays(Array.from({ length: 14 }, (_, i) => i + 1)), history).scores.negativePersistence, 93);
  assert.equal(calculateRiskSignals(articlesForDays(Array.from({ length: 15 }, (_, i) => i + 1)), history).scores.negativePersistence, 100);
  assert.equal(calculateRiskSignals(articlesForDays(Array.from({ length: 30 }, (_, i) => i + 1)), history).scores.negativePersistence, 100);

  const multipleArticlesSameDay = articlesForDays(Array.from({ length: 20 }, () => 6));
  assert.equal(calculateRiskSignals(multipleArticlesSameDay, history).scores.negativePersistence, 7);

  const acrossSeoulMidnight = [
    { sentiment: "negative", sentimentConfidence: 1, publishedAt: "2026-09-01T14:59:00.000Z" },
    { sentiment: "negative", sentimentConfidence: 1, publishedAt: "2026-09-01T15:01:00.000Z" },
  ];
  assert.equal(calculateRiskSignals(acrossSeoulMidnight, history).negativeActiveDays, 2);
  assert.equal(calculateRiskSignals(acrossSeoulMidnight, history).scores.negativePersistence, 13);
});

test("a low score is mathematically consistent when negative signals are sparse", () => {
  const articles = Array.from({ length: 100 }, (_, index) => ({
    sentiment: index < 5 ? "negative" : index < 51 ? "positive" : "neutral",
    sentimentConfidence: index < 5 ? 0.8 : 1,
    publishedAt: index < 5
      ? `2026-09-${String([2, 14, 26][index % 3]).padStart(2, "0")}T12:00:00.000Z`
      : `2026-09-${String((index % 27) + 1).padStart(2, "0")}T12:00:00.000Z`,
  }));
  const stableHistory = {
    recentArticleCount: 100,
    previousArticleCount: 200,
    previousPressCount: 20,
    recentPressCount: 10,
  };
  const signals = calculateRiskSignals(articles, stableHistory);
  assert.equal(signals.negativeArticlePercent, 5);
  assert.equal(signals.scores.negativeNewsAcceleration, 0);
  assert.equal(signals.scores.negativePersistence, 20);
  assert.equal(signals.scores.negativeSentiment, 4);
  assert.deepEqual(calculateWeightedRiskScore({
    issueImpact: 0,
    negativeNewsAcceleration: signals.scores.negativeNewsAcceleration,
    negativePersistence: signals.scores.negativePersistence,
    negativeSentiment: signals.scores.negativeSentiment,
  }), { score: 3, coverage: 1 });
});
