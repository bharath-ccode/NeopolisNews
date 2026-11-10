"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Loader2, AlertCircle, Check, X, Upload, Crop as CropIcon } from "lucide-react";
import { uploadImage } from "@/lib/uploadUtils";

interface Rect { x: number; y: number; w: number; h: number; }

interface Props {
  brochureUrl: string;
  initialPage: number;
  /** Upload destination folder, e.g. "projects/plans" or "projects/logos". */
  folder: string;
  /** What this picker is for, shown in the header — e.g. "master plan", "logo". */
  label: string;
  onConfirm: (url: string) => void;
  onSkip: () => void;
}

const DISPLAY_WIDTH = 1400; // internal render resolution; shown scaled via CSS

/** Renders a page of the brochure PDF client-side (pdfjs-dist — the same
 *  library every in-browser PDF viewer uses; there is no server-side PDF
 *  rasterization available here: sharp's prebuilt binary lists "pdf" as a
 *  format but has no actual PDF backend compiled in, confirmed against a
 *  real PDF before building this) at an admin-editable page number, lets
 *  them drag a crop rectangle over exactly the part they want (a logo is a
 *  small corner graphic; a master plan is usually a whole page or half of
 *  one — one drag-to-select tool covers both rather than guessing fixed
 *  regions), and uploads the result — or, if nothing here is right, lets
 *  them upload their own image file instead. */
export default function BrochurePagePicker({ brochureUrl, initialPage, folder, label, onConfirm, onSkip }: Props) {
  const [page, setPage] = useState(Math.max(1, initialPage || 1));
  const [pageInput, setPageInput] = useState(String(page));
  const [rendering, setRendering] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const render = useCallback(async (pageNum: number) => {
    setRendering(true);
    setError(null);
    setSelection(null);
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
      const viewport = pdfPage.getViewport({ scale: DISPLAY_WIDTH / baseWidth });

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pdfPage.render({ canvas, viewport }).promise;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't render that page.");
    } finally {
      setRendering(false);
    }
  }, [brochureUrl]);

  useEffect(() => { render(page); }, [page, render]);

  function goToPage() {
    const n = parseInt(pageInput, 10);
    if (Number.isInteger(n) && n >= 1) setPage(n);
    else setPageInput(String(page));
  }

  // Drag-to-select in displayed (CSS) pixels; converted to canvas-native
  // pixels at crop time via the display/canvas width ratio.
  function pointerPos(e: React.PointerEvent): { x: number; y: number } | null {
    const wrap = wrapperRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = pointerPos(e);
    if (!p) return;
    setDragStart(p);
    setSelection({ x: p.x, y: p.y, w: 0, h: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart) return;
    const p = pointerPos(e);
    if (!p) return;
    setSelection({
      x: Math.min(dragStart.x, p.x),
      y: Math.min(dragStart.y, p.y),
      w: Math.abs(p.x - dragStart.x),
      h: Math.abs(p.y - dragStart.y),
    });
  }

  function onPointerUp() {
    setDragStart(null);
    // Ignore accidental clicks/tiny drags — treat as "no selection" (full page).
    if (selection && selection.w < 8 && selection.h < 8) setSelection(null);
  }

  async function confirm() {
    const canvas = canvasRef.current;
    const wrap = wrapperRef.current;
    if (!canvas || !wrap) return;
    setUploading(true);
    setError(null);
    try {
      const displayWidth = wrap.getBoundingClientRect().width;
      const ratio = canvas.width / displayWidth;

      let sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
      if (selection && selection.w > 0 && selection.h > 0) {
        sx = selection.x * ratio;
        sy = selection.y * ratio;
        sw = selection.w * ratio;
        sh = selection.h * ratio;
      }

      const out = document.createElement("canvas");
      out.width = sw;
      out.height = sh;
      out.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob: Blob = await new Promise((resolve, reject) =>
        out.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png")
      );
      const file = new File([blob], `brochure-page-${page}.png`, { type: "image/png" });
      const url = await uploadImage(file, folder);
      onConfirm(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // Escape hatch for when nothing on the brochure is right — no more
  // paging/cropping, just use whatever image the admin provides.
  async function handleOwnFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5 MB"); return; }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, folder);
      onConfirm(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
          <CropIcon className="w-3.5 h-3.5" /> Pick the {label} from the brochure — drag to crop, or use the whole page
        </p>
        <button type="button" onClick={onSkip} className="text-gray-400 hover:text-gray-600" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={wrapperRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center min-h-[160px] cursor-crosshair select-none touch-none"
      >
        {rendering && <Loader2 className="w-6 h-6 animate-spin text-brand-500 absolute" />}
        <canvas ref={canvasRef} className={`max-w-full h-auto pointer-events-none ${rendering ? "opacity-0" : "opacity-100"}`} />
        {selection && selection.w > 0 && selection.h > 0 && (
          <div
            className="absolute border-2 border-brand-500 bg-brand-500/10 pointer-events-none"
            style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-500">Page</span>
          <input
            type="number"
            min={1}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={goToPage}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goToPage(); } }}
            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {selection && (
          <button type="button" onClick={() => setSelection(null)}
            className="text-xs text-gray-500 hover:text-brand-600 underline">
            Reset to full page
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-brand-300 disabled:opacity-60 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
            title="Not on the brochure? Upload your own image instead.">
            <Upload className="w-3.5 h-3.5" /> Upload my own instead
          </button>
          <button type="button" onClick={confirm} disabled={rendering || uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {uploading ? "Uploading…" : "Use This"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleOwnFile}
        className="hidden"
      />
    </div>
  );
}
