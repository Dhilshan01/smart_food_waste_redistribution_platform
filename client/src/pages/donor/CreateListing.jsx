import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const categories = [
  { value: "Cooked Meal", icon: "🍛" },
  { value: "Bakery", icon: "🍞" },
  { value: "Fruits & Vegetables", icon: "🥦" },
  { value: "Dairy", icon: "🥛" },
  { value: "Beverages", icon: "🧃" },
  { value: "Packaged Food", icon: "📦" },
  { value: "Other", icon: "🍽️" },
];

const CreateListing = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    food_category: "",
    prepared_at: "",
    expires_at: "",
    pickup_address: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live safety score preview
  const getLiveScore = () => {
    if (!formData.expires_at) return null;
    const now = new Date();
    const expiry = new Date(formData.expires_at);
    const hours = (expiry - now) / (1000 * 60 * 60);
    if (hours <= 0) return { label: "Expired", color: "text-red-600", bg: "bg-red-50 border-red-200", dot: "bg-red-500" };
    if (hours <= 2) return { label: "Unsafe", color: "text-red-600", bg: "bg-red-50 border-red-200", dot: "bg-red-500" };
    if (hours <= 6) return { label: "Moderate Risk", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" };
    return { label: "Safe", color: "text-green-600", bg: "bg-green-50 border-green-200", dot: "bg-green-500" };
  };

  const liveScore = getLiveScore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/listings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/donor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post Food Donation</h1>
          <p className="text-gray-400 text-sm mt-1">
            Fill in the details — the system will automatically calculate a food safety score
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Food Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Title</label>
              <input
                type="text" name="title"
                placeholder="e.g. Leftover Rice and Curry"
                value={formData.title} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                placeholder="Describe the food, portion size, allergens..."
                value={formData.description} onChange={handleChange} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                <input
                  type="text" name="quantity"
                  placeholder="e.g. 20 portions"
                  value={formData.quantity} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text" name="city"
                  placeholder="e.g. Colombo"
                  value={formData.city} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Category</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, food_category: cat.value })}
                    className={`p-3 rounded-xl border text-center transition ${
                      formData.food_category === cat.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="text-xs text-gray-600 leading-tight">{cat.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time & Safety */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Time & Safety
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prepared At</label>
                <input
                  type="datetime-local" name="prepared_at"
                  value={formData.prepared_at} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expires At</label>
                <input
                  type="datetime-local" name="expires_at"
                  value={formData.expires_at} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>

            {/* Live Safety Score Preview */}
            {liveScore && (
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${liveScore.bg}`}>
                <span className={`w-3 h-3 rounded-full shrink-0 ${liveScore.dot}`} />
                <div>
                  <p className={`text-sm font-semibold ${liveScore.color}`}>
                    Predicted Safety Score: {liveScore.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Based on your selected expiry time
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pickup Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Pickup Location
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address</label>
              <input
                type="text" name="pickup_address"
                placeholder="Street address for food pickup"
                value={formData.pickup_address} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex gap-3">
            <span className="text-lg shrink-0">🛡️</span>
            <p className="text-xs text-gray-400 leading-relaxed">
              By submitting, you confirm this food is safe for consumption and has been properly stored.
              The system will automatically score this listing and notify nearby charities if it is urgent.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? "Posting..." : "Post Food Donation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;