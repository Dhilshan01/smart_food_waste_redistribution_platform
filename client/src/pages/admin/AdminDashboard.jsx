import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === "users") fetchUsers();
    if (activeTab === "listings") fetchListings();
    if (activeTab === "claims") fetchClaims();
  }, [activeTab, fetchUsers, fetchListings, fetchClaims]);

  const handleToggleUser = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (user) => {
    const name = user.organization_name || user.full_name || user.email;
    if (!window.confirm(`Delete ${name}? This will also remove related listings, claims, transactions, and notifications.`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "listings", label: "Listings" },
    { key: "claims", label: "Claims" },
  ];

  const statusColor = {
    available: "bg-green-100 text-green-700",
    claimed: "bg-blue-100 text-blue-700",
    collected: "bg-gray-100 text-gray-700",
    expired: "bg-red-100 text-red-700",
  };

  const safetyColor = {
    safe: "bg-green-100 text-green-700",
    moderate_risk: "bg-yellow-100 text-yellow-700",
    unsafe: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && loading && (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        )}

        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Platform Overview
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Real-time statistics across the platform
              </p>
            </div>

            {/* User Stats */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Users
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Users",
                    value: stats.users.total,
                    color: "text-gray-900",
                  },
                  {
                    label: "Donors",
                    value: stats.users.donors,
                    color: "text-green-600",
                  },
                  {
                    label: "Charities",
                    value: stats.users.charities,
                    color: "text-blue-600",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Stats */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Listings
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  {
                    label: "Total",
                    value: stats.listings.total,
                    color: "text-gray-900",
                  },
                  {
                    label: "Available",
                    value: stats.listings.available,
                    color: "text-green-600",
                  },
                  {
                    label: "Claimed",
                    value: stats.listings.claimed,
                    color: "text-blue-600",
                  },
                  {
                    label: "Collected",
                    value: stats.listings.collected,
                    color: "text-gray-500",
                  },
                  {
                    label: "Expired",
                    value: stats.listings.expired,
                    color: "text-red-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Score Breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Food Safety Scores
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Safe",
                    value: stats.safety.safe,
                    color: "text-green-600",
                    bg: "bg-green-50 border-green-100",
                  },
                  {
                    label: "Moderate Risk",
                    value: stats.safety.moderate,
                    color: "text-yellow-600",
                    bg: "bg-yellow-50 border-yellow-100",
                  },
                  {
                    label: "Unsafe",
                    value: stats.safety.unsafe,
                    color: "text-red-600",
                    bg: "bg-red-50 border-red-100",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-2xl border p-5 ${s.bg}`}
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Claims
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm inline-block">
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">
                  {stats.claims.total}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Users</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Organization",
                      "City",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {u.full_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "donor"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {u.organization_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {u.city || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                            u.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === "listings" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              All Listings
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Title",
                      "Donor",
                      "City",
                      "Quantity",
                      "Status",
                      "Safety",
                      "Expires",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {l.title}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {l.organization_name || l.donor_name}
                      </td>
                      <td className="px-4 py-4 text-gray-500">{l.city}</td>
                      <td className="px-4 py-4 text-gray-500">{l.quantity}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[l.status]}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${safetyColor[l.safety_score]}`}
                        >
                          {l.safety_score?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {new Date(l.expires_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLAIMS TAB */}
        {activeTab === "claims" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Claims</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Food Item",
                      "Donor",
                      "Charity",
                      "City",
                      "Status",
                      "Claimed At",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {c.title}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {c.donor_org || c.donor_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {c.charity_org || c.charity_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{c.city}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            c.status === "collected"
                              ? "bg-green-100 text-green-700"
                              : c.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : c.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(c.claimed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
