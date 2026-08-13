import { LOCALITIES, type Locality } from "@/lib/projectsStore";
import { HEALTH_DISCOVERY } from "./health";
import type { DiscoveryIndustryConfig, DiscoverySelection, DiscoveryTarget } from "./types";

// One file per industry, added here as it's ready — e.g. a future
// FOOD_DISCOVERY from "./food", EDUCATION_DISCOVERY from "./education".
export const DISCOVERY_INDUSTRIES: DiscoveryIndustryConfig[] = [
  HEALTH_DISCOVERY,
];

// Default locality list for any industry that doesn't override it.
export const DISCOVERY_LOCALITIES: Locality[] = [...LOCALITIES];

export function buildQuery(target: Pick<DiscoveryTarget, "queryTerm" | "locality">): string {
  return `${target.queryTerm} in ${target.locality}, Hyderabad, Telangana`;
}

/** Stable identifier for a subtype within an industry/type, used to key
 *  admin selection state — shared between the admin UI and the run loop
 *  so a checked box maps unambiguously to the config entry it selects. */
export function subtypeKey(industry: string, type: string, subtype: string): string {
  return `${industry}::${type}::${subtype}`;
}

/** Industry -> Type -> Subtype config, flattened x localities into the
 *  list the run loop actually iterates over. With no selection, runs
 *  everything (the monthly cron). With a selection, only the subtypes in
 *  `subtypeKeys` are included, crossed against `localities` instead of
 *  each industry's own default list — an explicit admin pick overrides it. */
export function flattenDiscoveryTargets(selection?: DiscoverySelection): DiscoveryTarget[] {
  const targets: DiscoveryTarget[] = [];
  for (const industryConfig of DISCOVERY_INDUSTRIES) {
    const localities = selection ? selection.localities : (industryConfig.localities ?? DISCOVERY_LOCALITIES);
    for (const typeConfig of industryConfig.types) {
      for (const sub of typeConfig.subtypes) {
        if (selection && !selection.subtypeKeys.has(subtypeKey(industryConfig.industry, typeConfig.type, sub.subtype))) {
          continue;
        }
        for (const locality of localities) {
          targets.push({
            industry: industryConfig.industry,
            type: typeConfig.type,
            subtype: sub.subtype,
            queryTerm: sub.queryTerm,
            locality,
          });
        }
      }
    }
  }
  return targets;
}
