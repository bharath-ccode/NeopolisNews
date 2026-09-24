import { BarChart3, CheckCircle, Zap, Rocket } from "lucide-react";

// Moved off the public /advertise page while the platform is new and
// everything is free — this is internal reference only, so we don't lose
// the pricing/phasing thinking behind it. Nothing here is buyable yet.

const DATA_PRODUCTS = [
  {
    name: "Investor Dashboard",
    price: "₹50,000/yr",
    desc: "Price heatmaps, rental yield data, appreciation trends.",
    users: "Investors, HNIs",
  },
  {
    name: "Developer Analytics",
    price: "₹1,50,000/yr",
    desc: "Inventory velocity, lead quality, competitive benchmarks.",
    users: "Developers",
  },
  {
    name: "Institutional Reports",
    price: "Custom",
    desc: "Quarterly district reports for PE funds, REITs, banks.",
    users: "PE Funds, Banks, NBFCs",
  },
];

const TIMELINE = [
  { phase: "Day 1", items: ["Developer listings", "Rental listings", "Ad placements"] },
  { phase: "Month 3", items: ["Sponsored content", "Premium features", "Newsletter"] },
  { phase: "Month 6", items: ["Resident services", "Vendor commissions", "Memberships"] },
  { phase: "Year 2", items: ["Data SaaS", "API products", "Institutional reports"] },
];

export default function AdminRoadmapPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-brand-600" /> Product & Revenue Roadmap
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Internal only — nothing on this page is live or public. Moved off /advertise while the platform is free.
          Kept here so we come back and build it.
        </p>
      </div>

      {/* Data & Analytics Products */}
      <section>
        <h3 className="font-bold text-gray-900 mb-1">Data & Analytics Products</h3>
        <p className="text-sm text-gray-500 mb-4">Public page currently just says &quot;launches Year 2, join the waitlist.&quot;</p>
        <div className="grid md:grid-cols-3 gap-4">
          {DATA_PRODUCTS.map((p) => (
            <div key={p.name} className="card p-5">
              <BarChart3 className="w-6 h-6 text-brand-500 mb-2" />
              <h4 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h4>
              <p className="text-lg font-extrabold text-brand-700 mb-1.5">{p.price}</p>
              <p className="text-xs text-gray-500 mb-2">{p.desc}</p>
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-medium">
                {p.users}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Activation Timeline */}
      <section>
        <h3 className="font-bold text-gray-900 mb-1">Revenue Activation Timeline</h3>
        <p className="text-sm text-gray-500 mb-4">Not shown publicly right now — the free-for-now positioning supersedes this until we're ready to build it out.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIMELINE.map((t) => (
            <div key={t.phase} className="card p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <span className="font-bold text-brand-700 text-sm">{t.phase}</span>
              </div>
              <ul className="space-y-1.5">
                {t.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
