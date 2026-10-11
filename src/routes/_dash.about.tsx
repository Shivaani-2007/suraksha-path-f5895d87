import { createFileRoute } from "@tanstack/react-router";
import { Notice, PageHeader } from "@/components/common";

export const Route = createFileRoute("/_dash/about")({
  head: () => ({
    meta: [
      { title: "About — SURAKSHA PATH" },
      { name: "description", content: "Problem, solution, innovation, social impact and limitations of the SURAKSHA PATH prototype." },
      { property: "og:title", content: "About SURAKSHA PATH" },
      { property: "og:description", content: "An accessibility-first evacuation planning prototype for My Bharat Hack for Social Cause." },
    ],
  }),
  component: About,
});

const sections = [
  ["Problem", "Standard navigation and emergency information may not account for individual accessibility needs. A route that works for one person may be unusable for a wheelchair user, an older adult or someone with low vision, and a nearby shelter may lack an accessible entrance or medical help."],
  ["Solution", "SURAKSHA PATH combines hazard information, accessibility-aware route comparison, shelter details with verification status, and community reporting with a review workflow."],
  ["Innovation", "Personalised evacuation decisions based on accessibility constraints, reported hazards and shelter suitability — explained with transparent rules instead of a black box."],
  ["Social impact", "The platform aims to make emergency information more usable for people with disabilities, older adults and communities affected by disasters."],
  ["How scoring works", "Routes crossing verified blockages or violating a stated need are excluded. Hazards reduce the score by severity. Missing information is labelled “unknown” and is never treated as safe."],
  ["Limitations", "This prototype does not replace emergency services, professional evacuation guidance or official government alerts. All shelters, incidents, routes and alerts are fictional demo data stored only in your browser. Routes are predefined scenarios, not live routing. Hindi translation is partial."],
] as const;

function About() {
  return (
    <>
      <PageHeader title="About SURAKSHA PATH" desc="Accessible Evacuation. Safer Tomorrow. Built for My Bharat Hack for Social Cause — Disaster Resilience, Accessibility, Community Safety, GIS and Emerging Technologies." />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(([t, d]) => (
          <section key={t} className="card-surface p-5">
            <h2 className="text-lg font-semibold">{t}</h2>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </section>
        ))}
      </div>
      <div className="mt-6"><Notice tone="warning">In an emergency, call 112 and follow instructions from local authorities.</Notice></div>
    </>
  );
}
