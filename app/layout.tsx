import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalShell from "@/components/ConditionalShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
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
  },
  alternates: { canonical: SITE_URL },
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
