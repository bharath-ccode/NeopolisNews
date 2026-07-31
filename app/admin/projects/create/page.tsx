import ProjectForm from "@/app/admin/projects/ProjectForm";

export default function CreateProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Add Project</h2>
        <p className="text-sm text-gray-400">
          Create a new real estate project with contacts and floor plans
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ProjectForm />
      </div>
    </div>
  );
}
