"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BuilderForm from "@/app/admin/builders/BuilderForm";
import { getBuilderById, type Builder } from "@/lib/buildersStore";

export default function EditBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBuilderById(id).then((b) => {
      setBuilder(b);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="text-center py-20 text-gray-500">Builder not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Edit Builder</h2>
        <p className="text-sm text-gray-400">{builder.builderName}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <BuilderForm initialData={builder} />
      </div>
    </div>
  );
}
