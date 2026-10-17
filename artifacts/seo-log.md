# Where To BTO — SEO and news log

## 17 October 2026 — November HFE readiness

**Delivery:** [PR #8](https://github.com/radiansnail-1/bto-narrowing-map/pull/8), prepared on branch `codex/seo-bto-news-20261017`, based on `origin/main` at `8b1de46`. The new guide is not yet a verified production publication. The associated PR must pass `verify` and receive the required approving review before merge; automatic merge is disabled in repository settings. No protection was changed. The current production deployment remains Ready at `8b1de46`, deployment `dpl_Dcvq5jHgs2vLj35F2p4Cp5hjfsFp` ([rollback/source deployment](https://where-to-ffhvex57l-radiansnail-1s-projects.vercel.app)).

### News baseline

- First explicit news-check run; no previous successful news cutoff exists in this repository. Coverage cutoff: **17 October 2026, 22:45 UTC**. Future runs should compare against this entry and its sources, including later announcements with earlier effective dates.
- Read the rendered [HDB news index](https://www.hdb.gov.sg/hdb-pulse/news), the [Flat Portal](https://homes.hdb.gov.sg/) (footer updated 15 October), and the official releases below. The latest index items were an EC tender result on 15 October and green notes on 6 October; these do not announce a BTO launch.
- The portal still calls November 2026 the upcoming exercise and displays seven town-level preview cards. It gives no dated application window on the landing page. It repeats the recommended 25 September HFE document date and says HFE applications pause during the sales application period. No new official project names, prices or classifications were established by this check; the map/project dataset remains unchanged.
- [HDB's supply release](https://www.hdb.gov.sg/hdb-pulse/news/2026/20261001-Flash-Estimate-of-3rd-Quarter-2026-Resale-Price-Index-and-Upcoming-Flat-Supply), displayed as published **30 September** although its URL contains 20261001, reiterates about 7,960 November flats across Bedok, Geylang, Sembawang, Tengah, Toa Payoh and Yishun, plus Community Care Apartments in Toa Payoh. It requires a valid HFE letter at flat application. This is a baseline confirmation, not a newly announced launch today.
- [22 August HDB announcement](https://www.hdb.gov.sg/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children): revised HFE income ceilings start with applications from 24 August 2026; additional child ballot chances start with February 2027. [Annex B](https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children/Annex-B.pdf) explains existing-letter and pending-application transitions. These older announcements are not presented as new news.
- [HFE application guidance](https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/application-for-an-hdb-flat-eligibility-hfe-letter), rendered and checked today: up to a month after complete documents, potentially longer around launches; nine-month letter validity; re-application/household-change instructions.
- [CPF Board release, 22 September](https://www.cpf.gov.sg/member/infohub/news/news-releases/government-extends-4-per-cent-interest-rate-floor-on-special-medisave-and-retirement-account-monies-until-31-december-2027): OA remains 2.5% and the HDB concessionary loan rate 2.6% for 1 October–31 December 2026. This does not lock a future key-collection rate. No calculator logic was changed.
- The MND press-release index presented a bot-verification interstitial to web retrieval; no CAPTCHA was attempted. The consequential claims used here are directly supported by HDB. Do not interpret the limited MND-index check as proof that no other announcement exists.

### Search evidence and selected intent

Authenticated property: **`sc-domain:wheretobto.com`**, selected from the owner's actual property list. Web search, all queries/pages/countries/devices. Latest complete available date: **15 October 2026**; UI updated five hours before inspection. Explicit date controls confirmed the windows below (the comparison chart's accessibility date label itself was malformed).

| Metric | 9–15 Oct 2026 | 2–8 Oct 2026 |
| --- | ---: | ---: |
| Clicks | 9 | 4 |
| Impressions | 324 | 290 |
| CTR (reported, rounded) | 2.8% | 1.4% |
| Average position | 20.7 | 17.2 |

Page breakdown, same windows: Tampines Bliss 3/1 clicks and 82/77 impressions; DIA calculator 2/0 clicks and 38/23 impressions; homepage 2/1 and 26/24; Sembawang Brook 1/0 and 28/10; project directory 0/0 and 112/100; guide directory 0/0 and 13/12. The project directory's impressions with no clicks are an opportunity for later query-specific work, not proof that a title rewrite would help. The new HFE article addresses a verified coverage gap; no HFE keyword volume is claimed.

Visible query opportunities, same comparison: “bto locations” 15/13 impressions, “bto projects” 9/12, “bto calculator” 9/6, “tampines bliss bto location” 7/4, all with zero recorded clicks for those individual rows. Search Console anonymization means visible query rows need not sum to aggregate clicks.

**Hypothesis:** A practical answer to “I missed the November HFE preparation date; what can I check now?” adds useful launch-readiness coverage beyond the existing DIA/grant and unpublished-data guides. The guide gives concrete dashboard checks, existing-letter decisions and separate effective dates, then links readers into the map and related funding guidance. It does not duplicate a project listing or promise approval.

### Indexing and analytics

- Indexing report **12 October**: 20 indexed; 19 discovered/currently not indexed; 3 page-with-redirect exclusions; 0 crawled/currently not indexed. The discovered validation started 13 September. No new validation was started.
- Example discovered URLs include Berlayar Rise, Kim Keat Crest, the unnamed second Lakeview record, November Bedok/Geylang/Sembawang/Yishun, Pearl's Hill, Sembawang Deck and Sembawang Portico. The inspected `/bto-projects/nov-2026-bedok-unnamed` reports not on Google, sitemap discovery, no referring page detected, and no recorded crawl/canonical. Public HTTP independently returns 200 with the expected canonical and no noindex directive. This is an indexing limitation, not an established technical block.
- Submitted `https://wheretobto.com/sitemap.xml`: submitted 29 August, last read **14 October**, **Success**, **38 discovered pages**. No unchanged sitemap was resubmitted and no indexing request was made.
- Existing Vercel Web Analytics was accessible: **41 visitors, 76 page views, 66% bounce rate** in its **rolling 10 October 11 pm–17 October** production view. Visible referrers: Reddit 13 visitors, Google 10, Bing 2, Yahoo Singapore 2. These are analytics visitors in a different window, not Search Console clicks, crawler counts or proven conversions. No visible AI referral/citation evidence was established. Custom downstream events are unavailable; no new measurement service was added.

### Change and editorial review

- New intended URL: `https://wheretobto.com/guides/november-2026-bto-hfe-checklist`.
- Linked it from `/guides` and `/guides/handling-unpublished-bto-information`; added automatic sitemap inclusion through the existing typed guide list. The guide directory receives a real modification date.
- Reused the existing practical-guide route with per-guide publication/check dates in visible text, Open Graph and Article JSON-LD. Older guides retain 7 September and the official project data retains 28 August. If actual publication occurs on another date, update the new publication date and its regression assertion before release; retain the true source-review date unless rechecked.
- Manually read the complete title, description, answer, all five sections, source labels and CTA. There is no added FAQ, invented expertise, speculative price/name/classification or guaranteed loan/grant/application outcome. The opening answers the question; each section supplies a different check. No keyword variants, filler pages, dependencies or CMS were added.

### Validation and release gate

- `npm ci`; `npm run lint`; `npm run test`: **72 passed**; `NEXT_PUBLIC_MAP_TEST_API=1 npm run build`: **46 static pages**; `CI=1 npm run test:e2e`: **15 passed**, production build and one worker. An initial browser failure was the expected guide-count fixture changing from 9 to 10; it was corrected and the complete suite passed.
- Browser regression includes the new route, canonical and article dates while preserving older guide dates. An ordinary `env -u NEXT_PUBLIC_MAP_TEST_API npm run build` also passed, followed by local production inspection.
- Visual review at **390×844** and **1440×900**: readable title/body/source links and no horizontal overflow. Keyboard Tab visibly focuses navigation. Calculator navigation works; the established full map/shortlist/calculator browser flows passed. Physical Safari and old GPU hardware were not tested.
- Existing live `/guides`, unpublished-information guide and upcoming Bedok record returned 200 with correct canonicals and no noindex; robots allows crawling and references the canonical sitemap. Production still has 38 sitemap URLs before this release.
- The Vercel connector returned empty/404 project reads; the authenticated CLI resolved the exact existing project `prj_YLpw7HxyY3yMEy9fJiLvdb7FxtRE`, team `team_iEDTYCrbyeqwFdvzvLWKkrIp`, production branch `main`, Ready deployment and source commit. CLI readback is the provider evidence for this run.
- Lockfile installation also reported inherited advisories (including critical development-tool advisories and a moderate Next.js advisory). Dependencies were unchanged under this content scope; a separate maintenance review is needed.

**Next observation:** First resolve the PR's required review and final-head CI; after merge, verify the Ready production deployment, guide response, metadata/canonical, sitemap and assets. Only then record publication. Check the new URL's discovery/indexing after release and compare subsequent complete weekly windows; these small pre-release samples establish no causal SEO gain. Continue news checks from the cutoff above and do not repeat these baseline announcements as fresh news.
