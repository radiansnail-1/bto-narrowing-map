# Where To BTO — Plan

## Project Resume

**Project:** Where To BTO (formerly "BTO Narrowing Map" / "BTO Explorer")
**Path:** `/Users/brian/Documents/Codex/2026-08-27/files-mentioned-by-the-user-bto`
**Source of truth:** Project-local source and canonical handoff files, 2026-08-28
**Status:** Product/data pass complete and locally verified: rename, typography, five amenity groups, exact 23-point fit dimming, results grouping, typed right-panel view state, amenity media manifest, and HDB fact audit.
**Next action:** Check the live GitHub PR for this branch. If it is merged, continue the TODO refresh work; otherwise resume from its current checks or review state. Deployment is a separate, explicit action.
**Verification command:** Run `npm run lint && npm run test && npm run build`, restart the development server, then run `env -u CI npm run test:e2e`.
**Do-not-do:** No backend, CMS, state library, live routing, ranking engine, bus layer, or new UI dependency. Do not commit `work/geo-raw/`. Do not add a crest or imply government endorsement. Never infer dates, coordinates, classification, prices, or figures.
**Freshness rule:** If external notes conflict with project-local files, use the newer source and identify it. Published project facts must remain official, dated, and explicit about missing data ("Not published by HDB yet", never a generic "Unknown").

## Goal and approach

Help a first-time couple narrow the current and officially announced BTO set to a small, understandable shortlist using a cinematic Singapore map. All projects start bright; each confirmed miss on an answered criterion dims a project by exactly 23 percentage points; unknown and unanswered criteria stay neutral. Results are grouped, never ranked.

- Product logic lives in typed static data and pure functions (`lib/matching.ts`, `lib/results.ts`, `lib/amenity-groups.ts`, `lib/storage.ts`, `lib/panel-view.ts`).
- React owns interaction state (one typed right-panel view state); React Three Fiber owns the map scene.
- The browser loads checked-in processed map binaries and local optimised images; no runtime map API, font fetch, or image hotlinking.
- Desktop-first; no winner, hidden score, or composite ranking.

## Final implementation shape (approved 2026-08-28)

| Area | Decision | Where |
|---|---|---|
| Branding | Product and page metadata are "Where To BTO". The pseudo-government strip and "Prototype — not an official Government service" text are removed; no crest. | `app/layout.tsx`, `components/BtoExplorer.tsx`, `app/globals.css` |
| Typography | Hanken Grotesk only (400/500/600/700) via `next/font/local` from OFL files in `app/fonts/`. Inter and DM Mono removed everywhere, including map labels and HUD. | `app/fonts.ts`, `app/globals.css`, `components/map-scene.css` |
| Palette | BTO housing is the sole red/warm family. Five amenity groups share one accessible palette (MRT blue, Food & shopping yellow, Healthcare teal, Schools indigo, Parks & recreation green) applied through `--group-*` CSS variables from `amenityGroupStyle()`. Active rows tinted; inactive neutral. | `lib/amenity-groups.ts` |
| Amenity groups | Seven official types collapse into five user-facing groups; the specific type is preserved in data and detail UI. A chosen group passes when any record of that group is inside the 1 km screen. Max 3 groups per answer. | `lib/amenity-groups.ts`, `lib/matching.ts`, `data/amenities.ts` |
| Storage | `where-to-bto:v2` with validation; legacy `bto-narrowing-map:v1` (individual types) is read once, migrated, and removed. Unknown amenity values are dropped; other invalid fields reset answers to defaults. | `lib/storage.ts` |
| Fit opacity | `projectOpacity(match) = 1 − 0.23 × missCount` → 100/77/54/31/8 %. Selection never resets it; selection is a ring + emissive lift + 1 km context. | `lib/matching.ts`, `components/MapScene.tsx` |
| Right panel | One typed view state: `questions \| results \| project \| amenity`, React state only. Finish → results; Edit answers → questions; result/map/tray click → project (returnTo remembered); amenity click from any view → full amenity detail with Back to the exact prior view; selected BTO keeps map focus and 1 km boundary. The floating amenity popover is gone. | `lib/panel-view.ts`, `components/BtoExplorer.tsx`, `components/panel/*` |
| Results grouping | fits (every answered criterion pass) / awaiting (no miss, ≥1 unknown) / trade-offs (≥1 miss). Snapshot order inside groups. | `lib/results.ts`, `components/panel/ResultsView.tsx` |
| Media | Separate typed manifest `data/amenity-media.json` joined by amenity ID. Each amenity has either a verified local WebP record (≤1600 px, with full provenance) or an explicit research blocker and polished no-photo state. Built by `scripts/build-amenity-media.ts` from curated `work/amenity-media/picks.json`. Rendered with `next/image` and a stable aspect-ratio frame. | `lib/amenity-media.ts`, `public/amenities/` |
| Facts | Snapshot audited against HDB on 2026-08-28 (`auditLog`, `lastAuditDate`). Added published Lakeview/Shunfu launch window and flat types, a Shunfu record, and the November 2026 HFE deadline note. Unpublished values remain `null` and render as "Not published by HDB yet". | `data/official-data-snapshot.json`, `components/panel/format.ts` |

### State diagram (right panel)

