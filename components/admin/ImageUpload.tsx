"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/uploadUtils";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  accept?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="h-28 w-28 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-2 w-36 h-28 border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors text-gray-400 hover:text-brand-500 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin mt-6" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 mt-5" />
              <Upload className="w-4 h-4" />
            </>
          )}
          <span className="text-xs font-medium px-2 text-center leading-tight">
            {uploading ? "Uploading…" : label}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
