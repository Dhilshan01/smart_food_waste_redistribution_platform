import cron from 'node-cron';
import pool from '../config/db.js';

// Runs every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    try {
        const result = await pool.query(
            `UPDATE food_listings 
             SET status = 'expired' 
             WHERE expires_at < NOW() AND status = 'available'
             RETURNING id`
        );
        if (result.rows.length > 0) {
            console.log(`Auto-expired ${result.rows.length} listing(s)`);
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
});

console.log('Cron job scheduled: auto-expiry every 15 minutes');