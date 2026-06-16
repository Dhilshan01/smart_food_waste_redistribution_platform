import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0, available: 0, claimed: 0, expired: 0, collected: 0,
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings/my-listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
      setStats({
        total: res.data.length,
        available: res.data.filter(l => l.status === "available").length,
        claimed: res.data.filter(l => l.status === "claimed").length,
        collected: res.data.filter(l => l.status === "collected").length,
        expired: res.data.filter(l => l.status === "expired").length,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredListings = activeFilter === "all"
    ? listings
    : listings.filter(l => l.status === activeFilter);

  const filters = [
    { key: "all", label: "All", count: stats.total },
    { key: "available", label: "Available", count: stats.available },
    { key: "claimed", label: "Claimed", count: stats.claimed },
    { key: "collected", label: "Collected", count: stats.collected },
    { key: "expired", label: "Expired", count: stats.expired },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.organization_name || user?.full_name} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your food donations and track their impact
            </p>
          </div>
          <Link
            to="/donor/create-listing"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <span>+</span> Post Food Donation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Posted", value: stats.total, color: "text-gray-900", bg: "bg-white" },
            { label: "Available", value: stats.available, color: "text-green-600", bg: "bg-white" },
            { label: "Claimed", value: stats.claimed, color: "text-blue-600", bg: "bg-white" },
            { label: "Collected", value: stats.collected, color: "text-gray-500", bg: "bg-white" },
            { label: "Expired", value: stats.expired, color: "text-red-500", bg: "bg-white" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 shadow-sm text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Impact Banner */}
        {stats.collected > 0 && (
          <div className="bg-green-600 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <p className="text-white font-bold text-lg">
                {stats.collected} donation{stats.collected > 1 ? "s" : ""} successfully collected!
              </p>
              <p className="text-green-100 text-sm">
                Your contributions are making a real difference in your community.
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                activeFilter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === f.key ? "bg-white text-gray-900" : "bg-gray-100 text-gray-500"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-400 text-sm">Loading your listings...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🍱</div>
            <p className="text-gray-600 font-medium">No listings found</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              {activeFilter === "all"
                ? "You haven't posted any food donations yet"
                : `No ${activeFilter} listings`}
            </p>
            {activeFilter === "all" && (
              <Link
                to="/donor/create-listing"
                className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
              >
                Post Your First Donation
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions={true}
                onDelete={listing.status === "available" ? handleDelete : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;