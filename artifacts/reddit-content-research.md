# Reddit question research for BTO guides

Checked 7 September 2026. Search findings are qualitative topic signals, not a statistical measure of frequency. Reddit supplied questions, never authority for the answers. No comments copied into the public articles.

## DIA, HFE and EHG timing

Repeated questions concern assessment timing, whether grants remain tied to student income, mixed student/working couples, and smaller initial downpayments.

- https://www.reddit.com/r/askSingapore/comments/1clh25s — later income and loan uncertainty.
- https://www.reddit.com/r/askSingapore/comments/1ilxh9e — when deferred assessment occurs.
- https://www.reddit.com/r/asksg/comments/1tq7i13/forgo_deferred_income_assessment_for_hdb_grant/ — grant versus later assessment confusion.
- https://www.reddit.com/r/singapore/comments/1qlnsbw/bto_deferred_income_assessment/ — education eligibility question.

Official checks: HDB booking page (current July 2025 one-party change, age and assessment timing), HDB HFE application page, HDB Ask.gov DIA application answer, 2024 HDB young-couples announcement for the 2.5% mechanism. The announcement's old 80% HDB loan table is deliberately not used as a current loan limit. Public guide links to all sources inline.

## Cash and CPF payment timeline

Repeated questions mix mandatory cash, usable CPF, grants, fees, payment milestones and maximum versus approved loans.

- https://www.reddit.com/r/singaporefi/comments/1vw013q/how_much_cpf_do_i_realistically_need_to_bto/ — August 2026 discussion incorrectly generalising bank cash requirements to all loans.
- https://www.reddit.com/r/singaporefi/comments/1v40zpa/bto_1st_downpayment/ — July 2026 confusion over CPF/grant allocation for fees after asking AI.
- https://www.reddit.com/r/askSingapore/comments/1im02qk — downpayment and stamp duty payment method.
- https://www.reddit.com/r/singaporefi/comments/1qkdpn6/bto_payment_timeline/ — appointment timing and savings.

Official checks: HDB Agreement for Lease page (ordinary HDB 10%/15%, bank 75%-LTV 5% mandatory cash), CPF Ask.gov downpayment guidance, CPF expenses guide, HDB MyNiceHome loan overview, IRAS current stamp duty table. Worked $500k example assumes full $375k loan and no grant; $9,600 BSD calculated from verified marginal bands. No estimated renovation cost or promised loan amount.

## Standard, Plus and Prime commitments

- https://www.reddit.com/r/singaporefi/comments/1r0bfz5/standard_vs_plus_vs_prime/ — February 2026 discussion on long occupation commitments, changing circumstances and location value; includes a misleading claim that subsidy recovery applies to all subsequent owners.
- https://www.reddit.com/r/askSingapore/comments/1ewamts — broader discussion of Plus/Prime commitments and affordability.

Official checks: HDB current conditions-after-purchase page (MOP starts legal completion; exclusions; subsidy recovery base; resale buyers exempt from recovery), 2024 classification framework and Annex A (five/ten years, rental conditions, special-flat exceptions). An illustrative four-year wait is explicitly not a project forecast. No generic subsidy recovery percentage or resale price prediction.

## Implementation and verification

Three new slugs in data/reddit-guides.ts and static /guides/[guide] route. No collisions with the six existing fixed guide routes. Article metadata, canonical URLs, dated Article JSON-LD, semantic sections, inline official citations, next-step links. No author persona or FAQ rich-result claim.

Targeted ESLint passed on both source files. Parent owns full build/browser verification, adding index/navigation/sitemap links, and ensuring /tools/dia-calculator exists. No deployments, commits, existing guide edits, or external writes performed.
