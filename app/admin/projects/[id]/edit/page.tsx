"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProjectForm from "@/app/admin/projects/ProjectForm";
import { getProjectById, type Project } from "@/lib/projectsStore";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectById(id).then((p) => {
      setProject(p);
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

  if (!project) {
    return (
      <div className="text-center py-20 text-gray-500">Project not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
        <p className="text-sm text-gray-400">{project.projectName}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ProjectForm initialData={project} />
      </div>
    </div>
  );
}
