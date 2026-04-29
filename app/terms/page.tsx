import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — NeopolisNews",
  description: "Terms and conditions for using the NeopolisNews platform.",
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

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-brand-950 text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Terms of Service</h1>
          <p className="text-brand-300 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        <P>
          Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the {SITE_NAME}{" "}
          website at <a href={SITE_URL} className="text-brand-600 hover:underline">{SITE_URL}</a> and related
          services (collectively, the &ldquo;Platform&rdquo;) operated by {SITE_NAME}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        </P>
        <P>
          By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree,
          please do not use the Platform.
        </P>

        {/* 1 */}
        <H2>1. About the Platform</H2>
        <P>
          {SITE_NAME} is a local information platform for the Neopolis urban district in Hyderabad, India.
          It provides a business directory, real estate project listings, property classifieds, local news,
          and related services. We connect residents, businesses, builders, and brokers within the district.
        </P>

        {/* 2 */}
        <H2>2. Eligibility</H2>
        <P>
          You must be at least 18 years old to use the Platform. By using the Platform, you represent
          that you meet this requirement and that all information you provide is accurate and complete.
        </P>

        {/* 3 */}
        <H2>3. User Accounts</H2>

        <H3>3.1 Registration</H3>
        <P>
          Certain features require you to create an account using a mobile number (verified via OTP),
          email address and password, or Google OAuth. You are responsible for maintaining the
          confidentiality of your credentials and for all activity under your account.
        </P>

        <H3>3.2 Business accounts</H3>
        <P>
          Business owners may claim or register a business listing. You warrant that you are authorised
          to represent the business and that all business information you submit is accurate. Listings
          are subject to verification at our discretion.
        </P>

        <H3>3.3 Builder accounts</H3>
        <P>
          Real estate builders may register for a builder portal account, which is subject to approval.
          Builders are responsible for the accuracy of all project information, pricing, availability
          announcements, and construction updates they publish.
        </P>

        <H3>3.4 Broker accounts</H3>
        <P>
          Property brokers may register for a broker account to list properties. Brokers must hold a
          valid RERA registration where applicable and are solely responsible for the accuracy of
          all property listings.
        </P>

        {/* 4 */}
        <H2>4. Content &amp; Listings</H2>

        <H3>4.1 Your content</H3>
        <P>
          When you submit content — including business descriptions, property listings, photos, reviews,
          or news articles — you grant {SITE_NAME} a non-exclusive, royalty-free, worldwide licence to
          display, reproduce, and distribute that content on the Platform and in promotional materials.
        </P>

        <H3>4.2 Accuracy</H3>
        <P>
          You are solely responsible for the accuracy, completeness, and legality of any content you
          submit. {SITE_NAME} does not verify all listings and makes no warranties about their accuracy.
          Property prices, availability, and specifications are subject to change without notice.
        </P>

        <H3>4.3 Prohibited content</H3>
        <P>You must not submit content that:</P>
        <UL>
          <li>Is false, misleading, or fraudulent.</li>
          <li>Infringes any third-party intellectual property rights.</li>
          <li>Is defamatory, obscene, hateful, or discriminatory.</li>
          <li>Violates any applicable law or regulation, including RERA, consumer protection laws, or data protection obligations.</li>
          <li>Contains unsolicited commercial communications (spam).</li>
          <li>Impersonates any person or entity.</li>
        </UL>

        <H3>4.4 Content removal</H3>
        <P>
          We reserve the right to remove any content that violates these Terms or that we consider, in
          our sole discretion, to be inappropriate, without notice or liability to you.
        </P>

        {/* 5 */}
        <H2>5. Enquiries &amp; Communications</H2>
        <P>
          When you submit an enquiry through the Platform, your name, phone number, and message are
          forwarded to the relevant business owner, builder, or broker. {SITE_NAME} is a communication
          facilitator only and is not a party to any transaction or agreement you enter into as a result.
          We are not liable for the conduct of any business, builder, broker, or individual you contact
          through the Platform.
        </P>

        {/* 6 */}
        <H2>6. Intellectual Property</H2>
        <P>
          All original content on the Platform — including the {SITE_NAME} name, logo, design, software,
          and editorial content — is owned by or licensed to us and protected by applicable intellectual
          property laws. You may not copy, reproduce, or distribute any part of the Platform without our
          prior written permission.
        </P>

        {/* 7 */}
        <H2>7. Third-Party Services</H2>
        <P>
          The Platform integrates third-party services including Supabase (database and authentication),
          Resend (email delivery), and Google (OAuth). Your use of these services is subject to their
          respective terms and privacy policies. We are not responsible for the availability or content
          of third-party services.
        </P>

        {/* 8 */}
        <H2>8. Disclaimers</H2>
        <P>
          The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
          of any kind, express or implied. We do not warrant that the Platform will be uninterrupted,
          error-free, or free of viruses. Property listings, prices, and availability are provided for
          informational purposes only and do not constitute an offer or guarantee.
        </P>

        {/* 9 */}
        <H2>9. Limitation of Liability</H2>
        <P>
          To the maximum extent permitted by applicable law, {SITE_NAME} and its officers, directors,
          employees, and affiliates shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages arising from your use of or inability to use the Platform,
          even if advised of the possibility of such damages. Our total liability for any claim relating
          to the Platform shall not exceed ₹5,000.
        </P>

        {/* 10 */}
        <H2>10. Indemnification</H2>
        <P>
          You agree to indemnify and hold {SITE_NAME} harmless from any claims, losses, damages, or
          expenses (including reasonable legal fees) arising from your use of the Platform, your content,
          or your violation of these Terms.
        </P>

        {/* 11 */}
        <H2>11. Termination</H2>
        <P>
          We may suspend or terminate your account and access to the Platform at any time, with or without
          notice, if you violate these Terms or if we discontinue the Platform. You may close your account
          at any time by contacting us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>.
        </P>

        {/* 12 */}
        <H2>12. Governing Law &amp; Dispute Resolution</H2>
        <P>
          These Terms are governed by the laws of India. Any disputes arising from these Terms or your
          use of the Platform shall be subject to the exclusive jurisdiction of the courts in Hyderabad,
          Telangana, India. We encourage you to contact us first to resolve any dispute informally.
        </P>

        {/* 13 */}
        <H2>13. Changes to These Terms</H2>
        <P>
          We may revise these Terms at any time. We will post the updated Terms on this page with a
          revised effective date. Your continued use of the Platform after any changes constitutes your
          acceptance of the new Terms.
        </P>

        {/* 14 */}
        <H2>14. Contact</H2>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 space-y-1">
          <p className="font-semibold">{SITE_NAME}</p>
          <p>Neopolis District, Hyderabad, Telangana, India</p>
          <p>
            Email:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-brand-600">Cookie Notice</Link>
          <Link href="/" className="hover:text-brand-600">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
