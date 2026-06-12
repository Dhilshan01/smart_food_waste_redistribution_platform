import pool from '../config/db.js';
import { calculateSafetyScore } from '../utils/foodSafetyScore.js';


export const createListing = async (req, res) => {
    const { title, description, quantity, food_category, prepared_at, expires_at, pickup_address, city } = req.body;
    const donor_id = req.user.id;

    try {
        const { score } = calculateSafetyScore(prepared_at, expires_at);

        const newListing = await pool.query(
            `INSERT INTO food_listings 
            (donor_id, title, description, quantity, food_category, prepared_at, expires_at, pickup_address, city, safety_score)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [donor_id, title, description, quantity, food_category, prepared_at, expires_at, pickup_address, city, score]
        );

        // Log safety score
        await pool.query(
            `INSERT INTO food_safety_logs (listing_id, safety_score, hours_remaining)
             VALUES ($1, $2, $3)`,
            [newListing.rows[0].id, score, calculateSafetyScore(prepared_at, expires_at).hoursRemaining]
        );

        res.status(201).json({
            message: 'Listing created successfully',
            listing: newListing.rows[0]
        });

    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getAvailableListings = async (req, res) => {
    try {
        const { city } = req.query;

        let query = `
            SELECT fl.*, u.full_name as donor_name, u.organization_name, u.phone
            FROM food_listings fl
            JOIN users u ON fl.donor_id = u.id
            WHERE fl.status = 'available' AND fl.expires_at > NOW()
        `;
        const params = [];

        if (city) {
            params.push(city);
            query += ` AND fl.city ILIKE $${params.length}`;
        }

        query += ` ORDER BY fl.expires_at ASC`;

        const listings = await pool.query(query, params);

        // Attach live safety score to each listing
        const listingsWithScore = listings.rows.map(listing => {
            const safety = calculateSafetyScore(listing.prepared_at, listing.expires_at);
            return { ...listing, live_safety: safety };
        });

        res.status(200).json(listingsWithScore);

    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getMyListings = async (req, res) => {
    try {
        const listings = await pool.query(
            `SELECT * FROM food_listings WHERE donor_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );

        const listingsWithScore = listings.rows.map(listing => {
            const safety = calculateSafetyScore(listing.prepared_at, listing.expires_at);
            return { ...listing, live_safety: safety };
        });

        res.status(200).json(listingsWithScore);

    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getListingById = async (req, res) => {
    try {
        const listing = await pool.query(
            `SELECT fl.*, u.full_name as donor_name, u.organization_name, u.phone
             FROM food_listings fl
             JOIN users u ON fl.donor_id = u.id
             WHERE fl.id = $1`,
            [req.params.id]
        );

        if (listing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const safety = calculateSafetyScore(listing.rows[0].prepared_at, listing.rows[0].expires_at);
        res.status(200).json({ ...listing.rows[0], live_safety: safety });

    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateListingStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const listing = await pool.query(
            `UPDATE food_listings SET status = $1 WHERE id = $2 AND donor_id = $3 RETURNING *`,
            [status, req.params.id, req.user.id]
        );

        if (listing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.status(200).json({ message: 'Status updated', listing: listing.rows[0] });

    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const deleteListing = async (req, res) => {
    try {
        const listing = await pool.query(
            `DELETE FROM food_listings WHERE id = $1 AND donor_id = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );

        if (listing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.status(200).json({ message: 'Listing deleted successfully' });

    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};