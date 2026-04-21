"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { createBuilder, updateBuilder, type Builder, type BuilderInput } from "@/lib/buildersStore";

interface BuilderFormProps {
  initialData?: Builder;
}

const EMPTY: BuilderInput = {
  builderName: "",
  logoUrl: null,
  address: null,
  email: null,
  phone: null,
  website: null,
};

export default function BuilderForm({ initialData }: BuilderFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BuilderInput>(
    initialData
      ? {
          builderName: initialData.builderName,
          logoUrl: initialData.logoUrl,
          address: initialData.address,
          email: initialData.email,
          phone: initialData.phone,
          website: initialData.website,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialData;

  function set(field: keyof BuilderInput, value: string | null) {
    setForm((f) => ({ ...f, [field]: value || null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.builderName.trim()) {
      setError("Builder name is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await updateBuilder(initialData!.id, form);
      } else {
        await createBuilder(form);
      }
      router.push("/admin/builders");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Logo */}
      <div>
        <label className="label">Builder Logo</label>
        <ImageUpload
          value={form.logoUrl}
          onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
          folder="builders/logos"
          label="Upload Logo"
        />
        <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · max 5 MB</p>
      </div>

      {/* Builder Name */}
      <div>
        <label className="label">
          Builder Name <span className="text-red-500">*</span>
        </label>
        <input
          className="input"
          placeholder="e.g. Prestige Group"
          value={form.builderName}
          onChange={(e) => setForm((f) => ({ ...f, builderName: e.target.value }))}
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className="label">Address</label>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Office address"
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="contact@builder.com"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className="input"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="label">Website</label>
        <input
          className="input"
          type="url"
          placeholder="https://builder.com"
          value={form.website ?? ""}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Update Builder" : "Create Builder"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/builders")}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
