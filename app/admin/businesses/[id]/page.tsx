"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ImageIcon,
  Loader2,
  X,
  CheckCircle,
  Copy,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Save,
  FileText,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { getBusinessById, saveBusiness, type BusinessRecord, type SocialLinks } from "@/lib/businessStore";
import { createClient } from "@/lib/supabase/client";

interface VerificationRequest {
  id: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  proof_url: string | null;
  status: string;
  created_at: string;
}

const MAX_PICTURES = 3;

function getInviteLink(id: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/onboard/${id}`;
}

export default function AdminBusinessEditPage() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [social, setSocial] = useState<SocialLinks>({});
  const [savingSocial, setSavingSocial] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveMsg, setApproveMsg] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const picRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const b = getBusinessById(id);
    if (!b) { setNotFound(true); return; }
    setBusiness(b);
    setSocial(b.socialLinks ?? {});

    // Fetch pending verification request from Supabase if status is pending
    createClient()
      .from("verification_requests")
      .select("id, submitter_name, submitter_email, submitter_phone, proof_url, status, created_at")
      .eq("business_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setVerificationRequest(data as VerificationRequest); });
  }, [id]);

  function persist(updated: BusinessRecord) {
    saveBusiness(updated);
    setBusiness(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Fire-and-forget sync to Supabase for public profile
    fetch("/api/businesses/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {});
  }

  function toggleVerified() {
    if (!business) return;
    persist({ ...business, verified: !business.verified });
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    setError("");
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "logos");
      persist({ ...business, logo: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function handlePictureAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    const pics = business.pictures ?? [];
    if (pics.length >= MAX_PICTURES) return;
    setError("");
    setUploadingPic(true);
    try {
      const url = await uploadFile(file, "pictures");
      persist({ ...business, pictures: [...pics, url] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPic(false);
      if (picRef.current) picRef.current.value = "";
    }
  }

  function removeLogo() {
    if (!business) return;
    const { logo: _, ...rest } = business;
    persist(rest as BusinessRecord);
  }

  function removePicture(idx: number) {
    if (!business) return;
    const pictures = (business.pictures ?? []).filter((_, i) => i !== idx);
    persist({ ...business, pictures });
  }

  function saveSocialLinks() {
    if (!business) return;
    setSavingSocial(true);
    persist({ ...business, socialLinks: social });
    setTimeout(() => setSavingSocial(false), 500);
  }

  function copyInviteLink() {
    if (!business) return;
    navigator.clipboard.writeText(getInviteLink(business.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function approveClaim() {
    if (!business) return;
    setApproving(true); setApproveMsg("");
    try {
      const res = await fetch(`/api/admin/businesses/${business.id}/approve-claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Approval failed."); return; }
      setApproveMsg(`Claim link sent to ${data.sentTo}`);
      setVerificationRequest(null);
      persist({ ...business, status: "verified" as BusinessRecord["status"] });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setApproving(false);
    }
  }

  async function rejectClaim() {
    if (!business) return;
    setRejecting(true); setRejectMsg("");
    try {
      const res = await fetch(`/api/admin/businesses/${business.id}/reject-claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rejectNotes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Rejection failed."); return; }
      setRejectMsg("Request rejected. Business reset to invited status.");
      setVerificationRequest(null);
      setShowRejectForm(false);
      persist({ ...business, status: "invited" as BusinessRecord["status"] });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRejecting(false);
    }
  }

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Business not found.</p>
        <Link href="/admin/businesses" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Businesses
        </Link>
      </div>
    );
  }

  if (!business) return null;

  const pictures = business.pictures ?? [];

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/businesses"
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
          {business.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{business.name}</h1>
          <p className="text-xs text-gray-400">
            {business.industry} · <span className="capitalize">{business.status}</span>
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-1 text-sm text-green-600 shrink-0">
            <CheckCircle className="w-4 h-4" /> Saved
          </div>
        )}
        {business.status === "active" && (
          <a
            href={`/businesses/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Profile
          </a>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Pending verification request */}
      {verificationRequest && (
        <div className="card border-amber-200 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-900">Pending Ownership Verification</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 shrink-0 mt-0.5 text-xs font-semibold">NAME</span>
                <span className="text-gray-800 font-medium">{verificationRequest.submitter_name}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <a href={`mailto:${verificationRequest.submitter_email}`} className="text-brand-600 hover:underline text-sm truncate">
                  {verificationRequest.submitter_email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <a href={`tel:${verificationRequest.submitter_phone}`} className="text-gray-800 text-sm">
                  {verificationRequest.submitter_phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 text-xs font-semibold w-5 shrink-0 mt-0.5">DATE</span>
                <span className="text-gray-600 text-sm">
                  {new Date(verificationRequest.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {verificationRequest.proof_url && (
              <a href={verificationRequest.proof_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                <FileText className="w-4 h-4" /> View Proof Document
              </a>
            )}

            <div className="pt-2 border-t border-amber-100 space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={approveClaim} disabled={approving || rejecting}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                  {approving ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</> : <><CheckCircle className="w-4 h-4" /> Approve &amp; Send Claim Link</>}
                </button>
                <button
                  onClick={() => setShowRejectForm((v) => !v)}
                  disabled={approving || rejecting}
                  className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <p className="text-xs text-gray-400">Sends a 24-hour claim link to the owner&apos;s email.</p>
              </div>

              {showRejectForm && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800">Reject this request?</p>
                  <p className="text-xs text-red-700">The business will be reset to &quot;Invited&quot; status and the submitter will be notified.</p>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Optional: reason for rejection (sent to submitter)"
                    rows={2}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-800 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={rejectClaim} disabled={rejecting}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                      {rejecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting…</> : "Confirm Rejection"}
                    </button>
                    <button onClick={() => setShowRejectForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            {approveMsg && (
              <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {approveMsg}
              </p>
            )}
            {rejectMsg && (
              <p className="text-sm text-red-700 font-medium flex items-center gap-1.5">
                <X className="w-4 h-4" /> {rejectMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Verified toggle */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {business.verified ? (
              <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <Shield className="w-6 h-6 text-gray-300 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">Verified Business</p>
              <p className="text-xs text-gray-400">
                {business.verified
                  ? "Owner skips OTP verification during onboarding"
                  : "Owner must complete OTP verification during onboarding"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleVerified}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              business.verified ? "bg-green-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                business.verified ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="card p-5 mb-4">
        <p className="font-semibold text-gray-900 text-sm mb-3">Logo</p>
        <div className="flex items-center gap-4">
          {business.logo ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.logo}
                alt="Business logo"
                className="w-20 h-20 rounded-xl object-cover border border-gray-200"
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              {uploadingLogo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Upload</span>
                </>
              )}
            </button>
          )}
          {business.logo && (
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              {uploadingLogo ? "Uploading…" : "Change logo"}
            </button>
          )}
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* Pictures */}
      <div className="card p-5 mb-4">
        <p className="font-semibold text-gray-900 text-sm mb-0.5">Photos</p>
        <p className="text-xs text-gray-400 mb-3">Up to {MAX_PICTURES} photos</p>
        <div className="flex flex-wrap gap-3">
          {pictures.map((url, idx) => (
            <div key={idx} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-28 h-28 rounded-xl object-cover border border-gray-200"
              />
              <button
                onClick={() => removePicture(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {pictures.length < MAX_PICTURES && (
            <button
              onClick={() => picRef.current?.click()}
              disabled={uploadingPic}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              {uploadingPic ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Add Photo</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={picRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePictureAdd}
        />
      </div>

      {/* Social media links */}
      <div className="card p-5 mb-4">
        <p className="font-semibold text-gray-900 text-sm mb-4">Social Media</p>
        <div className="space-y-3">
          {(
            [
              { key: "instagram", icon: Instagram, label: "Instagram", placeholder: "https://instagram.com/yourbusiness", color: "text-pink-500" },
              { key: "facebook",  icon: Facebook,  label: "Facebook",  placeholder: "https://facebook.com/yourbusiness", color: "text-blue-600" },
              { key: "youtube",   icon: Youtube,   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel",  color: "text-red-500"  },
            ] as const
          ).map(({ key, icon: Icon, label, placeholder, color }) => (
            <div key={key} className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
              <div className="flex-1">
                <input
                  type="url"
                  value={social[key] ?? ""}
                  onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value || undefined }))}
                  placeholder={placeholder}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 placeholder-gray-300"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={saveSocialLinks}
          disabled={savingSocial}
          className="mt-4 flex items-center gap-2 text-sm btn-primary py-2"
        >
          <Save className="w-3.5 h-3.5" />
          {savingSocial ? "Saving…" : "Save Social Links"}
        </button>
      </div>

      {/* Business info (read-only summary) */}
      <div className="card p-5 mb-4">
        <p className="font-semibold text-gray-900 text-sm mb-3">Details</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-400 w-28 shrink-0">Address</span>
            <span className="text-gray-700">{business.address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-28 shrink-0">Owner Phone</span>
            <span className="text-gray-700">{business.ownerPhone}</span>
          </div>
          {business.email && (
            <div className="flex gap-2">
              <span className="text-gray-400 w-28 shrink-0">Email</span>
              <span className="text-gray-700">{business.email}</span>
            </div>
          )}
          {business.contactPhone && (
            <div className="flex gap-2">
              <span className="text-gray-400 w-28 shrink-0">Customer Phone</span>
              <span className="text-gray-700">{business.contactPhone}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-gray-400 w-28 shrink-0">Created</span>
            <span className="text-gray-700">
              {new Date(business.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Invite link */}
      {business.status !== "active" && (
        <div className="card p-5">
          <p className="font-semibold text-gray-900 text-sm mb-3">Invite Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={getInviteLink(business.id)}
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-gray-50 outline-none"
            />
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 px-3 py-2 rounded-lg transition-colors shrink-0"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <a
              href={getInviteLink(business.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 px-2.5 py-2 rounded-lg transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
