import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Notice, PageHeader, SimBadge, StatusPill, VerificationPill } from "@/components/common";
import { MapLegend, MapView } from "@/components/map/MapView";
import type { MapMarker, MarkerType } from "@/components/map/types";
import { useMapMarkers } from "@/hooks/useMapData";
import { useStore } from "@/services/store";
import { MAP_CENTER, places } from "@/data/sample";

export const Route = createFileRoute("/_dash/map")({
  head: () => ({
    meta: [
      { title: "Emergency Map — SURAKSHA PATH" },
      { name: "description", content: "Interactive map of sample shelters, hazards, blocked roads and safe areas." },
      { property: "og:title", content: "Emergency Map — SURAKSHA PATH" },
      { property: "og:description", content: "Explore simulated hazards and shelters on an interactive map." },
    ],
  }),
  component: MapPage,
});

const FILTERS: { k: MarkerType; label: string }[] = [
  { k: "shelter", label: "Shelters" },
  { k: "hazard", label: "Reported hazards" },
  { k: "blocked", label: "Blocked roads" },
  { k: "safe", label: "Safe areas" },
];

function MapPage() {
  const { shelters, incidents } = useStore();
  const { shelterMarkers, incidentMarkers } = useMapMarkers();
  const [show, setShow] = useState<Record<string, boolean>>({ shelter: true, hazard: true, blocked: true, safe: true });
  const [layer, setLayer] = useState<"street" | "topo">("street");
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>(MAP_CENTER);
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [q, setQ] = useState("");
  const [searchMsg, setSearchMsg] = useState("");

  const markers = useMemo(() => {
    const list = [...shelterMarkers, ...incidentMarkers].filter((m) => show[m.kind]);
    if (origin) list.push({ id: "origin", kind: "origin", lat: origin[0], lng: origin[1], label: "Your selected starting point", glyph: "A" });
    return list;
  }, [shelterMarkers, incidentMarkers, show, origin]);

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim().toLowerCase();
    if (!term) return;
    const hit =
      places.find((p) => p.name.toLowerCase().includes(term)) ??
      shelters.find((s) => `${s.name} ${s.area}`.toLowerCase().includes(term)) ??
      incidents.find((i) => `${i.title} ${i.area}`.toLowerCase().includes(term));
    if (hit) {
      setCenter([hit.lat, hit.lng]);
      setSearchMsg(`Showing: ${"name" in hit ? hit.name : hit.title}`);
    } else setSearchMsg("No sample location matched. Try “Neelpur”, “Kaveri” or “Old Mill”.");
  };

  const shelter = selected?.kind === "shelter" ? shelters.find((s) => s.id === selected.id) : undefined;
  const incident = selected && selected.kind !== "shelter" ? incidents.find((i) => i.id === selected.id) : undefined;

  return (
    <>
      <PageHeader title="Emergency Map" desc="Click the map to choose a starting point. Click a marker for details." actions={<SimBadge label="All markers are simulated" />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <form onSubmit={doSearch} className="flex gap-2" role="search">
            <label htmlFor="map-q" className="sr-only">Search sample locations</label>
            <input id="map-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sample locations…" className="h-10 flex-1 rounded-lg border border-input bg-card px-3" />
            <Button type="submit"><Search /> Search</Button>
          </form>
          {searchMsg && <p className="text-sm text-muted-foreground" aria-live="polite">{searchMsg}</p>}
          <MapView center={center} markers={markers} layer={layer} height={520} onMarkerClick={(m) => m.kind !== "origin" && setSelected(m)} onMapClick={(ll) => setOrigin(ll)} />
          <MapLegend />
        </div>

        <aside className="space-y-4">
          <section className="card-surface p-4">
            <h2 className="mb-3 font-semibold">Show on map</h2>
            <div className="space-y-2">
              {FILTERS.map(({ k, label }) => (
                <div key={k} className="flex items-center gap-2">
                  <Checkbox id={`f-${k}`} checked={!!show[k]} onCheckedChange={(v) => setShow({ ...show, [k]: !!v })} />
                  <Label htmlFor={`f-${k}`}>{label}</Label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2" role="group" aria-label="Map layer">
              <Layers className="mt-2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Button size="sm" variant={layer === "street" ? "default" : "outline"} aria-pressed={layer === "street"} onClick={() => setLayer("street")}>Street</Button>
              <Button size="sm" variant={layer === "topo" ? "default" : "outline"} aria-pressed={layer === "topo"} onClick={() => setLayer("topo")}>Terrain</Button>
            </div>
          </section>

          <section className="card-surface p-4">
            <h2 className="mb-2 font-semibold">Starting point</h2>
            <label htmlFor="origin-select" className="text-sm text-muted-foreground">Pick a sample place, or click the map</label>
            <select id="origin-select" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2" value="" onChange={(e) => {
              const p = places.find((x) => x.id === e.target.value);
              if (p) { setOrigin([p.lat, p.lng]); setCenter([p.lat, p.lng]); }
            }}>
              <option value="">Choose…</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {origin && <p className="mt-2 flex items-center gap-1 text-sm"><MapPin className="h-4 w-4 text-primary" aria-hidden />{origin[0].toFixed(4)}, {origin[1].toFixed(4)}</p>}
          </section>

          <section className="card-surface p-4" aria-live="polite">
            <h2 className="mb-2 font-semibold">Details</h2>
            {!selected && <p className="text-sm text-muted-foreground">Select a marker to see details.</p>}
            {shelter && (
              <div className="space-y-2">
                <p className="font-medium">{shelter.name}</p>
                <p className="text-sm text-muted-foreground">{shelter.address}</p>
                <VerificationPill v={shelter.verification} />
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild size="sm"><Link to="/shelters/$id" params={{ id: shelter.id }}>Open details</Link></Button>
                  <Button asChild size="sm" variant="teal"><Link to="/safe-route" search={{ to: shelter.id }}>Set as destination</Link></Button>
                </div>
              </div>
            )}
            {incident && (
              <div className="space-y-2">
                <p className="font-medium">{incident.title}</p>
                <p className="text-sm">{incident.description}</p>
                <div className="flex flex-wrap gap-2"><StatusPill s={incident.status} /><SimBadge label={incident.source === "user_report" ? "User report" : "Simulated"} /></div>
              </div>
            )}
          </section>

          <Notice>Without map tiles or location access, use the place list above — all sample items are also in the Shelters and Report History pages.</Notice>
        </aside>
      </div>
    </>
  );
}
