"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  TrendingUp,
  MousePointerClick,
  Globe,
  BarChart3,
} from "lucide-react";
import clsx from "clsx";
import {
  getMockPageViews,
  MOCK_PAGE_STATS,
  MOCK_TRAFFIC_SOURCES,
  DailyPageView,
} from "@/lib/newsStore";

const PERIOD_OPTIONS = [
  { label: "7 days",  value: 7  },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState(14);
  const [pageViews, setPageViews] = useState<DailyPageView[]>([]);

  useEffect(() => {
    setPageViews(getMockPageViews(period));
  }, [period]);

  const totalViews    = pageViews.reduce((s, d) => s + d.views, 0);
  const totalVisitors = pageViews.reduce((s, d) => s + d.visitors, 0);
  const avgViews      = pageViews.length ? Math.round(totalViews / pageViews.length) : 0;
  const maxViews      = pageViews.length ? Math.max(...pageViews.map((d) => d.views)) : 1;

  const STAT_CARDS = [
    {
      label: "Total Page Views",
      value: totalViews.toLocaleString("en-IN"),
      sub: `Last ${period} days`,
      icon: Eye,
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Unique Visitors",
      value: totalVisitors.toLocaleString("en-IN"),
      sub: `Last ${period} days`,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg. Daily Views",
      value: avgViews.toLocaleString("en-IN"),
      sub: "Per day",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Avg. Session Duration",
      value: "2m 48s",
      sub: "Across all pages",
      icon: MousePointerClick,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Website performance and traffic statistics.
          </p>
        </div>
        {/* Period selector */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 self-start">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Page views chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900">Daily Page Views</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Views and visitors over the last {period} days
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-brand-500 inline-block" />
              Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" />
              Visitors
            </span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-1">
          {pageViews.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-[28px]">
              <div className="w-full flex flex-col justify-end gap-0.5 h-32 relative group">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <p className="font-semibold">{day.date}</p>
                  <p>Views: {day.views.toLocaleString("en-IN")}</p>
                  <p>Visitors: {day.visitors.toLocaleString("en-IN")}</p>
                </div>
                {/* Views bar */}
                <div
                  className="w-full bg-brand-500 rounded-t transition-all hover:bg-brand-600"
                  style={{ height: `${(day.views / maxViews) * 100}%` }}
                />
                {/* Visitors bar (overlaid semi-transparent) */}
                <div
                  className="w-full bg-blue-300 rounded-t absolute bottom-0"
                  style={{
                    height: `${(day.visitors / maxViews) * 100}%`,
                    opacity: 0.5,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">
                {day.date.split(" ")[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Top Pages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                    Page
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                    Views
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">
                    Avg. Time
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 hidden sm:table-cell">
                    Bounce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_PAGE_STATS.map((p) => (
                  <tr key={p.page} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <code className="text-xs text-gray-700 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                        {p.page}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {p.views.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{p.avgTime}</span>
                    </td>
                    <td className="px-5 py-3 text-right hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{p.bounce}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic sources */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Traffic Sources</h3>
          </div>
          <div className="space-y-4">
            {MOCK_TRAFFIC_SOURCES.map((src) => (
              <div key={src.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{src.source}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {src.pct}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full transition-all", src.color)}
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Donut-style summary */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Breakdown
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_TRAFFIC_SOURCES.map((src) => (
                <div key={src.source} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      src.color
                    )}
                  />
                  <span className="text-xs text-gray-600 truncate">
                    {src.source}
                  </span>
                  <span className="text-xs font-medium text-gray-900 ml-auto">
                    {src.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center pb-4">
        Analytics data shown is simulated for demonstration. Integrate a real analytics
        provider (e.g. Google Analytics, Plausible, PostHog) for live data.
      </p>
    </div>
  );
}
