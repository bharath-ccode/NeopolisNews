import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

export const metadata: Metadata = {
  title: "Neopolis Poll — Have Your Say",
  description: "Vote on the question of the day and see how Neopolis is leaning, plus every past poll in the archive.",
  alternates: { canonical: `${SITE_URL}/polls` },
  openGraph: {
    title: "Neopolis Poll — Have Your Say",
    description: "Vote on the question of the day and see how Neopolis is leaning.",
    url: `${SITE_URL}/polls`,
  },
};

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
