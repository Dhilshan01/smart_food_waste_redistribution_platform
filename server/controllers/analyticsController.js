import pool from '../config/db.js';

const parseNumber = (value) => Number(value || 0);

export const getBusinessAnalytics = async (req, res) => {
    const businessId = req.user.id;

    try {
        const [
            listingSummary,
            revenueSummary,
            donationSummary,
            categoryBreakdown,
            monthlyListings,
            recentOutcomes,
            outcomeSummary,
            monthlyRevenue
        ] = await Promise.all([
            pool.query(
                `SELECT
                    COUNT(*)::int AS total_listed,
                    COUNT(*) FILTER (WHERE listing_type = 'sale')::int AS sale_listings,
                    COUNT(*) FILTER (WHERE listing_type = 'donation')::int AS donation_listings,
                    COUNT(*) FILTER (WHERE status = 'available')::int AS available,
                    COUNT(*) FILTER (WHERE status = 'claimed')::int AS claimed,
                    COUNT(*) FILTER (WHERE status = 'collected')::int AS collected,
                    COUNT(*) FILTER (WHERE status = 'expired')::int AS expired,
                    COALESCE(SUM(unit_price) FILTER (WHERE listing_type = 'sale' AND status = 'available'), 0)::numeric AS active_sale_value
                 FROM food_listings
                 WHERE donor_id = $1`,
                [businessId]
            ),
            pool.query(
                `SELECT
                    COUNT(*)::int AS total_sales,
                    COALESCE(SUM(total_amount), 0)::numeric AS recovered_revenue
                 FROM transactions
                 WHERE seller_id = $1`,
                [businessId]
            ),
            pool.query(
                `SELECT COUNT(*)::int AS collected_donations
                 FROM claims c
                 JOIN food_listings fl ON c.listing_id = fl.id
                 WHERE fl.donor_id = $1 AND c.status = 'collected'`,
                [businessId]
            ),
            pool.query(
                `SELECT
                    COALESCE(food_category, 'Other') AS category,
                    COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE status = 'expired')::int AS expired,
                    COUNT(*) FILTER (WHERE status = 'collected')::int AS collected
                 FROM food_listings
                 WHERE donor_id = $1
                 GROUP BY COALESCE(food_category, 'Other')
                 ORDER BY total DESC, category ASC`,
                [businessId]
            ),
            pool.query(
                `SELECT
                    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                    COUNT(*)::int AS listed,
                    COUNT(*) FILTER (WHERE listing_type = 'sale')::int AS sales_listed,
                    COUNT(*) FILTER (WHERE listing_type = 'donation')::int AS donations_listed,
                    COUNT(*) FILTER (WHERE status = 'expired')::int AS expired
                 FROM food_listings
                 WHERE donor_id = $1
                 GROUP BY DATE_TRUNC('month', created_at)
                 ORDER BY DATE_TRUNC('month', created_at) DESC
                 LIMIT 6`,
                [businessId]
            ),
            pool.query(
                `SELECT id, title, listing_type, status, food_category, unit_price, expires_at, created_at
                 FROM food_listings
                 WHERE donor_id = $1
                 ORDER BY created_at DESC
                 LIMIT 8`,
                [businessId]
            ),
            pool.query(
                `SELECT COUNT(*) FILTER (WHERE outcome = 'sold')::int AS sold,
                        COUNT(*) FILTER (WHERE outcome = 'donated')::int AS donated,
                        COUNT(*) FILTER (WHERE outcome = 'wasted')::int AS wasted,
                        COALESCE(SUM(estimated_value) FILTER (WHERE outcome IN ('sold', 'donated')), 0)::numeric AS cost_savings
                 FROM waste_analytics WHERE business_id = $1`,
                [businessId]
            ),
            pool.query(
                `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                        COALESCE(SUM(total_amount), 0)::numeric AS revenue
                 FROM transactions WHERE seller_id = $1
                   AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
                 GROUP BY DATE_TRUNC('month', created_at)
                 ORDER BY DATE_TRUNC('month', created_at)`,
                [businessId]
            )
        ]);

        const summary = listingSummary.rows[0] || {};
        const revenue = revenueSummary.rows[0] || {};
        const donations = donationSummary.rows[0] || {};
        const totalListed = parseNumber(summary.total_listed);
        const expired = parseNumber(summary.expired);
        const collected = parseNumber(summary.collected);
        const collectedDonations = parseNumber(donations.collected_donations);
        const avoidedWaste = collectedDonations + parseNumber(revenue.total_sales);
        const wasteRate = totalListed > 0 ? Math.round((expired / totalListed) * 100) : 0;
        const utilizationRate = totalListed > 0 ? Math.round((avoidedWaste / totalListed) * 100) : 0;

        res.status(200).json({
            summary: {
                totalListed,
                saleListings: parseNumber(summary.sale_listings),
                donationListings: parseNumber(summary.donation_listings),
                available: parseNumber(summary.available),
                claimed: parseNumber(summary.claimed),
                collected,
                expired,
                activeSaleValue: parseNumber(summary.active_sale_value),
                totalSales: parseNumber(revenue.total_sales),
                recoveredRevenue: parseNumber(revenue.recovered_revenue),
                collectedDonations,
                avoidedWaste,
                wasteRate,
                utilizationRate
                ,sold: parseNumber(outcomeSummary.rows[0]?.sold)
                ,donated: parseNumber(outcomeSummary.rows[0]?.donated)
                ,wasted: parseNumber(outcomeSummary.rows[0]?.wasted)
                ,costSavings: parseNumber(outcomeSummary.rows[0]?.cost_savings)
            },
            categoryBreakdown: categoryBreakdown.rows,
            monthlyListings: monthlyListings.rows.reverse(),
            monthlyRevenue: monthlyRevenue.rows,
            recentOutcomes: recentOutcomes.rows
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
