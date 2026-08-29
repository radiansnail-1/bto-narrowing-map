# Where To BTO — Plan

## Project Resume

**Project:** Where To BTO
**Path:** `/Users/brian/Documents/RMS/Websites/where-to-bto`
**Source of truth:** Project-local source and canonical handoff files, 2026-08-29
**Status:** The public domain and manual AdSense integration are live; AdSense review and the owner's sensitive payment setup remain pending. Draft PR #5 contains the deployed source plus repository ownership rules.
**Next action:** The owner should complete the AdSense Payments alert, wait for site approval, and explicitly merge PR #5 when ready.
**Verification command:** `npm run lint && npm run test && npm run build && env -u CI npm run test:e2e`
**Do-not-do:** Do not enter bank, tax, identity, or payment-profile data for the user. Do not enable Auto Ads or put ads on the interactive map, privacy page, or AI disclosure page. Do not merge PR #5 without explicit authorization.
**Freshness rule:** If wiki/vault context conflicts with project-local files, use whichever source is newer and say which one won.

## Goal and approach

Help a first-time couple turn the current and officially announced BTO set into a small, understandable shortlist using a cinematic Singapore map, supported by crawlable guides and restrained manual advertising.

- All projects start bright; every confirmed miss dims one project by exactly 23 percentage points. Unknown and unanswered criteria stay neutral.
- Results are grouped into fits, awaiting published data, and trade-offs. They are never ranked.
- Manual AdSense is limited to one responsive in-article unit in guides and one non-sticky bottom unit on eligible content pages.
- The interactive map, privacy page, and AI disclosure page have no ad placements; Auto Ads stays off.
- Official facts, visual geometry, amenity media, and advertising configuration remain separate contracts.

## Current state

- `https://wheretobto.com` is the canonical Vercel production domain with valid HTTPS; `www` redirects to the apex.
- The site is linked to the existing Google publisher account. Ownership meta, `/ads.txt`, privacy disclosure, and Google's three-choice CMP are configured.
- AdSense site status is `Getting ready`; review was requested. Blank ad inventory before approval is expected.
- Manual units are configured through Vercel production environment variables. The publisher pays nothing to Google; Google pays the publisher after approval and payout requirements.
- Production deployment `dpl_HWcX3ZTb2SKZV8vzdAQNckFwk3wD` is live and was verified in Chrome using its Vercel URL because local Chrome retained stale custom-domain DNS/certificate state.
- Draft PR #5 (`codex/adsense-setup`) is open, mergeable, and green. It is intentionally unmerged pending explicit approval.
- `main` is protected: PR required, one approval required, code-owner review required when applicable, stale approvals dismissed, conversations resolved, CI `verify` required, force pushes/deletion disabled, and repository admins retain bypass to prevent owner lockout.
- `@radiansnail-1` is the sole direct collaborator and is declared owner for every path in `.github/CODEOWNERS` on PR #5.

## TODO

- [ ] Owner: open AdSense → Payments and complete the flagged payment-profile action, including any requested identity, tax, address/PIN, or bank details.
- [ ] Owner: wait for the `wheretobto.com` AdSense site review to change from `Getting ready`; respond to any policy feedback Google provides.
- [ ] Owner: explicitly approve/merge [PR #5](https://github.com/radiansnail-1/bto-narrowing-map/pull/5) when ready so GitHub `main` matches the deployed production source and CODEOWNERS becomes part of the base branch.
- [ ] Add `wheretobto.com` to Google Search Console and submit `https://wheretobto.com/sitemap.xml` when the owner is signed in.
- [ ] Refresh the official BTO snapshot when HDB publishes the November 2026 project details (names, prices, classification, coordinates, waits).
- [ ] Re-measure the full visual path on an older integrated-GPU laptop before calling it broadly production-ready.
- [ ] Consider adding Bukit Panjang and Punggol LRT geometry when defensible source relations are available.
- [ ] Establish a dated quarterly prompt/citation audit only after enough real search or AI-referral traffic exists to define useful questions.

### Parking Lot

- Put a compressing CDN or proxy in front of `public/map/buildings.bin` if bandwidth becomes material.
- Review long BTO labels around the central-area cluster if the project catalogue grows.
- Consider AVIF variants alongside WebP if image weight becomes a concern.

## Review Status

| Review | Last run | Status | Findings | Stale? |
|---|---|---|---|---|
| Engineering plan | 2026-08-28 | Cleared | Approved product/engineering scope implemented. | No |
| Visual acceptance | 2026-08-29 | Cleared | Map, results, comparison, content header, guides, and ad placement checked. | No |
| User-journey verification | 2026-08-29 | Cleared | Desktop flows and production AdSense surfaces pass. | No |

**Review verdict:** CLEARED; EXTERNAL ADSENSE REVIEW PENDING
**Next review:** Check AdSense site status after Google completes review.
**Blockers / open questions:** Only owner-controlled Google payment verification, AdSense approval, and explicit PR merge authorization.
**Context pointers:** `README.md`, `components/AdUnit.tsx`, `components/SiteBottomAd.tsx`, `components/GuideArticleBody.tsx`, `lib/adsense.ts`, `app/ads.txt/route.ts`, `app/(content)/privacy/page.tsx`, `.github/CODEOWNERS`.
**How to resume:** `cd /Users/brian/Documents/RMS/Websites/where-to-bto && gh pr view 5 --web`
**Out of scope:** Auto Ads, map ads, backend/CMS/auth, live travel times, composite ranking, bus stops, and entering the user's sensitive payment data.
**Last updated:** 2026-08-29
