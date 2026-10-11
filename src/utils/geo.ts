import type { Shelter, TriState, VerificationStatus } from "@/types";

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export interface ShelterFilters {
  q: string;
  wheelchair: boolean;
  toilets: boolean;
  medical: boolean;
  water: boolean;
  food: boolean;
  verification: VerificationStatus | "all";
  maxKm: number | null;
  from: { lat: number; lng: number } | null;
}

const yes = (v: TriState) => v === "yes";

export function filterShelters(list: Shelter[], f: ShelterFilters) {
  const q = f.q.trim().toLowerCase();
  return list.filter((s) => {
    if (q && !`${s.name} ${s.area} ${s.address} ${s.type}`.toLowerCase().includes(q)) return false;
    if (f.wheelchair && !yes(s.wheelchairEntrance)) return false;
    if (f.toilets && !yes(s.accessibleToilets)) return false;
    if (f.medical && !yes(s.medical)) return false;
    if (f.water && !yes(s.water)) return false;
    if (f.food && !yes(s.food)) return false;
    if (f.verification !== "all" && s.verification !== f.verification) return false;
    if (f.maxKm && f.from && distanceKm(f.from, s) > f.maxKm) return false;
    return true;
  });
}

export function timeAgo(iso: string | null, now = Date.now()) {
  if (!iso) return "never";
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}
