import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const AnalyticsDashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/analytics/business", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const maxMonthlyValue = useMemo(() => {
    if (!analytics?.monthlyListings?.length) return 1;
    return Math.max(...analytics.monthlyListings.map((m) => Number(m.listed || 0)), 1);
  }, [analytics]);

  const maxCategoryValue = useMemo(() => {
    if (!analytics?.categoryBreakdown?.length) return 1;
    return Math.max(...analytics.categoryBreakdown.map((c) => Number(c.total || 0)), 1);
  }, [analytics]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <p className="text-gray-600 font-medium">Analytics unavailable</p>
        <p className="text-gray-400 text-sm mt-1">Try again after creating your first listing.</p>
      </div>
    );
  }

  const { summary } = analytics;
  const metricCards = [
    { label: "Food Listed", value: summary.totalListed, tone: "text-gray-900" },
    { label: "Sold", value: summary.sold, tone: "text-emerald-600" },
    { label: "Donated", value: summary.donated, tone: "text-blue-600" },
    { label: "Recovered Revenue", value: currency(summary.recoveredRevenue), tone: "text-green-600" },
    { label: "Wasted", value: summary.wasted, tone: "text-red-500" },
    { label: "Cost Savings", value: currency(summary.costSavings), tone: "text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Waste Analytics</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track redistribution, sales recovery, and waste reduction patterns.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {metricCards.map((metric) => (
          <div key={metric.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400">{metric.label}</p>
            <p className={`text-2xl font-bold mt-1 ${metric.tone}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
        summary.wasteRate <= 10 ? "bg-green-100 text-green-800" : summary.wasteRate <= 30 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
      }`}>
        Sustainability score: {Math.max(0, 100 - summary.wasteRate)}/100
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-2xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Monthly Waste Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={analytics.monthlyListings}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} />
              <Tooltip /><Legend /><Line type="monotone" dataKey="expired" stroke="#ef4444" name="Wasted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80 rounded-2xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Outcome Breakdown</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart><Pie data={[
              { name: "Sold", value: summary.sold },
              { name: "Donated", value: summary.donated },
              { name: "Wasted", value: summary.wasted },
            ]} dataKey="value" innerRadius={55} outerRadius={90} label>
              {["#10b981", "#3b82f6", "#ef4444"].map((color) => <Cell key={color} fill={color} />)}
            </Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80 rounded-2xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Food Categories</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics.categoryBreakdown}><CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="expired" fill="#f97316" name="Wasted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80 rounded-2xl border bg-white p-5">
          <h3 className="mb-4 font-semibold">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics.monthlyRevenue}><CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Utilization</p>
          <div className="space-y-4">
            {[
              { label: "Utilized", value: summary.utilizationRate, color: "bg-green-600" },
              { label: "Waste rate", value: summary.wasteRate, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${Math.min(item.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 mb-4">Monthly Listing Trends</p>
          {analytics.monthlyListings.length === 0 ? (
            <p className="text-sm text-gray-400">No monthly data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-44">
              {analytics.monthlyListings.map((month) => {
                const height = Math.max((Number(month.listed || 0) / maxMonthlyValue) * 100, 8);
                return (
                  <div key={month.month} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        className="w-full max-w-12 bg-green-600 rounded-t-lg"
                        style={{ height: `${height}%` }}
                        title={`${month.listed} listings`}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 truncate w-full text-center">{month.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Category Analysis</p>
          {analytics.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400">Create listings to see category trends.</p>
          ) : (
            <div className="space-y-3">
              {analytics.categoryBreakdown.map((category) => {
                const width = Math.max((Number(category.total || 0) / maxCategoryValue) * 100, 6);
                return (
                  <div key={category.category}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{category.category}</span>
                      <span>{category.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">Outcome Snapshot</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sales listed", value: summary.saleListings },
              { label: "Donation listings", value: summary.donationListings },
              { label: "Collected donations", value: summary.collectedDonations },
              { label: "Active sale value", value: currency(summary.activeSaleValue) },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
