<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## SURAKSHA PATH decisions
- All app data flows through the demo store in src/services/store.tsx (localStorage) — single source so map, directory, planner and dashboard stay consistent; swap actions for a backend later.
- Route scoring rules live only in src/utils/routeScoring.ts with tests — keeps safety logic transparent and testable.
- Leaflet is only imported from src/components/map/LeafletMap.tsx, loaded lazily behind ClientOnly — Leaflet touches window at import.
- Dashboard pages live under the pathless _dash layout; never name a route file segment "route" (reserved by the router generator).
