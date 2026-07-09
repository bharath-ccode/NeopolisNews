import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  title: "Neopolis Leaderboard — Points for Showing Up",
  description:
    "Who's building Neopolis? The community leaderboard: points earned at club events, plantation drives, wellness sessions and local businesses in Kokapet.",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
  openGraph: {
    title: "Neopolis Leaderboard",
    description: "Points are earned by showing up. See who's building Neopolis.",
    url: `${SITE_URL}/leaderboard`,
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
