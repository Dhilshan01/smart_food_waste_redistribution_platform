import { Link } from "react-router-dom";

const stats = [
  { value: "1 in 3", label: "Meals produced globally are wasted" },
  { value: "820M+", label: "People face hunger worldwide" },
  { value: "Real-time", label: "Food safety scoring system" },
];

const features = [
  {
    icon: "🍱",
    title: "Post Surplus Food",
    description: "Restaurants, bakeries, hotels and event organizers can post surplus food in minutes.",
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
  },
  {
    icon: "🚨",
    title: "Urgency Notifications",
    description: "Charities receive real-time alerts for food nearing expiry so nothing goes to waste.",
    color: "bg-red-50 border-red-100",
    iconBg: "bg-red-100",
  },
  {
    icon: "🛡️",
    title: "Food Safety Scoring",
    description: "Every listing is automatically scored as Safe, Moderate Risk, or Unsafe based on time.",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: "🤝",
    title: "Direct Charity Matching",
    description: "Charitable organizations browse and claim donations with a single click.",
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
  },
  {
    icon: "⏰",
    title: "Auto Expiry System",
    description: "Expired listings are automatically hidden to prevent unsafe food redistribution.",
    color: "bg-yellow-50 border-yellow-100",
    iconBg: "bg-yellow-100",
  },
  {
    icon: "📊",
    title: "Impact Analytics",
    description: "Admins monitor platform activity, user management, and food redistribution stats.",
    color: "bg-gray-50 border-gray-100",
    iconBg: "bg-gray-100",
  },
];

const howItWorks = [
  { step: "01", title: "Register", description: "Sign up as a Food Donor or Charitable Organization.", icon: "📝" },
  { step: "02", title: "Post or Browse", description: "Donors post surplus food. Charities browse available listings.", icon: "🔍" },
  { step: "03", title: "Safety Check", description: "System scores every listing based on preparation and expiry time.", icon: "🛡️" },
  { step: "04", title: "Collect", description: "Charity claims the food and collects it before it expires.", icon: "✅" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-white pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            Smart Food Waste Redistribution Platform
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Food that's wasted today
            <span className="text-green-600"> could feed someone</span> tomorrow
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A real-time platform connecting food donors with charitable organizations —
            with built-in food safety scoring to ensure every donation is safe to consume.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm shadow-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-white mb-2">{s.value}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete platform for safe, efficient, and coordinated food redistribution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className={`rounded-2xl border p-6 ${f.color}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Simple steps to reduce food waste and feed communities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{step.step}</span>
                  <h3 className="font-semibold text-gray-900 mt-1 mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-gray-300 text-lg z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Scoring Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Food Safety Scoring</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Our rule-based algorithm evaluates every listing in real-time based on
              preparation time and expiry duration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: "Safe",
                hours: "More than 6 hours remaining",
                description: "Food is well within safe consumption time. Ideal for collection.",
                bg: "bg-green-50 border-green-200",
                badge: "bg-green-100 text-green-700",
                dot: "bg-green-500",
              },
              {
                label: "Moderate Risk",
                hours: "2 to 6 hours remaining",
                description: "Food should be collected urgently. Charities are notified immediately.",
                bg: "bg-yellow-50 border-yellow-200",
                badge: "bg-yellow-100 text-yellow-700",
                dot: "bg-yellow-500",
              },
              {
                label: "Unsafe",
                hours: "Less than 2 hours remaining",
                description: "Food is near expiry. Listing will be auto-removed from the platform.",
                bg: "bg-red-50 border-red-200",
                badge: "bg-red-100 text-red-700",
                dot: "bg-red-500",
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-6 ${s.bg}`}>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${s.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <p className="font-semibold text-gray-800 text-sm mb-2">{s.hours}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join donors and charities already using FoodShare to reduce waste and feed communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition text-sm"
            >
              Register as Donor
            </Link>
            <Link
              to="/register"
              className="bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-green-800 transition text-sm border border-green-500"
            >
              Register as Charity
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍱</span>
            <span className="font-bold text-white">Food<span className="text-green-400">Share</span></span>
          </div>
          <p className="text-gray-500 text-sm">
            Smart Food Waste Redistribution Platform · Final Year Project
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm transition">Sign In</Link>
            <Link to="/register" className="text-gray-400 hover:text-white text-sm transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;