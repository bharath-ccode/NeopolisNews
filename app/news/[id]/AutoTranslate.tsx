"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

/**
 * Shown on ?lang=te when no cached Telugu translation exists yet.
 * Kicks off the translation once, then refreshes so the server
 * re-renders the page from the now-cached translation.
 */
export default function AutoTranslate({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    fetch(`/api/articles/${articleId}/translate`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.refresh();
      })
      .catch(() => setFailed(true));
  }, [articleId, router]);

  if (failed) {
    return (
      <div className="bg-red-50 border-b border-red-100 text-red-700 text-sm px-4 py-3 text-center">
        తెలుగు అనువాదం అందుబాటులో లేదు. దయచేసి కాసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి. (Telugu
        translation is unavailable right now — please try again shortly.)
      </div>
    );
  }

  return (
    <div className="bg-brand-50 border-b border-brand-100 text-brand-800 text-sm px-4 py-3 flex items-center justify-center gap-2">
      <Languages className="w-4 h-4 animate-pulse" />
      తెలుగు అనువాదం సిద్ధమవుతోంది… మొదటిసారి ఒక నిమిషం పట్టవచ్చు. (Preparing the Telugu
      translation — the first time can take up to a minute.)
    </div>
  );
}
