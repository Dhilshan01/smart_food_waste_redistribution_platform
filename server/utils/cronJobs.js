import cron from 'node-cron';
import pool from '../config/db.js';
import { notifyCharitiesUrgent } from './notificationHelper.js';

// Auto-expire listings every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    try {
        const expired = await pool.query(
            `UPDATE food_listings 
             SET status = 'expired' 
             WHERE expires_at < NOW() AND status = 'available'
             RETURNING id, donor_id, unit_price`
        );
        for (const listing of expired.rows) {
            await pool.query(
                `INSERT INTO waste_analytics (business_id, listing_id, outcome, estimated_value)
                 VALUES ($1, $2, 'wasted', $3)`,
                [listing.donor_id, listing.id, Number(listing.unit_price || 0)]
            );
        }
        if (expired.rows.length > 0) {
            console.log(`Auto-expired ${expired.rows.length} listing(s)`);
        }
    } catch (error) {
        console.error('Cron expire error:', error);
    }
});

// Check for near-expiry listings every 30 minutes and notify charities
cron.schedule('*/30 * * * *', async () => {
    try {
        const urgentListings = await pool.query(
            `SELECT * FROM food_listings 
             WHERE status = 'available'
             AND expires_at > NOW()
             AND expires_at <= NOW() + INTERVAL '2 hours'`
        );

        for (const listing of urgentListings.rows) {
            await notifyCharitiesUrgent(listing);
        }

        if (urgentListings.rows.length > 0) {
            console.log(`Sent urgent notifications for ${urgentListings.rows.length} listing(s)`);
        }
    } catch (error) {
        console.error('Cron urgent error:', error);
    }
});

console.log('Cron jobs scheduled');
