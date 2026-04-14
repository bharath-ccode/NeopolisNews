import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  HardHat,
  FileCheck,
  ChevronRight,
  Camera,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { PROJECTS, type Project, type ConstructionMilestone } from "@/lib/projects";

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return {};
  return {
    title: `${project.name} – Project Progress | NeopolisNews`,
    description: `Legal approvals, construction milestones, and occupation certificate for ${project.name} by ${project.developer}.`,
  };
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isLegalComplete(p: Project) {
  return !!(
    p.legalStatus.developmentPlanApproval && p.legalStatus.reraRegistration
  );
}

function legalStepState(p: Project): "complete" | "partial" | "pending" {
  const hasDpa = !!p.legalStatus.developmentPlanApproval;
  const hasRera = !!p.legalStatus.reraRegistration;
  if (hasDpa && hasRera) return "complete";
  if (hasDpa || hasRera) return "partial";
  return "pending";
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StepHeader({
  step,
  title,
  state,
  subtitle,
}: {
  step: number;
  title: string;
  state: "complete" | "partial" | "pending" | "in-progress";
  subtitle?: string;
}) {
  const badge = {
    complete: (
      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" /> Complete
      </span>
    ),
    partial: (
      <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" /> Partial
      </span>
    ),
    "in-progress": (
      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
        <Clock className="w-3.5 h-3.5" /> In Progress
      </span>
    ),
    pending: (
      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    ),
  };

  const stepColor = {
    complete: "bg-green-500 text-white",
    partial: "bg-yellow-500 text-white",
    "in-progress": "bg-blue-500 text-white",
    pending: "bg-gray-200 text-gray-500",
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${stepColor[state]}`}
        >
          {state === "complete" ? <CheckCircle className="w-5 h-5" /> : step}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge[state]}
    </div>
  );
}

function DocRow({
  no,
  label,
  documentNumber,
  meta,
  present,
}: {
  no: number;
  label: string;
  documentNumber?: string;
  meta?: string;
  present: boolean;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-3 pr-4 text-xs text-gray-400 font-mono align-top w-6">
        {no}
      </td>
      <td className="py-3 pr-6 align-top">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
      </td>
      <td className="py-3 pr-6 align-top">
        {present && documentNumber ? (
          <code className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono break-all">
            {documentNumber}
          </code>
        ) : (
          <span className="text-xs text-gray-400 italic">Not yet issued</span>
        )}
      </td>
      <td className="py-3 align-top">
        {present ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <CheckCircle className="w-3.5 h-3.5" /> Received
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
            <Clock className="w-3.5 h-3.5" /> Awaited
          </span>
        )}
      </td>
    </tr>
  );
}

function MilestoneTimeline({
  milestones,
  plannedCompletion,
}: {
  milestones: ConstructionMilestone[];
  plannedCompletion: string;
}) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">
        Construction not yet started. Milestones will be posted by the builder
        as work progresses.
      </p>
    );
  }

  return (
    <ol className="relative border-l-2 border-gray-200 space-y-0 ml-3">
      {milestones.map((m, idx) => {
        const isLatest = idx === milestones.length - 1;
        return (
          <li key={m.id} className="pl-7 pb-7 relative">
            {/* Dot */}
            <span
              className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                isLatest
                  ? "bg-brand-500 border-brand-500"
                  : "bg-white border-gray-300"
              } flex items-center justify-center`}
            >
              {!isLatest && (
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              )}
            </span>

            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">{m.date}</span>
              {isLatest && (
                <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  Latest Update
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {m.milestone}
            </p>
            {m.details && (
              <p className="text-xs text-gray-500 leading-relaxed mb-1.5">
                {m.details}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {m.media && (
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" /> {m.media}
                </span>
              )}
              {m.postedBy && <span>Posted by: {m.postedBy}</span>}
            </div>
          </li>
        );
      })}

      {/* Planned end node */}
      <li className="pl-7 relative">
        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-dashed border-gray-300 bg-white" />
        <span className="text-xs text-gray-400">{plannedCompletion}</span>
        <p className="text-sm font-semibold text-gray-400 italic">
          Possession / Handover (Planned)
        </p>
      </li>
    </ol>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) notFound();

  const legalState = legalStepState(project);
  const constructionState =
    project.progress === 100
      ? "complete"
      : project.constructionMilestones.length > 0
      ? "in-progress"
      : "pending";
  const ocState = project.occupationCertificate ? "complete" : "pending";

  return (
    <>
      {/* ── Breadcrumb / back ── */}
      <div className="border-b border-gray-100 bg-white">
        <SectionWrapper tight>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 py-3">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/real-estate" className="hover:text-brand-600">
              Real Estate
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-600 font-medium">{project.name}</span>
          </nav>
        </SectionWrapper>
      </div>

      {/* ── Project Header ── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white py-10 md:py-14">
        <SectionWrapper tight>
          <Link
            href="/real-estate"
            className="inline-flex items-center gap-1 text-brand-300 hover:text-white text-xs mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Projects
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={project.statusColor}>{project.status}</span>
                {project.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-300">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-1">
                {project.name}
              </h1>
              <p className="text-brand-300 text-sm">
                {project.developer} &middot; {project.type} &middot;{" "}
                {project.phase}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-brand-300">
                {project.price}
              </p>
              <p className="text-xs text-brand-400 mt-0.5">
                {project.available} units available
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Floors", value: `${project.floors}G` },
              { label: "Total Units", value: project.units || "N/A" },
              { label: "Carpet Area", value: project.carpet },
              { label: "Possession", value: project.completion },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-brand-800/60 rounded-xl px-4 py-3"
              >
                <p className="text-xs text-brand-400">{s.label}</p>
                <p className="text-sm font-bold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Project Progress ── */}
      <SectionWrapper id="progress">
        <div className="mb-8">
          <h2 className="section-heading">Project Progress</h2>
          <p className="text-gray-500 text-sm mt-1">
            Legal approvals, construction milestones, and occupation status —
            updated regularly by the developer.
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Overall Construction Progress
            </span>
            <span className="text-sm font-extrabold text-brand-700">
              {project.progress}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${project.progress}%`,
                background:
                  project.progress === 100
                    ? "#22c55e"
                    : project.progress >= 50
                    ? "#3b82f6"
                    : "#f59e0b",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Project Start</span>
            <span>Target: {project.completion}</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* ─── STEP 1: Legal Approvals ──────────────────────────────────── */}
          <div className="card p-6">
            <StepHeader
              step={1}
              title="Legal Approvals"
              state={legalState}
              subtitle="Two statutory approvals required before construction and sale"
            />

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2.5 px-3 text-xs font-semibold text-gray-400 w-8">
                      #
                    </th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-gray-400">
                      Document Type
                    </th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-gray-400">
                      Document Number
                    </th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* DPA Row */}
                  <tr>
                    <td className="py-3.5 px-3 text-xs text-gray-400 font-mono align-top">
                      1
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <p className="text-sm font-semibold text-gray-800">
                        Development Plan Approval
                      </p>
                      {project.legalStatus.developmentPlanApproval ? (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Approved:{" "}
                          {
                            project.legalStatus.developmentPlanApproval
                              .approvedOn
                          }{" "}
                          &middot;{" "}
                          {
                            project.legalStatus.developmentPlanApproval
                              .authority
                          }
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Issued by the local municipal / development authority
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      {project.legalStatus.developmentPlanApproval ? (
                        <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono break-all">
                          {
                            project.legalStatus.developmentPlanApproval
                              .documentNumber
                          }
                        </code>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Not yet issued
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      {project.legalStatus.developmentPlanApproval ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" /> Awaited
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* RERA Row */}
                  <tr>
                    <td className="py-3.5 px-3 text-xs text-gray-400 font-mono align-top">
                      2
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      <p className="text-sm font-semibold text-gray-800">
                        RERA Registration
                      </p>
                      {project.legalStatus.reraRegistration ? (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Registered:{" "}
                          {project.legalStatus.reraRegistration.registeredOn}{" "}
                          &middot; Valid until:{" "}
                          {project.legalStatus.reraRegistration.validUntil}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Real Estate Regulatory Authority registration
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      {project.legalStatus.reraRegistration ? (
                        <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono break-all">
                          {
                            project.legalStatus.reraRegistration
                              .registrationNumber
                          }
                        </code>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Not yet registered
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 align-top">
                      {project.legalStatus.reraRegistration ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 whitespace-nowrap">
                          <CheckCircle className="w-3.5 h-3.5" /> Registered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" /> Awaited
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legal complete banner */}
            {isLegalComplete(project) && (
              <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <Shield className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Legal Status: Complete
                  </p>
                  <p className="text-xs text-green-600">
                    Both DPA and RERA approvals are in place. This project is
                    legally cleared for construction and sale.
                  </p>
                </div>
              </div>
            )}

            {!isLegalComplete(project) &&
              (project.legalStatus.developmentPlanApproval ||
                project.legalStatus.reraRegistration) && (
                <div className="mt-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-yellow-800">
                      Legal Status: Partial
                    </p>
                    <p className="text-xs text-yellow-700">
                      One or more approvals are still pending. Verify before
                      making any booking or payment.
                    </p>
                  </div>
                </div>
              )}

            {!project.legalStatus.developmentPlanApproval &&
              !project.legalStatus.reraRegistration && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-600">
                      Legal Status: Not Yet Initiated
                    </p>
                    <p className="text-xs text-gray-500">
                      No statutory approvals received yet. Proceed with caution.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* ─── STEP 2: Construction Progress ───────────────────────────── */}
          <div className="card p-6">
            <StepHeader
              step={2}
              title="Construction Progress"
              state={constructionState}
              subtitle="Builder posts milestone updates as work progresses on site"
            />

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Civil Works</span>
                <span className="font-bold text-gray-700">
                  {project.progress}% complete
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    project.progress === 100
                      ? "bg-green-500"
                      : project.progress >= 50
                      ? "bg-blue-500"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <MilestoneTimeline
              milestones={project.constructionMilestones}
              plannedCompletion={project.completion}
            />
          </div>

          {/* ─── STEP 3: Occupation Certificate ──────────────────────────── */}
          <div className="card p-6">
            <StepHeader
              step={3}
              title="Occupation Certificate (OC)"
              state={ocState}
              subtitle="Statutory certificate confirming the building is safe and legally fit for occupancy"
            />

            {project.occupationCertificate ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-400">
                          Field
                        </th>
                        <th className="py-2.5 px-3 text-xs font-semibold text-gray-400">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3.5 px-3 text-sm text-gray-500 align-top whitespace-nowrap">
                          Certificate Number
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <code className="text-xs bg-green-50 text-green-800 border border-green-200 px-2 py-1 rounded font-mono break-all">
                            {project.occupationCertificate.certificateNumber}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 text-sm text-gray-500 align-top">
                          Issued On
                        </td>
                        <td className="py-3.5 px-3 text-sm font-semibold text-gray-800 align-top">
                          {project.occupationCertificate.issuedOn}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 text-sm text-gray-500 align-top">
                          Issued By
                        </td>
                        <td className="py-3.5 px-3 text-sm font-semibold text-gray-800 align-top">
                          {project.occupationCertificate.issuedBy}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 text-sm text-gray-500 align-top">
                          Valid From
                        </td>
                        <td className="py-3.5 px-3 text-sm font-semibold text-gray-800 align-top">
                          {project.occupationCertificate.validFrom}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      OC Received — Legally Cleared for Occupancy
                    </p>
                    <p className="text-xs text-green-600">
                      The building has been inspected and certified by the
                      competent authority. Residents can move in.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-center">
                <HardHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-500">
                  OC Not Yet Issued
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  The Occupation Certificate will be applied for and issued by
                  the local authority after construction is complete and all
                  inspections are passed.
                </p>
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Amenities ── */}
      {project.amenities.length > 0 && (
        <section className="bg-gray-50">
          <SectionWrapper>
            <h2 className="section-heading mb-5">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {project.amenities.map((a) => (
                <span
                  key={a}
                  className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg font-medium"
                >
                  {a}
                </span>
              ))}
            </div>
          </SectionWrapper>
        </section>
      )}

      {/* ── Back CTA ── */}
      <SectionWrapper>
        <div className="flex items-center justify-between">
          <Link
            href="/real-estate"
            className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> View All Projects
          </Link>
          <Link href="/advertise" className="btn-primary text-sm">
            List Your Project
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
