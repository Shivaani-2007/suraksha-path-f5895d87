export type TriState = "yes" | "no" | "unknown";
export type VerificationStatus = "verified" | "community" | "overdue" | "unavailable";
export type ReportStatus = "pending" | "under_review" | "verified" | "rejected" | "resolved";
export type Severity = "low" | "medium" | "high";
export type DataSource = "simulated" | "user_report" | "verified";

export type IncidentCategory =
  | "blocked_road"
  | "flooded_path"
  | "inaccessible_route"
  | "shelter_accessibility"
  | "shelter_capacity"
  | "map_error"
  | "other";

export type MarkerKind = "hazard" | "blocked" | "safe";

export interface Shelter {
  id: string;
  name: string;
  area: string;
  address: string;
  type: string;
  lat: number;
  lng: number;
  wheelchairEntrance: TriState;
  accessibleToilets: TriState;
  medical: TriState;
  water: TriState;
  food: TriState;
  capacity?: number;
  occupancy?: number;
  lastVerified: string | null;
  verification: VerificationStatus;
  source: string;
  notes?: string;
}

export interface StatusChange {
  status: ReportStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  kind: MarkerKind;
  title: string;
  area: string;
  lat: number;
  lng: number;
  description: string;
  severity: Severity;
  status: ReportStatus;
  reporterRole: string;
  createdAt: string;
  source: DataSource;
  image?: string;
  shelterId?: string;
  history: StatusChange[];
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteFeatures {
  /** null = no information available */
  stairs: boolean | null;
  inaccessibleCrossing: boolean | null;
  steepSlope: boolean | null;
  unlitSection: boolean | null;
  tactileGuidance: boolean | null;
}

export interface RouteOption {
  id: string;
  name: string;
  originId: string;
  shelterId: string;
  distanceKm: number;
  /** Only present when routing data supports it */
  walkMinutes: number | null;
  incidentIds: string[];
  features: RouteFeatures;
  path: [number, number][];
  lastUpdated: string;
  source: DataSource;
}

export type AccessNeed = "wheelchair" | "limited_mobility" | "low_vision" | "general" | "assistance";

export interface AccessibilityProfile {
  name: string;
  needs: AccessNeed[];
  language: "en" | "hi";
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceGuidance: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export type AlertType = "road_blockage" | "shelter_update" | "route_change" | "report_review" | "announcement";

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  location?: string;
  createdAt: string;
  source: string;
  verification: "simulated" | "community" | "verified";
  nextAction: string;
  read: boolean;
}

export interface AppSettings {
  notifyRoad: boolean;
  notifyShelter: boolean;
  notifyReports: boolean;
  compactSidebar: boolean;
}
