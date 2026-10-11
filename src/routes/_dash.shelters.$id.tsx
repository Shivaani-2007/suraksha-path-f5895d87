import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileWarning, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, SimBadge, StatusPill, TriLabel, VerificationPill } from "@/components/common";
import { MapView } from "@/components/map/MapView";
import { useStore } from "@/services/store";
import { timeAgo } from "@/utils/geo";

export const Route = createFileRoute("/_dash/shelters/$id")({
  head: () => ({
    meta: [
      { title: "Shelter Details — SURAKSHA PATH" },
      { name: "description", content: "Accessibility, facilities and verification status for a sample shelter." },
      { property: "og:title", content: "Shelter Details — SURAKSHA PATH" },
      { property: "og:description", content: "Sample shelter information with verification status." },
    ],
  }),
  component: ShelterDetail,
});

function ShelterDetail() {
  const { id } = Route.useParams();
  const { shelters, incidents, now } = useStore();
  const s = shelters.find((x) => x.id === id);
  if (!s) return <EmptyState title="Shelter not found"><Link to="/shelters" className="text-primary underline">Back to directory</Link></EmptyState>;
  const related = incidents.filter((i) => i.shelterId === s.id);
  const rows = [
    ["Wheelchair entrance", s.wheelchairEntrance],
    ["Accessible toilets", s.accessibleToilets],
    ["Medical assistance", s.medical],
    ["Drinking water", s.water],
    ["Food", s.food],
  ] as const;

  return (
    <>
      <Link to="/shelters" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> All shelters</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{s.name}</h1>
          <p className="text-muted-foreground">{s.type} · {s.address}</p>
          <div className="mt-2 flex flex-wrap gap-2"><VerificationPill v={s.verification} /><SimBadge label="Fictional shelter" /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="teal"><Link to="/route" search={{ to: s.id }}><Navigation /> Directions</Link></Button>
          <Button asChild variant="outline"><Link to="/report" search={{ shelter: s.id }}><FileWarning /> Report an issue</Link></Button>
        </div>
      </div>
      {s.verification !== "verified" && <div className="mb-4"><Notice tone="warning">This information is not recently verified. Do not assume the shelter is open or accessible.</Notice></div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="mb-3 font-semibold">Facilities</h2>
          <dl className="divide-y divide-border">
            {rows.map(([l, v]) => (
              <div key={l} className="flex justify-between py-2"><dt>{l}</dt><dd><TriLabel v={v} /></dd></div>
            ))}
            <div className="flex justify-between py-2"><dt>Reported capacity</dt><dd className="font-semibold">{s.capacity ?? "Unknown"}</dd></div>
            <div className="flex justify-between py-2"><dt>Reported occupancy</dt><dd className="font-semibold">{s.occupancy ?? "Unknown"}</dd></div>
            <div className="flex justify-between py-2"><dt>Last verified</dt><dd className="font-semibold">{s.lastVerified ? timeAgo(s.lastVerified, now) : "Never"}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt>Source</dt><dd className="text-right">{s.source}</dd></div>
          </dl>
          {s.notes && <p className="mt-3 text-sm text-muted-foreground">{s.notes}</p>}
        </section>
        <section className="card-surface p-4">
          <h2 className="mb-3 font-semibold">Location</h2>
          <MapView center={[s.lat, s.lng]} zoom={15} markers={[{ id: s.id, kind: "shelter", lat: s.lat, lng: s.lng, label: s.name, glyph: "S" }]} height={300} />
        </section>
      </div>
      <section className="card-surface mt-6 p-5">
        <h2 className="mb-3 font-semibold">Reports about this shelter</h2>
        {related.length === 0 ? <p className="text-sm text-muted-foreground">No reports yet.</p> : (
          <ul className="divide-y divide-border">
            {related.map((i) => <li key={i.id} className="flex items-center justify-between gap-2 py-2"><span>{i.title}</span><StatusPill s={i.status} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
