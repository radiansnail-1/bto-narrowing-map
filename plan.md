# Where To BTO — Plan

**Goal:** Help couples build an explainable BTO shortlist with an accessible 3D map and source-backed planning tools.
**Status:** The September implementation is merged and live at `8b1de46` (PR #7). The 17 October SEO run adds a sourced November HFE-readiness guide in `codex/seo-bto-news-20261017`; [PR #8](https://github.com/radiansnail-1/bto-narrowing-map/pull/8) is proceeding through final-head CI for automatic merge and production verification under Brian's 18 October authorization.
**Next action:** Merge PR #8 automatically once all required checks pass on its final head, using the existing admin allowance for a review-only gate, then verify the Ready Vercel production deployment and canonical guide. The guide's publication and source-review dates are now 18 October after official-source rechecks.

## Current SEO run — 17 October 2026

- Isolated checkout: `/Users/brian/Documents/Codex/2026-10-17/ok-i-future-this-one-needs/bto-seo-20261017`, based on current `origin/main` (`8b1de46`). The owner's checkout remains untouched.
- New guide: `/guides/november-2026-bto-hfe-checklist`. It distinguishes HFE preparation, issued-letter readiness, August income-ceiling transition and February 2027 ballot changes; it does not promise an approval or application slot.
- Reuses the practical-guide route, adds per-guide dates, directory/sitemap coverage and a contextual link. The three older practical guides keep 7 September dates; the official project audit remains 28 August.
- Validation: lint, 72 unit tests, production test build and all 15 sequential browser checks passed. An ordinary production build without the map test flag also passed. Phone (390px) and desktop (1440px) visual review passed; physical Safari remains untested.
- Search Console property: `sc-domain:wheretobto.com`. Complete 9–15 October versus 2–8 October: 9/4 clicks, 324/290 impressions, 2.8%/1.4% CTR. This small sample predates the new article.
- Indexing report dated 12 October: 20 indexed, 19 discovered/unindexed, 3 redirects. Sitemap read 14 October: Success, 38 discovered pages. The inspected upcoming Bedok URL is discovered/unindexed with no crawl; no sitemap or indexing request was submitted.
- News baseline and dated source links: `artifacts/seo-log.md`. The HDB portal still presents November as upcoming, with no dated sales window; no new project details were fabricated or added to the map.
- Release policy updated 18 October: Brian expressly authorized automatic merging without a separate human-review wait. Required checks must pass on the exact final head and the PR must have no conflicts. If review is the only remaining gate, use the repository’s existing admin allowance; preserve repository-wide protection settings and never override failing/pending CI. Previously verified production/rollback deployment: `dpl_Dcvq5jHgs2vLj35F2p4Cp5hjfsFp`, `https://where-to-ffhvex57l-radiansnail-1s-projects.vercel.app`.

## September implementation evidence (historical)

- **Path:** `/Users/brian/Documents/ChatGPT/BTO/bto-narrowing-map`
- **Checkpoint branch:** `codex/handoff-mobile-dia-seo`
- **Base:** `main`; implementation began from `b2af53c`.
- **Resume:** `gh pr status`
- **Evidence already produced:** `npm run test` — 72 tests in 11 files; browser suite — 14 passed together against the production test build with forced SwiftShader (`--use-angle=swiftshader --enable-unsafe-swiftshader`, one worker); `npm run lint` — passed; `NEXT_PUBLIC_MAP_TEST_API=1 npm run build` — passed with TypeScript validation and 45 generated static pages; `git diff --check` — passed.
- **Browser evidence:** Chromium mobile emulation at 320/390px and 844px landscape/1023px; automatic map loading, pan/pinch/rotate/reset, pin placement/cancellation, selected-project resize, full questionnaire, DIA validation and three new articles. Desktop flows and demand-rendering regression passed.
- **Limits:** Physical iPhone/Safari, older integrated GPUs and deployed behavior of this patch remain unverified. Local production smoke had no application runtime exceptions; Vercel analytics returns 404 outside Vercel hosting.
- **CI correction:** Queued short arrow taps survive between frames; focus fades use actual elapsed time; idle checks inspect the queued-frame count. CI runs sequential browser checks against the built app and uploads failure traces. The original pan/idle/shortlist failures were reproduced with concurrent software rendering; the corrected full software-rendered suite passed.
- **Mobile test follow-up:** The Linux trace confirmed gestures passed but the combined gesture/resize test exhausted its 90-second budget. Resize now has its own test; one final reset verifies zoom, target and orbit after all gestures. Both revised checks passed locally with forced SwiftShader (32 seconds total); the suite now contains 15 browser checks.
- **External blocker:** Search Console's detailed exclusion tables stalled. The aggregate report is recorded, but individual excluded URLs and submitted-sitemap status remain unverified.

## Product state

- Homepage always loads the 3D map, including mobile. Responsive controls and questionnaire stack through 1023px; map and content use the shared service header.
- Four independent criteria preserve neutral unknown/unanswered facts and equal miss opacity. Results stay unranked; a validated shortlist holds up to four projects.
- Mobile gestures: one-finger pan, pinch zoom, two-finger drag to rotate, Reset view and Cancel pin. Mobile uses lighter rendering while retaining building geometry.
- Full-quality rendering sleeps when idle. Removed unused water loading, redundant wrappers and shallow test assertions.
- `/tools/dia-calculator` models a stated uncompleted-flat, DIA, first-HDB-loan scenario; it does not determine eligibility, award grants or guarantee borrowing.
- Project details link to free Google Maps transit directions using approximate anchors. Current estimates appear externally; the map's 5 km criterion remains straight-line distance.
- Crawlable surface: 22 project records, directory, FAQ, methodology, AI information, ten guides (one awaiting publication) and the calculator. New guides cover DIA/HFE/EHG timing, cash/CPF milestones, and Standard/Plus/Prime commitments.
- Canonicals default to the verified `https://wheretobto.com`; an explicit `NEXT_PUBLIC_SITE_URL` can override the domain. Editorial dates do not silently advance project-data freshness.

## TODO

- [x] September implementation merged and verified live through Vercel production state at `8b1de46`; scoped SEO releases are now authorized by the recurring schedule, subject to its review, CI and live-verification gates.
- [ ] Follow the 19 discovered/unindexed URLs from the 12 October report. Upcoming Bedok inspection and submitted sitemap status are now verified; inspect additional priority examples as useful. Preserve expected canonical redirects.
- [ ] If in-app transit estimates are wanted, configure a free registered OneMap token with renewal and verify its live contract. No token is currently configured; no paid API is needed for the existing external links.
- [ ] Refresh the official BTO snapshot when HDB publishes November 2026 project details: names, prices, classification, coordinates and waits.
- [ ] Test physical mobile Safari and re-measure the full visual path on an older integrated-GPU laptop before claiming broad hardware coverage.
- [ ] Consider Bukit Panjang and Punggol LRT geometry when defensible source relations are available.
- [ ] Establish a dated quarterly prompt/citation audit only when real search or AI-referral traffic supports useful questions.

### Parking lot

- Evaluate compression/CDN delivery for `public/map/buildings.bin` on the public host.
- Review central-area label crowding if the catalogue grows.
- Consider AVIF variants alongside WebP if image weight becomes a concern.

## Boundaries and pointers

- RMS wiki is the user-confirmed destination for durable product notes after verified merge; preserve its unrelated existing edits.
- Verified BTO news or a demonstrated site defect may require scoped website code, project/map data and calculator/eligibility-rule changes; these are now authorized with source/cohort evidence and relevant tests. Unrelated backend/auth, secrets, provider/security settings, paid services and tracking remain outside scope. Scoped publication is authorized after CI; Search Console submissions need a substantive reason.
- Never invent unpublished HDB facts or imply Government endorsement. Keep official records, visual geometry and licensed media separate; exclude `work/geo-raw/`.
- Evidence and source limitations: `artifacts/mobile-seo-audit.md`, `artifacts/codebase-audit.md`, `artifacts/dia-research.md`, `artifacts/reddit-content-research.md`, `artifacts/transit-and-reference-research.md`.
- No tracked Graphify graph or repository Graphify publication requirement is present.

**Last updated:** 2026-10-18
