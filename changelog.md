# Changelog

## 2026-08-29 (domain, AdSense, and repository governance)

- Connected `wheretobto.com` to Vercel with valid apex HTTPS and `www` redirect, set the canonical production URL, and published the GitHub repository homepage.
- Activated the existing Google publisher account for website AdSense, added and verified the site, requested review, enabled Google's three-choice consent manager, and kept Auto Ads off.
- Added exact manual in-article and bottom units, responsive reserved layouts, `/ads.txt`, verification metadata, privacy disclosure, sitemap coverage, and production environment wiring. The map, privacy page, and AI disclosure page have no ad placements.
- Verified production in Chrome: guide pages contain both intended units, other eligible content has only the bottom unit, and the interactive map has none.
- Published draft PR #5; local lint, 59 unit tests, 43-route build, GitHub CI/E2E, and Vercel checks all passed.
- Protected `main` with required PR review, code-owner review, CI, conversation resolution, and no force pushes/deletion; added `@radiansnail-1` as owner for every repository path.

## 2026-08-29 (user journey and shortlist pass)

- Added a first-time promise, clearer question wording, HDB starting-price/HFE guidance, and explicit clear-to-unanswered controls for every criterion.
- Added visible criterion statuses and reasons, chosen-answer summary, zero-fit guidance, launch-stage filters, and status distinction on map labels.
- Added a validated local shortlist capped at four projects, side-by-side comparison, project-page add/remove actions, persisted result/project flow, and panel-scroll resets.
- Added a substantive Start Here guide and contextual commute, amenities, price/wait, and unpublished-data links.
- Corrected launch-filter consistency across map, labels, tray, counts, results, and selected context; preserved nested amenity return flow; made the missing-budget reason truthful; added explicit shortlist-full feedback; and made map project labels keyboard-operable.
- Verified the final scope with `git diff --check`, lint, 58 unit tests, a 41-route production build, 8 Playwright flows, and fresh-tab visual/runtime QA with no console errors.

## 2026-08-29 (crawlable content and SEO pass)

- Added 22 statically generated, source-linked BTO project pages plus a complete project directory.
- Added six substantive comparison guides, a ten-question FAQ, transparent methodology/source register, and a visible canonical AI-information page.
- Added unique route metadata, canonicals, Open Graph/Twitter fields, WebSite/WebApplication/WebPage/Article/Breadcrumb/FAQ JSON-LD, `sitemap.xml`, `robots.txt`, web manifest, and site icon.
- Added internal navigation from the map shell and a shared public-service-style content shell using the existing self-hosted Hanken Grotesk system.
- Replaced the map/content header split with one 64 px header, removed the generic W tile, beta badge, status dot, and brand subtitle, and locked route-to-route geometry at the 834×734 review viewport.
- Flattened the crawlable pages into a calmer editorial layout: no eyebrow labels, hero accent stripe, floating hero card, side-tab callouts, or repeated equal-sized guide cards.
- Added focused guides for commute checks, 1 km amenity context, and unpublished launch facts, and rebuilt the guide index as a scannable list.
- Production URLs resolve from an explicit site URL or Vercel's stable production hostname; no guessed deployment domain is hardcoded.
- Verified the initial crawlable-content pass with metadata/robots/sitemap response checks and visual states at 834×734 and 390×844; the later user-journey pass supersedes its test and route totals above.

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

**Last updated:** 2026-08-29
