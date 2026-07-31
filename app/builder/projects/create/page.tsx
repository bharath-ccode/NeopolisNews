"use client";

import { useBuilderAuth } from "@/context/BuilderAuthContext";
import ProjectForm from "@/app/admin/projects/ProjectForm";

export default function BuilderCreateProjectPage() {
  const { builder } = useBuilderAuth();
  if (!builder) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">New Project</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Create a project page for {builder.builderName}.
        </p>
      </div>
      <ProjectForm
        lockedBuilderId={builder.id}
        redirectTo="/builder/projects"
      />
    </div>
  );
}
