import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BrowseListings from "./BrowseListings";


const CharityDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  const fetchClaims = useCallback(async () => {
    setLoadingClaims(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/claims/my-claims",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClaims(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingClaims(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === "my-claims") fetchClaims();
  }, [activeTab, fetchClaims]);

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    collected: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          {[
            { key: "browse", label: "Browse Food" },
            { key: "my-claims", label: "My Claims" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "browse" && <BrowseListings />}

      {activeTab === "my-claims" && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Claims</h2>
          {loadingClaims ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No claims yet</p>
              <button
                onClick={() => setActiveTab("browse")}
                className="text-green-600 text-sm font-medium mt-2 hover:underline"
              >
                Browse available food →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {claim.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {claim.quantity} · {claim.city}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Claimed on{" "}
                        {new Date(claim.claimed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[claim.status]}`}
                    >
                      {claim.status.charAt(0).toUpperCase() +
                        claim.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharityDashboard;
