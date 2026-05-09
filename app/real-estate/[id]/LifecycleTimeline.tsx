import { Check } from "lucide-react";
import { LIFECYCLE_STAGES, type LifecycleStatus } from "@/lib/projectsStore";

export default function LifecycleTimeline({ current }: { current: LifecycleStatus | null }) {
  const currentIdx = current ? LIFECYCLE_STAGES.findIndex((s) => s.id === current) : -1;

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const future  = i > currentIdx;

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${done || active ? "bg-green-400" : "bg-gray-200"}`} />
              )}

              {/* Node */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                done   ? "bg-green-500 border-green-500 text-white" :
                active ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100" :
                         "bg-white border-gray-200 text-gray-300"
              }`}>
                {done
                  ? <Check className="w-4 h-4" />
                  : <span className="text-[10px] font-bold">{i + 1}</span>
                }
                {active && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-30" />
                )}
              </div>

              {/* Label */}
              <p className={`mt-2 text-center text-[11px] font-semibold leading-tight px-1 ${
                done   ? "text-green-600" :
                active ? "text-orange-600" :
                         "text-gray-400"
              }`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden flex-col gap-0">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;

          return (
            <div key={stage.id} className="flex items-start gap-3">
              {/* Left: node + line */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                  done   ? "bg-green-500 border-green-500 text-white" :
                  active ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100" :
                           "bg-white border-gray-200 text-gray-300"
                }`}>
                  {done
                    ? <Check className="w-3.5 h-3.5" />
                    : <span className="text-[10px] font-bold">{i + 1}</span>
                  }
                </div>
                {i < LIFECYCLE_STAGES.length - 1 && (
                  <div className={`w-0.5 h-6 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>

              {/* Label */}
              <p className={`pt-1 text-sm font-semibold ${
                done   ? "text-green-600" :
                active ? "text-orange-600" :
                         "text-gray-400"
              }`}>
                {stage.label}
                {active && <span className="ml-2 text-xs font-normal text-orange-400">← Current</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
