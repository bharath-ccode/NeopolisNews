import type { Metadata } from "next";
import ArticleView, { buildArticleMetadata } from "../../[id]/ArticleView";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  return buildArticleMetadata(params.id, "te");
}

export default function TeluguArticlePage({ params }: { params: { id: string } }) {
  return <ArticleView id={params.id} lang="te" />;
}
