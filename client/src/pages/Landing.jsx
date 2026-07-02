import { Link } from "react-router-dom";

const metrics = [
  { value: "1 in 3", label: "Meals produced globally are wasted", delay: "animate-delay-100" },
  { value: "820M+", label: "People face hunger worldwide", delay: "animate-delay-200" },
  { value: "Real-time", label: "Safety and expiry monitoring", delay: "animate-delay-300" },
];

const roles = [
  {
    title: "Businesses and donors",
    description: "Post surplus food, choose donation or sale, track collections, and measure recovered value.",
    items: ["Create listings", "Sell surplus stock", "Donate to charities", "View waste analytics"],
  },
  {
    title: "Charity organizations",
    description: "Browse safe donation listings, claim food, and manage collection status from one workspace.",
    items: ["Find donations", "Claim food", "Track collections", "Prioritize urgent listings"],
  },
  {
    title: "System administrators",
    description: "Monitor users, listings, claims, safety risk, and platform activity across the system.",
    items: ["Manage users", "Monitor listings", "Review claims", "View platform metrics"],
  },
];

const workflow = [
  {
    step: "01",
    title: "Register",
    description: "Businesses, charities, and admins access role-specific dashboards after authentication.",
  },
  {
    step: "02",
    title: "List surplus food",
    description: "A donor enters food details, quantity, pickup location, expiry time, storage conditions, and listing type.",
  },
  {
    step: "03",
    title: "Score safety",
    description: "The platform calculates a live score using preparation time, expiry time, and storage conditions.",
  },
  {
    step: "04",
    title: "Redistribute",
    description: "Businesses purchase sale listings, while charities claim donation listings before collection.",
  },
];

const modules = [
  "JWT authentication and role-based access control",
  "Surplus food listing management",
  "B2B marketplace for discounted food sales",
  "Charity donation claim workflow",
  "Food safety scoring and expiry warnings",
  "Waste analytics and sustainability reporting",
];

const safetyLevels = [
  {
    label: "Safe",
    range: "80-100",
    description: "Good remaining shelf life. Suitable for sale or donation.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    label: "Moderate Risk",
    range: "50-79",
    description: "Needs quick action. Prioritize collection before expiry.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    label: "Unsafe",
    range: "0-49",
    description: "High risk or expired. Avoid redistribution and handle safely.",
    className: "border-red-200 bg-red-50 text-red-800",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_420px]">
          <div className="relative max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Smart surplus food management platform
            </p>
            <h1 className="animate-fade-up mt-5 text-5xl font-black tracking-tight text-white sm:text-6xl">
              FoodFlow
            </h1>
            <p className="animate-fade-up animate-delay-100 mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
              A web platform that helps businesses redistribute surplus food through B2B sales,
              charity donations, expiry tracking, food safety scoring, and waste analytics.
            </p>
            <div className="animate-fade-up animate-delay-200 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="interactive-lift inline-flex justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="interactive-lift inline-flex justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="animate-fade-up animate-delay-300 animate-soft-float relative rounded-lg border border-white/15 bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <p className="text-sm font-black text-slate-950">System activity</p>
              <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                <span className="animate-status-pulse h-2 w-2 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Connects food donors, business buyers, charities, and admins.",
                "Scores each listing before redistribution.",
                "Tracks sales, donations, collected food, and expired food.",
                "Supports analytics for waste reduction decisions.",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`animate-fade-up rounded-lg border border-slate-200 bg-slate-50 p-3 ${
                    index === 0
                      ? "animate-delay-100"
                      : index === 1
                        ? "animate-delay-200"
                        : index === 2
                          ? "animate-delay-300"
                          : "animate-delay-400"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`interactive-lift animate-fade-up ${metric.delay} rounded-lg border border-slate-200 p-5`}
            >
              <p className="text-3xl font-black text-slate-950">{metric.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">User roles</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Designed for every participant in the redistribution process.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {roles.map((role) => (
              <article key={role.title} className="interactive-lift rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-950">{role.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{role.description}</p>
                <ul className="mt-5 space-y-2">
                  {role.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">How to use</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                From surplus food to measurable impact.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                The workflow is intentionally simple so food can be listed, scored, reserved,
                collected, and reported before it expires.
              </p>
            </div>

            <div className="grid gap-3">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="interactive-lift grid gap-4 rounded-lg border border-slate-200 p-5 sm:grid-cols-[70px_1fr]"
                >
                  <span className="relative text-2xl font-black text-emerald-700">
                    {item.step}
                    <span className="animate-status-pulse absolute -right-2 top-1 h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Core modules</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              What is included in the platform.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {modules.map((module) => (
                <div key={module} className="interactive-lift rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="block h-1.5 w-8 rounded-full bg-emerald-600" />
                  <p className="mt-4 text-sm font-bold leading-relaxed text-slate-800">{module}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Food safety scoring</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Every listing receives a risk category.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The score is calculated from preparation time, time remaining before expiry,
              storage conditions, and food category context.
            </p>
            <div className="mt-6 space-y-3">
              {safetyLevels.map((level) => (
                <div key={level.label} className={`interactive-lift rounded-lg border p-4 ${level.className}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">{level.label}</p>
                    <p className="text-xs font-black">{level.range}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Ready to begin</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Reduce waste while improving redistribution decisions.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Register as a food donor or charity organization and start using the platform workflow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="inline-flex justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold">FoodFlow · Smart food redistribution</p>
          <nav className="flex gap-5 text-sm">
            <Link to="/">Home</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
