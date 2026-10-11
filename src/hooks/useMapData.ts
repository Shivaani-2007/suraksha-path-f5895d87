import { useMemo } from "react";
import { useStore } from "@/services/store";
import type { MapMarker } from "@/components/map/types";

/** Builds map markers from the single shared demo dataset. */
export function useMapMarkers() {
  const { shelters, incidents } = useStore();
  return useMemo(() => {
    const shelterMarkers: MapMarker[] = shelters.map((s) => ({
      id: s.id, kind: "shelter", lat: s.lat, lng: s.lng, label: `${s.name} (sample shelter)`, glyph: "S",
    }));
    const incidentMarkers: MapMarker[] = incidents
      .filter((i) => i.status !== "rejected" && i.status !== "resolved")
      .map((i) => ({
        id: i.id, kind: i.kind, lat: i.lat, lng: i.lng,
        label: `${i.title} (${i.source === "user_report" ? "user report" : "simulated"})`,
        glyph: i.kind === "blocked" ? "×" : i.kind === "safe" ? "✓" : "!",
      }));
    return { shelterMarkers, incidentMarkers };
  }, [shelters, incidents]);
}
