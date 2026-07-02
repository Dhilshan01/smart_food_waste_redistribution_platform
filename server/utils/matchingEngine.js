/**
 * Transparent rule-based charity matching.
 * Final score = location × 0.30 + safety × 0.25 + urgency × 0.25
 *             + category preference × 0.20.
 */
export const calculateMatchScore = (listing, charity, preferredCategories = []) => {
  const locationScore =
    listing.city?.trim().toLowerCase() === charity.city?.trim().toLowerCase() ? 100 : 30;
  const safetyScore = Math.max(0, Math.min(100, Number(listing.live_safety?.numericScore ?? listing.safety_score_numeric ?? 0)));
  const hoursRemaining = Math.max(
    0,
    (new Date(listing.expires_at).getTime() - Date.now()) / 3_600_000,
  );
  const urgencyScore = Math.max(0, Math.min(100, Math.round(100 - hoursRemaining * 2)));
  const categoryPreferenceScore = preferredCategories.includes(listing.food_category) ? 100 : 30;
  const matchScore = Math.round(
    locationScore * 0.3 +
      safetyScore * 0.25 +
      urgencyScore * 0.25 +
      categoryPreferenceScore * 0.2,
  );

  const reasons = [];
  if (locationScore === 100) reasons.push("Same city");
  if (safetyScore >= 80) reasons.push("High safety score");
  if (urgencyScore >= 70) reasons.push("Expiring soon");
  if (categoryPreferenceScore === 100) reasons.push("Matches your preferences");

  return {
    match_score: matchScore,
    match_factors: {
      location: locationScore,
      safety: safetyScore,
      urgency: urgencyScore,
      category_preference: categoryPreferenceScore,
    },
    match_reasons: reasons,
  };
};
