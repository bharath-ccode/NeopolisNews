import type { Locality } from "@/lib/projectsStore";

// Discovery config mirrors lib/businessDirectory.ts's TAXONOMY shape
// (Industry -> Type -> Subtypes) so a config file reads like the taxonomy
// it's populating, plus the one thing the taxonomy doesn't need: a search
// phrase per subtype.

export interface DiscoverySubtypeConfig {
  subtype: string;
  queryTerm: string; // e.g. "dental clinic"
}

export interface DiscoveryTypeConfig {
  type: string; // matches TAXONOMY[industry] key, e.g. "Clinics"
  subtypes: DiscoverySubtypeConfig[];
}

export interface DiscoveryIndustryConfig {
  industry: string; // matches a TAXONOMY key, e.g. "Health & Wellness"
  types: DiscoveryTypeConfig[];
  /** Overrides the global default locality list for this industry only. */
  localities?: Locality[];
}

// Flat shape the run loop actually iterates over.
export interface DiscoveryTarget {
  industry: string;
  type: string;
  subtype: string;
  queryTerm: string;
  locality: Locality;
}

/** An admin-picked subset of the full config to search: which subtypes
 *  (identified by subtypeKey()) and which localities. Omitting a selection
 *  entirely (e.g. the monthly cron) runs everything. Passing one with an
 *  empty subtypes/localities set runs nothing, by design — the admin UI
 *  requires at least one of each before it will submit a run. */
export interface DiscoverySelection {
  subtypeKeys: Set<string>;
  localities: Locality[];
}
