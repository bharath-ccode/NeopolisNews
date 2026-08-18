"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fires a fire-and-forget page-view log on every route change. Mounted
 *  once in the root layout. Skips /admin/* so an admin's own browsing
 *  doesn't pollute visitor analytics. */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    fetch("/api/track-pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
