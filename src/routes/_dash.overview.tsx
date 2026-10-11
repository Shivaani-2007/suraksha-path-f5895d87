import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Accessibility, AlertTriangle, Clock, FileWarning, Navigation, Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SimBadge, VerificationPill } from "@/components/common";
import { MapView } from "@/components/map/MapView";
import { useStore } from "@/services/store";
import { useMapMarkers } from "@/hooks/useMapData";
import { MAP_CENTER } from "@/data/sample";
import { categoryLabel } from "@/utils/labels";
import { timeAgo } from "@/utils/geo";
import type { IncidentCategory } from "@/types";

export const Route = createFileRoute("/_dash/overview")({
  head: () => ({
    meta: [
      { title: "Overview — SURAKSHA PATH" },
      { name: "description", content: "Dashboard of sample shelters, hazards, community reports and alerts." },
      { property: "og:title", content: "Overview — SURAKSHA PATH" },
      { property: "og:description", content: "Simulated dashboard of shelters, hazards and reports." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { shelters, incidents, alerts, now } = useStore();
  const { shelterMarkers, incidentMarkers } = useMapMarkers();
  const active = incidents.filter((i) => i.status !== "rejected" && i.status !== "resolved");
  const stats = [
    { label: "Sample shelters", value: shelters.length, icon: Tent, to: "/shelters", search: {} },
    { label: "Marked wheelchair-accessible", value: shelters.filter((s) => s.wheelchairEntrance === "yes").length, icon: Accessibility, to: "/shelters", search: { wheelchair: true } },
    { label: "Reported road hazards", value: active.filter((i) => i.kind !== "safe").length, icon: AlertTriangle, to: "/map", search: {} },
    { label: "Pending community reports", value: incidents.filter((i) => i.status === "pending").length, icon: FileWarning, to: "/reports", search: { status: "pending" } },
  ] as const;

  const chart = (Object.keys(categoryLabel) as IncidentCategory[])
    .map((c) => ({ name: categoryLabel[c].split(" ")[0] + (c.startsWith("shelter") ? " " + categoryLabel[c].split(" ")[1] : ""), count: incidents.filter((i) => i.category === c).length }))
    .filter((d) => d.count > 0);

  const recentShelters = [...shelters].filter((s) => s.lastVerified).sort((a, b) => Date.parse(b.lastVerified!) - Date.parse(a.lastVerified!)).slice(0, 4);

  return (
    <>
      <PageHeader title="Overview" desc="A summary of the sample dataset. All metrics below are simulated." actions={<SimBadge label="Simulated metrics" />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to, search }) => (
          <Link key={label} to={to} search={search as never} className="card-surface group p-5 transition-shadow hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            <span className="text-xs text-primary group-hover:underline">View →</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild><Link to="/safe-route"><Navigation /> Find a safe route</Link></Button>
        <Button asChild variant="teal"><Link to="/shelters"><Tent /> View shelters</Link></Button>
        <Button asChild variant="outline"><Link to="/report"><FileWarning /> Report an issue</Link></Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card-surface p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Map preview</h2><Link to="/map" className="text-sm text-primary hover:underline">Open full map</Link></div>
          <MapView center={MAP_CENTER} markers={[...shelterMarkers, ...incidentMarkers]} height={320} />
        </section>
        <section className="card-surface p-4">
          <h2 className="mb-1 font-semibold">Reports by category</h2>
          <p className="mb-3 text-xs text-muted-foreground">Sample data</p>
          <div className="h-64" role="img" aria-label={`Bar chart: ${chart.map((c) => `${c.name} ${c.count}`).join(", ")}`}>
            <ResponsiveContainer>
              <BarChart data={chart} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent alerts</h2><Link to="/alerts" className="text-sm text-primary hover:underline">All alerts</Link></div>
          <ul className="divide-y divide-border">
            {[...alerts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4).map((a) => (
              <li key={a.id} className="py-3">
                <p className="font-medium">{a.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" aria-hidden />{timeAgo(a.createdAt, now)} · {a.source}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="card-surface p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recently updated shelters</h2><Link to="/shelters" className="text-sm text-primary hover:underline">Directory</Link></div>
          <ul className="divide-y divide-border">
            {recentShelters.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link to="/shelters/$id" params={{ id: s.id }} className="font-medium hover:underline">{s.name}</Link>
                  <p className="text-xs text-muted-foreground">Updated {timeAgo(s.lastVerified, now)}</p>
                </div>
                <VerificationPill v={s.verification} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
