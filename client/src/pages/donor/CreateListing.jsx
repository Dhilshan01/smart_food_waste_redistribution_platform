import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const categories = [
  "Cooked Meal",
  "Bakery",
  "Fruits & Vegetables",
  "Dairy",
  "Beverages",
  "Packaged Food",
  "Other",
];

const storageLabels = {
  room_temperature: "Room temperature",
  refrigerated: "Refrigerated",
  frozen: "Frozen",
};

const getSafetyPreview = (preparedAt, expiresAt, storageConditions) => {
  if (!expiresAt || !preparedAt) {
    return {
      label: "Pending",
      score: "--",
      tone: "slate",
      hoursRemaining: "--",
      action: "Add preparation and expiry times to calculate safety.",
    };
  }

  const now = new Date();
  const expiry = new Date(expiresAt);
  const prepared = new Date(preparedAt);
  const hoursRemaining = (expiry - now) / (1000 * 60 * 60);
  const shelfLife = (expiry - prepared) / (1000 * 60 * 60);
  let score = shelfLife > 0 ? Math.round((hoursRemaining / shelfLife) * 100) : 0;

  if (storageConditions === "refrigerated") score += 5;
  if (storageConditions === "frozen") score += 10;
  if (storageConditions === "room_temperature") score -= 5;
  score = Math.max(0, Math.min(100, score));

  if (hoursRemaining <= 0) {
    return {
      label: "Expired",
      score: 0,
      tone: "red",
      hoursRemaining: "0.0",
      action: "Do not list expired food. Adjust the expiry time.",
    };
  }

  if (score >= 80) {
    return {
      label: "Safe",
      score,
      tone: "emerald",
      hoursRemaining: hoursRemaining.toFixed(1),
      action: "Safe for sale or donation.",
    };
  }

  if (score >= 50) {
    return {
      label: "Moderate Risk",
      score,
      tone: "amber",
      hoursRemaining: hoursRemaining.toFixed(1),
      action: "Prioritize quick collection.",
    };
  }

  return {
    label: "Unsafe",
    score,
    tone: "red",
    hoursRemaining: hoursRemaining.toFixed(1),
    action: "High risk. Update details or discard safely.",
  };
};

const toneClasses = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

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
    listing_type: "donation",
    unit_price: "",
    storage_conditions: "room_temperature",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const safety = useMemo(
    () => getSafetyPreview(formData.prepared_at, formData.expires_at, formData.storage_conditions),
    [formData.prepared_at, formData.expires_at, formData.storage_conditions],
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (listingType) => {
    setFormData({
      ...formData,
      listing_type: listingType,
      unit_price: listingType === "donation" ? "" : formData.unit_price,
    });
  };

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
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Listing intake</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Create surplus listing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish food for donation or B2B resale with live safety scoring.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/donor/dashboard")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to workspace
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-950">Redistribution mode</h2>
                <p className="mt-1 text-xs text-slate-500">Choose how this surplus item should move.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "donation", title: "Donation", desc: "Available to charities at no cost." },
                { key: "sale", title: "B2B Sale", desc: "Recover value through discounted resale." },
              ].map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleTypeChange(type.key)}
                  className={`rounded-lg border p-4 text-left transition ${
                    formData.listing_type === type.key
                      ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-black text-slate-950">{type.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">{type.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Food details</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Food title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Fresh bread loaves"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Description</label>
                <textarea
                  name="description"
                  placeholder="Portion size, allergens, packaging notes..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    placeholder="50 loaves"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Colombo"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">Food category</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData({ ...formData, food_category: category })}
                      className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                        formData.food_category === category
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="mr-2" aria-hidden="true">{["🍲", "🥖", "🍎", "🥛", "🥤", "📦", "🍽️"][index]}</span>
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Storage conditions</label>
                <select
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="room_temperature">Room temperature</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Timing and pickup</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Prepared at</label>
                  <input
                    type="datetime-local"
                    name="prepared_at"
                    value={formData.prepared_at}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Expires at</label>
                  <input
                    type="datetime-local"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Pickup address</label>
                <input
                  type="text"
                  name="pickup_address"
                  placeholder="Street address for collection"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              {formData.listing_type === "sale" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Total listing price</label>
                  <input
                    type="number"
                    name="unit_price"
                    step="0.01"
                    min="0"
                    placeholder="15.00"
                    value={formData.unit_price}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-slate-950">Safety score</h2>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${toneClasses[safety.tone]}`}>
                {safety.label}
              </span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <span className="text-5xl font-black tracking-tight text-slate-950">{safety.score}</span>
              <span className="pb-2 text-sm font-semibold text-slate-500">/ 100</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full ${
                  safety.tone === "emerald" ? "bg-emerald-600" : safety.tone === "amber" ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: safety.score === "--" ? "0%" : `${safety.score}%` }}
              />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Time left</dt>
                <dd className="mt-1 font-black text-slate-950">{safety.hoursRemaining}h</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold text-slate-500">Storage</dt>
                <dd className="mt-1 font-black text-slate-950">{storageLabels[formData.storage_conditions]}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">{safety.action}</p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Listing preview</h2>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950">{formData.title || "Untitled food item"}</p>
                  <p className="mt-1 text-xs text-slate-500">{formData.food_category || "Category not selected"}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                  {formData.listing_type}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>{formData.quantity || "Quantity pending"}</p>
                <p>{formData.city || "City pending"}</p>
                <p>{formData.pickup_address || "Pickup address pending"}</p>
                {formData.listing_type === "sale" && (
                  <p className="font-black text-emerald-700">Rs {Number(formData.unit_price || 0).toFixed(2)}</p>
                )}
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg px-4 py-3 text-sm font-black text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              formData.listing_type === "sale" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Publishing..." : formData.listing_type === "sale" ? "Publish sale listing" : "Publish donation"}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default CreateListing;
