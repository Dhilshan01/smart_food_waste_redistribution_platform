import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";

const MatchedListings = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/listings/matched", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load matches.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const claim = async (id) => {
    setClaimingId(id);
    try {
      await axios.post(
        "/api/claims",
        { listing_id: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setListings((current) => current.filter((listing) => listing.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not claim this listing.");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Calculating your matches...</div>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-black text-slate-950">Matched For You</h2>
      <p className="mt-1 text-sm text-slate-500">Ranked using location, safety, urgency, and your claim history.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <div key={listing.id} className="relative">
            <div className={`absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-black ${
              listing.match_score >= 80
                ? "bg-emerald-100 text-emerald-800"
                : listing.match_score >= 50
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-700"
            }`}>
              {listing.match_score}% match
            </div>
            <ListingCard listing={listing} showActions onClaim={claim} />
            <div className="-mt-4 flex flex-wrap gap-1 rounded-b-lg border border-t-0 border-slate-200 bg-white px-4 pb-4">
              {listing.match_reasons.map((reason) => (
                <span key={reason} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {reason}
                </span>
              ))}
              {claimingId === listing.id && <span className="text-xs text-emerald-700">Claiming...</span>}
            </div>
          </div>
        ))}
      </div>
      {listings.length === 0 && <p className="py-20 text-center text-slate-500">No matching donations available.</p>}
    </section>
  );
};

export default MatchedListings;
