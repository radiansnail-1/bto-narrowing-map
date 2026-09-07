# DIA calculator research and scope

Checked 7 September 2026. This is a payment scenario, not an eligibility engine or financial recommendation.

## Official evidence

- [HDB flat booking / DIA](https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/booking-of-flat): from July 2025 only one partner needs to satisfy current/recent student or NSF conditions; at least one partner 30 or below at HFE, married/fiancé-fiancée, at least one first-timer. Earlier sales required both partners to meet student/NSF condition. Uncompleted-flat assessment approximately three months before completion; completed flats assessed at booking. HDB informs qualifying applicants during booking.
- [HDB 4 March 2024 announcement](https://www.hdb.gov.sg/hdb-pulse/news/2024/greater-support-for-young-couples): 2.5% initial payment from June 2024 for eligible uncompleted-flat DIA applicants. Older loan-LTV figures in this historical announcement are NOT used in the model.
- [HDB housing loan](https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/housing-loan/housing-loan-from-hdb): up to 75% new-flat purchase price when lease covers youngest buyer to 95; monthly instalments up to 30% of income; assessment interest max(3%, prevailing HDB rate). Tenure shortest of 25 years, 65 minus average applicant age, remaining lease minus 20. Concessionary interest pegged 0.1 percentage point above CPF OA, reviewed quarterly; actual financial assessment and usable CPF affect amount.
- [HDB 22 August 2026 announcement](https://www.hdb.gov.sg/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children): family ceiling rises from S$14,000 to S$16,000 for HFE applications from 24 August 2026, including HDB loans. Existing HFE transition annexes must be checked; this model deliberately does not apply income eligibility gates or infer treatment of legacy HFE/DIA bookings.
- [HDB payments at signing](https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/sign-agreement-for-lease): stamp duty and legal fees additional. Excluded rather than guessed; no IRAS tax calculation is implemented.
- [HDB rate table](https://www.hdb.gov.sg/managing-my-home/upgrading-and-redevelopment/pay-upgrading-cost/process): 2.60% for July–September 2026. UI uses editable 2.6% illustration, not a future fixed rate claim.
- [CPF home purchase planner](https://www.cpf.gov.sg/member/tools-and-services/planners/home-purchase): usable CPF depends on individual circumstances. No CPF contribution, interest, reserve, withdrawal-limit or grant entitlement forecast implemented.

## Supported scenario and equations

Uncompleted 99-year BTO from July 2025 onward; DIA approval and first HDB loan eligibility assumed, full 75% LTV assumed subject to income. User must enter a valid age/lease-compatible tenure. No bank loans, completed flats, earlier applications, short leases, second loans or automatic EHG award.

Initial = 2.5% × full flat price. Initial CPF is capped at that payment; remainder cash. CPF at keys explicitly means usable funds remaining after signing, excluding grant. Remaining price = price − initial − user-assumed grant. CPF applied to remaining price first; modelled loan = min(75% price, income-supported principal at assessment interest, price remaining after grant and CPF). Cash needed is remaining balance. Cash-at-keys input is compared against required cash; surplus is not assumed to be an optional extra repayment. Initial + grant + CPF-at-keys applied + loan + cash-at-keys required = price.

Grant defaults zero, has a scenario entry ceiling S$120k, cannot exceed 95% of flat price. Excess-grant scenarios are rejected: HDB requires at least 5% from own cash/CPF where grants exceed 95%. See [HDB general purchase conditions](https://services-homes.hdb.gov.sg/sales/files/general_conditions_for_purchase.pdf) and [HDB February 2024 release](https://www.hdb.gov.sg/hdb-pulse/news/2024/hdb-launches-5714-flats-in-feb-2024-bto-and-sbf-exercises). This input is not a grant estimate. Option fees not separately subtracted since gross initial downpayment is shown; UI warns against counting option fee twice. Fees/insurance/renovation/moving excluded. No storage/network of financial inputs.

## Verification

Vitest covers independent amortisation fixture, discounted-payment sum for income ceiling, zero rate/income, high-rate assessment, 75% cap, funding conservation, grant/CPF double counting, surplus CPF, invalid finite/range/tenure inputs. Parent handles combined build, lint and browser QA.
