import pool from '../config/db.js';
import { createNotification } from '../utils/notificationHelper.js';


export const createTransaction = async (req, res) => {
    const { listing_id, quantity_purchased } = req.body;
    const buyer_id = req.user.id;

    try {
        const listing = await pool.query(
            `SELECT * FROM food_listings WHERE id = $1 AND status = 'available' AND listing_type = 'sale'`,
            [listing_id]
        );
        if (listing.rows.length === 0) {
            return res.status(400).json({ message: 'Listing not available for purchase' });
        }
        if (listing.rows[0].donor_id === buyer_id) {
            return res.status(400).json({ message: 'You cannot purchase your own listing' });
        }

        const unit_price = listing.rows[0].unit_price;
        const total_amount = unit_price; // Simplified: full listing purchase. Quantity is descriptive text.

        const transaction = await pool.query(
            `INSERT INTO transactions (listing_id, seller_id, buyer_id, quantity_purchased, unit_price, total_amount)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [listing_id, listing.rows[0].donor_id, buyer_id, quantity_purchased || listing.rows[0].quantity, unit_price, total_amount]
        );

        await pool.query(`UPDATE food_listings SET status = 'claimed' WHERE id = $1`, [listing_id]);

        
        await pool.query(
            `INSERT INTO waste_analytics (business_id, listing_id, outcome, estimated_value)
             VALUES ($1, $2, 'sold', $3)`,
            [listing.rows[0].donor_id, listing_id, total_amount]
        );

        await createNotification(
            listing.rows[0].donor_id,
            '💰 New Purchase Request',
            `Your listing "${listing.rows[0].title}" has been purchased for Rs ${total_amount}.`,
            'claimed'
        );

        res.status(201).json({ message: 'Purchase successful', transaction: transaction.rows[0] });

    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getMyPurchases = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, fl.title, fl.city, fl.food_category, u.organization_name as seller_org
             FROM transactions t
             JOIN food_listings fl ON t.listing_id = fl.id
             JOIN users u ON t.seller_id = u.id
             WHERE t.buyer_id = $1 ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET MY SALES (as seller)
export const getMySales = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, fl.title, fl.city, fl.food_category, u.organization_name as buyer_org
             FROM transactions t
             JOIN food_listings fl ON t.listing_id = fl.id
             JOIN users u ON t.buyer_id = u.id
             WHERE t.seller_id = $1 ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// MARK TRANSACTION COLLECTED
export const markTransactionCollected = async (req, res) => {
    try {
        const transaction = await pool.query(
            `UPDATE transactions SET status = 'collected', collected_at = NOW()
             WHERE id = $1 AND buyer_id = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (transaction.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await pool.query(`UPDATE food_listings SET status = 'collected' WHERE id = $1`, [transaction.rows[0].listing_id]);
        res.status(200).json({ message: 'Marked as collected', transaction: transaction.rows[0] });
    } catch (error) {
        console.error('Mark collected error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
