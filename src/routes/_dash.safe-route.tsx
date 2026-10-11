import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, CircleHelp, Clock, Ruler, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Notice, PageHeader, Pill, SimBadge } from "@/components/common";
import { MapView } from "@/components/map/MapView";
import type { MapMarker, MapPath } from "@/components/map/types";
import { useStore } from "@/services/store";
import { places, routes as allRoutes } from "@/data/sample";
import { compareRoutes, type ScoredRoute } from "@/utils/routeScoring";
import { needLabel } from "@/utils/labels";
import { timeAgo } from "@/utils/geo";
import type { AccessNeed } from "@/types";

export const Route = createFileRoute("/_dash")({
  validateSearch: z.object({ to: z.string().optional(), from: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Find a Safe Route — SURAKSHA PATH" },
      { name: "description", content: "Accessibility-aware route comparison using transparent, rule-based scoring." },
      { property: "og:title", content: "Find a Safe Route — SURAKSHA PATH" },
      { property: "og:description", content: "Compare evacuation routes against your accessibility needs." },
    ],
  }),
  component: RoutePlanner,
});

const NEEDS: AccessNeed[] = ["wheelchair", "limited_mobility", "low_vision", "general", "assistance"];

function RoutePlanner() {
  const search = Route.useSearch();
  const { shelters, incidents, profile, now } = useStore();
  const [from, setFrom] = useState(search.from ?? "");
  const [to, setTo] = useState(search.to ?? "");
  const [mode, setMode] = useState("walk");
  const [needs, setNeeds] = useState<AccessNeed[]>(profile.needs.length ? profile.needs : ["general"]);
  const [maxKm, setMaxKm] = useState(3);
  const [assist, setAssist] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const candidates = useMemo(() => allRoutes.filter((r) => r.originId === from && (!to || r.shelterId === to)), [from, to]);
  const result = useMemo(() => compareRoutes(candidates, needs, incidents, maxKm), [candidates, needs, incidents, maxKm]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!from) errs.push("Choose a starting location.");
    if (!needs.length) errs.push("Select at least one travel need (choose “General walking” if none apply).");
    setErrors(errs);
    setSubmitted(errs.length === 0);
  };

  const toggle = (n: AccessNeed) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  const ranked: { tag: string; s: ScoredRoute }[] = [];
  if (result.shortest) ranked.push({ tag: "Shortest suitable route", s: result.shortest });
  if (result.fewestHazards) ranked.push({ tag: "Fewer reported hazards", s: result.fewestHazards });
  if (result.alternative) ranked.push({ tag: "Alternative route", s: result.alternative });

  const origin = places.find((p) => p.id === from);
  const markers: MapMarker[] = [];
  if (origin) markers.push({ id: "o", kind: "origin", lat: origin.lat, lng: origin.lng, label: origin.name, glyph: "A" });
  new Set(candidates.map((c) => c.shelterId)).forEach((sid) => {
    const s = shelters.find((x) => x.id === sid);
    if (s) markers.push({ id: s.id, kind: "destination", lat: s.lat, lng: s.lng, label: s.name, glyph: "S" });
  });
  incidents.filter((i) => candidates.some((c) => c.incidentIds.includes(i.id))).forEach((i) =>
    markers.push({ id: i.id, kind: i.kind, lat: i.lat, lng: i.lng, label: i.title, glyph: "!" }),
  );
  const paths: MapPath[] = result.all.map((s) => ({
    id: s.route.id,
    points: s.route.path,
    label: `${s.route.name} — ${s.verdict}`,
    tone: s === result.shortest ? "best" : s.verdict === "excluded" ? "excluded" : s.verdict === "unknown" ? "unknown" : "caution",
    dashed: s.verdict === "excluded" || s.verdict === "unknown",
  }));

  return (
    <>
      <PageHeader title="Find a Safe Route" desc="Routes are predefined simulated scenarios scored with transparent rules — not a live navigation engine." actions={<SimBadge label="Simulated routes" />} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="card-surface space-y-5 p-5" noValidate aria-describedby={errors.length ? "route-errors" : undefined}>
          {errors.length > 0 && (
            <div id="route-errors" role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {errors.map((e) => <p key={e}>{e}</p>)}
            </div>
          )}
          <div>
            <Label htmlFor="from">Starting location *</Label>
            <select id="from" value={from} onChange={(e) => { setFrom(e.target.value); setSubmitted(false); }} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="">Select a sample location…</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="to">Destination shelter</Label>
            <select id="to" value={to} onChange={(e) => { setTo(e.target.value); setSubmitted(false); }} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="">Any reachable shelter</option>
              {shelters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="mode">Travel mode</Label>
            <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-2">
              <option value="walk">Walking / wheelchair</option>
              <option value="assisted">With a helper or carer</option>
            </select>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Accessibility needs (select all that apply)</legend>
            <div className="mt-2 space-y-2">
              {NEEDS.map((n) => (
                <div key={n} className="flex min-h-9 items-center gap-2">
                  <Checkbox id={`need-${n}`} checked={needs.includes(n)} onCheckedChange={() => toggle(n)} />
                  <Label htmlFor={`need-${n}`}>{needLabel[n]}</Label>
                </div>
              ))}
            </div>
          </fieldset>
          <div>
            <Label htmlFor="maxkm">Maximum preferred distance: {maxKm} km</Label>
            <Slider id="maxkm" className="mt-3" min={0.5} max={6} step={0.5} value={[maxKm]} onValueChange={(v) => setMaxKm(v[0])} aria-label="Maximum preferred distance in km" />
          </div>
          {(needs.includes("assistance") || mode === "assisted") && (
            <div>
              <Label htmlFor="assist">Assistance requirement (optional)</Label>
              <input id="assist" value={assist} onChange={(e) => setAssist(e.target.value)} placeholder="e.g. need help crossing water" className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3" />
            </div>
          )}
          <Button type="submit" className="w-full" size="lg">Compare routes</Button>
        </form>

        <div className="space-y-4">
          <MapView center={origin ? [origin.lat, origin.lng] : [13.05, 80.24]} zoom={14} markers={markers} paths={submitted ? paths : []} height={340} />
          {!submitted && <Notice>Choose a starting location and your needs, then press “Compare routes”. Try “Old Mill Colony” with “Wheelchair user” to see an incompatible route being excluded.</Notice>}
          {submitted && (
            <div aria-live="polite" className="space-y-4">
              {!result.hasVerifiedSuitable && (
                <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4">
                  <p className="flex items-center gap-2 font-semibold text-danger"><ShieldAlert className="h-5 w-5" aria-hidden /> No verified suitable route is available</p>
                  <p className="mt-1 text-sm">Based on the sample data, no route can be confirmed for your needs. Stay where you are if safe, contact local authorities (112), or try a different shelter.</p>
                </div>
              )}
              {assist && <Notice>Assistance noted: “{assist}”. In a real deployment this would be shared with volunteers — the prototype does not send it anywhere.</Notice>}
              {ranked.map(({ tag, s }) => <RouteCard key={s.route.id} tag={tag} s={s} now={now} shelterName={shelters.find((x) => x.id === s.route.shelterId)?.name ?? ""} />)}
              {result.excluded.length > 0 && (
                <section>
                  <h2 className="mb-2 font-semibold">Excluded routes</h2>
                  {result.excluded.map((s) => <RouteCard key={s.route.id} tag="Excluded" s={s} now={now} shelterName={shelters.find((x) => x.id === s.route.shelterId)?.name ?? ""} />)}
                </section>
              )}
              <details className="card-surface p-4 text-sm">
                <summary className="cursor-pointer font-semibold">How routes are scored</summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                  <li>Routes crossing a verified blocked segment are excluded.</li>
                  <li>Each active hazard reduces the score (low −8, medium −18, high −30), including unverified reports.</li>
                  <li>Routes known to break your needs (e.g. stairs for wheelchair users) are excluded.</li>
                  <li>If facts relevant to your needs are missing, the route is marked “unknown” — never safe.</li>
                  <li>Distance reduces the score slightly; exceeding your preferred distance costs −20.</li>
                </ol>
                <p className="mt-2">Limitations: sample routes only, no live traffic or water-level data, travel times are rough estimates.</p>
              </details>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const verdictUI = {
  suitable: { icon: CheckCircle2, tone: "success", label: "Suitable based on available data" },
  caution: { icon: ShieldAlert, tone: "warning", label: "Usable with caution" },
  unknown: { icon: CircleHelp, tone: "neutral", label: "Suitability unknown" },
  excluded: { icon: XCircle, tone: "danger", label: "Not suitable" },
} as const;

function RouteCard({ tag, s, now, shelterName }: { tag: string; s: ScoredRoute; now: number; shelterName: string }) {
  const v = verdictUI[s.verdict];
  const Icon = v.icon;
  return (
    <article className="card-surface mb-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">{tag}</p>
          <h3 className="text-lg font-semibold">{s.route.name} → {shelterName}</h3>
        </div>
        <Pill tone={v.tone}><Icon className="h-3.5 w-3.5" aria-hidden />{v.label}</Pill>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-muted-foreground">Distance</dt><dd className="flex items-center gap-1 font-semibold"><Ruler className="h-4 w-4" aria-hidden />{s.route.distanceKm} km</dd></div>
        <div><dt className="text-muted-foreground">Est. time</dt><dd className="flex items-center gap-1 font-semibold"><Clock className="h-4 w-4" aria-hidden />{s.route.walkMinutes ? `~${s.route.walkMinutes} min` : "Not available"}</dd></div>
        <div><dt className="text-muted-foreground">Hazards</dt><dd className="font-semibold">{s.hazards.length}</dd></div>
        <div><dt className="text-muted-foreground">Info updated</dt><dd className="font-semibold">{timeAgo(s.route.lastUpdated, now)}</dd></div>
      </dl>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{s.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
      {s.limitations.length > 0 && <p className="mt-2 text-sm text-muted-foreground"><strong>Accessibility limitations:</strong> {s.limitations.join(" ")}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <SimBadge label="Simulated route data" /> {s.verdict !== "excluded" && <span className="text-muted-foreground">Score {s.score}/100</span>}
        <Link to="/shelters/$id" params={{ id: s.route.shelterId }} className="ml-auto text-primary hover:underline">Shelter details</Link>
      </div>
    </article>
  );
}
