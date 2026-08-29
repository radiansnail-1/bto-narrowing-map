# Where To BTO — Plan

## Project Resume

**Project:** Where To BTO
**Path:** `/Users/brian/Documents/RMS/Websites/where-to-bto`
**Source of truth:** Project-local source and canonical handoff files, 2026-08-29
**Status:** The crawlable content, shared public-service header, and shortlist-oriented user journey are implemented and locally verified.
**Next action:** Check the live GitHub PR. If it is merged, continue with the TODOs below; otherwise resume the PR from its current checks or review state. Deployment and Search Console submission remain separate actions.
**Verification command:** `npm run lint && npm run test && npm run build && env -u CI npm run test:e2e`
**Do-not-do:** No backend, CMS, state library, live routing, ranking engine, bus layer, mobile map, or new UI dependency. Do not commit `work/geo-raw/`. Do not add a crest or imply government endorsement. Never invent dates, coordinates, classification, prices, waits, or other unpublished facts.
**Freshness rule:** Prefer the newest dated project-local source over external notes, and keep unpublished HDB facts explicit as “Not published by HDB yet”.

## Goal and approach

Help a first-time couple turn the current and officially announced BTO set into a small, understandable shortlist using a cinematic Singapore map.

- All projects start bright; every confirmed miss dims one project by exactly 23 percentage points. Unknown and unanswered criteria stay neutral.
- Results are grouped into fits, awaiting published data, and trade-offs. They are never ranked.
- Users can filter launch stages, understand every criterion result, save up to four projects, and compare them side by side.
- Static typed data and pure functions own matching; React owns the validated/persisted panel flow; React Three Fiber owns the map.
- Official facts, visual map geometry, and licensed amenity media remain separate data contracts.

## Implemented product shape

- Map is the homepage; 22 source-linked project pages, project directory, FAQ, methodology, `/ai-info`, and six substantive guides are statically generated.
- One shared 64 px `SiteHeader` keeps geometry stable between map and content pages; Hanken Grotesk is the only interface font.
- BTO housing is the sole red family. Five amenity groups use distinct blue, yellow, teal, indigo, and green palettes.
- Clicking a mapped project flies directly to its full approximate 1 km context. Arrow-key pan, orbit, and bounded wheel zoom share one camera-control path.
- The right panel has a typed `questions | results | project | amenity` flow with exact Back behavior, scroll resets, and local persistence.
- Results explain pass, miss, awaiting-data, and unused states; filters stay consistent across map, tray, counts, and results.
- The shortlist is validated and capped at four; full-cap controls explain why another project cannot be added.
- Amenities replace the right panel with full details, licensed imagery where available, provenance, and a return to the exact prior project/flow.
- Metadata, canonicals, JSON-LD, sitemap, robots, manifest, and icon derive from the same typed records. Production identity comes from `NEXT_PUBLIC_SITE_URL` or Vercel’s production hostname.

## Verification

- `git diff --check` — passed.
- `npm run lint` — passed.
- `npm run test` — 9 files / 58 tests passed.
- `npm run build` — passed; 41 routes generated.
- `env -u CI npm run test:e2e` — 8/8 Playwright flows passed.
- Browser QA — 834×734 map and 390×844 content pages checked; clean fresh-tab console.
- Expected warning only: Next.js infers `/Users/brian` as the workspace root because multiple lockfiles exist.

## TODO

- [ ] Refresh the official BTO snapshot when HDB publishes the November 2026 project details (names, prices, classification, coordinates, waits).
- [ ] Re-measure the full visual path on an older integrated-GPU laptop before calling it broadly production-ready.
- [ ] Consider adding Bukit Panjang and Punggol LRT geometry when defensible source relations are available.
- [ ] After the canonical production domain is confirmed, set `NEXT_PUBLIC_SITE_URL`, verify the deployment in Google Search Console, and submit `/sitemap.xml`.
- [ ] Establish a dated quarterly prompt/citation audit only after enough real search or AI-referral traffic exists to define useful questions.

### Parking Lot

- Put a compressing CDN or proxy in front of `public/map/buildings.bin` if the site is deployed publicly.
- Review long BTO labels around the central-area cluster if the project catalogue grows.
- Consider AVIF variants alongside WebP if image weight becomes a concern.

## Review Status

| Review | Last run | Status | Findings | Stale? |
|---|---|---|---|---|
| Engineering plan | 2026-08-28 | Cleared | Approved product/engineering scope implemented. | No |
| Visual acceptance | 2026-08-29 | Cleared | Map, results, comparison, content header, and guide surfaces reviewed. | No |
| User-journey verification | 2026-08-29 | Cleared | Independent Luna/xhigh audit findings corrected; desktop flows pass. | No |

**Review verdict:** CLEARED FOR PR
**Blockers / open questions:** None for PR publication. Deployment and a canonical production domain are still separate decisions.
**Context pointers:** `README.md`, `DESIGN.md`, `components/BtoExplorer.tsx`, `components/panel/`, `lib/results.ts`, `lib/storage.ts`, `data/official-data-snapshot.json`, `data/amenity-media.json`.
**How to resume:** Read this file and `learnings.md`, then inspect the live PR state with `gh pr status`.
**Out of scope:** Backend/CMS/auth, live travel times, composite ranking, bus stops, mobile map, deployment, Search Console submission.
**Last updated:** 2026-08-29
