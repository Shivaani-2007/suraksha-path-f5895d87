// Browser-only: imported lazily from MapView.
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker, MapPath, MapViewProps } from "./types";

const LAYERS = {
  street: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap contributors" },
  topo: { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attr: "&copy; OpenStreetMap, SRTM | OpenTopoMap" },
};

export default function LeafletMap({ center, zoom = 13, markers, paths = [], layer = "street", onMarkerClick, onMapClick, height = 420 }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const [tileError, setTileError] = useState(false);
  const cb = useRef({ onMarkerClick, onMapClick });
  cb.current = { onMarkerClick, onMapClick };

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView(center, zoom);
    m.on("click", (e: L.LeafletMouseEvent) => cb.current.onMapClick?.([e.latlng.lat, e.latlng.lng]));
    markerLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    tiles.current?.remove();
    let errors = 0;
    tiles.current = L.tileLayer(LAYERS[layer].url, { attribution: LAYERS[layer].attr, maxZoom: 18 })
      .on("tileerror", () => {
        errors++;
        if (errors > 4) setTileError(true);
      })
      .on("load", () => setTileError(false))
      .addTo(m);
  }, [layer]);

  useEffect(() => {
    const g = markerLayer.current;
    if (!g) return;
    g.clearLayers();
    paths.forEach((p: MapPath) => {
      L.polyline(p.points, { className: `sp-route sp-route-${p.tone}`, weight: p.weight ?? 5, opacity: 0.85, dashArray: p.dashed ? "8 8" : undefined })
        .bindTooltip(p.label)
        .addTo(g);
    });
    markers.forEach((mk: MapMarker) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="sp-pin sp-pin-${mk.kind}" role="img" aria-label="${mk.kind}: ${mk.label.replace(/"/g, "")}">${mk.glyph ?? ""}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([mk.lat, mk.lng], { icon, title: mk.label, keyboard: true })
        .bindTooltip(mk.label)
        .on("click", () => cb.current.onMarkerClick?.(mk))
        .addTo(g);
    });
  }, [markers, paths]);

  useEffect(() => {
    map.current?.setView(center, map.current.getZoom());
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative overflow-hidden rounded-xl border border-border" style={{ height }}>
      <div ref={el} className="h-full w-full" role="application" aria-label="Interactive emergency map with sample data" />
      {tileError && (
        <div className="absolute inset-x-3 top-3 z-[500] rounded-lg bg-card p-3 text-sm shadow-lift">
          Map tiles could not load. Sample markers are still shown, and every item is also listed beside the map.
        </div>
      )}
    </div>
  );
}
