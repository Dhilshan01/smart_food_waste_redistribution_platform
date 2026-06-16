import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      login(res.data.token, res.data.user);

      if (res.data.user.role === "donor") navigate("/donor/dashboard");
      else if (res.data.user.role === "charity") navigate("/charity/dashboard");
      else navigate("/admin/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">🍱</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your FoodShare account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <input
                type="password" name="password"
                placeholder="••••••••"
                value={formData.password} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 mt-2 text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Register free
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Demo Accounts
          </p>
          <div className="space-y-2">
            {[
              { role: "Donor", email: "donor@test.com", color: "text-green-600" },
              { role: "Charity", email: "charity@test.com", color: "text-blue-600" },
              { role: "Admin", email: "admin@foodshare.com", color: "text-red-600" },
            ].map((d) => (
              <div key={d.role} className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${d.color}`}>{d.role}</span>
                <span className="text-gray-400">{d.email} · password</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;