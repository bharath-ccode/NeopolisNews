// Public surface for the business discovery pipeline. Add a new industry
// by writing lib/businessDiscovery/<industry>.ts (see health.ts) and
// listing it in DISCOVERY_INDUSTRIES (config.ts) — everything else here
// (search, dedupe, change detection, review, promotion) is shared.

export * from "./types";
export { DISCOVERY_INDUSTRIES, DISCOVERY_LOCALITIES, buildQuery, flattenDiscoveryTargets } from "./config";
export { runBusinessDiscovery, parseGoogleHours, type DiscoveryRunSummary } from "./run";
export { promoteCandidateToBusiness, rejectCandidate, type PromoteOverrides } from "./promote";
