import test from "node:test";
import assert from "node:assert/strict";
import { calculateSafetyScore } from "../utils/foodSafetyScore.js";
import { calculateMatchScore } from "../utils/matchingEngine.js";

test("expired food always scores zero", () => {
  const result = calculateSafetyScore("2025-01-01", "2025-01-02", "frozen");
  assert.equal(result.numericScore, 0);
  assert.equal(result.score, "unsafe");
});

test("matching exposes factors and rewards same-city preferences", () => {
  const listing = {
    city: "Colombo",
    food_category: "Bakery",
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    live_safety: { numericScore: 90 },
  };
  const result = calculateMatchScore(listing, { city: "Colombo" }, ["Bakery"]);
  assert.equal(result.match_factors.location, 100);
  assert.equal(result.match_factors.category_preference, 100);
  assert.ok(result.match_score >= 80);
});
