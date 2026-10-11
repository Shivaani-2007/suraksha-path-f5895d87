import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, ArrowRight, MapPinned, ShieldCheck, Users, Route as RouteIcon, ClipboardCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, Notice, SimBadge } from "@/components/common";
import { MapView, MapLegend } from "@/components/map/MapView";
import { useMapMarkers } from "@/hooks/useMapData";
import { MAP_CENTER } from "@/data/sample";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SURAKSHA PATH — A Safer Route for Every Person" },
      { name: "description", content: "Prototype for accessibility-aware evacuation routes, shelter suitability and community hazard reporting." },
      { property: "og:title", content: "SURAKSHA PATH — Accessible Evacuation. Safer Tomorrow." },
      { property: "og:description", content: "Compare evacuation routes and shelters based on individual accessibility needs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Accessibility, title: "Accessible Routes", text: "Compare routes against your needs — stairs, slopes, lighting and reported hazards." },
  { icon: ShieldCheck, title: "Verified Shelters", text: "See what each shelter offers and how recently the information was checked." },
  { icon: Users, title: "Community Safety", text: "Report blocked roads and changing conditions. Reports stay unverified until reviewed." },
];

const steps = [
  { icon: Accessibility, title: "Tell us your needs", text: "Optionally set mobility, vision or assistance needs. Never required to browse." },
  { icon: Search, title: "Explore hazards", text: "View reported hazards, blocked roads and shelters on the map." },
  { icon: RouteIcon, title: "Compare routes", text: "Transparent rules exclude blocked or unsuitable paths and explain why." },
  { icon: ClipboardCheck, title: "Report changes", text: "Share conditions; administrators review before anything is marked verified." },
];

function Landing() {
  const { shelterMarkers, incidentMarkers } = useMapMarkers();
  return (
    <div className="min-h-screen">
      <header className="bg-hero">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <Logo light className="text-lg" />
          <nav className="flex items-center gap-2">
            <Button asChild variant="heroOutline" size="sm"><Link to="/about">About</Link></Button>
            <Button asChild variant="teal" size="sm"><Link to="/overview">Open app</Link></Button>
          </nav>
        </div>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-8 md:grid-cols-2 md:px-8 md:pt-14">
          <div>
            <p className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-teal">Accessible Evacuation. Safer Tomorrow.</p>
            <h1 className="text-4xl font-bold leading-tight text-navy-foreground md:text-6xl">A Safer Route for Every Person.</h1>
            <p className="mt-5 max-w-xl text-lg text-navy-foreground/80">
              During floods and other emergencies, the nearest shelter isn't always the right one. SURAKSHA PATH matches evacuation routes and shelters to each person's accessibility needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="teal" size="lg"><Link to="/map">Explore Safety Map <ArrowRight /></Link></Button>
              <Button variant="heroOutline" size="lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                How It Works
              </Button>
            </div>
          </div>
          <img src={hero} width={1280} height={896} alt="Illustration: a volunteer helps a wheelchair user and an older adult along a raised path to a shelter during a flood" className="w-full rounded-2xl shadow-lift" />
        </section>
      </header>

      <section className="mx-auto -mt-10 grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:px-8">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-surface p-6">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon aria-hidden /></span>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Map preview</h2>
            <p className="text-muted-foreground">Fictional shelters and incidents shown on an OpenStreetMap basemap.</p>
          </div>
          <SimBadge label="Simulated sample data" />
        </div>
        <div className="card-surface p-3">
          <MapView center={MAP_CENTER} markers={[...shelterMarkers, ...incidentMarkers]} height={380} />
          <div className="p-3"><MapLegend /></div>
        </div>
      </section>

      <section id="how" className="scroll-mt-8 bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                <span className="font-display text-sm font-bold text-teal">Step {i + 1}</span>
                <div className="mt-2 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" aria-hidden /><h3 className="font-semibold">{title}</h3></div>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild><Link to="/route"><MapPinned /> Try the route planner</Link></Button>
            <Button asChild variant="outline"><Link to="/shelters">Browse shelters</Link></Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <Notice tone="warning">
          <strong>Disclaimer:</strong> SURAKSHA PATH is a student prototype built for My Bharat Hack for Social Cause. It uses simulated data and does not replace official emergency services, evacuation guidance or government alerts. In an emergency, call 112 and follow official instructions.
        </Notice>
      </footer>
    </div>
  );
}
