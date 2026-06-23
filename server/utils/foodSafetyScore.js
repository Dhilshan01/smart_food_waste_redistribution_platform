// Numeric scoring (0-100) with label mapping for backward compatibility
export const calculateSafetyScore = (preparedAt, expiresAt, storageConditions = 'room_temperature') => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const prepared = new Date(preparedAt);

    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);
    const totalShelfLife = (expiry - prepared) / (1000 * 60 * 60);

    // Base score from remaining time as % of total shelf life
    let score = totalShelfLife > 0 
        ? Math.round((hoursRemaining / totalShelfLife) * 100)
        : 0;

    // Storage condition adjustment
    if (storageConditions === 'refrigerated') score += 5;
    if (storageConditions === 'frozen') score += 10;
    if (storageConditions === 'room_temperature') score -= 5;

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    let label, category;
    if (hoursRemaining <= 0) {
        score = 0;
        label = 'unsafe';
        category = 'Expired';
    } else if (score >= 80) {
        label = 'safe';
        category = 'Safe';
    } else if (score >= 50) {
        label = 'moderate_risk';
        category = 'Moderate Risk';
    } else {
        label = 'unsafe';
        category = 'Unsafe';
    }

    return {
        score: label,              // 'safe' | 'moderate_risk' | 'unsafe' (kept for old code)
        numericScore: score,        // 0-100 (new)
        hoursRemaining: hoursRemaining > 0 ? hoursRemaining.toFixed(2) : 0,
        label: category,
        recommendedAction: getRecommendedAction(score, hoursRemaining)
    };
};

const getRecommendedAction = (score, hoursRemaining) => {
    if (hoursRemaining <= 0) return 'Remove immediately — expired';
    if (score >= 80) return 'Safe for sale or donation';
    if (score >= 50) return 'Prioritize urgent collection — sell or donate soon';
    return 'High risk — donate immediately or discard';
};