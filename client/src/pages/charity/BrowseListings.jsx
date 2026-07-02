import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";

const BrowseListings = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [safetyFilter, setSafetyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/listings/available",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { city: cityFilter },
        },
      );
      setListings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [cityFilter, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  const categories = [...new Set(listings.map((listing) => listing.food_category).filter(Boolean))];
  const filteredListings = listings.filter(
    (listing) =>
      (!safetyFilter || listing.live_safety?.score === safetyFilter) &&
      (!categoryFilter || listing.food_category === categoryFilter),
  );

  const urgentCount = listings.filter(
    (l) => l.live_safety?.score === "moderate_risk",
  ).length;

  const handleClaim = async (listingId) => {
    setClaimingId(listingId);
    try {
      await axios.post(
        "http://localhost:5000/api/claims",
        { listing_id: listingId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccessId(listingId);
      setTimeout(() => {
        setListings((current) => current.filter((listing) => listing.id !== listingId));
        setSuccessId(null);
      }, 700);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim");
    } finally {
      setClaimingId(null);
    }
  };

  // In your ListingCard inside the map:

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Available Food Donations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}{" "}
            available
            {urgentCount > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                · {urgentCount} urgent
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={safetyFilter}
            onChange={(e) => setSafetyFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Safety Levels</option>
            <option value="safe">✅ Safe</option>
            <option value="moderate_risk">⚠️ Moderate Risk</option>
            <option value="unsafe">❌ Unsafe</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm">
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
          {(cityFilter || safetyFilter || categoryFilter) && (
            <button
              onClick={() => {
                setCityFilter("");
                setSafetyFilter("");
                setCategoryFilter("");
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium px-3"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Urgent Alert Banner */}
        {urgentCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-red-500 text-xl">🚨</span>
            <div>
              <p className="text-red-700 font-semibold text-sm">
                Urgent Collection Needed
              </p>
              <p className="text-red-500 text-xs mt-0.5">
                {urgentCount} listing{urgentCount !== 1 ? "s are" : " is"}{" "}
                expiring soon — collect before they expire
              </p>
            </div>
            <button onClick={() => setSafetyFilter("moderate_risk")}
              className="ml-auto rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">
              View Urgent
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">
            Loading listings...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No listings found</p>
            <p className="text-gray-300 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard listing={listing} showActions={true} onClaim={handleClaim} />
                {claimingId === listing.id && <div className="absolute inset-0 grid place-items-center rounded-lg bg-white/80 font-bold">Claiming...</div>}
                {successId === listing.id && <div className="absolute inset-0 grid place-items-center rounded-lg bg-green-600/90 font-bold text-white">Claimed successfully</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseListings;
