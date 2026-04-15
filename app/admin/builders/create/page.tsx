import BuilderForm from "@/app/admin/builders/BuilderForm";

export default function CreateBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Add Builder</h2>
        <p className="text-sm text-gray-400">Register a new builder/developer</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <BuilderForm />
      </div>
    </div>
  );
}
