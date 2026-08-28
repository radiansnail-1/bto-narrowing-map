# Learnings

- **Official facts stay separate from visual context** — project, price, wait, and amenity records remain dated and source-linked; missing facts resolve to `unknown` instead of becoming invented matches. The geospatial backdrop must not silently change product data.
- **Ship processed geometry, not source extracts** — `scripts/build-map-assets.ts` converts URA and OSM inputs from ignored `work/geo-raw/` into the compact `public/map/` contract. Raw downloads are large, unstable publication inputs and do not belong in the repository.
- **Building height is a visual approximation unless tagged** — OSM `height` and `building:levels` win when present; other heights use deterministic bands. The UI and documentation must never describe the miniature as surveyed 3D data.
- **Flat map meshes require deliberate winding and normals** — triangles viewed from above need +Y winding and normals or Three.js back-face culling makes valid terrain appear missing.
- **Software WebGL needs a demand-rendered path** — headless Chromium and software renderers use snapped camera moves, no post-processing or shadows, and `frameloop="demand"`; this keeps interaction and E2E reliable without weakening the real-GPU experience.
- **The map communicates criteria, not a ranking** — every miss has equal visual weight, unanswered/unknown criteria are neutral, and selection improves inspectability without changing the match result.
- **Camera input needs one shared ownership path** — orbit, keyboard pan, wheel zoom, and scripted fly-to must update camera position and the OrbitControls target together. Wheel zoom is cursor-anchored and project selection derives its framing from the real 1 km scene radius plus HUD-safe insets.
- **Prefer honest area glyphs over false footprint matches** — amenity highlights use conservatively matched OSM polygons only when name, category, and location agree. Point-only or uncertain records remain explicit coordinate-area fallbacks instead of borrowing a nearby building.

**Last updated:** 2026-08-28
