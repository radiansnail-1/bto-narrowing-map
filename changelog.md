# Changelog

## 2026-09-07 — CI failure correction

- Reproduced the desktop pan, idle-rendering and shortlist timeout failures under concurrent software rendering; separately proved that a key tap released before a frame was lost.
- Retained a discrete pan step for short arrow taps and changed visual focus fading to elapsed time rather than a capped frame delta.
- Made the idle regression wait for an empty frame queue, added a between-frame key-tap regression, and ran browser checks sequentially against the production test build with failure trace retention.
- Verified 72 unit tests, lint and the production test build; all 14 browser checks passed together under forced SwiftShader. PR #7's final required CI and review remain GitHub-owned merge gates.

## 2026-09-07 — Mobile, DIA, transit and planning content

- Fixed the desktop minimum-width layout on phones while keeping the 3D map automatically loaded; added intuitive touch pan/pinch/rotation, reset and pin cancellation, responsive focus and bounded native pan.
- Made full-quality rendering sleep at idle, removed unused water loading and redundant wrappers/tests, and retained existing geometry and interaction coverage.
- Added the illustrative DIA payment calculator, three Reddit-informed guides backed by official sources, free external transit directions, and updated navigation, FAQ, metadata and sitemap.
- Confirmed the canonical public domain and inspected Search Console aggregates/public crawlability; individual exclusion tables remained unavailable. Deployment and recrawl remain separate.
- Verified before handoff: 72 unit tests, 13 browser checks together, lint, production build with 45 generated pages, production smoke and mobile screenshots. Device emulation does not establish physical Safari coverage.

## 2026-08-29 — User journey and shortlist

- Added clearer optional questions, published-price/HFE guidance, clear-to-unanswered controls, chosen-answer summaries and explanations of each result criterion.
- Added launch-stage filters, zero-fit guidance, a validated shortlist capped at four, comparison, project-page add/remove actions and persisted result/project flow.
- Corrected consistency across map, tray, counts, results and selected context; preserved nested amenity return intent and keyboard-operable project labels.
- Added a substantive Start Here guide and contextual planning links.
- Verified at that checkpoint: lint, 58 unit tests, 41 generated routes, eight browser flows and visual/runtime QA.

## 2026-08-29 — Crawlable content and SEO

- Added 22 static source-linked project pages, a directory, six comparison guides, FAQ, methodology and canonical AI-information page.
- Added route metadata, canonicals, structured data, sitemap, robots, manifest and icon with navigation from the map.
- Shared the public-service header across map/content and removed generic decorative chrome; guides use a scannable editorial list.
- Kept dates and official sources visible; metadata then used deployment environment identity, superseded by the verified-domain decision on 7 September.
- Checked map/content geometry and responsive editorial states; subsequent checkpoints supersede the original verification totals.

## 2026-08-28 — Product and data

- Renamed the product Where To BTO, removed pseudo-government styling, self-hosted Hanken Grotesk, and reserved red for BTO housing.
- Grouped seven official amenity types into five presentation groups with safe stored-state migration and exact neutral/miss-opacity semantics.
- Replaced the dead Finish narrowing action with typed question/result/project/amenity navigation, full amenity panels and correct Back behavior.
- Added separate licensed media provenance and 32 local WebP photos; retained explicit no-photo states for unsupported records.
- Audited HDB facts: November details stayed unpublished except supported launch-window, flat-type and HFE information. Removed the corrupt water-mask overlay and completed the then-current verification pass.

## 2026-08-28 — Geographic map and navigation

- Added coordinated keyboard pan, orbit, cursor-centred wheel zoom and project fly-to framing of the full approximate 1 km context.
- Replaced amenity dots with conservative OSM footprints and explicit coordinate-area fallbacks.
- Replaced procedural scenery with processed URA/OSM geometry: 118,415 footprints, transport, coastline, greenery and orientation landmarks, with source/licence metadata.
- Added tiled binaries, deterministic regeneration, camera/map-asset coverage and a software-renderer lite path.
- Prepared README, CI, canonical handoff state and exclusions for raw geodata; Git history preserves intermediate verification totals.

## 2026-08-27 — Initial prototype

- Built the Next.js/TypeScript/React Three Fiber prototype with official project records, curated amenities, workplace anchors, four criteria, local persistence and no bus-stop layer.
- Kept the 1 km amenity context and equal-weight straight-line workplace screen explicit; missing official data remained neutral.

**Last updated:** 2026-09-07
