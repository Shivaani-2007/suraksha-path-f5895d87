import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { MapViewProps } from "./types";

const LeafletMap = lazy(() => import("./LeafletMap"));

export function MapView(props: MapViewProps) {
  const h = props.height ?? 420;
  const fallback = (
    <div className="grid animate-pulse place-items-center rounded-xl border border-border bg-muted text-sm text-muted-foreground" style={{ height: h }}>
      Loading map…
    </div>
  );
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <LeafletMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}

export function MapLegend() {
  const items = [
    ["origin", "Starting point"],
    ["shelter", "Shelter"],
    ["destination", "Selected destination"],
    ["hazard", "Reported hazard"],
    ["blocked", "Blocked road"],
    ["safe", "Reported safe area"],
  ] as const;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Map legend">
      {items.map(([k, l]) => (
        <li key={k} className="flex items-center gap-2">
          <span className={`sp-pin sp-pin-${k} !h-4 !w-4 !border-2`} aria-hidden /> {l}
        </li>
      ))}
    </ul>
  );
}
