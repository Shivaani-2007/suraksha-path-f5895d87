export type MarkerType = "origin" | "shelter" | "hazard" | "blocked" | "safe" | "destination";

export interface MapMarker {
  id: string;
  kind: MarkerType;
  lat: number;
  lng: number;
  label: string;
  glyph?: string;
}

export interface MapPath {
  id: string;
  points: [number, number][];
  tone: "best" | "caution" | "excluded" | "unknown" | "plain";
  label: string;
  dashed?: boolean;
  weight?: number;
}

export interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers: MapMarker[];
  paths?: MapPath[];
  layer?: "street" | "topo";
  height?: number;
  onMarkerClick?: (m: MapMarker) => void;
  onMapClick?: (latlng: [number, number]) => void;
}
