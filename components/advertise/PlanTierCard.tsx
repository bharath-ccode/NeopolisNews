import { CheckCircle, Clock } from "lucide-react";

export interface PlanTier {
  name: string;
  subtitle?: string;
  future: boolean;
  features: string[];
  cta?: string;
}

/** Shared Starter/Growth/Enterprise-style tier card — used by every
 *  /advertise segment page so the "free now, future tiers greyed out, no
 *  pricing shown" pattern (see CLAUDE.md) stays consistent in one place
 *  instead of re-implemented per page. */
export default function PlanTierCard({
  plan,
  accentRing = "ring-brand-500",
  accentBg = "bg-brand-600 hover:bg-brand-700",
}: {
  plan: PlanTier;
  accentRing?: string;
  accentBg?: string;
}) {
  return (
    <div className={`card p-6 flex flex-col ${plan.future ? "opacity-70" : `ring-2 ${accentRing} relative`}`}>
      {!plan.future && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          Available Now
        </span>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-900 mb-0.5">{plan.name}</h3>
        {plan.subtitle && <p className="text-xs text-gray-400">{plan.subtitle}</p>}
      </div>
      <div className="mb-5">
        {plan.future ? (
          <span className="inline-flex items-center gap-1.5 text-gray-400 font-semibold text-sm">
            <Clock className="w-3.5 h-3.5" /> Future — pricing not set yet
          </span>
        ) : (
          <span className="text-4xl font-extrabold text-green-600">Free</span>
        )}
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {plan.future ? (
        <span className="block text-center font-semibold py-2.5 rounded-lg text-sm bg-gray-100 text-gray-400">
          Coming in a future phase
        </span>
      ) : (
        <a href="#contact" className={`block text-center font-semibold py-2.5 rounded-lg text-sm text-white transition-colors ${accentBg}`}>
          {plan.cta ?? "Get Started — It's Free"}
        </a>
      )}
    </div>
  );
}
