# Changelog

## 2026-08-28 (product/data pass)

- Renamed the product and metadata to "Where To BTO"; removed the pseudo-government identity strip and prototype disclaimer; no crest.
- Switched all typography to self-hosted Hanken Grotesk (OFL, `next/font/local`, weights 400–700); removed Inter and DM Mono, including map labels and HUD.
- Replaced seven amenity filters with five groups (MRT, Food & shopping, Healthcare, Schools, Parks & recreation) sharing one accessible palette; BTO housing is the only red family. Underlying official types are preserved; legacy stored selections migrate safely.
- Made fit opacity exact: 100/77/54/31/8 % for 0–4 confirmed misses; selection keeps fit opacity and is shown with a ring/emissive treatment.
- Fixed the dead "Finish narrowing" action with a typed right-panel view state (questions | results | project | amenity): grouped, unranked results, Edit answers, result → project, amenity → full detail with Back and preserved 1 km context; removed the floating amenity popover.
- Added a separate typed amenity media manifest and build pipeline (`npm run media:build`) with 32 local open-licence WebP assets, first-class credits, and explicit researched blockers for the 21 records without a defensible photo.
- Audited the snapshot against HDB (2026-08-28): confirmed November 2026 facts are unpublished, added the published Lakeview/Shunfu launch window and flat types, a Shunfu record, and the HFE deadline note; unpublished values render as "Not published by HDB yet".
- Completed the final 1600×1000 visual pass and removed a corrupt water-mask mesh that rendered as a rectangular overlay; lint, 46 unit tests, production build, and four Playwright flows pass.

## 2026-08-28

- Added smooth arrow-key ground panning and one coordinated camera path for mouse orbit, cursor-centred bounded wheel zoom, and project fly-to transitions.
- Changed project selection to frame the complete approximate 1 km context inside HUD-safe viewport bounds.
- Replaced amenity dots with complete place-area overlays: 36 conservatively matched OSM footprints and 16 coordinate-area fallbacks for all 52 mapped amenity records.
- Added camera math, map-asset integrity, and browser-flow coverage. Current verification: lint passed, 24/24 tests passed, production build passed, and 2/2 Playwright tests passed.
- Replaced the procedural city backdrop with processed URA/OSM geometry: 118,415 building footprints, coastline and planning areas, major roads, MRT/LRT, water, greenery, runways, stations, and recognizable landmarks.
- Added tiled binary map assets, a deterministic regeneration pipeline, source/licence metadata, zoom-aware infrastructure ribbons, focused 1 km project context, camera animation, post-processing, and a software-renderer lite path.
- Compacted the interface into a desktop HUD with layer controls, criterion chips, a collapsible project tray, project details, and preserved semantic controls.
- Added map-asset integrity coverage and retained the guided-flow/storage E2E coverage.
- Prepared the project for public GitHub publication with a README, CI workflow, canonical resume files, and exclusions for raw geodata and local artifacts.

## 2026-08-27

- Built the initial Next.js/TypeScript/React Three Fiber prototype with 21 official project records, 53 curated amenities, five work hubs, four transparent narrowing criteria, local persistence, project focus, and no bus-stop layer.
- Locked the 1 km amenity context and equal-weight straight-line workplace screen; incomplete official data remains neutral rather than fabricated.

**Last updated:** 2026-08-28
