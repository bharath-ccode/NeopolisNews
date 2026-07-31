import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  title: "Today in Neopolis — Daily Cartoon",
  description:
    "One panel a day from a city under construction. The daily cartoon about life in Neopolis, Kokapet — plus the weekly caption contest.",
  alternates: { canonical: `${SITE_URL}/cartoon` },
  openGraph: {
    title: "Today in Neopolis — Daily Cartoon",
    description: "One panel a day from a city under construction.",
    url: `${SITE_URL}/cartoon`,
  },
};

export default function CartoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
