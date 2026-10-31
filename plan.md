## Five-language daily publishing readiness — 28 October 2026

PR #16: https://github.com/radiansnail-1/bto-narrowing-map/pull/16 . The owner requested a working content-driven publisher before 29 October. New articles live in data/article-bundles/<slug>.json with complete en/es/fr/de/zh-Hans copy; the build discovers records and generates five static pages, self-canonicals, reciprocal language links, schema and sitemap entries. Add content records rather than daily template edits. Existing English routes and the /zh product page stay intact.

The original handling-unpublished-bto-information article is the five-language canary. Original publication/source-review dates stay 29 August; translation update is 28 October. No new scheduled article slot or housing/finance fact is counted. Root layouts use route groups so html lang is correct without request headers or dynamic rendering. Exact-head CI includes existing 19 browser checks and an ordinary production build.

Local validation: lint, 93 unit tests and ordinary production build passed; 55 static pages include the four translated routes. Partial copied-English text, incomplete copy, invalid dates, unsafe links and differing citation/navigation targets fail validation. Chinese phone/French desktop canary layout and language navigation passed source-built browser review; remote checks, merge and exact-source Ready release remain required. Preserve unrelated prior TODOs and dated history below.

# Where To BTO — Plan

## Queue number beyond flat supply — 23 October 2026 (PR #14)

