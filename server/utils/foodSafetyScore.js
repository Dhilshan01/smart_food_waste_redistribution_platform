export const calculateSafetyScore = (preparedAt, expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
        return { score: 'unsafe', hoursRemaining: 0, label: 'Expired' };
    } else if (hoursRemaining <= 2) {
        return { score: 'unsafe', hoursRemaining: hoursRemaining.toFixed(2), label: 'Unsafe' };
    } else if (hoursRemaining <= 6) {
        return { score: 'moderate_risk', hoursRemaining: hoursRemaining.toFixed(2), label: 'Moderate Risk' };
    } else {
        return { score: 'safe', hoursRemaining: hoursRemaining.toFixed(2), label: 'Safe' };
    }
};