import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";

const DonorDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, claimed: 0, expired: 0 });

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">🍱 FoodShare</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.organization_name || user?.full_name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your food donations</p>
          </div>
          <Link
            to="/donor/create-listing"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Post Food
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Posted", value: stats.total, color: "text-gray-900" },
            { label: "Available", value: stats.available, color: "text-green-600" },
            { label: "Claimed", value: stats.claimed, color: "text-blue-600" },
            { label: "Expired", value: stats.expired, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Listings</h2>
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No listings yet</p>
            <Link to="/donor/create-listing" className="text-green-600 text-sm font-medium mt-2 inline-block hover:underline">
              Post your first food donation →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions={true}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;