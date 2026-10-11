# SURAKSHA PATH — Accessible Evacuation. Safer Tomorrow.

Prototype for **My Bharat Hack for Social Cause** (Disaster Resilience, Accessibility, Community Safety, GIS).

## Problem
Standard navigation and emergency information rarely account for individual accessibility needs — a route or shelter that works for one person may be unusable for a wheelchair user, an older adult or someone with low vision.

## Solution
An interactive web app that combines an emergency map, hazard reports, accessibility-aware route comparison, a shelter directory with verification status, and community reporting with an admin review flow.

## Features
- Landing page, overview dashboard (simulated metrics + chart)
- Leaflet/OpenStreetMap map with filters, layers, search, origin selection, tile-error fallback
- Route planner (`/safe-route`) with multi-select needs and transparent rule-based scoring (`src/utils/routeScoring.ts`, tested)
- Shelter directory + detail pages with filters and verification labels
- Report form (validation, optional photo), report history, demo-admin review with status log
- Alerts with read/unread and filters; accessibility profile (large text, high contrast, reduced motion, partial Hindi)
- Settings with demo data reset

## Setup
```
bun install
bun run dev
bunx vitest run
```
Then open the local dev server URL printed in your terminal to view the app.


## Limitations
- All data is fictional and stored in browser localStorage only (demo mode, no secure sign-in).
- Routes are predefined simulated scenarios, not a live routing engine.
- Hindi translation covers navigation and key safety messages only.
- Does not replace emergency services or official alerts. In an emergency call 112.

## Structure
`src/types` models · `src/data` sample data · `src/services` demo store + i18n · `src/utils` scoring, filtering · `src/components` UI + map · `src/routes` pages.
