import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const safetyConfig = {
  safe: { label: "Safe", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  moderate_risk: { label: "Moderate", className: "bg-amber-50 text-amber-700 border-amber-200" },
  unsafe: { label: "Unsafe", className: "bg-red-50 text-red-700 border-red-200" },
};

const categories = ["Cooked Meal", "Bakery", "Fruits & Vegetables", "Dairy", "Beverages", "Packaged Food"];

const Marketplace = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/listings/marketplace", {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: cityFilter, category: categoryFilter, maxPrice },
      });
      setListings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, cityFilter, maxPrice, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  const totals = useMemo(() => {
    const safe = listings.filter((listing) => listing.live_safety?.score === "safe").length;
    const urgent = listings.filter((listing) => listing.live_safety?.score === "moderate_risk").length;
    const value = listings.reduce((sum, listing) => sum + Number(listing.unit_price || 0), 0);
    return { safe, urgent, value };
  }, [listings]);

  const handlePurchase = async (listingId, quantity) => {
    if (!window.confirm("Confirm purchase of this listing?")) return;
    setPurchasingId(listingId);
    try {
      await axios.post(
        "http://localhost:5000/api/transactions",
        { listing_id: listingId, quantity_purchased: quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccessId(listingId);
      setTimeout(() => {
        setSuccessId(null);
        fetchListings();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    } finally {
      setPurchasingId(null);
    }
  };

  const clearFilters = () => {
    setCityFilter("");
    setCategoryFilter("");
    setMaxPrice("");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Procurement network</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">B2B marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">
            Source safe surplus food from nearby businesses before it expires.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-96">
          {[
            { label: "Listings", value: listings.length },
            { label: "Safe", value: totals.safe },
            { label: "Value", value: `Rs ${totals.value.toFixed(0)}` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              <p className="text-lg font-black text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-950">Filters</h2>
            {(cityFilter || categoryFilter || maxPrice) && (
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-red-600 hover:text-red-700">
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">City</label>
              <input
                type="text"
                placeholder="Colombo"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Max price</label>
              <input
                type="number"
                placeholder="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {totals.urgent > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-black text-amber-800">{totals.urgent} urgent listing(s)</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">Prioritize items with moderate safety risk.</p>
            </div>
          )}
        </aside>

        <section>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-sm font-semibold text-slate-500">
              Loading marketplace inventory...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="text-base font-black text-slate-950">No sale listings found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing filters or check back when businesses post surplus stock.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {listings.map((listing) => {
                const safety = safetyConfig[listing.live_safety?.score] || safetyConfig.safe;
                return (
                  <article
                    key={listing.id}
                    className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  >
                    {successId === listing.id && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-600">
                        <p className="text-sm font-black text-white">Purchase created</p>
                      </div>
                    )}
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">{listing.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${safety.className}`}>
                          {safety.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">Quantity</dt>
                          <dd className="mt-1 font-bold text-slate-900">{listing.quantity}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">Category</dt>
                          <dd className="mt-1 font-bold text-slate-900">{listing.food_category}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">City</dt>
                          <dd className="mt-1 font-bold text-slate-900">{listing.city}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold text-slate-500">Expires</dt>
                          <dd className="mt-1 font-bold text-slate-900">{new Date(listing.expires_at).toLocaleString()}</dd>
                        </div>
                      </dl>

                      <div className="flex flex-col justify-between rounded-lg bg-slate-50 p-4 sm:w-40">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Total price</p>
                          <p className="mt-1 text-2xl font-black text-emerald-700">
                            Rs {Number(listing.unit_price || 0).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePurchase(listing.id, listing.quantity)}
                          disabled={purchasingId === listing.id}
                          className="mt-4 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {purchasingId === listing.id ? "Processing" : "Purchase"}
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500">
                      Supplier: {listing.organization_name || listing.donor_name || "Business"}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Marketplace;
