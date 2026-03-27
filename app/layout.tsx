import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "NeopolisNews – Urban District Digital Platform",
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
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
