"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Languages, RefreshCw } from "lucide-react";

/**
 * Shown on ?lang=te when no cached Telugu translation exists yet.
 * Kicks off the translation once, then refreshes so the server
 * re-renders the page from the now-cached translation.
 */
export default function AutoTranslate({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const translate = useCallback(() => {
    setFailed(false);
    fetch(`/api/articles/${articleId}/translate`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.refresh();
      })
      .catch(() => {
        // A gateway timeout can race a translation that still completed and
        // cached — refresh once before showing the failure state.
        router.refresh();
        setFailed(true);
      });
  }, [articleId, router]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    translate();
  }, [translate]);

  if (failed) {
    return (
      <div className="bg-red-50 border-b border-red-100 text-red-700 text-sm px-4 py-3 flex flex-wrap items-center justify-center gap-3 text-center">
        <span>
          తెలుగు అనువాదం విఫలమైంది. (The Telugu translation didn&apos;t come through.)
        </span>
        <button
          type="button"
          onClick={translate}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-full text-xs transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> మళ్ళీ ప్రయత్నించండి (Try again)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 border-b border-brand-100 text-brand-800 text-sm px-4 py-3 flex items-center justify-center gap-2">
      <Languages className="w-4 h-4 animate-pulse" />
      తెలుగు అనువాదం సిద్ధమవుతోంది… (Preparing the Telugu translation — just a moment.)
    </div>
  );
}
