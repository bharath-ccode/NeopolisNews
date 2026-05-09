"use client";

import { useState } from "react";
import { FileText, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export default function MasterPlanModal({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const isPdf = url.toLowerCase().includes(".pdf");

  return (
    <>
      {/* Trigger card */}
      <button
        onClick={() => { setOpen(true); setScale(1); }}
        className="card p-5 flex items-center gap-4 hover:border-brand-300 hover:shadow-md transition-all group w-full text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
            View Project Layout / Master Plan
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Click to view</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0" />
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 shrink-0">
            <p className="text-white text-sm font-semibold">Master Plan</p>
            <div className="flex items-center gap-2">
              {!isPdf && (
                <>
                  <button
                    onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-white text-xs font-mono w-10 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)))}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4">
            {isPdf ? (
              <iframe
                src={url}
                className="w-full max-w-4xl rounded-lg"
                style={{ height: "80vh" }}
                title="Master Plan"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="Master Plan"
                style={{ transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform 0.2s" }}
                className="max-w-full rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
