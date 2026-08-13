import { LOCALITIES, type Locality } from "@/lib/projectsStore";
import { HEALTH_DISCOVERY } from "./health";
import type { DiscoveryIndustryConfig, DiscoveryTarget } from "./types";

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

/** Industry -> Type -> Subtype config, flattened x localities into the
 *  list the run loop actually iterates over. */
export function flattenDiscoveryTargets(): DiscoveryTarget[] {
  const targets: DiscoveryTarget[] = [];
  for (const industryConfig of DISCOVERY_INDUSTRIES) {
    const localities = industryConfig.localities ?? DISCOVERY_LOCALITIES;
    for (const typeConfig of industryConfig.types) {
      for (const sub of typeConfig.subtypes) {
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
