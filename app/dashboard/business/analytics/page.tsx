"use client";

import { Eye, MessageSquare, Users, TrendingUp, ArrowUpRight } from "lucide-react";

const WEEKLY = [
  { day: "Mon", views: 45, leads: 3 },
  { day: "Tue", views: 78, leads: 6 },
  { day: "Wed", views: 62, leads: 4 },
  { day: "Thu", views: 91, leads: 8 },
  { day: "Fri", views: 110, leads: 12 },
  { day: "Sat", views: 134, leads: 14 },
  { day: "Sun", views: 88, leads: 7 },
];

const CLASSIFIEDS_PERF = [
  { title: "Grade A Office — Business Park", views: 312, leads: 14, conversion: "4.5%", trend: "+12%" },
  { title: "Cult.fit Neopolis Membership", views: 890, leads: 67, conversion: "7.5%", trend: "+34%" },
  { title: "Interior Design Services", views: 180, leads: 9, conversion: "5.0%", trend: "-3%" },
];

const LEAD_SOURCES = [
  { source: "Organic Search", count: 48, pct: 53 },
  { source: "Direct (URL)", count: 22, pct: 24 },
  { source: "Sponsored Placement", count: 14, pct: 16 },
  { source: "Newsletter", count: 6, pct: 7 },
];

const maxViews = Math.max(...WEEKLY.map((w) => w.views));

export default function BusinessAnalytics() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-400 mt-0.5">Last 30 days · Updated daily</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: "1,382", change: "+28%", icon: Eye, color: "bg-blue-50 text-blue-600" },
          { label: "Total Leads", value: "90", change: "+41%", icon: MessageSquare, color: "bg-green-50 text-green-600" },
          { label: "Profile Views", value: "428", change: "+19%", icon: Users, color: "bg-purple-50 text-purple-600" },
          { label: "Avg Conversion", value: "6.5%", change: "+0.8pp", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {s.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="card p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-4">Views This Week</h3>
        <div className="flex items-end gap-2 h-32">
          {WEEKLY.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-brand-500 rounded-t transition-all hover:bg-brand-600"
                style={{ height: `${(d.views / maxViews) * 100}%` }}
                title={`${d.views} views · ${d.leads} leads`}
              />
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500 inline-block" /> Views</span>
        </div>
      </div>

      {/* Classified performance */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-sm text-gray-900">Classified Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 text-left border-b border-gray-50">
                <th className="px-5 py-3 font-semibold">Classified</th>
                <th className="px-4 py-3 font-semibold text-right">Views</th>
                <th className="px-4 py-3 font-semibold text-right">Leads</th>
                <th className="px-4 py-3 font-semibold text-right">Conversion</th>
                <th className="px-4 py-3 font-semibold text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {CLASSIFIEDS_PERF.map((c) => (
                <tr key={c.title} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.views}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.leads}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-700">{c.conversion}</td>
                  <td className={`px-4 py-3 text-right text-xs font-bold ${c.trend.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                    {c.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead sources */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {LEAD_SOURCES.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="font-medium">{s.source}</span>
                  <span>{s.count} leads ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-3 text-sm">
            {[
              { tip: "Your Interior Design classified is underperforming — try updating the title and adding photos.", action: "Edit Classified" },
              { tip: "Upgrade the Office Space to Homepage Spot — 3× more views expected.", action: "Upgrade" },
              { tip: "Respond to 5 unanswered leads to improve your trust score.", action: "View Leads" },
            ].map((r) => (
              <li key={r.tip} className="flex gap-3 p-3 bg-brand-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-gray-700 leading-relaxed">{r.tip}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