```
questions ──Finish──▶ results ──Edit answers──▶ questions
    │                    │
    │ select project     │ select project / click result
    ▼                    ▼
project(returnTo: questions | results) ──Back──▶ returnTo
    │
    │ click amenity (from questions, results, or project)
    ▼
amenity(returnTo: previous non-amenity view) ──Back──▶ returnTo
```

`selectedProjectId` is independent of the view: opening an amenity never changes it, so the map focus and 1 km boundary persist. Dropping a custom pin clears the selection and returns to questions.

### Data / media boundaries

- `data/official-data-snapshot.json` — official facts only (HDB, OneMap, data.gov.sg). Dated, source-linked, nulls for unpublished values.
- `data/amenity-media.json` — curated visual context only; never feeds matching. Every record carries full provenance.
- `public/map/` — processed geometry; `work/geo-raw/` inputs are ignored.
- `public/amenities/` — optimised WebP derivatives only; source pages are recorded, originals are not shipped.

### Explicit non-goals

Backend/CMS/auth, state library, live routing or transit times, ranking engine or composite score, bus layer, mobile layout, historical catalogue, financial or eligibility advice, new UI dependencies, hotlinked or unlicensed images.

### Failure modes and handling

| Failure | Behaviour |
|---|---|
| Stored answers malformed | Field-level validation; answers reset to defaults, other fields kept. |
| Legacy stored amenity types | Migrated to groups, de-duplicated, capped at 3. |
| Selected project disappears under a project/amenity view | Controller falls back to the underlying flow view. |
| Amenity without a media record | Polished "No licensed photo yet" panel in the group tint. |
| Unpublished HDB fact | `null` → "Not published by HDB yet"; criteria show "Awaiting data"; results bucket "Could fit — awaiting published data". |
| Project without coordinate | Tray/results still list it; map shows "Location unavailable · no 1 km context". |
| Software WebGL | Lite path (`?lite=1` or SwiftShader detection): demand rendering, no post-processing. |

### Test plan

- Unit (Vitest): exact 23-point sequence; group matching (hawker or shopping satisfies Food & shopping) and storage migration; strict results grouping; unknown handling; media manifest validation (all 53 amenities covered by 32 verified image records plus 21 explicit blockers; every shipped WebP exists, is ≤1600 px, and has complete provenance); existing camera, data, and map-asset suites.
- Browser (Playwright, lite path): final question → Finish → results; Edit answers; result → project details; amenity → full right detail with image and credit; Back restores prior project view; 1 km context preserved; branding; computed typography is Hanken Grotesk only; legacy storage migration.
- Visual QA (headed Chromium, 1600×1000): initial, results, project, representative amenity states; contrast; no panel overflow.

## Completion scoreboard

| Item | Status |
|---|---|
| 1. Rename to Where To BTO | Done |
| 2. Remove pseudo-government strip | Done |
| 3. Hanken Grotesk only via next/font/local | Done |
| 4. BTO sole red family; amenity palette without red/orange/pink | Done |
| 5. Five amenity groups + shared palette + storage migration | Done |
| 6. Exact 23-point fit opacity; selection keeps fit | Done |
| 7. Finish → grouped results; Edit answers; result → project | Done |
| 8. Amenity full detail view; Back; 1 km preserved; popup removed | Done |
| 9. Amenity media manifest | Done: 32 licensed local images; 21 exact documented blockers after Commons/Openverse/geosearch audit; no incorrect or unlicensed substitutions |
| 10. HDB fact audit | Done 2026-08-28 (Nov 2026 facts confirmed unpublished) |
| 11. Static app, no new dependency | Done |
| 12. plan.md / DESIGN.md updated | Done |
| Tests + QA + dev server | Done: lint, 46 unit tests, production build, 4 Playwright flows, and 1600×1000 visual QA pass; dev server on localhost:3000 |

## TODO

- [ ] Refresh the official BTO snapshot when HDB publishes the November 2026 project details (names, prices, classification, coordinates, waits).
- [ ] Re-measure the full visual path on an older integrated-GPU laptop before calling it broadly production-ready.
- [ ] Consider adding Bukit Panjang and Punggol LRT geometry when defensible source relations are available.

### Parking Lot

- Put a compressing CDN or proxy in front of `public/map/buildings.bin` if the prototype is deployed publicly.
- Review long BTO labels around the central-area cluster if the project catalogue grows.
- AVIF variants alongside WebP if image weight becomes a concern.

## Review Status

| Review | Last run | Status | Findings | Stale? |
|---|---|---|---|---|
| Engineering plan | 2026-08-28 | Cleared | Approved product/engineering plan (12 items) locked before implementation. | No |
| Visual acceptance | 2026-08-28 | Cleared | Initial, results, project, and licensed-image amenity states reviewed at 1600×1000; corrupt water-mask rectangle removed. | No |

**Context pointers:** `README.md`, `DESIGN.md`, `components/BtoExplorer.tsx`, `components/panel/`, `lib/panel-view.ts`, `lib/amenity-groups.ts`, `lib/results.ts`, `lib/storage.ts`, `lib/amenity-media.ts`, `data/official-data-snapshot.json`, `data/amenity-media.json`.
**How to resume:** Read this file and `learnings.md`, then run the verification command.
**Last updated:** 2026-08-28
