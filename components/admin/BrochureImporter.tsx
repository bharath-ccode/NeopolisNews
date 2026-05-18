"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, Sparkles, CheckCircle, AlertCircle, X } from "lucide-react";

export interface ImportedProjectData {
  projectName?: string;
  projectType?: string;
  tier?: string;
  lifecycleStatus?: string;
  totalLandAreaAcres?: number;
  totalUnits?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  maxFloors?: number;
  amenitiesSqft?: number;
  reraNumber?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    projectOwner?: string;
  };
  towers?: { towerName: string; numFloors: number }[];
  unitPlans?: {
    planName: string;
    bhk: number;
    sizeSqft: number;
    facing?: string;
    maidRoom?: boolean;
    homeOffice?: boolean;
  }[];
  amenities?: string[];
}

interface Props {
  onImport: (data: ImportedProjectData) => void;
}

type Status = "idle" | "loading" | "done" | "error";

export default function BrochureImporter({ onImport }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    setSummary(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/import-brochure", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed.");

      const data = json as ImportedProjectData;
      onImport(data);

      const parts: string[] = [];
      if (data.projectName)                  parts.push(`Project: ${data.projectName}`);
      if (data.unitPlans?.length)            parts.push(`${data.unitPlans.length} unit plan${data.unitPlans.length !== 1 ? "s" : ""}`);
      if (data.towers?.length)               parts.push(`${data.towers.length} tower${data.towers.length !== 1 ? "s" : ""}`);
      if (data.amenities?.length)            parts.push(`${data.amenities.length} amenities`);
      if (data.contact?.email || data.contact?.phone) parts.push("contact details");

      setSummary(parts.join(" · "));
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
      setStatus("error");
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  if (dismissed) return null;

  return (
    <div className="relative rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-5">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Import from Brochure</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Upload a PDF brochure — AI will extract project details and pre-fill this form.
          </p>

          {status === "idle" && (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <FileUp className="w-4 h-4" />
                Upload PDF
              </button>
              <span className="text-xs text-gray-400">or drag & drop here</span>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reading brochure… this takes 15–30 seconds</span>
            </div>
          )}

          {status === "done" && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Fields imported — review and save</p>
                {summary && <p className="text-xs text-gray-500 mt-0.5">{summary}</p>}
                <button
                  type="button"
                  onClick={() => { setStatus("idle"); setSummary(null); }}
                  className="text-xs text-brand-600 hover:underline mt-1"
                >
                  Import another brochure
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => { setStatus("idle"); setError(null); }}
                  className="text-xs text-brand-600 hover:underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
