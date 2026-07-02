CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('donor','charity','admin')), organization_name TEXT, phone TEXT,
 address TEXT, city TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS food_listings (
 id SERIAL PRIMARY KEY, donor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT, quantity TEXT NOT NULL, food_category TEXT,
 prepared_at TIMESTAMPTZ NOT NULL, expires_at TIMESTAMPTZ NOT NULL, pickup_address TEXT, city TEXT,
 status TEXT DEFAULT 'available', safety_score TEXT, safety_score_numeric INT CHECK(safety_score_numeric BETWEEN 0 AND 100),
 listing_type TEXT DEFAULT 'donation' CHECK(listing_type IN ('sale','donation')),
 unit_price NUMERIC(12,2) DEFAULT 0, storage_conditions TEXT, latitude NUMERIC, longitude NUMERIC,
 created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS claims (
 id SERIAL PRIMARY KEY, listing_id INT REFERENCES food_listings(id) ON DELETE CASCADE,
 charity_id INT REFERENCES users(id) ON DELETE CASCADE, notes TEXT, status TEXT DEFAULT 'pending',
 claimed_at TIMESTAMPTZ DEFAULT NOW(), collected_at TIMESTAMPTZ, UNIQUE(listing_id,charity_id)
);
CREATE TABLE IF NOT EXISTS notifications (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, title TEXT, message TEXT,
 type TEXT DEFAULT 'general', is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS food_safety_logs (
 id SERIAL PRIMARY KEY, listing_id INT REFERENCES food_listings(id) ON DELETE CASCADE,
 safety_score TEXT, safety_score_numeric INT, hours_remaining NUMERIC, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS business_profiles (
 id SERIAL PRIMARY KEY, user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 registration_number TEXT, business_type TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS transactions (
 id SERIAL PRIMARY KEY, listing_id INT REFERENCES food_listings(id) ON DELETE CASCADE,
 seller_id INT REFERENCES users(id) ON DELETE CASCADE, buyer_id INT REFERENCES users(id) ON DELETE CASCADE,
 quantity_purchased TEXT, unit_price NUMERIC(12,2), total_amount NUMERIC(12,2),
 status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), collected_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS waste_analytics (
 id SERIAL PRIMARY KEY, business_id INT REFERENCES users(id) ON DELETE CASCADE,
 listing_id INT REFERENCES food_listings(id) ON DELETE CASCADE,
 outcome TEXT CHECK(outcome IN ('sold','donated','wasted')), estimated_value NUMERIC(12,2) DEFAULT 0,
 created_at TIMESTAMPTZ DEFAULT NOW()
);
