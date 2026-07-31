import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  title: "Community Clubs — Running, Civic, Hobbies & More in Neopolis, Kokapet",
  description:
    "Join Neopolis community clubs — running groups, civic & green volunteering, hobby circles and family activities in Kokapet & Narsingi, Hyderabad. Attend events, earn Neopolis Points.",
  alternates: { canonical: `${SITE_URL}/clubs` },
  openGraph: {
    title: "Neopolis Community Clubs",
    description: "Do things together. Earn points for showing up.",
    url: `${SITE_URL}/clubs`,
  },
};

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
