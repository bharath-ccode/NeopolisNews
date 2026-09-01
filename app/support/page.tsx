import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Support — NeopolisNews",
  description: "Get help with your NeopolisNews account, listings, or the app — contact our support team or browse common questions.",
};

const CONTACT_EMAIL = "support@neopolis.news";
const CONTACT_PHONE = "+91 99000 00000";
const SITE_NAME      = "NeopolisNews";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>;
}

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I create an account or sign in?",
    a: "Tap Sign In from the menu and choose Google, email/password, or a one-time code sent to your email or phone — whichever's easiest.",
  },
  {
    q: "How do I post a classified, list a property, or register a business?",
    a: (
      <>
        Sign in, then use Post from your dashboard (
        <Link href="/dashboard/individual/post" className="text-brand-600 hover:underline">individual</Link>{" "}
        or{" "}
        <Link href="/dashboard/business/post" className="text-brand-600 hover:underline">business</Link>).
        To add a business that isn&apos;t listed yet, use{" "}
        <Link href="/register-business" className="text-brand-600 hover:underline">Register a Business</Link>.
      </>
    ),
  },
  {
    q: "I run a business already listed on NeopolisNews — how do I claim it?",
    a: "Open the business's page and look for the Claim this business button — you'll verify your ownership and get access to its dashboard, enquiries, and analytics.",
  },
  {
    q: "How do notifications and the daily digest work?",
    a: "Push notifications and the email digest are opt-in, managed from your account settings. Every digest email includes an unsubscribe link that takes effect immediately.",
  },
  {
    q: "Something in an article, cartoon, or listing looks wrong — how do I report it?",
    a: (
      <>
        Email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>{" "}
        with a link to the page and what looks off — we review and correct these quickly.
      </>
    ),
  },
  {
    q: "How do I delete my account or personal data?",
    a: (
      <>
        Email {CONTACT_EMAIL} from your registered address asking to delete your account — we&apos;ll confirm
        and process it within 30 days. See our{" "}
        <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> for details on
        what we collect and retain.
      </>
    ),
  },
  {
    q: "The app or website isn't working properly — what should I try first?",
    a: "Make sure you're on the latest version from your app store, then try a fresh sign-out/sign-in. If that doesn't fix it, email us with your device type and what you were doing when it happened.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Help</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Support</h1>
          <p className="text-brand-300 text-sm">
            Questions, account issues, or feedback about {SITE_NAME} — we usually reply within 24 hours.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        {/* Contact card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 grid sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2.5 hover:text-brand-700">
            <Mail className="w-4 h-4 text-brand-600 shrink-0" />
            {CONTACT_EMAIL}
          </a>
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-brand-700">
            <Phone className="w-4 h-4 text-brand-600 shrink-0" />
            {CONTACT_PHONE}
          </a>
          <span className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            Neopolis District, Hyderabad, Telangana, India
          </span>
          <span className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            Replies within 24 hours, every day
          </span>
        </div>

        <H2>Frequently Asked Questions</H2>
        <div className="divide-y divide-gray-100">
          {FAQS.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between gap-3">
                {f.q}
                <span className="text-gray-300 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
              </summary>
              <div className="text-gray-600 leading-relaxed mt-2 text-sm">{f.a}</div>
            </details>
          ))}
        </div>

        <H2>Still need help?</H2>
        <P>
          Email <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>{" "}
          with as much detail as you can — a link to the page, a screenshot, and your device/browser — and we'll
          get back to you.
        </P>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-brand-600">Cookie Notice</Link>
          <Link href="/" className="hover:text-brand-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
