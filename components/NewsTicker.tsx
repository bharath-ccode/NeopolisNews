"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, X } from "lucide-react";

interface TickerItem {
  text: string;
  url: string;
}

/** Slim rotating headline bar above the navbar. Hidden on the homepage
 *  (the hero live desk already shows headlines there) and when dismissed
 *  for the session. */
export default function NewsTicker() {
  const pathname = usePathname();
  const [items, setItems] = useState<TickerItem[]>([]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(Boolean(sessionStorage.getItem("ticker_dismissed")));
    fetch("/api/ticker")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items)) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (pathname === "/" || dismissed || items.length === 0) return null;

  const item = items[index];

  return (
    <div className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center gap-3 text-sm">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5" /> Today
        </span>
        <Link
          key={index /* remount to retrigger the fade */}
          href={item.url}
          className="flex-1 min-w-0 truncate text-white/85 hover:text-amber-300 transition-colors animate-[fadeIn_0.5s_ease]"
        >
          {item.text}
        </Link>
        {items.length > 1 && (
          <span className="shrink-0 hidden sm:flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Headline ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? "bg-amber-400" : "bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </span>
        )}
        <button
          onClick={() => {
            sessionStorage.setItem("ticker_dismissed", "1");
            setDismissed(true);
          }}
          aria-label="Dismiss ticker"
          className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
