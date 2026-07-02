import pool from '../config/db.js';

// GET PLATFORM STATS
export const getStats = async (req, res) => {
    try {
        const totalUsers = await pool.query(`SELECT COUNT(*) FROM users WHERE role != 'admin'`);
        const totalDonors = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'donor'`);
        const totalCharities = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'charity'`);
        const totalListings = await pool.query(`SELECT COUNT(*) FROM food_listings`);
        const availableListings = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE status = 'available'`);
        const claimedListings = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE status = 'claimed'`);
        const collectedListings = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE status = 'collected'`);
        const expiredListings = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE status = 'expired'`);
        const totalClaims = await pool.query(`SELECT COUNT(*) FROM claims`);

        // Safety score breakdown
        const safeCount = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE safety_score = 'safe'`);
        const moderateCount = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE safety_score = 'moderate_risk'`);
        const unsafeCount = await pool.query(`SELECT COUNT(*) FROM food_listings WHERE safety_score = 'unsafe'`);

        res.status(200).json({
            users: {
                total: parseInt(totalUsers.rows[0].count),
                donors: parseInt(totalDonors.rows[0].count),
                charities: parseInt(totalCharities.rows[0].count),
            },
            listings: {
                total: parseInt(totalListings.rows[0].count),
                available: parseInt(availableListings.rows[0].count),
                claimed: parseInt(claimedListings.rows[0].count),
                collected: parseInt(collectedListings.rows[0].count),
                expired: parseInt(expiredListings.rows[0].count),
            },
            claims: {
                total: parseInt(totalClaims.rows[0].count),
            },
            safety: {
                safe: parseInt(safeCount.rows[0].count),
                moderate: parseInt(moderateCount.rows[0].count),
                unsafe: parseInt(unsafeCount.rows[0].count),
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query(
            `SELECT id, full_name, email, role, organization_name, phone, city, is_active, created_at
             FROM users WHERE role != 'admin'
             ORDER BY created_at DESC`
        );
        res.status(200).json(users.rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// TOGGLE USER ACTIVE STATUS
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await pool.query(
            `UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, full_name, is_active`,
            [req.params.id]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: `User ${user.rows[0].is_active ? 'activated' : 'deactivated'}`,
            user: user.rows[0]
        });
    } catch (error) {
        console.error('Toggle user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE USER AND RELATED PLATFORM DATA
export const deleteUser = async (req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const user = await client.query(
            `SELECT id, role FROM users WHERE id = $1`,
            [userId]
        );

        if (user.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.rows[0].role === 'admin') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Admin users cannot be deleted here' });
        }

        await client.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);

        await client.query(
            `DELETE FROM claims
             WHERE charity_id = $1
                OR listing_id IN (SELECT id FROM food_listings WHERE donor_id = $1)`,
            [userId]
        );

        await client.query(
            `DELETE FROM transactions
             WHERE buyer_id = $1
                OR seller_id = $1
                OR listing_id IN (SELECT id FROM food_listings WHERE donor_id = $1)`,
            [userId]
        );

        await client.query(
            `DELETE FROM waste_analytics
             WHERE business_id = $1
                OR listing_id IN (SELECT id FROM food_listings WHERE donor_id = $1)`,
            [userId]
        );

        await client.query(
            `DELETE FROM food_safety_logs
             WHERE listing_id IN (SELECT id FROM food_listings WHERE donor_id = $1)`,
            [userId]
        );

        await client.query(`DELETE FROM food_listings WHERE donor_id = $1`, [userId]);

        const deleted = await client.query(
            `DELETE FROM users WHERE id = $1 AND role != 'admin' RETURNING id, full_name, email`,
            [userId]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: 'User deleted successfully',
            user: deleted.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// GET ALL LISTINGS
export const getAllListings = async (req, res) => {
    try {
        const listings = await pool.query(
            `SELECT fl.*, u.full_name as donor_name, u.organization_name
             FROM food_listings fl
             JOIN users u ON fl.donor_id = u.id
             ORDER BY fl.created_at DESC`
        );
        res.status(200).json(listings.rows);
    } catch (error) {
        console.error('Get all listings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE ANY LISTING
export const deleteAnyListing = async (req, res) => {
    try {
        const listing = await pool.query(
            `DELETE FROM food_listings WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        if (listing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET ALL CLAIMS
export const getAllClaims = async (req, res) => {
    try {
        const claims = await pool.query(
            `SELECT c.*, fl.title, fl.city, fl.quantity,
                    u1.full_name as charity_name, u1.organization_name as charity_org,
                    u2.full_name as donor_name, u2.organization_name as donor_org
             FROM claims c
             JOIN food_listings fl ON c.listing_id = fl.id
             JOIN users u1 ON c.charity_id = u1.id
             JOIN users u2 ON fl.donor_id = u2.id
             ORDER BY c.claimed_at DESC`
        );
        res.status(200).json(claims.rows);
    } catch (error) {
        console.error('Get all claims error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPlatformAnalytics = async (req, res) => {
    try {
        const [totals, monthly, donors, charities, averageSafety, averageMatch] = await Promise.all([
            pool.query(
                `SELECT
                    COUNT(*) FILTER (WHERE outcome = 'sold')::int AS sold,
                    COUNT(*) FILTER (WHERE outcome = 'donated')::int AS donated,
                    COUNT(*) FILTER (WHERE outcome = 'wasted')::int AS wasted,
                    COALESCE(SUM(estimated_value) FILTER (WHERE outcome = 'sold'), 0)::numeric AS recovered_value
                 FROM waste_analytics`
            ),
            pool.query(
                `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                        COUNT(*) FILTER (WHERE outcome = 'sold')::int AS sold,
                        COUNT(*) FILTER (WHERE outcome = 'donated')::int AS donated,
                        COUNT(*) FILTER (WHERE outcome = 'wasted')::int AS wasted
                 FROM waste_analytics
                 WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
                 GROUP BY DATE_TRUNC('month', created_at)
                 ORDER BY DATE_TRUNC('month', created_at)`
            ),
            pool.query(
                `SELECT u.id, COALESCE(u.organization_name, u.full_name) AS name,
                        COUNT(fl.id)::int AS listings
                 FROM users u LEFT JOIN food_listings fl ON fl.donor_id = u.id
                 WHERE u.role = 'donor'
                 GROUP BY u.id ORDER BY listings DESC LIMIT 5`
            ),
            pool.query(
                `SELECT u.id, COALESCE(u.organization_name, u.full_name) AS name,
                        COUNT(c.id)::int AS claims
                 FROM users u LEFT JOIN claims c ON c.charity_id = u.id
                 WHERE u.role = 'charity'
                 GROUP BY u.id ORDER BY claims DESC LIMIT 5`
            ),
            pool.query(`SELECT COALESCE(ROUND(AVG(safety_score_numeric)), 0)::int AS score FROM food_listings`),
            pool.query(
                `SELECT COALESCE(ROUND(AVG(
                    (CASE WHEN LOWER(fl.city) = LOWER(u.city) THEN 100 ELSE 30 END) * .30 +
                    COALESCE(fl.safety_score_numeric, 0) * .25 +
                    GREATEST(0, LEAST(100, 100 - EXTRACT(EPOCH FROM (fl.expires_at - NOW())) / 1800)) * .25 +
                    30 * .20
                 )), 0)::int AS score
                 FROM food_listings fl CROSS JOIN users u
                 WHERE fl.listing_type = 'donation' AND u.role = 'charity'`
            ),
        ]);

        res.status(200).json({
            totals: totals.rows[0],
            monthly: monthly.rows,
            topDonors: donors.rows,
            topCharities: charities.rows,
            averageSafetyScore: averageSafety.rows[0].score,
            averageMatchScore: averageMatch.rows[0].score,
        });
    } catch (error) {
        console.error('Get platform analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
