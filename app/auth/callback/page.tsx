"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error_description");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    if (code) {
      // PKCE flow — exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) setError(err.message);
        else router.replace("/dashboard");
      });
    } else {
      // Implicit flow — Supabase processes the hash fragment automatically;
      // wait for the SIGNED_IN event then redirect.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          subscription.unsubscribe();
          router.replace("/dashboard");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm">
            <p className="text-sm font-semibold text-red-700 mb-1">Sign-in failed</p>
            <p className="text-xs text-red-500 mb-4">{error}</p>
            <a href="/auth/login" className="text-brand-600 text-sm font-semibold hover:underline">
              Back to login
            </a>
          </div>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
