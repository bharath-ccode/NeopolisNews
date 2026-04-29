import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Notice — NeopolisNews",
  description: "How NeopolisNews uses cookies and browser storage.",
};

const EFFECTIVE_DATE = "20 April 2026";
const CONTACT_EMAIL  = "support@neopolis.news";
const SITE_NAME      = "NeopolisNews";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>;
}

interface CookieRow {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}

function CookieTable({ rows }: { rows: CookieRow[] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 w-1/4">Name / Key</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 w-1/6">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Purpose</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-700 w-1/5">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.name} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-800 align-top">{r.name}</td>
              <td className="px-4 py-3 text-gray-600 align-top">{r.type}</td>
              <td className="px-4 py-3 text-gray-600 align-top">{r.purpose}</td>
              <td className="px-4 py-3 text-gray-600 align-top">{r.duration}</td>
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
      {/* Hero */}
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Cookie Notice</h1>
          <p className="text-brand-300 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        <P>
          This notice explains how {SITE_NAME} uses cookies and similar browser storage technologies
          when you visit our Platform. We use these only to make the Platform work — we do not use
          advertising cookies or sell your browsing data.
        </P>

        {/* 1 */}
        <H2>1. What Are Cookies?</H2>
        <P>
          Cookies are small text files stored in your browser by a website. We also use
          browser <strong>localStorage</strong> — a similar mechanism that stores data locally in your
          browser without expiry unless cleared manually.
        </P>

        {/* 2 */}
        <H2>2. Cookies We Use</H2>

        <CookieTable
          rows={[
            {
              name: "sb-*-auth-token",
              type: "Cookie (httpOnly)",
              purpose:
                "Supabase authentication session. Keeps you logged in across page loads for your individual, builder, or admin account.",
              duration: "Up to 7 days or until you sign out",
            },
            {
              name: "business_otp_*",
              type: "Cookie (httpOnly)",
              purpose:
                "Stores a signed HMAC token during business OTP verification or claim link flow. Required to complete business registration securely.",
              duration: "24 hours",
            },
          ]}
        />

        {/* 3 */}
        <H2>3. Local Storage We Use</H2>
        <P>
          In addition to cookies, we store some data in your browser&apos;s localStorage. This data
          never leaves your device unless you explicitly submit a form.
        </P>

        <CookieTable
          rows={[
            {
              name: "neopolis_listings",
              type: "localStorage",
              purpose:
                "Stores property listings you have posted as an individual owner. Used to display and manage your listings on the dashboard.",
              duration: "Until manually cleared",
            },
            {
              name: "neopolis_businesses",
              type: "localStorage",
              purpose:
                "Admin-side cache of the business directory list to reduce database reads.",
              duration: "Until manually cleared",
            },
            {
              name: "supabase.auth.token",
              type: "localStorage",
              purpose:
                "Supabase auth session for individual user accounts (managed by the Supabase JS SDK).",
              duration: "Until you sign out",
            },
          ]}
        />

        {/* 4 */}
        <H2>4. Third-Party Cookies</H2>
        <P>
          If you sign in with Google, Google may set its own cookies as part of the OAuth flow.
          These are governed by{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline"
          >
            Google&apos;s Privacy Policy
          </a>
          . We do not use any other third-party advertising, analytics, or tracking cookies.
        </P>

        {/* 5 */}
        <H2>5. What We Do Not Do</H2>
        <ul className="list-disc list-inside space-y-1.5 text-gray-600 mb-4 ml-2">
          <li>We do not use advertising or retargeting cookies.</li>
          <li>We do not share cookie data with advertisers.</li>
          <li>We do not use cross-site tracking cookies.</li>
          <li>We do not use analytics services that drop third-party cookies (e.g. Google Analytics).</li>
        </ul>

        {/* 6 */}
        <H2>6. How to Control Cookies</H2>
        <P>
          You can control or delete cookies through your browser settings. Common browser guides:
        </P>
        <ul className="list-disc list-inside space-y-1.5 text-gray-600 mb-4 ml-2">
          <li>
            <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
          </li>
          <li>
            <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
          </li>
          <li>
            <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
          </li>
          <li>
            <strong>Edge:</strong> Settings → Cookies and site permissions
          </li>
        </ul>
        <P>
          Note: disabling or clearing the cookies and localStorage items listed above will sign you
          out of the Platform and may affect functionality such as business dashboard access.
        </P>

        {/* 7 */}
        <H2>7. Changes to This Notice</H2>
        <P>
          We may update this Cookie Notice when we change how we use cookies. We will post the
          revised notice on this page with an updated effective date.
        </P>

        {/* 8 */}
        <H2>8. Contact</H2>
        <P>
          Questions about our use of cookies? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
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
