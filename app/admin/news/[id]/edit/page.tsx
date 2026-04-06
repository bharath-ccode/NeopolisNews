"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { getArticleById, Article } from "@/lib/newsStore";
import ArticleForm from "../../ArticleForm";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    const found = getArticleById(id);
    setArticle(found);
  }, [id]);

  if (article === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Article not found</h2>
        <p className="text-gray-500 text-sm mb-4">
          The article you&apos;re trying to edit doesn&apos;t exist or was deleted.
        </p>
        <button
          onClick={() => router.push("/admin/news")}
          className="btn-primary text-sm py-2"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return <ArticleForm article={article} />;
}
