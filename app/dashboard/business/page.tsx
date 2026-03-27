"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Eye,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Star,
  CheckCircle,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MOCK_CLASSIFIEDS = [
  { id: "c1", title: "2,500 sq ft Grade A Office Space — Business Park Block B", category: "Office Leasing", price: "₹2.8L/mo", status: "Active", views: 312, leads: 14 },
  { id: "c2", title: "Grand Opening: Cult.fit Neopolis — Join Now at ₹1,499/mo", category: "Fitness", price: "₹1,499/mo", status: "Active", views: 890, leads: 67 },
  { id: "c3", title: "Interior Design Services — Residential & Commercial", category: "Services", price: "₹Starting 2.5L", status: "Paused", views: 180, leads: 9 },
];

const MOCK_RECENT_LEADS = [
  { id: "ld1", name: "Vikram Nair", enquiry: "2,500 sq ft Office Space", time: "1 hour ago", source: "Organic" },
  { id: "ld2", name: "Sunita Rao", enquiry: "Cult.fit Membership", time: "3 hours ago", source: "Sponsored" },
  { id: "ld3", name: "Arjun Patel", enquiry: "Interior Design Services", time: "Yesterday", source: "Organic" },
  { id: "ld4", name: "Kavita Singh", enquiry: "2,500 sq ft Office Space", time: "Yesterday", source: "Sponsored" },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const displayName = user?.businessName ?? user?.name ?? "Business";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">
          Welcome, {displayName}!
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {user?.businessCategory && <span className="mr-2 tag-purple">{user.businessCategory}</span>}
          Here&apos;s your business dashboard on NeopolisNews.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Classifieds", value: "2", icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
          { label: "Total Views", value: "1,382", icon: Eye, color: "bg-blue-50 text-blue-600" },
          { label: "Total Leads", value: "90", icon: MessageSquare, color: "bg-green-50 text-green-600" },
          { label: "Profile Views", value: "428", icon: Users, color: "bg-orange-50 text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/business/post" className="card p-4 flex items-center gap-3 hover:border-purple-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">Post Classified</p>
            <p className="text-xs text-gray-400">Listing, offer, or service</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
        <Link href="/dashboard/business/classifieds" className="card p-4 flex items-center gap-3 hover:border-purple-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">My Classifieds</p>
            <p className="text-xs text-gray-400">3 listings</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
        <Link href="/dashboard/business/analytics" className="card p-4 flex items-center gap-3 hover:border-purple-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">Analytics</p>
            <p className="text-xs text-gray-400">Views, leads, trends</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
      </div>

      {/* My Classifieds */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">My Classifieds</h3>
          <Link href="/dashboard/business/classifieds" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_CLASSIFIEDS.map((c) => (
            <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="tag-purple">{c.category}</span>
                  <span className="text-xs font-bold text-brand-700">{c.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{c.views}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{c.leads}</span>
                <span className={c.status === "Active" ? "tag-green" : "tag-orange"}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Recent Leads</h3>
          <Link href="/dashboard/business/analytics" className="text-xs text-brand-600 font-semibold hover:underline">View analytics</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_RECENT_LEADS.map((l) => (
            <div key={l.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                {l.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                <p className="text-xs text-gray-400 truncate">Enquiry: {l.enquiry}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={l.source === "Sponsored" ? "tag-orange" : "tag-blue"}>{l.source}</span>
                <p className="text-xs text-gray-400 mt-0.5">{l.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-brand-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">Upgrade to Growth Plan</h3>
          <p className="text-sm text-purple-100 mt-0.5">
            Get featured placement, sponsored articles, and display ads — from ₹20,000/mo.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            {["Priority placement", "Homepage banner", "Analytics dashboard"].map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs text-purple-200">
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> {f}
              </span>
            ))}
          </div>
        </div>
        <Link href="/advertise" className="bg-white text-purple-700 font-bold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors shrink-0 text-sm">
          View Plans <ArrowRight className="w-4 h-4 inline ml-1" />
        </Link>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
        <h3 className="font-bold text-purple-900 text-sm mb-3">Tips to generate more leads</h3>
        <ul className="space-y-2">
          {[
            "Add high-resolution photos and a video walkthrough",
            "Keep your classified active — paused listings get 0 views",
            "Respond to all leads within 2 hours to maximise conversions",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-purple-800">
              <CheckCircle className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
