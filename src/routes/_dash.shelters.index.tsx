import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SimBadge, TriLabel, VerificationPill } from "@/components/common";
import { useStore } from "@/services/store";
import { places } from "@/data/sample";
import { distanceKm, filterShelters, timeAgo, type ShelterFilters } from "@/utils/geo";
import { verificationLabel } from "@/utils/labels";
import type { VerificationStatus } from "@/types";

export const Route = createFileRoute("/_dash/shelters/")({
  validateSearch: z.object({ q: z.string().optional(), wheelchair: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Shelter Directory — SURAKSHA PATH" },
      { name: "description", content: "Searchable directory of sample emergency shelters with accessibility and verification details." },
      { property: "og:title", content: "Shelter Directory — SURAKSHA PATH" },
      { property: "og:description", content: "Filter sample shelters by accessibility, medical help, water, food and verification." },
    ],
  }),
  component: Shelters,
});

function Shelters() {
  const search = Route.useSearch();
  const { shelters, now } = useStore();
  const [fromId, setFromId] = useState("");
  const [f, setF] = useState<Omit<ShelterFilters, "from">>({
    q: search.q ?? "", wheelchair: !!search.wheelchair, toilets: false, medical: false, water: false, food: false, verification: "all", maxKm: null,
  });
  const from = places.find((p) => p.id === fromId) ?? null;
  const list = useMemo(() => filterShelters(shelters, { ...f, from }), [shelters, f, from]);
  const toggles = [["wheelchair", "Wheelchair entrance"], ["toilets", "Accessible toilets"], ["medical", "Medical assistance"], ["water", "Drinking water"], ["food", "Food"]] as const;

  return (
    <>
      <PageHeader title="Shelters" desc="Fictional sample shelters. None of these are real or guaranteed to be open." actions={<SimBadge label="Sample shelters" />} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card-surface h-fit space-y-4 p-4" aria-label="Filters">
          <div className="relative">
            <Label htmlFor="sq">Search</Label>
            <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <input id="sq" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background pl-9 pr-2" placeholder="Name or area" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Must have (confirmed)</legend>
            {toggles.map(([k, l]) => (
              <div key={k} className="flex items-center gap-2">
                <Checkbox id={`t-${k}`} checked={f[k]} onCheckedChange={(v) => setF({ ...f, [k]: !!v })} />
                <Label htmlFor={`t-${k}`}>{l}</Label>
              </div>
            ))}
          </fieldset>
          <div>
            <Label htmlFor="vs">Verification</Label>
            <select id="vs" value={f.verification} onChange={(e) => setF({ ...f, verification: e.target.value as VerificationStatus | "all" })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2">
              <option value="all">Any status</option>
              {(Object.keys(verificationLabel) as VerificationStatus[]).map((v) => <option key={v} value={v}>{verificationLabel[v]}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="df">Distance from</Label>
            <select id="df" value={fromId} onChange={(e) => setFromId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2">
              <option value="">No location</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select aria-label="Maximum distance" disabled={!from} value={f.maxKm ?? ""} onChange={(e) => setF({ ...f, maxKm: e.target.value ? Number(e.target.value) : null })} className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-2 disabled:opacity-50">
              <option value="">Any distance</option>
              {[1, 2, 3, 5].map((k) => <option key={k} value={k}>Within {k} km (straight line)</option>)}
            </select>
          </div>
          <Button variant="outline" className="w-full" onClick={() => { setF({ q: "", wheelchair: false, toilets: false, medical: false, water: false, food: false, verification: "all", maxKm: null }); setFromId(""); }}>Clear filters</Button>
        </aside>

        <div>
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">{list.length} of {shelters.length} shelters</p>
          {list.length === 0 ? (
            <EmptyState title="No shelters match these filters">Try removing a filter. Unknown information is not counted as “yes”.</EmptyState>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {list.map((s) => (
                <li key={s.id}>
                  <Link to="/shelters/$id" params={{ id: s.id }} className="card-surface block h-full p-5 transition-shadow hover:shadow-lift">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold">{s.name}</h2>
                        <p className="text-sm text-muted-foreground">{s.type} · {s.area}</p>
                      </div>
                      <VerificationPill v={s.verification} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt>Wheelchair entrance</dt><dd><TriLabel v={s.wheelchairEntrance} /></dd>
                      <dt>Accessible toilets</dt><dd><TriLabel v={s.accessibleToilets} /></dd>
                      <dt>Medical help</dt><dd><TriLabel v={s.medical} /></dd>
                      <dt>Water / Food</dt><dd><TriLabel v={s.water} /> / <TriLabel v={s.food} /></dd>
                    </dl>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {s.capacity ? `Reported capacity ${s.capacity}${s.occupancy != null ? `, occupancy ${s.occupancy}` : ""} · ` : "Capacity unknown · "}
                      Checked {timeAgo(s.lastVerified, now)}
                      {from && ` · ${distanceKm(from, s).toFixed(1)} km away`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
