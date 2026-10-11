// All records below are FICTIONAL demo data. Names are invented and placed on a real
// basemap only so the map can be demonstrated. Nothing here is live information.
import type { AccessibilityProfile, AlertItem, Incident, Place, RouteOption, Shelter } from "@/types";

const DAY = 86400000;
// Fixed reference time so server and client render identically.
export const DEMO_NOW = Date.parse("2026-10-11T09:00:00Z");
const ago = (ms: number) => new Date(DEMO_NOW - ms).toISOString();

export const MAP_CENTER: [number, number] = [13.05, 80.24];

export const places: Place[] = [
  { id: "p1", name: "Neelpur Bus Stand (sample)", lat: 13.06, lng: 80.225 },
  { id: "p2", name: "Kaveri Nagar Market (sample)", lat: 13.038, lng: 80.232 },
  { id: "p3", name: "Old Mill Colony (sample)", lat: 13.052, lng: 80.262 },
];

export const shelters: Shelter[] = [
  {
    id: "s1", name: "Sevashram Community Hall", area: "Neelpur East", address: "12 Lake View Road, Neelpur East (fictional)",
    type: "Community hall", lat: 13.068, lng: 80.245, wheelchairEntrance: "yes", accessibleToilets: "yes", medical: "yes",
    water: "yes", food: "yes", capacity: 300, occupancy: 120, lastVerified: ago(0.2 * DAY), verification: "verified",
    source: "Simulated district verification record", notes: "Ramp at main entrance, ground-floor accessible toilets.",
  },
  {
    id: "s2", name: "Govt. Model School Relief Point", area: "Kaveri Nagar", address: "School Street, Kaveri Nagar (fictional)",
    type: "School", lat: 13.03, lng: 80.248, wheelchairEntrance: "unknown", accessibleToilets: "unknown", medical: "no",
    water: "yes", food: "yes", capacity: 450, lastVerified: ago(1.5 * DAY), verification: "community",
    source: "Volunteer report (unconfirmed)", notes: "Accessibility details incomplete.",
  },
  {
    id: "s3", name: "Highland Temple Mandapam", area: "Old Mill Colony", address: "Hill Road, Old Mill Colony (fictional)",
    type: "Religious venue", lat: 13.058, lng: 80.275, wheelchairEntrance: "no", accessibleToilets: "no", medical: "no",
    water: "yes", food: "yes", capacity: 150, occupancy: 140, lastVerified: ago(9 * DAY), verification: "overdue",
    source: "Simulated record, last check 9 days ago", notes: "Entry via 14 steps.",
  },
  {
    id: "s4", name: "Riverside Primary Health Centre Annexe", area: "Neelpur West", address: "Canal Bank Road, Neelpur West (fictional)",
    type: "Health facility", lat: 13.072, lng: 80.215, wheelchairEntrance: "yes", accessibleToilets: "yes", medical: "yes",
    water: "yes", food: "no", capacity: 80, occupancy: 30, lastVerified: ago(0.5 * DAY), verification: "verified",
    source: "Simulated district verification record",
  },
  {
    id: "s5", name: "Sports Complex Indoor Arena", area: "Kaveri Nagar South", address: "Stadium Link Road (fictional)",
    type: "Sports complex", lat: 13.022, lng: 80.222, wheelchairEntrance: "unknown", accessibleToilets: "unknown", medical: "unknown",
    water: "unknown", food: "unknown", lastVerified: null, verification: "unavailable", source: "No information received",
  },
];

const hist = (status: Incident["status"], at: string, by = "Demo system") => [{ status, at, by }];

