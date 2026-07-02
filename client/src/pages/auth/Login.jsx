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
      setError(
        err.response?.data?.message ||
          (err.request ? "Cannot reach the server. Check that the backend is running on port 5000." : "Login failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
              FF
            </span>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-400">Sign in to your FoodFlow account</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-green-600 hover:underline">
              Register free
            </Link>
          </p>
          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-700">Demo accounts</p>
            <p className="mt-2 text-xs text-gray-500">Ask the system administrator for the donor, charity, and admin demo credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
