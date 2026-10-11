/**
 * Transparent, rule-based route scoring for the SURAKSHA PATH prototype.
 * Not an AI model. Rules:
 * 1. Exclude routes crossing a VERIFIED blocked segment.
 * 2. Penalise active hazards (by severity; unverified reports still count).
 * 3. Exclude routes known to violate the user's accessibility needs.
 * 4. Missing accessibility facts relevant to the user → "unknown", never "suitable".
 * 5. Prefer fewer hazards and shorter distance.
 */
import type { AccessNeed, Incident, RouteOption } from "@/types";

export type RouteVerdict = "suitable" | "caution" | "unknown" | "excluded";

export interface ScoredRoute {
  route: RouteOption;
  verdict: RouteVerdict;
  score: number;
  hazards: Incident[];
  reasons: string[];
  limitations: string[];
}

const SEVERITY_PENALTY = { low: 8, medium: 18, high: 30 } as const;
const ACTIVE = new Set(["pending", "under_review", "verified"]);

export function scoreRoute(
  route: RouteOption,
  needs: AccessNeed[],
  incidents: Incident[],
  maxDistanceKm?: number,
): ScoredRoute {
  const reasons: string[] = [];
  const limitations: string[] = [];
  let excluded = false;
  let unknown = false;
  let penalty = 0;

  const linked = incidents.filter((i) => route.incidentIds.includes(i.id) && ACTIVE.has(i.status));
  const hazards: Incident[] = [];
  for (const inc of linked) {
    if (inc.kind === "blocked" && inc.status === "verified") {
      excluded = true;
      reasons.push(`Crosses a confirmed blocked segment: ${inc.title}.`);
    } else if (inc.kind !== "safe") {
      hazards.push(inc);
      penalty += SEVERITY_PENALTY[inc.severity];
      reasons.push(
        `${inc.status === "verified" ? "Verified" : "Unverified"} ${inc.severity} hazard reported: ${inc.title}.`,
      );
    }
  }

  const f = route.features;
  const wheel = needs.includes("wheelchair");
  const mobility = needs.includes("limited_mobility");
  const vision = needs.includes("low_vision");

  if (wheel) {
    if (f.stairs === true) { excluded = true; reasons.push("Contains stairs — not usable by wheelchair."); }
    if (f.inaccessibleCrossing === true) { excluded = true; reasons.push("Has an inaccessible crossing."); }
    if (f.stairs === null || f.inaccessibleCrossing === null) { unknown = true; limitations.push("Stairs/crossing accessibility not known."); }
    if (f.steepSlope === true) { penalty += 15; limitations.push("Steep slope section."); }
  }
  if (mobility) {
    if (f.stairs === true) { penalty += 25; limitations.push("Stairs present."); }
    if (f.steepSlope === true) { penalty += 15; limitations.push("Steep slope section."); }
    if (f.stairs === null || f.steepSlope === null) { unknown = true; limitations.push("Stairs/slope information missing."); }
  }
  if (vision) {
    if (f.unlitSection === true) { penalty += 15; limitations.push("Unlit section."); }
    if (f.unlitSection === null) { unknown = true; limitations.push("Lighting information missing."); }
    if (f.tactileGuidance !== true) limitations.push("No confirmed tactile guidance.");
  }

  if (maxDistanceKm && route.distanceKm > maxDistanceKm) {
    penalty += 20;
    limitations.push(`Longer than your preferred ${maxDistanceKm} km.`);
  }

  const score = Math.max(0, Math.round(100 - penalty - route.distanceKm * 4));
  let verdict: RouteVerdict;
  if (excluded) verdict = "excluded";
  else if (unknown) verdict = "unknown";
  else if (penalty > 0) verdict = "caution";
  else verdict = "suitable";

  if (verdict === "suitable") reasons.push("No active hazards and no known conflicts with your needs.");
  if (verdict === "unknown") reasons.push("Not enough information to call this route suitable.");

  return { route, verdict, score: excluded ? 0 : score, hazards, reasons, limitations };
}

export interface RouteComparison {
  shortest: ScoredRoute | undefined;
  fewestHazards: ScoredRoute | undefined;
  alternative: ScoredRoute | undefined;
  excluded: ScoredRoute[];
  all: ScoredRoute[];
  hasVerifiedSuitable: boolean;
}

export function compareRoutes(
  routes: RouteOption[],
  needs: AccessNeed[],
  incidents: Incident[],
  maxDistanceKm?: number,
): RouteComparison {
  const all = routes.map((r) => scoreRoute(r, needs, incidents, maxDistanceKm));
  const usable = all.filter((s) => s.verdict !== "excluded");
  const excluded = all.filter((s) => s.verdict === "excluded");
  const known = usable.filter((s) => s.verdict !== "unknown");
  const shortest = [...known].sort((a, b) => a.route.distanceKm - b.route.distanceKm)[0];
  const fewestHazards = [...known]
    .filter((s) => s !== shortest)
    .sort((a, b) => a.hazards.length - b.hazards.length || b.score - a.score)[0];
  const alternative = usable.find((s) => s !== shortest && s !== fewestHazards);
  return {
    shortest,
    fewestHazards,
    alternative,
    excluded,
    all,
    hasVerifiedSuitable: known.length > 0,
  };
}
