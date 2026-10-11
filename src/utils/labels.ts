import type { AccessNeed, IncidentCategory, ReportStatus, VerificationStatus } from "@/types";

export const categoryLabel: Record<IncidentCategory, string> = {
  blocked_road: "Blocked road",
  flooded_path: "Flooded path",
  inaccessible_route: "Inaccessible route",
  shelter_accessibility: "Shelter accessibility issue",
  shelter_capacity: "Shelter capacity change",
  map_error: "Missing / incorrect map info",
  other: "Other safety concern",
};

export const statusLabel: Record<ReportStatus, string> = {
  pending: "Pending review",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
  resolved: "Resolved",
};

export const verificationLabel: Record<VerificationStatus, string> = {
  verified: "Recently verified",
  community: "Reported by community",
  overdue: "Verification overdue",
  unavailable: "Information unavailable",
};

export const needLabel: Record<AccessNeed, string> = {
  wheelchair: "Wheelchair user",
  limited_mobility: "Limited mobility / elderly",
  low_vision: "Low vision",
  general: "General walking",
  assistance: "Requires assistance",
};
