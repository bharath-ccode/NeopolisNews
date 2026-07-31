import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — NeopolisNews",
  description: "How NeopolisNews collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "20 April 2026";
const CONTACT_EMAIL  = "support@neopolis.news";
const SITE_NAME      = "NeopolisNews";
const SITE_URL       = "https://neopolis.news";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-10 mb-3">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-800 mt-5 mb-2">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-inside space-y-1.5 text-gray-600 mb-4 ml-2">{children}</ul>;
}

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-brand-300 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        <P>
          {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website at{" "}
          <a href={SITE_URL} className="text-brand-600 hover:underline">{SITE_URL}</a>{" "}
          and related services (collectively, the &ldquo;Platform&rdquo;). This Privacy Policy explains
          what information we collect, how we use it, and the choices you have. By using the Platform,
          you agree to the practices described here.
        </P>

        {/* 1 */}
        <H2>1. Information We Collect</H2>

        <H3>1.1 Information you provide directly</H3>
        <UL>
          <li><strong>Contact details</strong> — name, mobile number, and email address when you register, enquire about a property or business, list a property, or subscribe to our digest.</li>
          <li><strong>Business information</strong> — business name, address, industry, operating hours, photos, and social media links submitted during business registration or profile management.</li>
          <li><strong>Property listings</strong> — property type, location, size, price, and description when you post a classified listing.</li>
          <li><strong>Messages &amp; enquiries</strong> — content of enquiries you send to businesses, builders, or property owners through the Platform.</li>
          <li><strong>Reviews</strong> — name and review content you submit for a business.</li>
          <li><strong>Account credentials</strong> — email address and password if you register with email/password, or tokens provided by Google if you sign in with Google.</li>
        </UL>

        <H3>1.2 Information collected automatically</H3>
        <UL>
          <li><strong>Usage data</strong> — pages visited, links clicked, and time spent on the Platform.</li>
          <li><strong>Device data</strong> — browser type, operating system, and IP address.</li>
          <li><strong>Cookies and local storage</strong> — session tokens and cached data stored in your browser (see Section 7).</li>
        </UL>

        <H3>1.3 Information from third parties</H3>
        <UL>
          <li><strong>Google OAuth</strong> — if you sign in with Google, we receive your name, email address, and profile picture from Google.</li>
        </UL>

        {/* 2 */}
        <H2>2. How We Use Your Information</H2>
        <UL>
          <li>To create and manage your account and verify your identity via OTP.</li>
          <li>To display business listings, property listings, and project pages on the Platform.</li>
          <li>To deliver enquiries, contact messages, and review notifications to the relevant business owner, broker, or builder.</li>
          <li>To send transactional emails — OTP codes, claim links, enquiry notifications, and digest emails (only if you have subscribed).</li>
          <li>To show business owners the number of profile views their listing has received.</li>
          <li>To improve the Platform, fix bugs, and analyse usage patterns.</li>
          <li>To comply with legal obligations.</li>
        </UL>

        {/* 3 */}
        <H2>3. How We Share Your Information</H2>
        <P>
          We do not sell your personal information. We share it only in the following limited circumstances:
        </P>
        <UL>
          <li><strong>With business owners, builders, and brokers</strong> — when you submit an enquiry or contact form, your name, phone number, and message are forwarded to the relevant party by email.</li>
          <li><strong>With service providers</strong> — we use Supabase (database and authentication), Resend (email delivery), and Google (OAuth) to operate the Platform. Each provider processes data only as necessary to provide their service.</li>
          <li><strong>For legal compliance</strong> — if required by law, court order, or governmental authority.</li>
          <li><strong>In a business transfer</strong> — if {SITE_NAME} is acquired or merged, your information may transfer to the new entity under equivalent privacy protections.</li>
        </UL>

        {/* 4 */}
        <H2>4. Data Retention</H2>
        <P>
          We retain your personal information for as long as your account is active or as needed to provide services.
          Enquiry records are retained for 12 months. Business and property listing data is retained while the
          listing is active and for up to 12 months after deletion. You may request deletion of your data at any
          time (see Section 6).
        </P>

        {/* 5 */}
        <H2>5. Data Security</H2>
        <P>
          We implement industry-standard technical and organisational measures to protect your information,
          including encrypted connections (HTTPS), row-level security on our database, and httpOnly cookies
          for sensitive tokens. However, no method of transmission or storage is 100% secure; you use the
          Platform at your own risk.
        </P>

        {/* 6 */}
        <H2>6. Your Rights</H2>
        <P>You have the right to:</P>
        <UL>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete information.</li>
          <li><strong>Deletion</strong> — request that we delete your account and associated personal data.</li>
          <li><strong>Objection</strong> — object to certain processing activities.</li>
          <li><strong>Withdraw consent</strong> — unsubscribe from marketing emails at any time using the unsubscribe link in any digest email.</li>
        </UL>
        <P>
          To exercise any of these rights, email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>.
          We will respond within 30 days.
        </P>

        {/* 7 */}
        <H2>7. Cookies &amp; Local Storage</H2>
        <P>
          We use cookies and browser local storage to operate the Platform. For full details, see our{" "}
          <Link href="/cookies" className="text-brand-600 hover:underline">Cookie Notice</Link>.
          You can control cookies through your browser settings; disabling them may affect Platform functionality.
        </P>

        {/* 8 */}
        <H2>8. Children&apos;s Privacy</H2>
        <P>
          The Platform is not directed at children under 18. We do not knowingly collect personal information
          from minors. If you believe a child has provided us with personal data, please contact us and we will
          delete it promptly.
        </P>

        {/* 9 */}
        <H2>9. Third-Party Links</H2>
        <P>
          The Platform may contain links to external websites (builder websites, social media profiles, etc.).
          We are not responsible for the privacy practices of those sites and encourage you to review their
          policies before providing any personal information.
        </P>

        {/* 10 */}
        <H2>10. Changes to This Policy</H2>
        <P>
          We may update this Privacy Policy from time to time. We will post the revised policy on this page
          with an updated effective date. Continued use of the Platform after changes are posted constitutes
          your acceptance of the updated policy.
        </P>

        {/* 11 */}
        <H2>11. Contact Us</H2>
        <P>
          If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
        </P>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 space-y-1">
          <p className="font-semibold">{SITE_NAME}</p>
          <p>Neopolis District, Hyderabad, Telangana, India</p>
          <p>
            Email:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>
          </p>
          <p>
            Website:{" "}
            <a href={SITE_URL} className="text-brand-600 hover:underline">{SITE_URL}</a>
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-brand-600">Cookie Notice</Link>
          <Link href="/" className="hover:text-brand-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
