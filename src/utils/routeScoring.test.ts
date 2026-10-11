import { describe, expect, it } from "vitest";
import { compareRoutes, scoreRoute } from "./routeScoring";
import { incidents, routes } from "@/data/sample";

const r = (id: string) => routes.find((x) => x.id === id)!;

describe("route scoring rules", () => {
  it("excludes a route crossing a verified blocked segment", () => {
    expect(scoreRoute(r("r1a"), ["general"], incidents).verdict).toBe("excluded");
  });
  it("excludes stairs for wheelchair users", () => {
    expect(scoreRoute(r("r3a"), ["wheelchair"], incidents).verdict).toBe("excluded");
  });
  it("never marks a route with missing accessibility facts as suitable", () => {
    expect(scoreRoute(r("r2b"), ["wheelchair"], incidents).verdict).toBe("unknown");
  });
  it("penalises routes with reported hazards", () => {
    const s = scoreRoute(r("r2a"), ["general"], incidents);
    expect(s.verdict).toBe("caution");
    expect(s.hazards).toHaveLength(1);
  });
  it("reports no verified suitable route when all are excluded or unknown", () => {
    const c = compareRoutes([r("r3a"), r("r3b")], ["wheelchair"], incidents);
    expect(c.hasVerifiedSuitable).toBe(false);
  });
});
