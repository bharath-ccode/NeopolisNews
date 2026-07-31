"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, MessageCircle, Send, Pencil, Trash2, Clock } from "lucide-react";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  owner_response: string | null;
  owner_response_at: string | null;
  created_at: string;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${
            n <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsTab({
  businessId,
  token,
}: {
  businessId: string;
  token: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`/api/my-business/reviews?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .finally(() => setLoading(false));
  }, [businessId, token]);

  async function saveResponse(reviewId: string, response: string) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/my-business/reviews", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, reviewId, response }),
    }).catch(() => null);
    if (!res?.ok) {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError((j as { error?: string }).error ?? "Failed to save response.");
      setSaving(false);
      return;
    }
    const updated = await res.json();
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    setEditing(null);
    setDraft("");
    setSaving(false);
  }

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const unanswered = reviews.filter((r) => !r.owner_response).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Customer Reviews</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          {reviews.length > 0 && <> · {avg.toFixed(1)} ★ average · {unanswered} awaiting your reply</>}
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Reviews left on your public business page will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-bold text-sm text-gray-900">@{r.author_name}</span>
                <Stars value={r.rating} />
                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <Clock className="w-3 h-3" />
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              )}

              {/* Owner response */}
              {editing === r.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Thank the customer or address their concern…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveResponse(r.id, draft)}
                      disabled={saving || !draft.trim()}
                      className="flex items-center gap-1.5 btn-primary text-xs py-2 disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {r.owner_response ? "Update Reply" : "Post Reply"}
                    </button>
                    <button
                      onClick={() => { setEditing(null); setDraft(""); }}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : r.owner_response ? (
                <div className="mt-3 ml-4 border-l-2 border-brand-200 pl-4">
                  <p className="text-xs font-bold text-brand-700 mb-1">Your reply</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.owner_response}</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => { setEditing(r.id); setDraft(r.owner_response ?? ""); }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 font-semibold"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => saveResponse(r.id, "")}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditing(r.id); setDraft(""); }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Reply to this review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
