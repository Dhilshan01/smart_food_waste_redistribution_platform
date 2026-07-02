import pool from "../config/db.js";
import { calculateSafetyScore } from "../utils/foodSafetyScore.js";
import { notifyCharitiesUrgent } from "../utils/notificationHelper.js";
import { calculateMatchScore } from "../utils/matchingEngine.js";

export const createListing = async (req, res) => {
    const { 
        title, description, quantity, food_category, prepared_at, expires_at, 
        pickup_address, city, listing_type, unit_price, storage_conditions,
        latitude, longitude
    } = req.body;
    const donor_id = req.user.id;

    try {
        const safety = calculateSafetyScore(prepared_at, expires_at, storage_conditions);

        const newListing = await pool.query(
            `INSERT INTO food_listings 
            (donor_id, title, description, quantity, food_category, prepared_at, expires_at, 
             pickup_address, city, safety_score, listing_type, unit_price, storage_conditions,
             safety_score_numeric, latitude, longitude)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
            [donor_id, title, description, quantity, food_category, prepared_at, expires_at, 
             pickup_address, city, safety.score, listing_type || 'donation', 
             listing_type === 'sale' ? unit_price : 0, storage_conditions || 'room_temperature',
             safety.numericScore, latitude || null, longitude || null]
        );

        await pool.query(
            `INSERT INTO food_safety_logs (listing_id, safety_score, safety_score_numeric, hours_remaining)
             VALUES ($1, $2, $3, $4)`,
            [newListing.rows[0].id, safety.score, safety.numericScore, safety.hoursRemaining]
        );

        if (safety.score === 'moderate_risk' || safety.score === 'unsafe') {
            await notifyCharitiesUrgent({
                title, city, id: newListing.rows[0].id
            });
        }

        res.status(201).json({
            message: 'Listing created successfully',
            listing: { ...newListing.rows[0], safety_details: safety }
        });

    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// CHARITY VIEW — donations only
export const getAvailableListings = async (req, res) => {
    try {
        const { city } = req.query;
        let query = `
            SELECT fl.*, u.full_name as donor_name, u.organization_name, u.phone
            FROM food_listings fl
            JOIN users u ON fl.donor_id = u.id
            WHERE fl.status = 'available' AND fl.expires_at > NOW() AND fl.listing_type = 'donation'
        `;
        const params = [];
        if (city) {
            params.push(city);
            query += ` AND fl.city ILIKE $${params.length}`;
        }
        query += ` ORDER BY fl.expires_at ASC`;

        const listings = await pool.query(query, params);
        const listingsWithScore = listings.rows.map(listing => {
            const safety = calculateSafetyScore(listing.prepared_at, listing.expires_at, listing.storage_conditions);
            return { ...listing, live_safety: safety };
        });
        res.status(200).json(listingsWithScore);
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMatchedListings = async (req, res) => {
  try {
    const [charityResult, preferenceResult, listingsResult] = await Promise.all([
      pool.query(`SELECT id, city FROM users WHERE id = $1`, [req.user.id]),
      pool.query(
        `SELECT fl.food_category, COUNT(*)::int AS claim_count
         FROM claims c JOIN food_listings fl ON fl.id = c.listing_id
         WHERE c.charity_id = $1
         GROUP BY fl.food_category ORDER BY claim_count DESC`,
        [req.user.id],
      ),
      pool.query(
        `SELECT fl.*, u.full_name AS donor_name, u.organization_name, u.phone
         FROM food_listings fl JOIN users u ON u.id = fl.donor_id
         WHERE fl.status = 'available' AND fl.expires_at > NOW()
           AND fl.listing_type = 'donation'`,
      ),
    ]);

    const charity = charityResult.rows[0];
    const preferences = preferenceResult.rows.map((row) => row.food_category);
    const matched = listingsResult.rows
      .map((listing) => {
        const liveSafety = calculateSafetyScore(
          listing.prepared_at,
          listing.expires_at,
          listing.storage_conditions,
        );
        return {
          ...listing,
          live_safety: liveSafety,
          ...calculateMatchScore(
            { ...listing, live_safety: liveSafety },
            charity,
            preferences,
          ),
        };
      })
      .sort((a, b) => b.match_score - a.match_score);

    res.status(200).json(matched);
  } catch (error) {
    console.error("Get matched listings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// BUSINESS MARKETPLACE VIEW — sale listings only
export const getMarketplaceListings = async (req, res) => {
    try {
        const { city, category, maxPrice } = req.query;
        let query = `
            SELECT fl.*, u.full_name as donor_name, u.organization_name, u.phone
            FROM food_listings fl
            JOIN users u ON fl.donor_id = u.id
            WHERE fl.status = 'available' AND fl.expires_at > NOW() AND fl.listing_type = 'sale'
              AND fl.donor_id != $1
        `;
        const params = [req.user.id];

        if (city) {
            params.push(city);
            query += ` AND fl.city ILIKE $${params.length}`;
        }
        if (category) {
            params.push(category);
            query += ` AND fl.food_category = $${params.length}`;
        }
        if (maxPrice) {
            params.push(maxPrice);
            query += ` AND fl.unit_price <= $${params.length}`;
        }
        query += ` ORDER BY fl.expires_at ASC`;

        const listings = await pool.query(query, params);
        const listingsWithScore = listings.rows.map(listing => {
            const safety = calculateSafetyScore(listing.prepared_at, listing.expires_at, listing.storage_conditions);
            return { ...listing, live_safety: safety };
        });
        res.status(200).json(listingsWithScore);
    } catch (error) {
        console.error('Get marketplace error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyListings = async (req, res) => {
  try {
    const listings = await pool.query(
      `SELECT * FROM food_listings WHERE donor_id = $1 ORDER BY created_at DESC`,
      [req.user.id],
    );

    const listingsWithScore = listings.rows.map((listing) => {
      const safety = calculateSafetyScore(
        listing.prepared_at,
        listing.expires_at,
        listing.storage_conditions,
      );
      return { ...listing, live_safety: safety };
    });

    res.status(200).json(listingsWithScore);
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await pool.query(
      `SELECT fl.*, u.full_name as donor_name, u.organization_name, u.phone
             FROM food_listings fl
             JOIN users u ON fl.donor_id = u.id
             WHERE fl.id = $1`,
      [req.params.id],
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const safety = calculateSafetyScore(
      listing.rows[0].prepared_at,
      listing.rows[0].expires_at,
      listing.rows[0].storage_conditions,
    );
    res.status(200).json({ ...listing.rows[0], live_safety: safety });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateListingStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const listing = await pool.query(
      `UPDATE food_listings SET status = $1 WHERE id = $2 AND donor_id = $3 RETURNING *`,
      [status, req.params.id, req.user.id],
    );

    if (listing.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Listing not found or unauthorized" });
    }

    res
      .status(200)
      .json({ message: "Status updated", listing: listing.rows[0] });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await pool.query(
      `DELETE FROM food_listings WHERE id = $1 AND donor_id = $2 RETURNING *`,
      [req.params.id, req.user.id],
    );

    if (listing.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Listing not found or unauthorized" });
    }

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
