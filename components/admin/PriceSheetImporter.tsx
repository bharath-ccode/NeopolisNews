"use client";

import { useRef, useState } from "react";
import { FileUp, Link2, Loader2, Sparkles, CheckCircle, AlertCircle, X } from "lucide-react";

export interface ImportedPriceSheet {
  basePricePerSft: number;
  charges: Record<string, string>;
  priceSheetUrl: string;
}

interface Props {
  onImport: (data: ImportedPriceSheet) => void;
}

type Status = "idle" | "loading" | "done" | "error";

/** Same pattern as BrochureImporter, trimmed to the two fields a price
 *  sheet actually has: a numeric base price/sft and a flexible charges
 *  blob — real sheets vary too much (floor rise, facing, view, club,
 *  parking, legal...) to force into fixed columns. */
export default function PriceSheetImporter({ onImport }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function extractFromUrl(pdfUrl: string) {
    const res = await fetch("/api/admin/import-price-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pdfUrl }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Import failed.");
    onImport(json as ImportedPriceSheet);
    setStatus("done");
  }

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const { uploadImage } = await import("@/lib/uploadUtils");
      const pdfUrl = await uploadImage(file, "price-sheets/temp");
      await extractFromUrl(pdfUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
      setStatus("error");
    }
  }

  async function processUrl() {
    const url = urlInput.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      setError("Enter a full URL starting with http:// or https://");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await extractFromUrl(url);
      setUrlInput("");
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
      <button type="button" onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors" title="Dismiss">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Import from Price Sheet</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Upload the developer&apos;s price sheet PDF — AI will pull the base price and charges below for you to review before saving.
          </p>

          {status === "idle" && (
            <div className="space-y-3">
              <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="flex items-center gap-3">
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <FileUp className="w-4 h-4" /> Upload PDF
                </button>
                <span className="text-xs text-gray-400">or drag & drop here</span>
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileChange} />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); processUrl(); } }}
                    placeholder="or paste a price sheet PDF link — https://…"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button type="button" onClick={processUrl} disabled={!urlInput.trim()}
                  className="px-4 py-2 border border-brand-300 text-brand-700 bg-white hover:bg-brand-50 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Import from URL
                </button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reading price sheet… this takes 15–30 seconds</span>
            </div>
          )}

          {status === "done" && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Pulled below — review and save</p>
                <button type="button" onClick={() => setStatus("idle")} className="text-xs text-brand-600 hover:underline mt-1">
                  Import another sheet
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-600">{error}</p>
                <button type="button" onClick={() => { setStatus("idle"); setError(null); }} className="text-xs text-brand-600 hover:underline mt-1">
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
