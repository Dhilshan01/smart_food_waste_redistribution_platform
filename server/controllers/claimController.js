import pool from "../config/db.js";
import { createNotification } from "../utils/notificationHelper.js";

// CLAIM A LISTING (charity only)
export const claimListing = async (req, res) => {
  const { listing_id, notes } = req.body;
  const charity_id = req.user.id;

  try {
    // Check listing exists and is available
    const listing = await pool.query(
      `SELECT * FROM food_listings WHERE id = $1 AND COALESCE(status, 'available') = 'available'`,
      [listing_id],
    );
    if (listing.rows.length === 0) {
      return res.status(400).json({ message: "Listing not available" });
    }

    // Check not already claimed by this charity
    const existing = await pool.query(
      `SELECT * FROM claims WHERE listing_id = $1 AND charity_id = $2`,
      [listing_id, charity_id],
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already claimed this listing" });
    }

    // Create claim
    const claim = await pool.query(
      `INSERT INTO claims (listing_id, charity_id, notes)
             VALUES ($1, $2, $3) RETURNING *`,
      [listing_id, charity_id, notes],
    );

    // Update listing status to claimed
    await pool.query(
      `UPDATE food_listings SET status = 'claimed' WHERE id = $1`,
      [listing_id],
    );

    await createNotification(
      listing.rows[0].donor_id,
      "Your Food Was Claimed",
      `Your listing "${listing.rows[0].title}" has been claimed by a charitable organization.`,
      "claimed",
    );

    res.status(201).json({
      message: "Listing claimed successfully",
      claim: claim.rows[0],
    });
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY CLAIMS (charity)
export const getMyClaims = async (req, res) => {
  try {
    const claims = await pool.query(
      `SELECT c.*, fl.title, fl.quantity, fl.city, fl.expires_at, fl.food_category,
                    u.organization_name as donor_org
             FROM claims c
             JOIN food_listings fl ON c.listing_id = fl.id
             JOIN users u ON fl.donor_id = u.id
             WHERE c.charity_id = $1
             ORDER BY c.claimed_at DESC`,
      [req.user.id],
    );
    res.status(200).json(claims.rows);
  } catch (error) {
    console.error("Get claims error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// MARK AS COLLECTED
export const markCollected = async (req, res) => {
  try {
    const claim = await pool.query(
      `UPDATE claims SET status = 'collected', collected_at = NOW()
             WHERE id = $1 AND charity_id = $2 RETURNING *`,
      [req.params.id, req.user.id],
    );

    if (claim.rows.length === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Update listing status
    await pool.query(
      `UPDATE food_listings SET status = 'collected' WHERE id = $1`,
      [claim.rows[0].listing_id],
    );

    const listingData = await pool.query(
      `SELECT title, donor_id, unit_price FROM food_listings WHERE id = $1`,
      [claim.rows[0].listing_id],
    );

    if (listingData.rows.length > 0) {
      await pool.query(
        `INSERT INTO waste_analytics (business_id, listing_id, outcome, estimated_value)
         VALUES ($1, $2, 'donated', $3)`,
        [
          listingData.rows[0].donor_id,
          claim.rows[0].listing_id,
          Number(listingData.rows[0].unit_price || 0),
        ],
      );
      await createNotification(
        listingData.rows[0].donor_id,
        "Food Successfully Collected",
        `Your donation "${listingData.rows[0].title}" has been collected. Thank you for your contribution!`,
        "collected",
      );
    }

    res
      .status(200)
      .json({ message: "Marked as collected", claim: claim.rows[0] });
  } catch (error) {
    console.error("Mark collected error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
