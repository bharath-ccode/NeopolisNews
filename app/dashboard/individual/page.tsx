"use client";

import Link from "next/link";
import {
  Home,
  Eye,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MOCK_LISTINGS = [
  { id: "l1", title: "3 BHK in Apex Tower, B-24", type: "Rent", price: "₹55,000/mo", status: "Active", views: 142, enquiries: 8 },
  { id: "l2", title: "2 BHK in Neopolis Heights, A-12", type: "Sale", price: "₹1.4 Cr", status: "Active", views: 89, enquiries: 3 },
];

const MOCK_ENQUIRIES = [
  { id: "e1", from: "Rahul S.", listing: "3 BHK in Apex Tower", time: "2 hours ago", message: "Is the flat still available? Can we schedule a visit?" },
  { id: "e2", from: "Priya M.", listing: "2 BHK in Neopolis Heights", time: "Yesterday", message: "What is the negotiated price? I'm a serious buyer." },
  { id: "e3", from: "Amit K.", listing: "3 BHK in Apex Tower", time: "2 days ago", message: "Looking for 11-month rent agreement. Any flexibility on deposit?" },
];

export default function IndividualDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">
          Good {getGreeting()}, {firstName}!
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Here&apos;s a snapshot of your activity on NeopolisNews.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: "2", icon: Home, color: "bg-blue-50 text-blue-600" },
          { label: "Total Views", value: "231", icon: Eye, color: "bg-green-50 text-green-600" },
          { label: "Enquiries Received", value: "11", icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
          { label: "Avg. Response Rate", value: "82%", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/individual/post" className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">Post New Listing</p>
            <p className="text-xs text-gray-400">Sale or rent</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
        <Link href="/dashboard/individual/listings" className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">Manage Listings</p>
            <p className="text-xs text-gray-400">2 active</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
        <Link href="/dashboard/individual/enquiries" className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">View Enquiries</p>
            <p className="text-xs text-gray-400">3 unread</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
        </Link>
      </div>

      {/* My Listings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">My Listings</h3>
          <Link href="/dashboard/individual/listings" className="text-xs text-brand-600 font-semibold hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_LISTINGS.map((l) => (
            <div key={l.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{l.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={l.type === "Rent" ? "tag-green" : "tag-blue"}>{l.type}</span>
                  <span className="text-xs font-bold text-brand-700">{l.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{l.views}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{l.enquiries}</span>
                <span className="tag-green">{l.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Recent Enquiries</h3>
          <Link href="/dashboard/individual/enquiries" className="text-xs text-brand-600 font-semibold hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_ENQUIRIES.map((e) => (
            <div key={e.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {e.from.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm text-gray-900">{e.from}</span>
                  <span className="text-xs text-gray-400">re: {e.listing}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {e.time}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1 pl-9">{e.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
        <h3 className="font-bold text-brand-900 text-sm mb-3">Tips to get more enquiries</h3>
        <ul className="space-y-2">
          {[
            "Add high-quality photos (listings with 5+ photos get 3× more views)",
            "Set a competitive price — check market rates on our Price Trends page",
            "Respond to enquiries within 2 hours to boost your response rate",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-brand-800">
              <CheckCircle className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