export const incidents: Incident[] = [
  { id: "i1", category: "blocked_road", kind: "blocked", title: "Lake View Road underpass blocked", area: "Neelpur East", lat: 13.064, lng: 80.238, description: "Underpass submerged; barricades placed (simulated).", severity: "high", status: "verified", reporterRole: "Volunteer", createdAt: ago(0.15 * DAY), source: "simulated", history: hist("verified", ago(0.1 * DAY)) },
  { id: "i2", category: "flooded_path", kind: "hazard", title: "Knee-deep water on Market Lane", area: "Kaveri Nagar", lat: 13.041, lng: 80.24, description: "Standing water reported along footpath.", severity: "medium", status: "pending", reporterRole: "Resident", createdAt: ago(0.08 * DAY), source: "simulated", history: hist("pending", ago(0.08 * DAY)) },
  { id: "i3", category: "inaccessible_route", kind: "hazard", title: "Footbridge stairs only, no ramp", area: "Old Mill Colony", lat: 13.055, lng: 80.255, description: "Pedestrian bridge has stairs only.", severity: "medium", status: "verified", reporterRole: "Volunteer", createdAt: ago(3 * DAY), source: "simulated", history: hist("verified", ago(2.5 * DAY)) },
  { id: "i4", category: "flooded_path", kind: "hazard", title: "Canal overflow near Bus Stand", area: "Neelpur West", lat: 13.063, lng: 80.222, description: "Water rising near canal edge.", severity: "high", status: "under_review", reporterRole: "Resident", createdAt: ago(0.05 * DAY), source: "simulated", history: hist("under_review", ago(0.04 * DAY)) },
  { id: "i5", category: "shelter_accessibility", kind: "hazard", title: "Ramp at school relief point unconfirmed", area: "Kaveri Nagar", lat: 13.031, lng: 80.247, description: "Unclear if temporary ramp has been installed.", severity: "low", status: "pending", reporterRole: "Caregiver", createdAt: ago(0.3 * DAY), source: "simulated", shelterId: "s2", history: hist("pending", ago(0.3 * DAY)) },
  { id: "i6", category: "blocked_road", kind: "blocked", title: "Fallen tree on Stadium Link Road", area: "Kaveri Nagar South", lat: 13.026, lng: 80.228, description: "Tree blocking both lanes.", severity: "medium", status: "verified", reporterRole: "Volunteer", createdAt: ago(0.4 * DAY), source: "simulated", history: hist("verified", ago(0.35 * DAY)) },
  { id: "i7", category: "other", kind: "safe", title: "Raised ground near Water Tank", area: "Neelpur East", lat: 13.07, lng: 80.235, description: "Community reports this area as dry and open.", severity: "low", status: "pending", reporterRole: "Resident", createdAt: ago(0.2 * DAY), source: "simulated", history: hist("pending", ago(0.2 * DAY)) },
  { id: "i8", category: "shelter_capacity", kind: "hazard", title: "Temple Mandapam nearly full", area: "Old Mill Colony", lat: 13.058, lng: 80.273, description: "Reported near capacity.", severity: "medium", status: "pending", reporterRole: "Shelter staff", createdAt: ago(0.1 * DAY), source: "simulated", shelterId: "s3", history: hist("pending", ago(0.1 * DAY)) },
  { id: "i9", category: "map_error", kind: "hazard", title: "Unmapped lane near Mill gate", area: "Old Mill Colony", lat: 13.049, lng: 80.258, description: "Shortcut lane missing on map.", severity: "low", status: "resolved", reporterRole: "Resident", createdAt: ago(4 * DAY), source: "simulated", history: hist("resolved", ago(3 * DAY)) },
];

const F = (stairs: boolean | null, crossing: boolean | null, slope: boolean | null, unlit: boolean | null, tactile: boolean | null) => ({
  stairs, inaccessibleCrossing: crossing, steepSlope: slope, unlitSection: unlit, tactileGuidance: tactile,
});

