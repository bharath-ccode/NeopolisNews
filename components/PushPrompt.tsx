"use client";

import { useEffect, useState } from "react";
import { BellRing, X, Loader2, CheckCircle2 } from "lucide-react";
import { authHeaders } from "@/lib/authToken";

/** Convert a base64url VAPID key to the Uint8Array PushManager expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Contextual push opt-in. Shows a soft in-page prompt; only after the user
 * taps yes does the real browser permission dialog appear. Renders nothing
 * when push is unsupported, already granted+subscribed, denied, or dismissed
 * this session.
 */
export default function PushPrompt({
  topic,
  message,
}: {
  topic: "deals" | "news" | "clubs";
  message: string;
}) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    if (Notification.permission === "denied") return;
    if (sessionStorage.getItem(`push_dismissed_${topic}`)) return;
    if (localStorage.getItem(`push_subscribed_${topic}`)) return;
    setVisible(true);
  }, [topic]);

  async function enable() {
    setBusy(true);
    setError("");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notifications were blocked — you can enable them in browser settings.");
        setBusy(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setError("Notifications aren't configured yet.");
        setBusy(false);
        return;
      }

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ subscription: subscription.toJSON(), topics: [topic] }),
      });
      if (!res.ok) throw new Error("subscribe failed");

      localStorage.setItem(`push_subscribed_${topic}`, "1");
      setDone(true);
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setError("Could not enable notifications. Please try again.");
    }
    setBusy(false);
  }

  function dismiss() {
    sessionStorage.setItem(`push_dismissed_${topic}`, "1");
    setVisible(false);
  }

  if (!visible) return null;

  if (done) {
    return (
      <div className="card p-4 flex items-center gap-3 bg-green-50 border-green-200">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">You&apos;re set — alerts will land even when the site is closed.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <BellRing className="w-4.5 h-4.5 w-[18px] h-[18px] text-brand-600" />
        </div>
        <p className="text-sm text-gray-700 flex-1">{message}</p>
        <button
          onClick={enable}
          disabled={busy}
          className="shrink-0 btn-primary text-xs py-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Yes, notify me"}
        </button>
        <button onClick={dismiss} className="shrink-0 text-gray-300 hover:text-gray-500" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
