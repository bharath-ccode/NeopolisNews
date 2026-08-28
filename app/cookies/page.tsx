import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Notice — NeopolisNews",
  description: "How NeopolisNews uses cookies and browser storage.",
};

const EFFECTIVE_DATE = "28 August 2026";
const CONTACT_EMAIL  = "support@neopolis.news";
const SITE_NAME      = "NeopolisNews";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>;
}
function Table({ rows }: { rows: { name: string; type: string; purpose: string; expiry: string }[] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-700">Name / Key</th>
            <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-700">Type</th>
            <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
            <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-700">Expiry</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-4 py-2 border border-gray-200 font-mono text-xs text-gray-700">{r.name}</td>
              <td className="px-4 py-2 border border-gray-200 text-gray-600">{r.type}</td>
              <td className="px-4 py-2 border border-gray-200 text-gray-600">{r.purpose}</td>
              <td className="px-4 py-2 border border-gray-200 text-gray-500">{r.expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Cookie Notice</h1>
          <p className="text-brand-300 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        <P>
          {SITE_NAME} uses cookies and browser storage technologies to operate the Platform, keep you
          signed in, and remember your preferences. This notice explains what we use and why.
          It covers the website at neopolis.news. The mobile app (iOS / Android) does not use
          browser cookies; it stores session tokens in encrypted device storage (Expo SecureStore).
        </P>

        <H2>1. Essential Cookies &amp; Storage</H2>
        <P>
          These are required for the Platform to function. You cannot opt out of them without
          disabling the relevant feature.
        </P>
        <Table rows={[
          { name: "sb-*-auth-token", type: "localStorage / Cookie", purpose: "Supabase authentication session — keeps you signed in", expiry: "Session / up to 7 days" },
          { name: "neopolis_otp_*", type: "httpOnly Cookie", purpose: "Signed OTP token for business verification flows", expiry: "24 hours" },
          { name: "neopolis_listings", type: "localStorage", purpose: "Your saved property listings (stored locally only, never sent to our servers)", expiry: "Persistent until cleared" },
          { name: "neopolis_businesses", type: "localStorage", purpose: "Admin business list cache — reduces API calls in the admin panel", expiry: "Persistent until cleared" },
        ]} />

        <H2>2. Functional Storage</H2>
        <P>
          These improve your experience but are not strictly necessary.
        </P>
        <Table rows={[
          { name: "push_subscribed", type: "localStorage", purpose: "Records whether you have subscribed to web push notifications", expiry: "Persistent until cleared" },
          { name: "digest_unsub_*", type: "URL token (not a cookie)", purpose: "One-click unsubscribe token for digest emails (delivered in email links only)", expiry: "Single use" },
        ]} />

        <H2>3. Third-Party Services</H2>
        <P>
          The following third-party services may set their own cookies or use browser storage. We
          do not control their cookies and encourage you to review their privacy policies.
        </P>
        <Table rows={[
          { name: "Google OAuth", type: "Cookie / storage", purpose: "Sign in with Google authentication flow", expiry: "Varies (Google)" },
        ]} />
        <P>
          Weather data (Open-Meteo), air-quality data (WAQI), and traffic data (Google Routes API)
          are fetched server-side or as anonymous API calls — they do not set cookies in your browser.
        </P>

        <H2>4. No Analytics or Advertising Cookies</H2>
        <P>
          {SITE_NAME} does not currently use any third-party analytics platforms (such as Google Analytics)
          or advertising networks. No tracking or profiling cookies are set for marketing purposes.
        </P>

        <H2>5. Managing Cookies</H2>
        <P>
          You can control or delete cookies at any time through your browser settings. Clearing
          cookies and localStorage will sign you out and remove any locally cached data. Links to
          cookie settings for common browsers:
        </P>
        <ul className="list-disc list-inside space-y-1.5 text-gray-600 mb-4 ml-2 text-sm">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Google Chrome</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Safari</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Mozilla Firefox</a></li>
        </ul>

        <H2>6. Changes to This Notice</H2>
        <P>
          We may update this Cookie Notice as the Platform evolves. Changes will be posted on this
          page with an updated effective date.
        </P>

        <H2>7. Contact</H2>
        <P>
          Questions about our use of cookies?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>
        </P>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          <Link href="/" className="hover:text-brand-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
