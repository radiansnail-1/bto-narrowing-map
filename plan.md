# Where To BTO — Plan

## Where To BTO homepage explanation — 19 October 2026

- Current scoped branch: `codex/aeo-home-definition-20261019` website improvement, based on the current production source; prior product/release state below is preserved.
- Added a visible initial-HTML explanation of the independent BTO comparison tool and a link to its sources/limitations beside the questionnaire. Map, project facts, comparison rules and financial calculations are unchanged.
- Lint, 88 unit tests, ordinary production build, generated-HTML inspection, desktop/phone browser checks and phone next-question navigation passed. Exact-head CI remains required before merge.
- Publication status: source prepared; scoped PR, exact final-head gates and live production verification are pending. Next action: publish the scoped PR, satisfy its gates, merge and verify the intended custom domain.

**Goal:** Help couples build an explainable BTO shortlist with an accessible 3D map and source-backed planning tools.
**Status:** PR #8 is merged at `a4f16c8`; roadmap PR #9 is merged at `46a0dab60de861c1ad7e874c78396fb14bf65353` and its production deployment is Ready. The 19 October SEO run adds a distinct CPF OA reserve decision guide.
**Next action:** Check the 19 October guide's exact-head CI and responsive/generated-output evidence, then merge under the existing allowance and verify the Ready production source and canonical URL. Final release evidence belongs on the scoped PR; after publication, observe discovery/indexing rather than claiming an SEO effect. Previous production/rollback: `dpl_DGujUjWrDkJd8Kdmc6GLzDLJ1geQ`.

## Current SEO run — 19 October 2026 (UTC)

- New guide: `/guides/cpf-oa-reserve-for-bto`. It answers whether to retain OA, not when downpayments fall due. CPF Board's dedicated retention page and two related articles support the per-buyer rule, lender differences and buffer/loan trade-off.
- Three coverage-gap candidates were assessed across financing, family proximity incentives and unit-booking availability. Sparse query data does not establish demand. The new guide includes uneven applicant balances, separate cash reserves and instructions matching the shipped roadmap's household reserve field.
- Added contextual links from the payment guide and funding roadmap, inherited directory inclusion, accurate Article metadata and sitemap date. Older guide dates and the official project snapshot are unchanged. No calculator rule or project fact changed.
- Required validation is the existing full `verify` job, plus actual-guide phone/desktop screenshots, keyboard/link checks and an ordinary production build without the diagnostic camera flag. Artifact upload remains read-only; no dependency, tracking or permission was added. Physical Safari is not established by Chromium emulation.
- Latest final GSC data: 11–17 October versus 4–10 October, 7/7 clicks and 292/336 impressions. Upcoming Bedok remains discovered/currently not indexed; sitemap API has no errors/warnings but was last downloaded 14 October. No resubmission or indexing request.
- News check attempted 19 October after the 17 October 22:45 UTC cutoff: CPF Board index read; HDB news/loan/release pages returned 403, Flat Portal 503, MND index no readable body. No consequential new fact was verified. This limited check does not advance the last complete news cutoff or project audit date.
- Full dated source, selection, editorial and measurement limits are in `artifacts/seo-log.md`; exact CI/head and production readback belong on the scoped PR.

## Current feature work — 18 October 2026

- Compared the linked `btofinancing.vercel.app` against shipped code. Spawn workers handled capability inventory, official rules, pure calculation/tests and UI; the parent integrated and reviewed the combined result. Evidence: `artifacts/competitor-financing-review.md`.
- `/tools/bto-roadmap` adds monthly household cash/CPF assumptions, dated price/fee/renovation stages, reserves, HDB/bank payment scenarios, a savings runway and full-term loan schedule. Assumed grant/loan figures remain separate from eligibility or approval.
- Bank DIA signing is cash-only; option fees credit once; the bank cash minimum cannot be displaced by a large grant/loan combination. Contributions occur after monthly payments so a payment gap stays visible even if later income restores cash.
- Financial scenario saving is opt-in local storage with explicit load and removal; no account, query-string financial state, dependency, tracking or map-data change.
- Shared navigation, project pages/panels, the DIA page and payment guide link to the tool. Metadata, structured data and sitemap cover its one canonical URL.
- Required final validation and release evidence belong on the exact PR head and production readback. Phone emulation does not establish physical Safari coverage.
- Local verification passed: lint, 87 unit tests, production verification build and 17 sequential browser checks, plus an ordinary production build. Manual desktop/phone charts, navigation and keyboard month selection passed. Full evidence and scope limits are in the comparison artifact.

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
- Crawlable surface: 22 project records, directory, FAQ, methodology, AI information, ten published guides and the calculator. New guides cover DIA/HFE/EHG timing, cash/CPF milestones, and Standard/Plus/Prime commitments.
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

**Last updated:** 2026-10-19 (UTC)
