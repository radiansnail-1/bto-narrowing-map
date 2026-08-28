# BTO Explorer — 3D City Visual Rebuild

## Verdict

The current app has the right product structure, but it does not yet deliver the visual premise of the reference video. It feels like a conventional dashboard layered over a generic 3D backdrop. The target is a recognisable, cinematic miniature of Singapore in which the city itself carries the information.

This rebuild is visual and spatial. The existing questionnaire, project matching rules, official BTO snapshot, 1 km amenity boundary, and no-bus decision remain intact.

## The gap

| Current build | Target experience |
| --- | --- |
| Repeated grid of procedural boxes | Irregular, recognisable city grain from real building footprints |
| Approximate island silhouette | Correct coastline and neighbourhood placement |
| Similar building heights and forms | Varied massing, towers, podiums, HDB clusters, and selected landmarks |
| A few thin glowing lines | Layered road and MRT ribbons with hierarchy and restrained bloom |
| Panels dominate the first impression | Full-bleed city dominates; controls feel like a compact HUD |
| Selection changes opacity | Selection becomes a cinematic neighbourhood reveal |

## Art direction

The scene should feel like a dark architectural model at night: charcoal land, deep blue-black water, cool grey buildings, warm road light, cyan MRT light, and coral-red BTO sites. Geometry and light create the detail; photoreal textures do not.

The initial frame must communicate three things before the user touches anything:

1. This is recognisably Singapore.
2. These red clusters are the BTO choices.
3. The glowing city network explains how the places relate.

The reference-quality bar is not “more polygons.” It is irregular real-world layout, strong silhouette, depth, lighting hierarchy, and purposeful camera motion.

## Rebuild plan

### Phase 1 — Prove the look in one district

Build a visual spike for one dense, recognisable area before attempting the whole island. Use central Singapore because Marina Bay, the Flyer, MBS, the CBD skyline, coastline, roads, and MRT lines make visual accuracy easy to judge.

- Import actual building-footprint polygons.
- Extrude them into deterministic height bands using footprint size and building category where available.
- Add the correct coastline, main roads, and MRT geometry.
- Create simplified landmark silhouettes for MBS, Singapore Flyer, Merlion, and one or two CBD towers.
- Establish the final camera angle, fog, shadows, ambient occlusion, selective bloom, and color palette.
- Validate at the real desktop viewport before proceeding.

Exit condition: a screenshot without UI should immediately read as a miniature 3D Singapore, not a field of random boxes.

### Phase 2 — Build the geospatial asset pipeline

Keep visual map data separate from current BTO facts. Add an offline preprocessing script that converts source GeoJSON into small, browser-ready scene tiles.

- Project geographic coordinates into the existing scene coordinate system.
- Crop, simplify, and quantize polygons.
- Derive stable approximate heights when authoritative height data is unavailable.
- Merge geometry by tile and material to keep draw calls low.
- Store generated assets under `public/map/`; do not fetch a 50 MB source file at runtime.
- Preserve source name, snapshot date, and license in a small manifest.

The URA Master Plan 2019 building-footprint layer is suitable for visual context, but it is not a source of current BTO facts and does not provide reliable building heights. New BTO sites and missing landmarks stay curated in the app data.

### Phase 3 — Expand to the island-wide scene

- Add coastline, water, and the full tiled building layer.
- Render expressways, arterial roads, and MRT lines as distinct luminous layers.
- Use level-of-detail and frustum culling outside the camera focus.
- Hand-tune only recognisable landmarks and unusually large malls; ordinary HDB blocks can remain approximate extrusions.
- Replace the procedural context grid and invented land shape completely.

### Phase 4 — Integrate BTO meaning into the city

- Give each mapped BTO project a distinct coral-red cluster that sits within the real surrounding grain.
- On selection, fly into the neighbourhood and reveal the true approximate 1 km circle on the ground.
- Raise or glow relevant amenities inside the circle; dim unrelated layers without erasing the skyline.
- Keep unavailable-coordinate projects accessible in the tray with the existing honest unavailable state.
- Keep workplace matching explicitly straight-line and separate from visual transit lines.

### Phase 5 — Make the camera and lighting cinematic

- Use a low orthographic three-quarter overview with a deliberate Singapore silhouette.
- Add a short, restrained opening settle rather than a long intro animation.
- Use smooth project fly-to and overview-return paths with damping.
- Add subtle parallax during pointer movement, stopping during direct orbit interaction.
- Apply bloom only to emissive infrastructure, BTO highlights, and selected amenities.
- Use atmospheric fog, contact shadows, and ambient occlusion to separate dense geometry.
- Respect reduced-motion preferences.

### Phase 6 — Reduce the interface into a HUD

Keep the information architecture, but make the city visually dominant.

- Narrow and lighten the left filter panel.
- Keep the top-right questionnaire compact and progressively dim answered criteria.
- Collapse the bottom project tray until the user hovers, scrolls, or opens it.
- Replace large opaque panel surfaces with translucent, edge-lit cards.
- Preserve readable labels, keyboard focus, contrast, and the ability to use the tool without orbiting the map.

### Phase 7 — Visual QA and performance hardening

Test the overview, a mapped project, an unmapped project, all filters, custom workplace pinning, and reduced motion at the desktop target size.

Quality gates:

- The city is recognisable before labels appear.
- No obvious repeated-grid pattern remains.
- Selected BTO, 1 km area, amenities, roads, and MRT each have a clear visual hierarchy.
- Project fly-to never clips through geometry or leaves the selected site obscured.
- The main scene holds a smooth interactive frame rate on a normal laptop.
- Raw source GeoJSON is never loaded by the browser.
- Existing unit, build, and end-to-end checks remain green.

## Performance budget

- Preprocess and tile all large geospatial sources.
- Merge static building geometry by tile and material.
- Cap device pixel ratio on high-density displays.
- Use one selective post-processing path, not per-object effects.
- Target fewer than roughly 1,000 visible draw calls in overview and materially fewer when focused.
- Establish the final budget after measuring the one-district spike; do not guess the whole-island asset size first.

## What not to do

- Do not keep the random building grid and simply add more effects.
- Do not hand-model all of Singapore.
- Do not make every road, amenity, and building glow equally.
- Do not add satellite imagery or photoreal textures; they fight the miniature-model style.
- Do not load live mapping APIs for this visual layer when a static processed snapshot will do.
- Do not change matching logic while rebuilding the scene.

## Recommended delivery order

1. Central Singapore visual spike and screenshot review.
2. Geospatial preprocessing pipeline.
3. Island-wide geometry and infrastructure.
4. BTO selection states and camera choreography.
5. HUD reduction and interaction polish.
6. Visual QA, accessibility, and performance pass.

The first review checkpoint is intentionally early: approve or reject the central-Singapore frame before investing in island-wide conversion.
