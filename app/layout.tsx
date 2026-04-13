import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalShell from "@/components/ConditionalShell";

export const metadata: Metadata = {
  title: "NeopolisNews – India's Finest Urban District",
  description:
    "Your single source of truth for Neopolis – real estate, rentals, retail, news, and services for India's finest urban district.",
  keywords: [
    "Neopolis",
    "urban district",
    "real estate India",
    "mixed-use development",
    "rentals",
    "commercial property",
  ],
  openGraph: {
    title: "NeopolisNews – India's Finest Urban District",
    description:
      "Real estate intelligence, rentals, retail directory, local news & services for India's finest urban district.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </AuthProvider>
      </body>
    </html>
  );
}
