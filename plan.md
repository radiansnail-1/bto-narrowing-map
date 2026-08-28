# BTO Narrowing Map — Plan

## Project Resume

**Project:** BTO Narrowing Map
**Path:** `/Users/brian/Documents/Codex/2026-08-27/files-mentioned-by-the-user-bto`
**Source of truth:** Project-local source and canonical handoff files, 2026-08-28
**Status:** The desktop prototype, geodata rebuild, camera-control fixes, 1 km selection framing, and full-area amenity highlights are locally complete and verified; publication is being delivered through a GitHub PR. The live PR is authoritative for open/failed/merged state.
**Next action:** Run `gh pr list --head fix/map-camera-highlights --state all`, then inspect the returned PR with `gh pr view`; if merged, continue with product/data work, otherwise resume it from its live state.
**Verification command:** `npm run lint && npm run test && npm run build && npm run test:e2e`
**Do-not-do:** Do not add a backend, login, mobile layout, live routing, aggregate ranking, automated ingestion, or a bus-stop layer without a new product decision. Do not commit `work/geo-raw/`.
**Freshness rule:** If external notes conflict with project-local files, use the newer source and identify it. Published project facts must remain official, dated, and explicit about missing data.

## Goal and approach

Help a first-time couple narrow the current and officially announced BTO set to a small, understandable shortlist using a cinematic Singapore map. All projects start bright; each missed answered criterion dims a project equally, while unknown facts remain neutral.

- Product logic lives in typed static data and pure matching functions.
- React owns ordinary interaction state; React Three Fiber owns the map scene.
- The browser loads checked-in processed map binaries, never raw GeoJSON or a live map API.
- The project remains desktop-first and intentionally avoids a winner or hidden score.

## Milestones

- [x] Build the four-question narrowing flow, amenity layers, project selection, persistence, and tests.
- [x] Integrate the dated official project snapshot and remove the bus-stop layer.
- [x] Replace procedural blocks with a real-geography Singapore miniature and compact HUD.
- [x] Add public-repository documentation, source attribution, and CI.
- [x] Add arrow-key panning, cursor-centred bounded zoom, full 1 km project framing, and area-based amenity highlights.
- [ ] Treat the live GitHub PR as authority: complete it if still open; otherwise proceed from merged `main`.

## TODO

- [ ] Refresh the official BTO snapshot when HDB publishes new project facts.
- [ ] Re-measure the full visual path on an older integrated-GPU laptop before calling it broadly production-ready.
- [ ] Consider adding Bukit Panjang and Punggol LRT geometry when defensible source relations are available.

### Parking Lot

- Put a compressing CDN or proxy in front of `public/map/buildings.bin` if the prototype is deployed publicly.
- Review long BTO labels around the central-area cluster if the project catalogue grows.

## Review Status

| Review | Last run | Status | Findings | Stale? |
|---|---|---|---|---|
| Engineering plan | 2026-08-27 | Cleared | Scope, data rules, failure states, and verification were locked before implementation. | No |
| Visual acceptance | 2026-08-28 | Cleared with known gaps | Final overview and Tampines/Redhill focus frames were inspected; approximation and missing-LRT gaps remain documented. | No |

**Review verdict:** CLEARED for prototype publication.
**Blockers / open questions:** None for publication. This is not a live official service and has no deployment in scope.
**Repo state:** Delivery branch `fix/map-camera-highlights`, based on `be55c56` from `origin/main`; the canonical handoff and requested fixes belong to this delivery.
**Verification:** `npm run lint`, `npm run test` (24/24), `npm run build`, and `npm run test:e2e` (2/2) pass. Production visual inspection confirmed the complete 1 km boundary and full-place overlays.
**Context pointers:** `README.md`, `DESIGN.md`, `components/MapScene.tsx`, `lib/camera.ts`, `lib/matching.ts`, `public/map/manifest.json`, `public/map/places.json`, `data/official-data-snapshot.json`.
**How to resume:** Inspect the live PR, then read this file and `learnings.md`.
**Out of scope:** Backend/auth, mobile, live journey planning, bus stops, financial/eligibility advice, historical catalogue, detailed HDB architecture, and automatic ranking.
**Last updated:** 2026-08-28
