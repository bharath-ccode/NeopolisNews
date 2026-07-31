"use client";

import { useState, useEffect, useRef } from "react";
import { Film, Plus, Trash2, Loader2, Upload, X, ExternalLink } from "lucide-react";

interface NowShowingItem {
  id: string;
  title: string;
  poster_url: string | null;
  genres: string[];
  languages: string[];
  formats: string[];
  bms_url: string | null;
  running_from: string;
  running_until: string | null;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

const GENRE_OPTIONS = ["Action", "Comedy", "Drama", "Romance", "Thriller", "Horror", "Sci-Fi", "Animation", "Family", "Documentary", "Fantasy", "Crime", "Biography"];
const LANGUAGE_OPTIONS = ["Telugu", "Hindi", "Tamil", "English", "Kannada", "Malayalam", "Bengali", "Marathi"];
const FORMAT_OPTIONS = ["2D", "3D", "IMAX", "4DX", "Dolby Atmos"];

function MultiSelect({
  label, options, selected, onChange,
}: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  }
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              selected.includes(opt)
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NowShowingTab({ businessId, token }: { businessId: string; token: string }) {
  const [movies, setMovies] = useState<NowShowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [bmsUrl, setBmsUrl] = useState("");
  const [runningFrom, setRunningFrom] = useState(new Date().toISOString().slice(0, 10));
  const [runningUntil, setRunningUntil] = useState("");

  useEffect(() => {
    fetch(`/api/my-business/now-showing?businessId=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setMovies(Array.isArray(data) ? data : []); setLoading(false); });
  }, [businessId, token]);

  async function uploadPoster(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return res.ok ? data.url : null;
  }

  async function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadPoster(file);
    if (url) setPosterUrl(url);
    setUploading(false);
    if (posterRef.current) posterRef.current.value = "";
  }

  function resetForm() {
    setTitle(""); setPosterUrl(null); setGenres([]); setLanguages([]); setFormats([]);
    setBmsUrl(""); setRunningFrom(new Date().toISOString().slice(0, 10)); setRunningUntil("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !runningFrom) return;
    setSaving(true);
    const res = await fetch("/api/my-business/now-showing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        businessId, title, poster_url: posterUrl, genres, languages, formats,
        bms_url: bmsUrl.trim() || null, running_from: runningFrom,
        running_until: runningUntil || null,
      }),
    });
    if (res.ok) {
      const newMovie = await res.json();
      setMovies((prev) => [newMovie, ...prev]);
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/my-business/now-showing/${id}?businessId=${businessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMovies((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Now Showing</h3>
          <p className="text-xs text-gray-400 mt-0.5">{movies.length} movie{movies.length !== 1 ? "s" : ""} listed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">Add Movie</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Movie Title *</label>
              <input className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pushpa 2" required />
            </div>

            <div>
              <label className={LABEL}>Poster Image</label>
              {posterUrl ? (
                <div className="relative w-28 h-40 rounded-xl overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPosterUrl(null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => posterRef.current?.click()} disabled={uploading}
                  className="w-28 h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-brand-600 transition-colors text-xs">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? "Uploading…" : "Upload poster"}
                </button>
              )}
              <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
            </div>

            <MultiSelect label="Genres" options={GENRE_OPTIONS} selected={genres} onChange={setGenres} />
            <MultiSelect label="Languages" options={LANGUAGE_OPTIONS} selected={languages} onChange={setLanguages} />
            <MultiSelect label="Formats" options={FORMAT_OPTIONS} selected={formats} onChange={setFormats} />

            <div>
              <label className={LABEL}>BookMyShow URL</label>
              <input type="url" className={INPUT} value={bmsUrl} onChange={(e) => setBmsUrl(e.target.value)} placeholder="https://in.bookmyshow.com/…" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Running From *</label>
                <input type="date" className={INPUT} value={runningFrom} onChange={(e) => setRunningFrom(e.target.value)} required />
              </div>
              <div>
                <label className={LABEL}>Running Until</label>
                <input type="date" className={INPUT} value={runningUntil} onChange={(e) => setRunningUntil(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary text-sm flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Movie"}
              </button>
            </div>
          </form>
        </div>
      )}

      {movies.length === 0 && !showForm ? (
        <div className="card p-10 text-center border-dashed">
          <Film className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No movies added yet. Add currently running films so residents know what&apos;s on.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {movies.map((m) => (
            <div key={m.id} className="card p-4 flex gap-4">
              {m.poster_url ? (
                <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-20 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                  <Film className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{m.title}</p>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  From {new Date(m.running_from).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {m.running_until && (
                    <> · Until {new Date(m.running_until).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                  )}
                </p>
                {m.languages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{m.languages.join(" · ")}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {m.formats.map((f) => (
                    <span key={f} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                  {m.genres.slice(0, 3).map((g) => (
                    <span key={g} className="bg-brand-50 text-brand-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
                {m.bms_url && (
                  <a href={m.bms_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 mt-1.5">
                    <ExternalLink className="w-3 h-3" /> BookMyShow
                  </a>
                )}
              </div>
              <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id}
                className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 self-start">
                {deletingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
