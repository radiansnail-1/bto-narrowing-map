# Financing roadmap comparison — 18 October 2026

Brian asked to inspect the linked tool, identify useful missing features, and use Spawn to implement them. The LinkedIn short link resolves to https://btofinancing.vercel.app/ (title: “Our BTO Roadmap”). This is a direct product request, separate from the scheduled SEO article run.

## Observed gaps and implementation

The reference tool was inspected in a browser using fictional figures: two working applicants earning S$3,000 each, a S$500,000 4-room flat and a November 2026 booking. Its visible functionality includes applicant balances, salary/bonus/raise forecasts, cash/CPF payment preferences, HDB/bank options, payment milestones/calendar, savings chart, renovation/emergency budgets, repayment chart and saved inputs.

Where To BTO already had independent map criteria, neutral unknowns, an unranked shortlist of up to four projects, side-by-side comparison, external transit directions, source-linked project pages and an illustrative DIA loan/payment calculator. The missing useful question was: **when will this household need cash, and will its assumed savings arrive before each payment?**

- Added `/tools/bto-roadmap` with two applicants’ starting balances, monthly cash/usable CPF additions, individual start months and optional annual growth assumptions.
- Added dated booking/signing/keys/renovation milestones, option-fee credit, stamp duty, entered fees, reserves and cash/CPF payment choices.
- Added ordinary/staggered/DIA scenarios, HDB and 75%/55% bank LTV scenarios, assumed grants and loans, monthly repayment and full-term amortisation.
- Added cash/CPF runway charts with month-level data, loan chart/data and opt-in browser storage. Financial inputs are not put in URLs; no account or measurement service was added.
- Linked the roadmap through shared navigation, project pages/panels, the existing DIA tool and the cash/CPF guide; added canonical metadata, WebApplication structured data and sitemap coverage.

The implementation is original code using the existing Next.js structure and no dependency. Salary-to-CPF calculations, automatic EHG awards and “you can afford” verdicts are deliberately replaced by visible user assumptions. Those reference features rely on applicant-specific conditions and should not silently turn a future salary projection into an approved grant or loan. No map facts or project-data audit dates changed.

## Authoritative rule review

Reviewed 18 October 2026. Announcement, sales-cohort and policy dates remain distinct.

- [HDB booking and DIA conditions](https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/booking-of-flat): option fee depends on flat type and forms part of the downpayment; DIA eligibility changed from July 2025. The model credits the option fee once and does not forecast a later CPF-related refund.
- [HDB Agreement for Lease](https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/sign-agreement-for-lease): current HDB 10% ordinary / 5% staggered / 2.5% enhanced DIA signing instalments. HDB’s current 75% LTV cohort begins with October 2024. Bank DIA signing is cash-only; the additional minimum cash at keys is 2.5%/7.5% for 75%/55% LTV respectively. The rendered HDB table was checked independently after the research pass.
- [HDB financing](https://www.hdb.gov.sg/buying-a-flat/financial-planning-for-a-flat-purchase/credit-to-finance-a-flat-purchase) and [MAS housing-loan limits](https://www.mas.gov.sg/publications/macroprudential-policies-in-singapore): LTV is a ceiling, not approval; age, tenure and other commitments can restrict actual borrowing. The roadmap accepts a stated loan rather than underwriting it.
- [IRAS BSD](https://www.iras.gov.sg/taxes/stamp-duty/for-property/buying-or-acquiring-property/buyer%27s-stamp-duty-%28bsd%29): residential marginal rates effective 15 February 2023, based on the higher entered price/market value. BSD is separate from the flat price and modelled at signing.
- [CPF allocation calculator](https://www.cpf.gov.sg/employer/tools-and-services/calculators/cpf-contribution-allocation-calculator) and [HDB CPF-use conditions](https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/housing-loan/housing-loan-from-hdb): contributions and usable balances depend on the applicant; entered usable additions and reserves remain assumptions.

The roadmap excludes eligibility, automatic grants, salary assessment, CPF interest/bonuses, ABSD, levy, insurance, other household spending and future rate changes. It assumes grant credit only at keys; an earlier grant disbursement needs the buyer’s own payment plan. Contributions arrive after payments each month so a month-end salary cannot conceal an earlier payment gap. A negative cash balance means unfunded cash, not an approved overdraft.

## Verification and release

The parent inspected and integrated the workers’ changes. An independent read-only finance review found no additional material issues after the identified bank DIA grant/loan cash-floor correction. Parent review also corrected the full-term chart, duty allocation, chart scales, loan-chart direction, non-additive reserve copy, payment ordering and storage opt-out.

- `npm ci`, lint and all **87 unit tests** passed; the new 15 cases cover purchase conservation, option credit, stamp duty, bank cash minima, contributions, zero rates, full amortisation, reserves and invalid assumptions.
- `NEXT_PUBLIC_MAP_TEST_API=1 npm run build` and **17 sequential browser checks** passed together against that production test build. The two new browser flows cover financial/date validation, the full-term table, phone widths 320/390/844/1440, explicit storage save/load/removal and malformed saved data. Existing map, shortlist, DIA and content flows remain covered.
- `env -u NEXT_PUBLIC_MAP_TEST_API npm run build` passed separately with 47 static pages. No verification-only map API is intended for ordinary production.
- Manual browser review: 1440×900 desktop and 390×844 phone, readable charts, no horizontal page overflow, native date/select controls, timeline links and keyboard month selection with visible focus. Physical Safari was not tested.
- Manually reviewed the full title, metadata description, visible copy, assumptions, funding labels, sources, chart text and CTAs. No government endorsement, approved grant/loan, invented project fact or guaranteed affordability result is stated.

PR, exact source commit and verified production readback are recorded in the delivery record/PR after GitHub and Vercel finish. The prior Ready production deployment is `dpl_7MYSjMnEH1mn6Qp6vFhjwjrNi5QV` at main `a4f16c89013c532e4ecabda2668a77dda6fc1ad2`; preserve it for rollback. Existing Vercel project `where-to-bto`, scope `radiansnail-1s-projects`, production branch `main`.
