export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Where To BTO?',
    answer: 'Where To BTO is an independent location-exploration tool for comparing launched and officially announced Singapore BTO projects. It helps you narrow the list by commute, budget, nearby amenities, and published waiting time without creating a hidden overall score.',
  },
  {
    question: 'Is Where To BTO an official HDB or Singapore Government service?',
    answer: 'No. It is an independent tool. Project pages link to the HDB material used for each record, and applicants should confirm every material detail in the HDB Flat Portal before making a housing decision.',
  },
  {
    question: 'How does the BTO matching work?',
    answer: 'The map checks four criteria independently: workplace proximity, published flat price, selected amenity groups, and published waiting time. Every confirmed miss dims a project by 23 percentage points. Unanswered criteria and facts that HDB has not published remain neutral.',
  },
  {
    question: 'Does the tool rank BTO projects or choose a winner?',
    answer: 'No. Results are grouped into projects that fit all answered criteria, projects that could fit but are awaiting published facts, and projects with confirmed trade-offs. Projects keep their source order within each group.',
  },
  {
    question: 'What does the approximate 1 km area mean?',
    answer: 'It is a straight-line map context around the selected BTO coordinate, used to show the curated amenities associated with that project. It is not a walking route, travel-time isochrone, or guarantee that every entrance is within a 1 km journey.',
  },
  {
    question: 'Are commute times live public-transport estimates?',
    answer: 'No. Preset workplace matching uses straight-line distance to one or two selected workplace anchors, with a 5 km threshold. A custom workplace pin uses the same rule. The tool does not claim live or routed travel times.',
  },
  {
    question: 'How is the budget criterion calculated?',
    answer: 'For the selected flat type, a project passes when HDB has published a starting price at or below the chosen maximum. This is not a financing, grant, affordability, or final purchase-cost calculation.',
  },
  {
    question: 'Why do some facts say “Not published by HDB yet”?',
    answer: 'Some announced projects do not yet have a published name, exact location, classification, price, flat mix, or waiting time. The tool leaves those fields empty and neutral instead of estimating or inventing them.',
  },
  {
    question: 'How current is the project information?',
    answer: 'Every project record carries a checked date and source links. The site also shows the latest full snapshot audit date. BTO information changes, so the linked HDB sources remain authoritative.',
  },
  {
    question: 'Can Where To BTO determine whether I am eligible to apply?',
    answer: 'No. Eligibility, grants, and housing-loan options depend on your household and current HDB rules. Use HDB’s official eligibility guidance and obtain the required HDB Flat Eligibility letter.',
  },
];
