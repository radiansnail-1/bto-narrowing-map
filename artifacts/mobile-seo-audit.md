# Mobile, content and SEO audit — 7 September 2026

Implemented and verified locally in `bto-narrowing-map`. No commit, deployment, indexing request or Search Console validation was submitted. The production build is available locally at http://localhost:3000.

## Mobile experience

The old explorer enforced a 760px minimum width inside a fixed-height, overflow-hidden shell. At a 390px viewport, the page expanded to 760px and the questionnaire began at x=394: the main controls were off-screen.

The final implementation **loads the 3D map automatically**, as requested. A responsive layout through 1023px stacks the map and questionnaire, wraps navigation, provides larger controls, and scrolls vertically. Landscape map height leaves room to scroll outside the canvas. Mobile map labels have larger text and expanded touch targets.

- One finger pans; pinch zooms; two-finger dragging rotates.
- Reset view restores the selected project or island overview.
- Workplace pin placement has a visible Cancel pin control and returns to the questionnaire after placement.
- Selecting a project reframes its context after a viewport resize until the user takes manual control.
- Native panning is constrained to the island bounds. Camera and target move together so the correction preserves orientation.
- Mobile rendering uses the existing lite visual path with DPR 1 and no expensive postprocessing/shadow pass. All building geometry remains present.

Playwright verified 320px, 390px, 844px landscape and 1023px layouts; questionnaire completion; project/transit access; automatic map asset loading; native CDP pan, pinch and rotation; reset; selected-project resize framing; and workplace pin placement/cancellation. These are Chromium device-emulation checks, not physical iPhone/Safari verification. An independent Astra review found and helped resolve the resize and pan-boundary cases.

Screenshots: [mobile explorer](./mobile-explorer.png), [DIA result](./mobile-dia-calculator.png).

## Performance and cleanup

The earlier [codebase audit](./codebase-audit.md) records the removed wrappers, redundant tests and unused map request. Its local desktop comparison with full effects/shadows measured 267 scene renders becoming zero during a three-second idle sample; main-thread task time fell from 1.109 seconds to 0.002 seconds. Requested map assets fell from eight to seven by removing 170,572 unused water bytes. Geometry count stayed at 355.

Those are local measurements, not mobile FPS, battery-life estimates or production Core Web Vitals. The final animated-map browser regression passes for idle rendering, selection/return, keyboard pan and wheel zoom.

The first expanded browser run exposed a software-renderer startup timeout and an outdated FAQ count after adding DIA content. The suite now uses full Chromium, which can use the local GPU; its explicit lite tests still exercise the lite rendering branch. All 13 checks passed together in 1.1 minutes after correction.

## Transit and reference

Project details provide free Google Maps transit links for selected work hubs or a custom pin, plus a destination picker when none is selected. The URLs require no API key. Missing origins do not produce guessed routes. Departure-time-dependent estimates are displayed in Google Maps; the site's 5 km matching criterion remains straight-line distance. Approximate anchors and future service uncertainty are stated beside the links.

Free in-app routing through OneMap is a separate possible integration requiring a registered, renewable token; none is configured. No paid API was introduced. [Routing research and official sources](./transit-and-reference-research.md).

The linked Seoul post was recovered through X's official embed and a public text mirror. Its project returned HTTP 403, so no complete visual comparison was performed. Useful ideas carried into this work are approachable touch controls, performance-conscious geometry/rendering, and clear source/height caveats. A landmark tour and visual effects were not copied speculatively.

## Planning content and SEO changes

Three new static articles answer recurring Reddit questions using official HDB, CPF and IRAS sources:

- `/guides/dia-hfe-and-housing-grants`
- `/guides/bto-cash-cpf-payment-timeline`
- `/guides/standard-plus-prime-bto-restrictions`

Reddit informs the questions, not the policy answers. [Research log](./reddit-content-research.md).

The new `/tools/dia-calculator` models a stated uncompleted-BTO/DIA/first-HDB-loan scenario: signing payment, usable CPF, assumed grant, future loan and cash needed at keys. It includes validation and independent arithmetic tests. It does not determine eligibility or award grants, and fees are separate. [Assumptions and official evidence](./dia-research.md).

Updated guide navigation, FAQ, commute and start-here pages, canonical/Open Graph metadata, structured data and sitemap entries. Production canonicals default to the verified `https://wheretobto.com` domain instead of taking preview hostnames from Vercel environment variables. Project-data checked dates were not falsely advanced by editorial changes.

## Search Console findings

The signed-in `wheretobto.com` domain property's Page indexing report, last updated **4 September 2026**, confirms:

| Status | Pages |
| --- | ---: |
| Indexed | 17 |
| Page with redirect | 3 |
| Discovered — currently not indexed | 18 |
| Crawled — currently not indexed | 0 |

The individual redirect/discovered URL tables and sitemap detail navigation stalled in Search Console despite repeated attempts. The exact excluded URLs, inspection results and submitted-sitemap status remain unverified.

A separate public HTTP audit of **all 34 URLs in the currently deployed sitemap** found HTTP 200 responses, no final-URL changes, canonical tags and no `noindex` meta directives. The homepage canonical omits a trailing slash, which is the same root URL, not a mismatch. Raw observations: [live HTTP audit](./live-seo-http-audit.json). Public robots.txt permits crawling and points to the canonical sitemap.

Public redirects were also verified: HTTP non-www redirects to HTTPS non-www; HTTPS www redirects to HTTPS non-www; HTTP www takes two hops through HTTPS www. These are sensible canonical redirects, but their correspondence to Search Console's three examples could not be confirmed.

Google's [Page indexing documentation](https://support.google.com/webmasters/answer/7440203?hl=en) explains that redirected source URLs ordinarily should not be indexed. “Discovered” means Google knows the URL but has not crawled it; it is not evidence that Google crawled and rejected the content. There is no evidence here that the mobile bug caused these 18 exclusions.

The code changes improve usability and crawlable content; they do not guarantee indexing. After deployment, inspect representative excluded canonical URLs, verify the submitted sitemap and request indexing for substantive priority pages where appropriate. Do not remove legitimate canonical redirects merely to make the exclusion count zero.

## Final verification

- **72 unit tests**, 11 files: passed.
- **13 browser tests** in one complete run: passed.
- ESLint: passed.
- Production build and TypeScript validation: passed; 45 generated static pages.
- Production smoke: mobile map loaded, calculator recomputed, no application runtime exceptions. The local Vercel analytics endpoint returned 404 outside Vercel hosting.
- Mobile screenshots inspected; `git diff --check`: passed.

All changes remain local and uncommitted. The remaining external work is deployment and Google recrawl/inspection; this report does not claim either happened.
