import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalShell from "@/components/ConditionalShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  title: {
    default: "NeopolisNews – Urban District Digital Platform",
    template: "%s | NeopolisNews",
  },
  description:
    "Your single source of truth for Neopolis – real estate, rentals, retail, news, and services for India's next urban micro-city.",
  keywords: [
    "Neopolis",
    "urban district",
    "real estate India",
    "mixed-use development",
    "rentals",
    "commercial property",
  ],
  openGraph: {
    title: "NeopolisNews – Urban District Digital Platform",
    description:
      "Real estate intelligence, rentals, retail directory, local news & services for the Neopolis urban district.",
    type: "website",
    url: SITE_URL,
    siteName: "NeopolisNews",
  },
  alternates: { canonical: SITE_URL },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NeopolisNews",
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
