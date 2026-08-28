import { LOCALITIES, type Locality } from "@/lib/projectsStore";
import { TAXONOMY } from "@/lib/businessDirectory";
import { HEALTH_DISCOVERY } from "./health";
import type { DiscoveryIndustryConfig, DiscoverySelection, DiscoveryTarget } from "./types";

// One file per industry, added here as it's ready — e.g. a future
// FOOD_DISCOVERY from "./food", EDUCATION_DISCOVERY from "./education".
// A hand-tuned Places query term per subtype (e.g. "ENT (Ear, Nose &
// Throat)" -> "ENT clinic") reads better than the raw taxonomy label, but
// it's an optimization, not a requirement — resolveIndustryConfig() below
// falls back to the subtype's own name for any industry/subtype that
// hasn't been tuned yet, so every industry in the taxonomy is searchable
// from day one, just with a more literal query term until someone adds
// a dedicated config file for it.
export const DISCOVERY_INDUSTRIES: DiscoveryIndustryConfig[] = [
  HEALTH_DISCOVERY,
];

// Every industry in the business taxonomy, not just the ones with a
// hand-tuned DISCOVERY_INDUSTRIES entry — Step 1 of the admin UI offers
// all of these.
export const ALL_INDUSTRIES: string[] = Object.keys(TAXONOMY);

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

function tunedQueryTerm(industry: string, type: string, subtype: string): string | undefined {
  return DISCOVERY_INDUSTRIES
    .find((i) => i.industry === industry)
    ?.types.find((t) => t.type === type)
    ?.subtypes.find((s) => s.subtype === subtype)
    ?.queryTerm;
}

/** Full Industry -> Type -> Subtype tree for any industry in the business
 *  taxonomy, with a Places query term per subtype — the hand-tuned one
 *  from DISCOVERY_INDUSTRIES where one exists, otherwise the subtype's
 *  own name. Lets the admin UI (and a bulk run) work for every industry,
 *  not just the ones someone has written a dedicated config for. */
export function resolveIndustryConfig(industry: string): DiscoveryIndustryConfig {
  const taxonomyTypes = TAXONOMY[industry] ?? {};
  return {
    industry,
    types: Object.entries(taxonomyTypes).map(([type, subtypes]) => ({
      type,
      subtypes: subtypes.map((subtype) => ({
        subtype,
        queryTerm: tunedQueryTerm(industry, type, subtype) ?? subtype,
      })),
    })),
  };
}

/** Industry -> Type -> Subtype config, flattened x localities into the
 *  list the run loop actually iterates over.
 *
 *  With no selection (the monthly cron's full sweep), only the hand-
 *  tuned DISCOVERY_INDUSTRIES config runs.
 *
 *  With a selection (an admin-driven run), each subtypeKey is resolved
 *  independently via resolveIndustryConfig — this is what lets an admin
 *  bulk-search any industry from Step 1, not just the ones with a tuned
 *  config, crossed against `localities` (an explicit admin pick, not
 *  each industry's own default list). */
export function flattenDiscoveryTargets(selection?: DiscoverySelection): DiscoveryTarget[] {
  const targets: DiscoveryTarget[] = [];

  if (selection) {
    for (const key of selection.subtypeKeys) {
      const [industry, type, subtype] = key.split("::");
      if (!industry || !type || !subtype) continue;
      const queryTerm = tunedQueryTerm(industry, type, subtype) ?? subtype;
      for (const locality of selection.localities) {
        targets.push({ industry, type, subtype, queryTerm, locality });
      }
    }
    return targets;
  }

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
