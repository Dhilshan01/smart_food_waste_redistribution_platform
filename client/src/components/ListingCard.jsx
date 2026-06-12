import { Link } from "react-router-dom";

const safetyConfig = {
  safe: {
    label: "Safe",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  moderate_risk: {
    label: "Moderate Risk",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  unsafe: {
    label: "Unsafe",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const ListingCard = ({ listing, showActions, onDelete, onStatusUpdate }) => {
  const safety = safetyConfig[listing.live_safety?.score || listing.safety_score] || safetyConfig.safe;
  const expiresAt = new Date(listing.expires_at);
  const hoursLeft = listing.live_safety?.hoursRemaining;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* Top color bar based on safety */}
      <div className={`h-1.5 w-full ${
        listing.live_safety?.score === "safe" ? "bg-green-500" :
        listing.live_safety?.score === "moderate_risk" ? "bg-yellow-400" : "bg-red-500"
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{listing.title}</h3>
          <span className={`ml-2 shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${safety.bg} ${safety.text} ${safety.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${safety.dot}`} />
            {safety.label}
          </span>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{listing.description}</p>
        )}

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🍱</span>
            <span>{listing.quantity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📂</span>
            <span>{listing.food_category}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📍</span>
            <span>{listing.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>⏰</span>
            <span>Expires: {expiresAt.toLocaleString()}</span>
          </div>
          {hoursLeft && (
            <div className={`flex items-center gap-2 text-sm font-medium ${
              listing.live_safety?.score === "safe" ? "text-green-600" :
              listing.live_safety?.score === "moderate_risk" ? "text-yellow-600" : "text-red-600"
            }`}>
              <span>⌛</span>
              <span>{hoursLeft} hours remaining</span>
            </div>
          )}
        </div>

        {/* Donor info */}
        {listing.donor_name && (
          <div className="text-xs text-gray-400 mb-4 border-t pt-3">
            Posted by <span className="font-medium text-gray-600">{listing.organization_name || listing.donor_name}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="flex-1 text-center text-sm bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg transition font-medium"
            >
              View Details
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(listing.id)}
                className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;