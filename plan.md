# Where To BTO — Plan

**Goal:** Help couples build an explainable BTO shortlist with an accessible 3D map and source-backed planning tools.
**Status:** Mobile, performance, DIA, transit-link and editorial improvements are implemented and locally verified. PR #7 is open. Corrective changes address CI failures; the final head must pass required CI and receive the required approving/code-owner review before merge. GitHub is the authority for delivery state.
**Next action:** Inspect https://github.com/radiansnail-1/bto-narrowing-map/pull/7 and its required checks/review. After merge, handle deployment separately and inspect representative Search Console exclusions against the deployed canonical pages.

## Resume state

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
- Crawlable surface: 22 project records, directory, FAQ, methodology, AI information, nine guides and the calculator. New guides cover DIA/HFE/EHG timing, cash/CPF milestones, and Standard/Plus/Prime commitments.
- Canonicals default to the verified `https://wheretobto.com`; an explicit `NEXT_PUBLIC_SITE_URL` can override the domain. Editorial dates do not silently advance project-data freshness.

## TODO

- [ ] Deploy this merged change only under a separate deployment request; inspect deployed mobile/calculator/content behavior afterwards.
- [ ] Reopen Search Console detail tables, identify the 18 discovered URLs and 3 redirect examples, inspect representative canonical URLs, and verify submitted `/sitemap.xml` status. Do not remove expected canonical redirects just to lower the count.
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
- No backend/CMS/auth, ranking engine, bus-stop layer, new UI dependency, paid API, deployment or Search Console submission is part of this checkpoint.
- Never invent unpublished HDB facts or imply Government endorsement. Keep official records, visual geometry and licensed media separate; exclude `work/geo-raw/`.
- Evidence and source limitations: `artifacts/mobile-seo-audit.md`, `artifacts/codebase-audit.md`, `artifacts/dia-research.md`, `artifacts/reddit-content-research.md`, `artifacts/transit-and-reference-research.md`.
- No tracked Graphify graph or repository Graphify publication requirement is present.

**Last updated:** 2026-09-07
