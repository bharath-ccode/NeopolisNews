"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useBuilderAuth } from "@/context/BuilderAuthContext";
import { getProjectById, Project } from "@/lib/projectsStore";
import ProjectForm from "@/app/admin/projects/ProjectForm";

export default function BuilderEditProjectPage() {
  const { builder }  = useBuilderAuth();
  const { id }       = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(setProject);
  }, [id]);

  if (project === undefined) {
    return (
      <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
    );
  }

  // Guard: only the owning builder can edit
  if (!project || project.builderId !== builder?.id) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Project not found or access denied.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">
          Edit Project
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{project.projectName}</p>
      </div>
      <ProjectForm
        initialData={project}
        lockedBuilderId={builder!.id}
        redirectTo="/builder/projects"
      />
    </div>
  );
}
