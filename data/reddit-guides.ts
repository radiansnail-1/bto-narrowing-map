export interface PracticalGuide {
  slug: string;
  publishedDate?: string;
  checkedDate?: string;
  category: string;
  title: string;
  description: string;
  answer: string;
  sections: { heading: string; paragraphs: string[]; sources?: { title: string; href: string }[] }[];
  next: { title: string; href: string }[];
}

export const PRACTICAL_GUIDES_CHECKED = '2026-09-07';

const booking = 'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/booking-of-flat';
const lease = 'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/sign-agreement-for-lease';

export const REDDIT_GUIDES: PracticalGuide[] = [
  {
  "slug": "bto-queue-number-beyond-flat-supply",
  "category": "Ballot and booking",
  "publishedDate": "2026-10-23",
  "checkedDate": "2026-10-23",
  "title": "BTO queue number beyond flat supply: what should you check next?",
  "description": "A BTO queue number beyond supply is not a flat offer. Check your HDB result, invitation, ethnic-group availability and backup plan without inventing your odds.",
  "answer": "You may still be invited to book if flats remain when your turn comes, but a queue number beyond supply does not guarantee a flat. Check the supply pool stated in your HDB result, your application status and any booking invitation. Then verify current availability for your ethnic group and keep an affordable backup plan.",
  "sections": [
    {
      "heading": "Compare your queue number with the right supply pool",
      "paragraphs": [
        "Start with the result for your own application: sales exercise, town or estate, flat type or application category, queue position and the supply figure HDB gives you. Do not compare a 4-room queue with the total of every flat type in a project, or add nearby projects that are outside your application.",
        "HDB's June 2026 administrative details explain that applicants can be shortlisted beyond 100% and potentially up to 200% of supply, with relevant quotas taken into account. Shortlisting gives a queue position; it is not a booking or a success probability. Use your own exercise conditions rather than treating one launch's figures as a universal rule."
      ],
      "sources": [
        {
          "title": "HDB: June 2026 BTO administrative details, paragraphs4 and10 (17 June 2026)",
          "href": "https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260617-HDB-Launches-6952-Flats-Across-7-Projects-in-June-2026-BTO-Sales-Exercise/Annex-B.pdf"
        }
      ]
    },
    {
      "heading": "Example: position 360 against a supply of 300",
      "paragraphs": [
        "In a fictional application pool with 300 flats, queue position 300 is within the stated supply and position 301 is beyond it. Position 360 is 120% of that supply: 360 ÷ 300 × 100. The example assumes HDB has identified those numbers as the same relevant pool.",
        "That 120% is a ratio, not a 20% or 80% chance of getting a flat. It does not reveal which applicants ahead will book, which units will remain or what your household can select. A screenshot of another project's take-up cannot supply those missing answers.",
        "Keep three separate entries in your notes: shortlisted with a queue number; invited for an appointment; flat actually booked. Do not mark the last two as complete because the first has happened. This example illustrates interpretation, not an HDB forecast or a household eligibility decision."
      ]
    },
    {
      "heading": "Read your own status and invitation before assuming a date",
      "paragraphs": [
        "Open the official HDB Flat Portal from HDB's website and check your application's status and correspondence. If an invitation is available, record its date, the flat list and the instructions that apply to your household. Follow any request for documents or action by its stated deadline.",
        "Use the timetable for your sales exercise. For example, the June 2026 annex described December 2026 as the tentative start of that exercise's booking. That is a dated cohort example, not the appointment date for every June applicant or a timetable for a later launch.",
        "If no invitation has arrived, an unofficial appointment tracker or another applicant's message cannot confirm your appointment. Ask HDB about a missing or conflicting notice rather than treating a community estimate as an official instruction."
      ],
      "sources": [
        {
          "title": "HDB: June 2026 administrative details, paragraph11",
          "href": "https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260617-HDB-Launches-6952-Flats-Across-7-Projects-in-June-2026-BTO-Sales-Exercise/Annex-B.pdf"
        },
        {
          "title": "HDB: booking invitation and documents",
          "href": "https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/booking-of-flat"
        }
      ]
    },
    {
      "heading": "Check flats available to your household, not just the remaining total",
      "paragraphs": [
        "Check the HDB Flat Portal for availability for your ethnic group. A remaining-flat total is not a promise that a particular unit will be available to your household when your turn arrives.",
        "HDB says adding a unit to its watchlist does not reserve it: booking still depends on availability for your ethnic group at the appointment. Treat a saved preference as something to recheck, not as a unit held in your name.",
        "Keep the unit's actual price and your minimum requirements beside each possible choice. Decide together which trade-offs you could accept before appointment day. If an option exceeds the confirmed funding plan, a late queue position does not make that shortfall disappear."
      ],
      "sources": [
        {
          "title": "HDB: a watchlisted unit is not reserved",
          "href": "https://ask.gov.sg/hdb/questions/cmttq9kyu02mc4a011yrfw5bh"
        }
      ]
    },
    {
      "heading": "Check the rules before applying again, cancelling or skipping selection",
      "paragraphs": [
        "Being outside supply, receiving an invitation and declining available flats are different situations. Do not use a forum answer for one situation as permission to act in another.",
        "For the June 2026 cohort, HDB's annex restricts applicants with queue positions within supply from applying in subsequent BTO or SBF exercises until after their booking appointment. It also sets out non-selection consequences. Check the conditions governing your own exercise and applicant category before making another application or deciding not to select.",
        "If you are considering declining, ask HDB which consequences and any limited-choice waiver apply to your actual circumstances. Do not assume that being beyond supply automatically means a waiver, or that missing an appointment has no effect. Cancellation after booking is a further stage with its own conditions."
      ],
      "sources": [
        {
          "title": "HDB: June 2026 restrictions and non-selection conditions, paragraphs7–9",
          "href": "https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260617-HDB-Launches-6952-Flats-Across-7-Projects-in-June-2026-BTO-Sales-Exercise/Annex-B.pdf"
        },
        {
          "title": "HDB: changes and cancellation at different stages",
          "href": "https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/application"
        }
      ]
    },
    {
      "heading": "Keep a conditional housing plan while you wait",
      "paragraphs": [
        "Write down what you will do if no suitable flat remains: which locations are workable, the maximum confirmed budget, the wait you can manage and the facts still needed before considering another exercise. This is preparation, not an instruction to submit another application.",
        "Where To BTO can help compare project-level commute, amenities, published prices and waits. It does not show live unit inventory, reserve flats, calculate ballot chances or decide whether you can apply again. Use HDB's current records for those decisions.",
        "Before increasing your budget or giving up an acceptable location, revisit the funding plan and the household's minimum requirements. Keep an uncertain booking outcome visible as uncertain instead of turning it into a guaranteed home or a presumed rejection."
      ]
    },
    {
      "heading": "Is being beyond supply the same as being unsuccessful?",
      "paragraphs": [
        "No. A shortlisted applicant with a queue number is in a different position from an applicant told that they were not shortlisted. HDB's June 2026 annex distinguishes those outcomes. Follow the status in your own result rather than labelling every beyond-supply position a rejection."
      ],
      "sources": [
        {
          "title": "HDB: shortlisted and unsuccessful outcomes, paragraph10",
          "href": "https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260617-HDB-Launches-6952-Flats-Across-7-Projects-in-June-2026-BTO-Sales-Exercise/Annex-B.pdf"
        }
      ]
    },
    {
      "heading": "Can a queue tracker tell me my odds?",
      "paragraphs": [
        "A tracker may report other applicants' observations, but this guide has no validated model that converts those reports into your household's probability. Check official status and remaining eligible choices rather than assigning a percentage from a queue ratio."
      ]
    }
  ],
  "next": [
    {
      "title": "Keep a conditional project shortlist on the map",
      "href": "/"
    },
    {
      "title": "Plan cash and CPF by payment milestone",
      "href": "/guides/bto-cash-cpf-payment-timeline"
    },
    {
      "title": "Use the funding roadmap with your confirmed assumptions",
      "href": "/tools/bto-roadmap"
    },
    {
      "title": "Check pre-application HFE readiness separately",
      "href": "/guides/november-2026-bto-hfe-checklist"
    }
  ]
},
  {
    slug: 'cpf-oa-reserve-for-bto', publishedDate: '2026-10-19', checkedDate: '2026-10-19',
    category: 'Budget and payments',
    title: 'Should you keep $20,000 in CPF OA for your BTO?',
    description: 'Taking an HDB loan for a BTO? Compare each buyer’s $20,000 CPF OA retention option, the funding gap it can create and a separate cash emergency fund.',
    answer: 'With an HDB housing loan, each buyer can choose to retain up to $20,000 in their own CPF Ordinary Account (OA), rather than use it for the flat purchase. It is an option, not an extra payment or a compulsory minimum balance. Keeping a buffer leaves less OA for the purchase, so check the resulting loan or cash requirement before deciding.',
    sections: [
      {
        heading: 'Check the rule for your lender, not a household allowance',
        paragraphs: [
          'CPF Board says HDB-loan buyers may retain up to $20,000 in OA, with the remaining available OA savings used towards the flat before the housing loan is disbursed. A couple’s potential $40,000 buffer therefore depends on each buyer’s own balance and choice. One buyer cannot treat the other buyer’s unused allowance as permission to retain more than $20,000 under this option.',
          'Bank-loan buyers can choose to retain any amount in OA. CPF Board recommends retaining at least $20,000 as a safety net, but that recommendation is not the HDB-loan retention limit. A bank loan also has its own cash-payment requirements; keeping OA does not remove them.',
          'This guide focuses on buyers below age 55 planning an ordinary BTO purchase. Check your own CPF usage limits and HDB documents, especially if a buyer will turn 55 before purchase completion. Do not treat an online reserve input as confirmation that your savings are usable.',
        ],
        sources: [
          { title: 'CPF Board: OA retention option and timing', href: 'https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/retain-20000-in-your-oa-if-you-are-taking-a-housing-loan' },
          { title: 'CPF Board: HDB-loan and bank-loan CPF rules', href: 'https://www.cpf.gov.sg/member/infohub/educational-resources/3-differences-between-hdb-loan-and-bank-loan' },
        ],
      },
      {
        heading: 'Write down each buyer’s buffer before adding the balances',
        paragraphs: [
          'Consider a fictional couple with $50,000 in one OA and $10,000 in the other. Assume these are their own savings, are otherwise usable for this purchase and exclude grants. If the first buyer retains $20,000 and the second retains $10,000, the household keeps $30,000 in OA and has $30,000 left towards the purchase. It does not have a $40,000 reserve simply because there are two buyers.',
          'Compared with using all $60,000, this choice leaves $30,000 less for the purchase. That difference needs to be covered by other confirmed funding, such as cash or a higher approved loan within the lender’s limits. If your approved loan is already at its limit, choosing a reserve does not automatically increase it.',
          'Repeat the calculation using the balances and payments expected at your actual appointments. Keep grants, fees and amounts already paid separate. This example explains the difference between two reserve choices; it is not a complete downpayment schedule or a loan offer.',
        ],
        sources: [{ title: 'CPF Board: individual retention and monthly-instalment trade-off', href: 'https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/retain-20000-in-your-oa-if-you-are-taking-a-housing-loan' }],
      },
      {
        heading: 'Compare a housing buffer with a smaller loan',
        paragraphs: [
          'Retained OA can provide a safety net for permitted housing repayments if income is interrupted. Using more OA for the purchase instead can reduce the loan needed. Compare both plans using the same price, repayment term and rate assumption, rather than treating the reserve as free money.',
          'For each plan, record the monthly repayment, expected monthly OA additions and cash needed if one applicant’s additions stop. Then ask how long the chosen OA buffer could support the intended housing payments. Do not count the same balance as both purchase funding and a repayment reserve.',
          'CPF Board’s worked comparison shows that retaining OA can mean a larger outstanding loan and higher instalments. Your result depends on your own approved financing and repayment split. Neither an assumed future salary nor a possible grant is a confirmed way to close a funding gap.',
        ],
        sources: [{ title: 'CPF Board: how retaining OA affects instalments', href: 'https://www.cpf.gov.sg/member/infohub/educational-resources/how-much-cpf-oa-should-you-use-when-buying-your-first-home' }],
      },
      {
        heading: 'Keep the cash emergency fund separate',
        paragraphs: [
          'An OA housing buffer is not the same as cash available for groceries, renovation or a cash-only purchase payment. Keep a separate cash plan for those expenses. A household can have OA left over and still face a cash shortfall at an appointment or during a work break.',
          'Write down two different amounts: OA deliberately retained for housing or retirement, and cash protected for everyday needs and unexpected costs. Test the plan after purchase payments and renovation, not only against today’s combined account balances. The right reserve is one the household can fund without hiding another shortfall.',
        ],
        sources: [{ title: 'CPF Board: housing safety net and retirement purpose', href: 'https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/retain-20000-in-your-oa-if-you-are-taking-a-housing-loan' }],
      },
      {
        heading: 'Model the reserve once in the funding roadmap',
        paragraphs: [
          'In Where To BTO’s funding roadmap, enter the starting OA balances you expect to be usable for this plan. Open “Advanced assumptions · fees and reserves” and enter the household buffer in “Protected CPF reserve”. For the fictional couple above, that means starting balances of $50,000 and $10,000, with a $30,000 protected reserve. Do not first subtract the reserve from those starting balances and then enter it again.',
          'Keep the loan as a separate assumption and compare the cash shortfalls with and without the reserve. The roadmap does not automatically increase the loan when you protect more OA. Its reserve is a household modelling amount: it does not verify each buyer’s $20,000 limit, CPF eligibility or HDB approval. It also keeps that reserve protected in its repayment projection, rather than simulating an emergency decision to spend it.',
          'CPF Board says HDB-loan buyers must decide how much to retain at the point of purchase. Confirm how to record that choice with HDB before the relevant payment is finalised. The roadmap does not submit the instruction. Use the map to compare locations only after the funding plan still leaves room for your chosen reserves.',
        ],
        sources: [{ title: 'CPF Board: when to decide how much OA to retain', href: 'https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/retain-20000-in-your-oa-if-you-are-taking-a-housing-loan' }],
      },
    ],
    next: [
      { title: 'Compare reserve choices in the funding roadmap', href: '/tools/bto-roadmap' },
      { title: 'Plan the cash and CPF payment milestones', href: '/guides/bto-cash-cpf-payment-timeline' },
      { title: 'Compare BTO locations on the map', href: '/' },
    ],
  },
  {
    slug: 'november-2026-bto-hfe-checklist', category: 'Upcoming launches',
    publishedDate: '2026-10-18', checkedDate: '2026-10-18',
    title: 'November 2026 BTO: what if you missed the HFE date?',
    description: 'Missed HDB’s recommended 25 September HFE document date? Check your letter, pending documents and November 2026 launch readiness.',
    answer: 'Apply for an HFE letter now if you need one. HDB asked November applicants to submit their documents by 25 September 2026, but you still need a valid, issued HFE letter when submitting a flat application. A pending application cannot replace that letter, and applying now does not guarantee it will arrive in time.',
    sections: [
      { heading: 'Separate the HFE preparation date from the BTO application window', paragraphs: ['HDB moved the final 2026 BTO exercise from October to November and advised buyers to submit HFE applications and all required documents by 25 September. That preparation date is separate from the opening and closing dates of the flat sales exercise.', 'HDB’s latest supply release, displayed as published on 30 September 2026, still identifies November as the next exercise. Check the HDB Flat Portal for the actual application window; an older October preview is not the schedule to follow.'], sources: [{ title: 'HDB: November exercise and recommended HFE date (22 Aug 2026)', href: 'https://www.hdb.gov.sg/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children' }, { title: 'HDB: latest quarterly supply update', href: 'https://www.hdb.gov.sg/hdb-pulse/news/2026/20261001-Flash-Estimate-of-3rd-Quarter-2026-Resale-Price-Index-and-Upcoming-Flat-Supply' }, { title: 'HDB Flat Portal: current sales information', href: 'https://homes.hdb.gov.sg/' }] },
      { heading: 'No letter yet? Check the complete application', paragraphs: ['HDB gives a processing period of up to a month after receiving the full document set, with longer waits possible around sales exercises. Count from complete documents, not the day you started a draft or obtained a preliminary eligibility result.', 'Open My Flat Dashboard in the HDB Flat Portal. Check whether Step 2 has been submitted, whether HDB requested more documents and whether an issued letter is available. Respond to outstanding requests promptly. Keep a note of the submission date and follow up with HDB about your own case rather than assuming a queue position or approval date.', 'The Flat Portal says new HFE applications will pause during the sales application period. Do not wait for the BTO window to open before starting your HFE application.'], sources: [{ title: 'HDB: application steps, documents and processing time', href: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/application-for-an-hdb-flat-eligibility-hfe-letter' }, { title: 'HDB Flat Portal: HFE service availability', href: 'https://homes.hdb.gov.sg/' }] },
      { heading: 'Already have a letter? Check validity before starting again', paragraphs: ['An HFE letter normally lasts nine months from issue. Check its expiry date, listed household members and stated eligibility against the intended flat application. If it is approaching expiry, use HDB’s re-application instructions; do not assume the letter will renew automatically.', 'For the August 2026 income-ceiling change, HDB says existing valid letter holders already eligible for a subsidised flat or HDB loan need take no action. A household previously excluded by the old ceiling, with no flat application submitted, may cancel its letter and apply afresh. HDB then uses the new application date for the income assessment period. Check Annex B before cancelling a usable letter.'], sources: [{ title: 'HDB: HFE validity and re-application', href: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/application-for-an-hdb-flat-eligibility-hfe-letter' }, { title: 'HDB: existing HFE holders and the revised ceilings (Annex B)', href: 'https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children/Annex-B.pdf' }] },
      { heading: 'Keep the two policy start dates separate', paragraphs: ['For eligible families applying for an HFE letter from 24 August 2026, the household income ceiling increased to $16,000. The corresponding ceiling for eligible singles aged 35 and above became $8,000. These ceilings do not establish your grant amount or approved loan.', 'The additional ballot chance for each eligible Singapore Citizen child starts with the February 2027 sales exercise. Do not add those future chances to a November 2026 application.'], sources: [{ title: 'HDB: income-ceiling and ballot changes, with effective dates', href: 'https://www.hdb.gov.sg/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children' }] },
      { heading: 'Use the remaining time to make a conditional shortlist', paragraphs: ['Choose the work and caregiving destinations that matter, then compare travel trade-offs on the map. Record the price, waiting time and flat type that would make each location workable for your household. Leave a field open if HDB has not published it.', 'At launch, check each shortlisted project against the official prices, classification, flat mix, estimated wait and application dates. Use your HFE outcome and confirmed savings for the funding plan. The map and DIA calculator help you explore choices; neither issues an HFE letter nor submits a flat application.'] },
    ],
    next: [{ title: 'Build a conditional shortlist on the map', href: '/' }, { title: 'Understand DIA, HFE and grant timing', href: '/guides/dia-hfe-and-housing-grants' }, { title: 'Plan cash and CPF by payment milestone', href: '/guides/bto-cash-cpf-payment-timeline' }],
  },
  {
    slug: 'dia-hfe-and-housing-grants', category: 'Eligibility and grants',
    title: 'DIA, HFE and EHG: what gets assessed when?',
    description: 'Understand how Deferred Income Assessment relates to your HFE letter, housing grant and loan, including the July 2025 eligibility change.',
    answer: 'You still need an HFE letter to apply for a BTO. Deferred Income Assessment (DIA) lets eligible young couples have their Enhanced CPF Housing Grant (EHG) and HDB loan income assessment later. It does not lock in a grant based on student income.',
    sections: [
      { heading: 'Start with the HFE letter', paragraphs: ['The HFE letter tells you your eligibility to buy an HDB flat, receive CPF housing grants and take an HDB housing loan. Apply early enough to have a valid letter for the sales exercise; choosing a project on a map does not establish eligibility.', 'HDB says you do not need to select DIA in the HFE application. Eligible applicants are informed at flat booking. Keep that confirmation alongside your HFE letter instead of treating an online calculator result as approval.'], sources: [{title:'HDB: applying for an HFE letter',href:'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/application-for-an-hdb-flat-eligibility-hfe-letter'}, {title:'HDB: how DIA is applied',href:'https://ask.gov.sg/hdb/questions/clxsp9q6x002hdf0ebonre60c'}] },
      { heading: 'Why older Reddit answers can give the wrong eligibility rule', paragraphs: ['For applications from the July 2025 sales exercises, the study or National Service condition can be met by one party. Before that change, both parties had to meet it. HDB also sets conditions on age, first-timer status and the couple’s application arrangement.', 'The relevant study or NS status includes completion within 12 months before the HFE application. At least one party must be aged 30 or below at that point. Check the full HDB table against your actual dates, especially if employment overlaps graduation.'], sources:[{title:'HDB: current DIA eligibility at flat booking',href:booking}] },
      { heading: 'A later assessment creates uncertainty, not a promised grant', paragraphs: ['Under DIA, HDB assesses income for EHG and its housing loan nearer key collection. Do not add today’s hypothetical student-income grant to tomorrow’s hypothetical graduate-income loan and call the sum your approved budget.', 'Prepare two household budgets: one using only confirmed resources, and another with a clearly labelled grant and loan scenario. In each, write down the remaining cash and CPF needed. A future salary estimate is useful for planning but cannot confirm the final assessment.'], sources:[{title:'HDB: deferred assessment timing',href:booking}] },
      { heading: 'DIA and a smaller initial downpayment answer different questions', paragraphs: ['Income assessment determines grant and loan eligibility; the payment scheme determines when money is due. Eligible DIA couples booking an uncompleted flat can benefit from the 2.5% initial downpayment introduced from June 2024. The rest of the purchase still needs funding.', 'Before booking, ask HDB to confirm your assessment arrangement, payment schedule and documents. Keep money for stamp duty and legal fees separate from the initial downpayment. If you are comparing scenarios, use the calculator below and then check the result against HDB’s appointment advice.'], sources:[{title:'HDB: support for young couples and initial downpayment',href:'https://www.hdb.gov.sg/hdb-pulse/news/2024/greater-support-for-young-couples'}] },
    ],
    next:[{title:'Explore a DIA financing scenario',href:'/tools/dia-calculator'},{title:'Plan your cash and CPF payment timeline',href:'/guides/bto-cash-cpf-payment-timeline'}],
  },
  {
    slug:'bto-cash-cpf-payment-timeline',category:'Budget and payments',
    title:'How much cash do you need for a BTO, and when?',
    description:'Separate cash from CPF, plan the BTO booking and downpayment milestones, and avoid mistaking a 75% loan limit for a guaranteed loan.',
    answer:'There is no single cash figure for every BTO buyer. Your loan type, approved loan, usable CPF, grant and payment scheme determine the shortfall. Budget by appointment date, including fees, rather than saving only a headline downpayment percentage.',
    sections:[
      {heading:'Cash and CPF are different pots of money',paragraphs:['An HDB loan does not impose the same mandatory cash downpayment as a bank loan. CPF OA can fund the HDB downpayment, subject to applicable usage rules and available savings. For a bank loan at a 75% loan-to-value limit, the standard schedule includes at least 5% of the price in cash.', 'Write down each applicant’s usable OA and available cash separately. An amount that can be paid with CPF is not necessarily cash-free for you: insufficient usable OA leaves a cash gap.'],sources:[{title:'CPF Board: using CPF for a downpayment',href:'https://ask.gov.sg/cpf/questions/cm0f52kzb01adpz7aljdajcqw?from=relatedquestions'},{title:'HDB: payment schedule by financing option',href:lease}]},
      {heading:'Put the appointments on your savings plan',paragraphs:['At flat booking, budget for the option fee shown by HDB for your flat type. At Agreement for Lease, budget for the applicable initial downpayment, stamp duty and legal fees. At key collection, the remaining purchase price must be covered by the loan and other available funds.', 'Under the ordinary current HDB-loan schedule, the downpayment is 10% at Agreement for Lease and 15% at key collection. Staggered or deferred schemes and older application cohorts can differ. Use the schedule in your own HDB documents.'],sources:[{title:'HDB: booking a flat',href:booking},{title:'HDB: signing the Agreement for Lease',href:lease}]},
      {heading:'Worked example: a $500,000 flat with a full 75% loan',paragraphs:['Assume a $500,000 purchase, an approved $375,000 HDB loan, no grant, the ordinary 10%/15% schedule and no special payment scheme. The price contribution outside the loan totals $125,000: $50,000 at lease signing and $75,000 at keys, before accounting for amounts already paid.', 'If the approved loan is instead $325,000, the amount outside the loan becomes $175,000. That extra $50,000 is a funding gap even though the advertised loan-to-value ceiling remains 75%. This is arithmetic for planning, not a loan offer.'],sources:[{title:'HDB: loan limits and downpayment overview',href:'https://www.mynicehome.gov.sg/get-started/hdb-loans-guide/'}]},
      {heading:'Stamp duty is additional to the downpayment',paragraphs:['For a residential property with a $500,000 dutiable value, Buyer’s Stamp Duty is $9,600: $1,800 on the first $180,000, $3,600 on the next $180,000 and $4,200 on the remaining $140,000. IRAS generally uses the higher of price or market value. This example excludes legal fees and any other applicable duties.', 'Keep a separate move-in budget for renovation, furniture, appliances and your emergency reserve. Test the plan against a lower loan or slower savings growth before increasing your maximum project price.'],sources:[{title:'IRAS: current stamp duty rates',href:'https://www.iras.gov.sg/quick-links/tax-rates/stamp-duty'},{title:'CPF Board: other HDB purchase expenses',href:'https://www.cpf.gov.sg/member/infohub/educational-resources/hdb-option-fee-and-housing-expenses-you-should-know'}]},
    ],
    next:[{title:'Decide how much CPF OA to retain',href:'/guides/cpf-oa-reserve-for-bto'},{title:'Build your month-by-month funding roadmap',href:'/tools/bto-roadmap'},{title:'Understand DIA and grant timing',href:'/guides/dia-hfe-and-housing-grants'},{title:'Read project prices without overestimating affordability',href:'/guides/understanding-bto-price-and-wait-data'}],
  },
  {
    slug:'standard-plus-prime-bto-restrictions',category:'Ownership commitments',
    title:'Standard, Plus or Prime BTO: what are you committing to?',
    description:'Compare the ownership commitments behind Standard, Plus and Prime BTO flats: MOP, whole-flat rental and subsidy recovery on resale.',
    answer:'For an ordinary new 99-year flat, Standard usually means a five-year Minimum Occupation Period; Plus and Prime mean ten years and tighter conditions. Compare those commitments with your plans for living there, alongside the location and price.',
    sections:[
      {heading:'The waiting time is separate from the MOP',paragraphs:['HDB starts the Minimum Occupation Period (MOP) from legal completion of the purchase, not your BTO application. Periods when you do not physically live in the flat can be excluded. Construction waiting time therefore does not run down the occupation requirement.', 'For a planning illustration, four years from application to legal completion followed by a ten-year MOP is about fourteen years from application before ordinary resale eligibility. It is not a forecast for a particular launch. Use the published wait as an estimate, then keep the occupation period separate.'],sources:[{title:'HDB: MOP and conditions after purchase',href:'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/conditions-after-buying-a-new-flat'}]},
      {heading:'Whole-flat rental is a meaningful difference',paragraphs:['Plus and Prime owners cannot rent out the whole flat, including after MOP. Standard flats may be rented out after MOP subject to HDB’s eligibility and approval rules. Renting spare bedrooms is a different permission with its own conditions.', 'If your plan depends on working overseas while renting out the entire home, resolve this before shortlisting a Plus or Prime project. A convenient commute today does not answer whether its ownership conditions fit that future plan.'],sources:[{title:'HDB: new classification framework and rental conditions',href:'https://www.hdb.gov.sg/hdb-pulse/news/2024/new-flat-classification-framework'}]},
      {heading:'Subsidy recovery is not simply a percentage of profit',paragraphs:['When you sell a Plus or Prime flat bought from HDB, subsidy recovery is calculated using the higher of resale price or valuation. The project’s rate is published at launch. Do not apply one launch’s percentage to every Plus or Prime flat.', 'HDB states that subsidy recovery does not apply to resale Plus or Prime flats. That is separate from the ten-year MOP applying to their resale buyers. Subsidy recovery can also be separate from a resale levy due when buying another subsidised flat.'],sources:[{title:'HDB: subsidy recovery and resale levy',href:'https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/conditions-after-buying-a-new-flat'}]},
      {heading:'Use a household decision test, not a tier ranking',paragraphs:['Write down your likely work locations, caregiving trips and space needs over a longer stay. Then ask whether you would still choose the project if you stayed beyond MOP. Give both applicants a chance to name a circumstance that would make moving necessary.', 'For each shortlisted project, record the classification, launch-specific subsidy recovery rate and official conditions beside its price and commute. Leave unpublished fields unknown. Short-lease 2-room Flexi flats, Community Care Apartments and special schemes have different conditions; do not apply this ordinary-flat comparison to them.'],sources:[{title:'HDB: official classification comparison',href:'https://www.hdb.gov.sg/-/media/hdb-pulse/news/2024/oct-bto-launch/Annex-A.pdf'}]},
    ],
    next:[{title:'Compare BTO locations for your household',href:'/guides/how-to-choose-a-bto-location'},{title:'Check each project’s official records',href:'/bto-projects'}],
  },
];
