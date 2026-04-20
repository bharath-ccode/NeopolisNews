"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Phone, Instagram, Facebook, Youtube,
  Clock, Loader2, CheckCircle, LogOut, ExternalLink,
  Image as ImageIcon, Upload, X, ShieldCheck,
  CalendarDays, Tag, Newspaper, Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DayTiming } from "@/lib/businessStore";
import EventsTab from "./_tabs/EventsTab";
import OffersTab from "./_tabs/OffersTab";
import NewsTab from "./_tabs/NewsTab";

interface SocialLinks { instagram?: string; facebook?: string; youtube?: string; }

interface Business {
  id: string;
  name: string;
  industry: string;
  address: string;
  status: string;
  verified: boolean;
  logo: string | null;
  pictures: string[];
  social_links: SocialLinks;
  contact_phone: string | null;
  description: string | null;
  timings: DayTiming[];
  view_count: number;
}

const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5";

type Tab = "profile" | "events" | "offers" | "news";

function TimingsEditor({ timings, onChange }: { timings: DayTiming[]; onChange: (t: DayTiming[]) => void }) {
  function update(idx: number, patch: Partial<DayTiming>) {
    onChange(timings.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-24">Day</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-20">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Opens</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Closes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {timings.map((t, idx) => (
            <tr key={t.day} className={t.closed ? "bg-gray-50/50" : ""}>
              <td className="px-4 py-2.5 font-medium text-gray-700 text-sm">{t.day.slice(0, 3)}</td>
              <td className="px-4 py-2.5">
                <button type="button" onClick={() => update(idx, { closed: !t.closed })}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    t.closed ? "bg-gray-100 border-gray-200 text-gray-400" : "bg-green-50 border-green-200 text-green-700"
                  }`}>
                  {t.closed ? "Closed" : "Open"}
                </button>
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? <span className="text-gray-300 text-xs">—</span> : (
                  <input type="time" value={t.open} onChange={(e) => update(idx, { open: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                )}
              </td>
              <td className="px-4 py-2.5">
                {t.closed ? <span className="text-gray-300 text-xs">—</span> : (
                  <input type="time" value={t.close} onChange={(e) => update(idx, { close: e.target.value })}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function loadFields(
  data: Business,
  setters: {
    setContactPhone: (v: string) => void;
    setDescription: (v: string) => void;
    setTimings: (v: DayTiming[]) => void;
    setInstagram: (v: string) => void;
    setFacebook: (v: string) => void;
    setYoutube: (v: string) => void;
    setLogo: (v: string | null) => void;
    setPictures: (v: string[]) => void;
  }
) {
  setters.setContactPhone(data.contact_phone?.replace(/^\+91/, "") ?? "");
  setters.setDescription(data.description ?? "");
  setters.setTimings(data.timings?.length ? data.timings : []);
  setters.setInstagram(data.social_links?.instagram ?? "");
  setters.setFacebook(data.social_links?.facebook ?? "");
  setters.setYoutube(data.social_links?.youtube ?? "");
  setters.setLogo(data.logo);
  setters.setPictures(data.pictures ?? []);
}

export default function MyBusinessPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [allBiz, setAllBiz] = useState<Business[]>([]);
  const [biz, setBiz] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Editable fields
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [timings, setTimings] = useState<DayTiming[]>([]);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  // Media
  const [logo, setLogo] = useState<string | null>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const fieldSetters = { setContactPhone, setDescription, setTimings, setInstagram, setFacebook, setYoutube, setLogo, setPictures };

  function switchBusiness(b: Business) {
    setBiz(b);
    setSaved(false);
    setError("");
    loadFields(b, fieldSetters);
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/my-business/login");
        return;
      }
      setToken(session.access_token);

      const { data, error: bizErr } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_email", session.user.email)
        .order("completed_at", { ascending: true });

      if (bizErr || !data?.length) {
        setError("No business found for your account. Contact support if this is unexpected.");
        setLoading(false);
        return;
      }

      setAllBiz(data as Business[]);
      const first = data[0] as Business;
      setBiz(first);
      loadFields(first, fieldSetters);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!biz || !token) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/my-business/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessId: biz.id,
          contactPhone: contactPhone ? `+91${contactPhone}` : null,
          description: description.trim() || null,
          timings,
          socialLinks: {
            instagram: instagram.trim() || undefined,
            facebook: facebook.trim() || undefined,
            youtube: youtube.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return res.ok ? data.url : null;
  }

  async function mediaAction(body: Record<string, unknown>): Promise<{ ok: boolean; pictures?: string[] }> {
    const res = await fetch("/api/my-business/media", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !biz) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setLogo(url);
      await mediaAction({ businessId: biz.id, type: "logo", action: "set", url });
    }
    setUploading(false);
    if (logoRef.current) logoRef.current.value = "";
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !biz || pictures.length >= 3) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const result = await mediaAction({ businessId: biz.id, type: "photo", action: "add", url });
      setPictures(result.pictures ?? [...pictures, url]);
    }
    setUploading(false);
    if (photoRef.current) photoRef.current.value = "";
  }

  async function removePhoto(idx: number) {
    if (!biz) return;
    const result = await mediaAction({ businessId: biz.id, type: "photo", action: "remove", index: idx });
    setPictures(result.pictures ?? pictures.filter((_, i) => i !== idx));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/my-business/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile",  label: "Profile",  icon: Building2    },
    { id: "events",   label: "Events",   icon: CalendarDays },
    { id: "offers",   label: "Offers",   icon: Tag          },
    { id: "news",     label: "News",     icon: Newspaper    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">My Business</p>
              <p className="text-sm font-bold text-gray-900 leading-none">{biz?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {biz && (
              <Link
                href={`/businesses/${biz.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex border-t border-gray-100">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Business switcher */}
        {allBiz.length > 1 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Your Businesses</p>
            <div className="flex flex-wrap gap-2">
              {allBiz.map((b) => (
                <button
                  key={b.id}
                  onClick={() => switchBusiness(b)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    biz?.id === b.id
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {b.verified && <ShieldCheck className="w-3.5 h-3.5" />}
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {biz?.verified && activeTab === "profile" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span><strong>Verified business</strong> — your listing is live and verified by NeopolisNews.</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* ── Events tab ──────────────────────────────────────────────────────── */}
        {activeTab === "events" && biz && token && (
          <EventsTab businessId={biz.id} token={token} />
        )}

        {/* ── Offers tab ──────────────────────────────────────────────────────── */}
        {activeTab === "offers" && biz && token && (
          <OffersTab businessId={biz.id} token={token} />
        )}

        {/* ── News tab ──────────────────────────────────────────────────────── */}
        {activeTab === "news" && biz && token && (
          <NewsTab businessId={biz.id} token={token} />
        )}

        {/* ── Profile tab ─────────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <>
            {/* View count stat */}
            {biz && (
              <div className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{(biz.view_count ?? 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-500">Total profile views</p>
                </div>
              </div>
            )}

            {/* Logo & Photos */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-600" /> Logo &amp; Photos
              </h2>

              <div className="mb-5">
                <p className={LABEL}>Logo</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button
                      onClick={() => logoRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {logo ? "Replace" : "Upload"} Logo
                    </button>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
                  </div>
                </div>
              </div>

              <div>
                <p className={LABEL}>Photos <span className="font-normal text-gray-400">({pictures.length}/3)</span></p>
                <div className="flex flex-wrap gap-3 mb-3">
                  {pictures.map((url, i) => (
                    <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {pictures.length < 3 && (
                    <button
                      onClick={() => photoRef.current?.click()}
                      disabled={uploading}
                      className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600 transition-colors"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span className="text-xs">Add photo</span>
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>

            {/* Contact & Social */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" /> Contact &amp; Social
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={LABEL}><Phone className="w-3.5 h-3.5 inline mr-1" />Customer Phone Number</label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500">+91</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9900000000"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL}><Instagram className="w-3.5 h-3.5 inline mr-1" />Instagram URL</label>
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourbusiness" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}><Facebook className="w-3.5 h-3.5 inline mr-1" />Facebook URL</label>
                  <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourbusiness" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}><Youtube className="w-3.5 h-3.5 inline mr-1" />YouTube URL</label>
                  <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel" className={INPUT} />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-base mb-4">About Your Business</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers what makes your place special…"
                rows={4}
                maxLength={300}
                className={INPUT + " resize-none"}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/300</p>
            </div>

            {/* Hours */}
            {timings.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" /> Business Hours
                </h2>
                <TimingsEditor timings={timings} onChange={setTimings} />
              </div>
            )}

            {/* Save */}
            <div className="flex items-center gap-3 pb-8">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : saved ? (
                  <><CheckCircle className="w-4 h-4" /> Saved!</>
                ) : (
                  "Save Changes"
                )}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium">Changes saved successfully.</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
