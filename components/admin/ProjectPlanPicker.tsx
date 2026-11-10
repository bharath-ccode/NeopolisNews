"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check, X, Crop as CropIcon } from "lucide-react";
import { uploadImage } from "@/lib/uploadUtils";

export type PlanCrop = "full" | "left_half" | "right_half" | "top_half" | "bottom_half";

const CROP_LABELS: Record<PlanCrop, string> = {
  full: "Full page",
  left_half: "Left half",
  right_half: "Right half",
  top_half: "Top half",
  bottom_half: "Bottom half",
};
const CROP_ORDER: PlanCrop[] = ["full", "left_half", "right_half", "top_half", "bottom_half"];

interface Props {
  brochureUrl: string;
  initialPage: number;
  initialCrop: PlanCrop;
  onConfirm: (url: string) => void;
  onSkip: () => void;
}

/** Renders one page of the brochure PDF client-side (pdfjs-dist — the same
 *  library every in-browser PDF viewer uses; there is no server-side PDF
 *  rasterization available here: sharp's prebuilt binary lists "pdf" as a
 *  format but has no actual PDF backend compiled in, confirmed against a
 *  real PDF before building this) and lets the admin crop/nudge/confirm it
 *  as the project's master-plan image — replacing the old
 *  screenshot-and-upload-manually step with a review-and-confirm one. */
export default function ProjectPlanPicker({ brochureUrl, initialPage, initialCrop, onConfirm, onSkip }: Props) {
  const [page, setPage] = useState(Math.max(1, initialPage || 1));
  const [crop, setCrop] = useState<PlanCrop>(initialCrop || "full");
  const [rendering, setRendering] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  const render = useCallback(async (pageNum: number, cropMode: PlanCrop) => {
    setRendering(true);
    setError(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // A plain public/ path, not new URL(..., import.meta.url) — webpack's
      // Terser pass chokes on the worker file's top-level `import.meta`
      // when it's bundled as a JS module instead of copied as a static
      // asset. public/pdf.worker.min.mjs is copied from this exact
      // pdfjs-dist version — re-copy it if that dependency is upgraded.
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      if (!pdfRef.current) {
        pdfRef.current = await pdfjsLib.getDocument({ url: brochureUrl }).promise;
      }
      const pdf = pdfRef.current;
      if (pageNum > pdf.numPages) throw new Error(`Brochure only has ${pdf.numPages} pages.`);

      const pdfPage = await pdf.getPage(pageNum);
      const baseWidth = pdfPage.getViewport({ scale: 1 }).width;
      const viewport = pdfPage.getViewport({ scale: 1800 / baseWidth });

      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = viewport.width;
      fullCanvas.height = viewport.height;
      await pdfPage.render({ canvas: fullCanvas, viewport }).promise;

      // Crop to the half the master plan actually occupies, if it shares the page
      // with other content (e.g. an amenities list laid out beside the diagram).
      let sx = 0, sy = 0, sw = fullCanvas.width, sh = fullCanvas.height;
      if (cropMode === "left_half") sw = fullCanvas.width / 2;
      if (cropMode === "right_half") { sx = fullCanvas.width / 2; sw = fullCanvas.width / 2; }
      if (cropMode === "top_half") sh = fullCanvas.height / 2;
      if (cropMode === "bottom_half") { sy = fullCanvas.height / 2; sh = fullCanvas.height / 2; }

      const out = canvasRef.current;
      if (!out) return;
      out.width = sw;
      out.height = sh;
      const outCtx = out.getContext("2d");
      outCtx?.drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't render that page.");
    } finally {
      setRendering(false);
    }
  }, [brochureUrl]);

  useEffect(() => { render(page, crop); }, [page, crop, render]);

  async function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    setError(null);
    try {
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png")
      );
      const file = new File([blob], `project-plan-page-${page}.png`, { type: "image/png" });
      const url = await uploadImage(file, "projects/plans");
      onConfirm(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
          <CropIcon className="w-3.5 h-3.5" /> Master plan found on page {initialPage} — review before using
        </p>
        <button type="button" onClick={onSkip} className="text-gray-400 hover:text-gray-600" title="Skip — I'll add it manually">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center min-h-[160px]">
        {rendering && <Loader2 className="w-6 h-6 animate-spin text-brand-500 absolute" />}
        <canvas ref={canvasRef} className={`max-w-full h-auto ${rendering ? "opacity-0" : "opacity-100"}`} />
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-300 text-gray-500">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-gray-500 px-1">Page {page}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)}
            className="p-1.5 border border-gray-200 rounded-lg hover:border-brand-300 text-gray-500">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-1">
          {CROP_ORDER.map((c) => (
            <button key={c} type="button" onClick={() => setCrop(c)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                crop === c ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-500 border-gray-200 hover:border-brand-300"
              }`}>
              {CROP_LABELS[c]}
            </button>
          ))}
        </div>

        <button type="button" onClick={confirm} disabled={rendering || uploading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : "Use as Project Plan"}
        </button>
      </div>
    </div>
  );
}
