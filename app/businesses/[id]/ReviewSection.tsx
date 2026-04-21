"use client";

import { useEffect, useState } from "react";
import { Star, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function StarRow({
  value,
  interactive,
  onChange,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : undefined}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              n <= (interactive ? hovered || value : value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function ReviewSection({ businessId }: { businessId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ author_name: "", rating: 0, comment: "" });

  useEffect(() => {
    fetch(`/api/businesses/${businessId}/reviews`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .finally(() => setLoading(false));
  }, [businessId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) { setSubmitError("Please choose a star rating."); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error ?? "Something went wrong."); return; }
      setReviews((prev) => [data, ...prev]);
      setSubmitted(true);
      setShowForm(false);
      setForm({ author_name: "", rating: 0, comment: "" });
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const avg = avgRating(reviews);
  const count = reviews.length;

  return (
    <div className="card p-6 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900 text-base mb-1">Reviews</h2>
          {count > 0 && (
            <div className="flex items-center gap-2">
              <StarRow value={Math.round(avg)} />
              <span className="text-sm font-semibold text-gray-700">{avg.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({count} {count === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {showForm ? <><ChevronUp className="w-4 h-4" /> Cancel</> : <><Star className="w-4 h-4" /> Write a Review</>}
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Your rating *</p>
            <StarRow value={form.rating} interactive onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Your name *"
            value={form.author_name}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            required
          />
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Share your experience (optional)"
            rows={3}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {/* Submitted confirmation */}
      {submitted && (
        <p className="text-sm text-green-600 font-medium mb-4">
          Thanks for your review!
        </p>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : count === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{r.author_name}</span>
                  <StarRow value={r.rating} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