// Predefined, SIMULATED route scenarios (no live routing engine).
export const routes: RouteOption[] = [
  // Scenario 1: Bus Stand -> Sevashram Hall
  { id: "r1a", name: "Via Lake View Road", originId: "p1", shelterId: "s1", distanceKm: 2.1, walkMinutes: 28, incidentIds: ["i1"], features: F(false, false, false, false, null), path: [[13.06, 80.225], [13.064, 80.238], [13.068, 80.245]], lastUpdated: ago(0.1 * DAY), source: "simulated" },
  { id: "r1b", name: "Via Water Tank ridge", originId: "p1", shelterId: "s1", distanceKm: 2.8, walkMinutes: 38, incidentIds: [], features: F(false, false, true, false, null), path: [[13.06, 80.225], [13.07, 80.235], [13.068, 80.245]], lastUpdated: ago(0.2 * DAY), source: "simulated" },
  { id: "r1c", name: "Via canal footpath", originId: "p1", shelterId: "s1", distanceKm: 2.4, walkMinutes: 32, incidentIds: ["i4"], features: F(null, null, false, true, null), path: [[13.06, 80.225], [13.063, 80.222], [13.066, 80.235], [13.068, 80.245]], lastUpdated: ago(0.05 * DAY), source: "simulated" },
  // Scenario 2: Market -> School relief point / Sevashram
  { id: "r2a", name: "Market Lane direct", originId: "p2", shelterId: "s2", distanceKm: 1.9, walkMinutes: 25, incidentIds: ["i2"], features: F(false, false, false, false, false), path: [[13.038, 80.232], [13.041, 80.24], [13.03, 80.248]], lastUpdated: ago(0.08 * DAY), source: "simulated" },
  { id: "r2b", name: "Via Temple Street", originId: "p2", shelterId: "s2", distanceKm: 2.3, walkMinutes: null, incidentIds: [], features: F(null, null, null, null, null), path: [[13.038, 80.232], [13.033, 80.236], [13.03, 80.248]], lastUpdated: ago(2 * DAY), source: "simulated" },
  { id: "r2c", name: "Market to Sevashram via main road", originId: "p2", shelterId: "s1", distanceKm: 3.6, walkMinutes: 48, incidentIds: [], features: F(false, false, false, false, true), path: [[13.038, 80.232], [13.05, 80.242], [13.068, 80.245]], lastUpdated: ago(0.3 * DAY), source: "simulated" },
  // Scenario 3: Old Mill Colony -> Temple Mandapam (wheelchair-incompatible)
  { id: "r3a", name: "Footbridge shortcut", originId: "p3", shelterId: "s3", distanceKm: 0.9, walkMinutes: 12, incidentIds: ["i3"], features: F(true, false, false, false, null), path: [[13.052, 80.262], [13.055, 80.255], [13.058, 80.275]], lastUpdated: ago(2.5 * DAY), source: "simulated" },
  { id: "r3b", name: "Hill Road", originId: "p3", shelterId: "s3", distanceKm: 1.6, walkMinutes: 22, incidentIds: [], features: F(true, null, true, false, null), path: [[13.052, 80.262], [13.056, 80.27], [13.058, 80.275]], lastUpdated: ago(1 * DAY), source: "simulated" },
  { id: "r3c", name: "Old Mill to Sevashram via ring road", originId: "p3", shelterId: "s1", distanceKm: 3.2, walkMinutes: 42, incidentIds: [], features: F(false, false, false, false, null), path: [[13.052, 80.262], [13.062, 80.255], [13.068, 80.245]], lastUpdated: ago(0.4 * DAY), source: "simulated" },
];

export const sampleProfiles: AccessibilityProfile[] = [
  { name: "Wheelchair user (sample)", needs: ["wheelchair", "assistance"], language: "en", largeText: false, highContrast: false, reduceMotion: false, voiceGuidance: false, emergencyContactName: "", emergencyContactPhone: "" },
  { name: "Older adult (sample)", needs: ["limited_mobility"], language: "hi", largeText: true, highContrast: false, reduceMotion: true, voiceGuidance: true, emergencyContactName: "", emergencyContactPhone: "" },
  { name: "Low vision (sample)", needs: ["low_vision"], language: "en", largeText: true, highContrast: true, reduceMotion: false, voiceGuidance: true, emergencyContactName: "", emergencyContactPhone: "" },
];

export const defaultProfile: AccessibilityProfile = {
  name: "", needs: ["general"], language: "en", largeText: false, highContrast: false, reduceMotion: false,
  voiceGuidance: false, emergencyContactName: "", emergencyContactPhone: "",
};

export const alerts: AlertItem[] = [
  { id: "a1", type: "road_blockage", title: "Lake View Road underpass blocked", message: "Simulated: underpass marked blocked. Routes through it are excluded.", location: "Neelpur East", createdAt: ago(0.1 * DAY), source: "Demo system", verification: "simulated", nextAction: "Plan a route avoiding this underpass.", read: false },
  { id: "a2", type: "shelter_update", title: "Sevashram Hall details verified", message: "Accessibility details re-checked in the demo record.", location: "Neelpur East", createdAt: ago(0.2 * DAY), source: "Demo system", verification: "simulated", nextAction: "View shelter details.", read: false },
  { id: "a3", type: "route_change", title: "Canal footpath condition changed", message: "Community report of rising water near the canal. Awaiting review.", location: "Neelpur West", createdAt: ago(0.05 * DAY), source: "Community report", verification: "community", nextAction: "Prefer the Water Tank ridge route.", read: false },
  { id: "a4", type: "report_review", title: "Your report is under review", message: "A demo administrator is reviewing a report you submitted.", createdAt: ago(0.3 * DAY), source: "Demo system", verification: "simulated", nextAction: "Check report history.", read: true },
  { id: "a5", type: "announcement", title: "Follow official instructions", message: "Always follow directions from local authorities and emergency services.", createdAt: ago(1 * DAY), source: "SURAKSHA PATH", verification: "simulated", nextAction: "Call 112 in an emergency.", read: false },
  { id: "a6", type: "shelter_update", title: "Temple Mandapam verification overdue", message: "Information is more than 7 days old. Treat as uncertain.", location: "Old Mill Colony", createdAt: ago(0.6 * DAY), source: "Demo system", verification: "simulated", nextAction: "Consider a verified shelter instead.", read: true },
];
