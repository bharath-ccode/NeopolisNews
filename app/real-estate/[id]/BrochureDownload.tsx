"use client";

import { Download, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Brochure download card — viewing the project is public, but downloading
 * the brochure requires an account.
 */
export default function BrochureDownload({ url }: { url: string }) {
  const { user, loading } = useAuth();

  const inner = (locked: boolean) => (
    <>
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        {locked ? (
          <Lock className="w-6 h-6 text-green-600" />
        ) : (
          <Download className="w-6 h-6 text-green-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
          Download Brochure
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {locked ? "Free sign-in required · PDF" : "PDF · Click to download"}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0" />
    </>
  );

  const cardCls =
    "card p-5 flex items-center gap-4 hover:border-brand-300 hover:shadow-md transition-all group w-full text-left";

  // While the session is restoring, render the locked look but do nothing on
  // click — avoids bouncing a signed-in user to the login page.
  if (loading) {
    return (
      <button type="button" className={cardCls} disabled>
        {inner(true)}
      </button>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`;
        }}
        className={cardCls}
      >
        {inner(true)}
      </button>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" download className={cardCls}>
      {inner(false)}
    </a>
  );
}
