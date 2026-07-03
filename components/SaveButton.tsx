"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

/**
 * Heart toggle to save/unsave a project or classified.
 * Redirects to sign-in when the user isn't authenticated.
 */
export default function SaveButton({
  itemType,
  itemId,
  size = "md",
  className = "",
}: {
  itemType: "project" | "classified";
  itemId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { user } = useAuth();
  const [saved, setSaved]   = useState(false);
  const [busy, setBusy]     = useState(false);

  useEffect(() => {
    if (!user) { setSaved(false); return; }
    let cancelled = false;
    authHeaders()
      .then((headers) => fetch("/api/saved-properties", { headers }))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setSaved(data.some(
          (s: { item_type: string; item_id: string }) =>
            s.item_type === itemType && s.item_id === itemId
        ));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, itemType, itemId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s); // optimistic
    const res = await fetch("/api/saved-properties", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ item_type: itemType, item_id: itemId }),
    }).catch(() => null);
    if (!res?.ok) {
      setSaved((s) => !s); // roll back
    } else {
      const data = await res.json();
      setSaved(Boolean(data.saved));
    }
    setBusy(false);
  }

  const iconCls = size === "sm" ? "w-4 h-4" : "w-4.5 h-4.5 w-[18px] h-[18px]";

  return (
    <button
      onClick={toggle}
      title={saved ? "Remove from saved" : "Save property"}
      aria-label={saved ? "Remove from saved" : "Save property"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        saved
          ? "bg-red-50 border-red-200 text-red-600"
          : "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500"
      } ${className}`}
    >
      <Heart className={`${iconCls} ${saved ? "fill-red-500 text-red-500" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
