import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ArticleView, { buildArticleMetadata } from "./ArticleView";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  return buildArticleMetadata(params.id, "en");
}

export default function ArticlePage(
  { params, searchParams }: { params: { id: string }; searchParams: { lang?: string } }
) {
  // Legacy Telugu URLs (?lang=te) moved to the path-based /news/te/[id].
  if (searchParams.lang === "te") permanentRedirect(`/news/te/${params.id}`);
  return <ArticleView id={params.id} lang="en" />;
}