- **Goal:** Publish one distinct English applicant guide at `/guides/bto-queue-number-beyond-flat-supply`, retained branch `seo/bto-queue-number-beyond-flat-supply`, [actual PR #14](https://github.com/radiansnail-1/bto-narrowing-map/pull/14). Prior PR10 CPF article is verified history, not retained new delivery.
- **Actual state:** Initial source `86aecfb7816fc1b20d8e8649a0c287b4839140c0` prepared from exact production `c22859bcf9dbf2cfff2a32233d4d2b51d67dbc7c`. Complete article, current guide answers and full PR5 guide changes reviewed. Added a related HFE-guide link and directory introduction; publication/source dates only on the new guide. Existing project snapshot, finance logic, neutral map matching and user TODOs below remain intact.
- **Next action:** Required hosted source/build/browser verification on the final head, followed by ordinary approved merge and exact-source candidate/promotion/live proof only if gates pass. A PR or passing preview is not publication.
- **Known blocker to resolve:** Existing `e2e/explorer.spec.ts` asserts11guide rows; this source adds a twelfth. The private publisher reader reports `source_path_outside_approved_website_scope` for that test path. Do not bypass the file scope via another writer or weaken/delete directory coverage. Capture actual hosted result; retain this same draft/PR if blocked and request the owning bridge's narrowly approved test repair rather than new filler.
- **News:** Limited official check through 2026-10-23T03:47:12Z; last complete cutoff remains17October22:45UTC. HDB index timed out and MND showed bot verification; CPF/IRAS and official indexed releases yielded no newly confirmed consequential change. No new project, sales dates or calculator rule is inferred; project audit dates do not advance.
- **Measurement:** Final Pacific14–20October4clicks/195impressions versus7–13October10/359; very small sample, with only1and2impressions on19/20October. One appointment-tracker impression is a weak related signal. Planner Singapore English available; broad queue-number estimate70/month, exact beyond-supply estimate unknown. No causal gain, indexing, business conversion or traffic forecast. Observe7/28days after verified publication, retaining earlier observation plans.

## Chinese product entry and calculator navigation — 19 October 2026

Publication: PR #12 is open; local checks and responsive QA passed. Required final-head checks and live verification remain pending.

Added server-rendered /zh Simplified Chinese product introduction and /tools chooser routing readers to the existing DIA illustration or cash/CPF funding roadmap. Core map/project/financial-tool interfaces remain English and the Chinese page labels those destinations; SG-specific data, calculation and matching rules are unchanged. Search Console current displayed window through 17 October shows 33 impressions for bto calculator, supporting a clearer entrance rather than another calculator. Lint, 89 tests and production build passed; responsive checks passed; end-to-end gates/publication are pending. Next: scoped PR, required checks, and verified production release. Preserve the existing untracked node_modules symlink and prior TODOs.

## Where To BTO homepage explanation — 19 October 2026

- Current scoped branch: `codex/aeo-home-definition-20261019` website improvement, based on the current production source; prior product/release state below is preserved.
- Added a visible initial-HTML explanation of the independent BTO comparison tool and a link to its sources/limitations beside the questionnaire. Map, project facts, comparison rules and financial calculations are unchanged.
- Lint, 88 unit tests, ordinary production build, generated-HTML inspection, desktop/phone browser checks and phone next-question navigation passed. Exact-head CI remains required before merge.
- Publication status: PR #11 is open; local validation and independent source review passed. Exact final-head GitHub gates and live production verification are pending. Next action: publish the scoped PR, satisfy its gates, merge and verify the intended custom domain.

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

**Last updated:** 2026-10-23 (SEO section; prior owner/native TODOs retained)


## 29 October 2026 — Five-language booking preparation (PR #17)

Goal: deliver one distinct appointment-preparation guide, https://wheretobto.com/guides/bto-flat-booking-appointment-checklist . Actual PR https://github.com/radiansnail-1/bto-narrowing-map/pull/17 ; retained branch seo/bto-flat-booking-appointment-20261029. Complete en/es/fr/de/zh-Hans bundle at data/article-bundles/bto-flat-booking-appointment-checklist.json; original publication/source-review/update dates29October. Six sections/twelve paragraphs per language, full titles/descriptions/answers/source labels/callout/navigation manually reviewed for factual meaning and natural prose. No external reviewer claimed. Existing five-language authoring schema and renderer reused. No project/calculator/tracking/template changes.

Current source86fc445ce620bf73b73d69d7516c919a1b736e45: complete practical/legacy answers and canary reviewed;48page coverage includes published PR14 and four canary translations, all43 old cards preserved. OTHER PR5 head278bfc377910aabc5cd35b6ed48f0561dbc09f31 full patches reviewed; ad integration, no competing article. Payment timeline/roadmap own money; queue guide owns position/availability, mentions invitation but lacks preparation worksheet. Queue coverage-only refresh opportunities:[] revision10; selected-only research revision11 and before-writing passed. Remaining ready/research cards retained with original dates; no new duplicate rejection.

Primary sources actually read29October: https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/booking-of-flat (direct extraction collapses accordions; full indexed official invitation/documents/attendance text read), https://www.mynicehome.gov.sg/get-started/hdb-bto-sbf-buying-guide/ (official guide updated29June2026). Invitation-specific checklist, fictional couple example, document privacy and no unverified representative form. No universal document completeness/eligibility/availability guarantee. Booking/lease/keys separate; no new finance rule or amount.

News check29October, limited: HDB indexed current23October quarterly release confirms November about7,960flats/same6towns and later details.28October innovation release is industry research/pilots, not buyer entitlement.28October Sunset Way/Maju Forest and Gillman Barracks revised conceptual plans were read: broad public/private housing estimates and future works, with housing mix/launch date still to come. Do not convert an area-wide public-housing plan into an invented BTO project, unit mix, centroid, launch cohort or ready amenity. No existing22project record is those sites; no current BTO fact/calculator rule established for replacement. Sources: https://www.hdb.gov.sg/hdb-pulse/news/2026/3rd-quarter-2026-public-housing-data-and-upcoming-flat-supply ; https://www.hdb.gov.sg/hdb-pulse/news/2026/enterprise-singapore-and-hdb-launch-new-initiatives ; https://www.hdb.gov.sg/hdb-pulse/news/2026/revised-plans-for-sunset-way-and-gillman-barracks-to-integrate-new-homes-with-more-greenery . Direct HDB index empty shell, MND robot check; CPF latest17October retirement item, IRAS newsroom/relevant official searches no newly confirmed housing rule. Last complete news cutoff17October22:45UTC remains; limited checks do not advance project snapshot dates.

Actual final GSC sc-domain:wheretobto.com, America/Los_Angeles, read29October04:33:48UTC, cutoff26October.20–26October1click/22impressions versus13–19October3clicks/221impressions; tiny/inconclusive, no cause or topic-demand proof. Latest query read30row bound mainly branded/location, no appointment evidence; omitted/suppressed unknown. Planner English Singapore supplementary request recorded separately below; estimates not traffic/organic difficulty. Indexing/AItraffic/business outcomes unknown, no submissions/tracking changes.

Shared observation29October00:40–00:41UTC, Codex CLI0.163.0 live-web-search, configuredgpt-6-luna/actualmodelunreported, question-set2026-10-20-v1, graderfinal-answer-links-v2: branded own-host citations1/1, unbranded0/2; literalname1/1and0/2, identityunverified. Branded answer includes one malformed https://https:// link plus valid methodology/FAQ links; do not count malformed link independently. Isolated15question benchmark, not consumer-wide or traffic. No new dispatch.

PR14 release24October and PR15 test-only maintenance25October are verified history; their old pending notes below are superseded, not new blockers. Current PR17 must pass actual exact-head hosted npm ci/lint/test, camera-flag verification build/one-worker browser, ordinary production build without flag and all5article390/1440 language proofs. Empty checks alone are not a pass. Next: validate samePR finalhead, repair supported failures, fresh exact-head before-merge overlap, normal checked merge/candidate/promotion/all5liveURL verification. Not yet published; future observation pending. Preserve prior7/28day observations, no measured gain. New guide review7/28days after actual verified release. Preserve all owner TODOs and physical Safari/hardware/indexing limits below.

Planner receipt: {"source":"Google Ads Keyword Planner","site":"where-to-bto","available":true,"fallback":"Search Console","estimates":true,"cached":true,"observed_at":"2026-10-29T04:34:32.586Z","host":"wheretobto.com","geography":"specified_targets","geo_target_constants":["geoTargetConstants/2702"],"keywords":[{"keyword":"bto booking checklist","average_monthly_searches":null,"advertiser_competition":null},{"keyword":"bto flat booking appointment","average_monthly_searches":"10","advertiser_competition":"LOW"},{"keyword":"hdb flat booking documents","average_monthly_searches":null,"advertiser_competition":null}],"caution":"Estimates; advertiser competition is not organic ranking difficulty. Missing metrics are not zero."}


## 29 October 2026 — Owner-requested retained PR17 repair

PR17 retains the original flat-booking appointment guide and its five complete language records. The historical canary date assertion now selects handling-unpublished-bto-information by stable slug instead of the first sorted article; all date and sitemap assertions remain. This is a source repair, not a release. Rerun native tests and the full hosted five-language build/layout receipt, refresh current source and other-draft comparisons, then use the normal merge and live release at the next eligible slot. Project-news cutoffs and original article dates remain unchanged.


## 31 October 2026 — Non-selection guide

Prepared the complete English, Spanish, French, German and Simplified Chinese guide in data/article-bundles/declining-bto-flat-selection.json. It distinguishes unsuccessful applications, declining available flats, household categories and later cancellation stages. Full source and translation review completed. Pull request assignment, build and layout checks, merge and production verification remain pending. Preserve existing project dates, financial calculations and unfinished work.
