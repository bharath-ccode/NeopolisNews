import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — NeopolisNews",
  description: "Get help with the NeopolisNews app and website.",
};

const CONTACT_EMAIL = "support@neopolis.news";
const SITE_NAME     = "NeopolisNews";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}

const FAQS = [
  {
    q: "How do I create an account?",
    a: "Tap 'Sign in' on the app or website. You can register with your mobile number (OTP), email and password, or sign in with Google. No account is required to browse news, businesses, or property listings.",
  },
  {
    q: "How do I delete my account and data?",
    a: `Email us at ${CONTACT_EMAIL} with the subject "Delete my account" from the email or phone number associated with your account. We will delete your account and personal data within 30 days and confirm by email.`,
  },
  {
    q: "I listed my business — how do I manage it?",
    a: "Visit neopolis.news/my-business and sign in with the email you used to claim your listing. From there you can edit your profile, add photos, manage offers, events, and respond to reviews.",
  },
  {
    q: "How do I turn off push notifications?",
    a: "On the mobile app: go to your device Settings → NeopolisNews → Notifications and toggle them off. On the website: open your browser's site settings for neopolis.news and set Notifications to 'Block'.",
  },
  {
    q: "The weather or traffic data looks wrong.",
    a: "Weather is sourced from Open-Meteo and air quality from WAQI — both use sensor readings near Kokapet. Traffic uses the Google Routes API for a representative route and is cached for 5 minutes. Minor differences from other apps are normal due to different measurement stations and update intervals.",
  },
  {
    q: "How do I report inaccurate business information?",
    a: `Email ${CONTACT_EMAIL} with the business name and what needs correcting. Verified business owners can correct their own listing at /my-business.`,
  },
  {
    q: "I am a builder or developer. How do I list my project?",
    a: "Visit neopolis.news/builder and register for a builder account. After approval you can create project listings, post construction updates, and manage availability.",
  },
  {
    q: "How do I unsubscribe from the news digest email?",
    a: "Click the 'Unsubscribe' link at the bottom of any digest email. You can also email us and we will remove you immediately.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Help &amp; Support</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{SITE_NAME} Support</h1>
          <p className="text-brand-300 text-sm max-w-xl">
            Questions about the app or website? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">

        {/* Contact card */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Contact us</h2>
          <p className="text-gray-500 text-sm mb-4">
            We typically respond within one business day.
          </p>
          <div className="space-y-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors group"
            >
              <span className="text-2xl">✉️</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-700">{CONTACT_EMAIL}</p>
                <p className="text-xs text-gray-400">General enquiries, account issues, bug reports</p>
              </div>
            </a>
          </div>
        </Card>

        {/* Account deletion — required by Apple/Google */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Delete your account</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            You have the right to delete your {SITE_NAME} account and all associated personal data at any time.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-1">
            <li>Email <a href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20account`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a> with the subject <strong>Delete my account</strong>.</li>
            <li>Include the mobile number or email address linked to your account so we can identify it.</li>
            <li>We will delete your account and personal data within <strong>30 days</strong> and send a confirmation email.</li>
          </ol>
          <p className="text-xs text-gray-400 mt-3">
            Business listings and public reviews associated with your account will also be removed.
            Property enquiry records may be retained for up to 12 months for legal compliance.
          </p>
        </Card>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Card key={i}>
                <p className="text-sm font-semibold text-gray-800 mb-1">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-brand-600">Cookie Notice</Link>
          <Link href="/" className="hover:text-brand-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
