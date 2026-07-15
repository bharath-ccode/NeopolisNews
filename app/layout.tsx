import type { Metadata } from "next";
import { Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalShell from "@/components/ConditionalShell";

// Self-hosted Telugu UI font — clean and highly legible for headings and body.
const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-telugu",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "Neopolis News – Kokapet & Narsingi Local News, Real Estate & Business Directory",
    template: "%s | Neopolis News",
  },
  description:
    "Neopolis News — Urban District Gateway. Real estate, rentals, local businesses, health, deals, events and news for Kokapet, Narsingi and the Neopolis urban district.",
  keywords: [
    "Neopolis News",
    "Neopolis",
    "Kokapet",
    "Narsingi",
    "Hyderabad real estate",
    "Kokapet apartments",
    "Narsingi businesses",
    "Neopolis district",
    "local news Hyderabad",
    "Kokapet rentals",
    "mixed-use urban district",
    "Neopolis Hyderabad",
  ],
  openGraph: {
    title: "Neopolis News – Kokapet & Narsingi Local News, Real Estate & Business Directory",
    description:
      "Urban District Gateway — news, real estate, business directory, health, deals and events for Kokapet & Narsingi, Hyderabad.",
    type: "website",
    url: SITE_URL,
    siteName: "Neopolis News",
    images: [{ url: `${SITE_URL}/banner.png` }],
  },
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  alternates: { canonical: SITE_URL },
};

// Social profiles (comma-separated URLs) strengthen the brand-entity signal.
const SAME_AS = (process.env.NEXT_PUBLIC_SOCIAL_LINKS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: "Neopolis News",
  alternateName: "NeopolisNews",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  description:
    "Hyperlocal news, real estate, business directory, community clubs and deals for the Neopolis urban district — Kokapet & Narsingi, Hyderabad.",
  areaServed: [
    { "@type": "Place", name: "Kokapet, Hyderabad" },
    { "@type": "Place", name: "Narsingi, Hyderabad" },
    { "@type": "Place", name: "Neopolis, Hyderabad" },
  ],
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Neopolis News",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoTelugu.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </AuthProvider>
      </body>
    </html>
  );
}
