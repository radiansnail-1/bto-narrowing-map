import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GuideArticleBody } from '@/components/GuideArticleBody';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Understanding BTO Prices and Waiting Times',
  description: 'Understand what published BTO starting prices and estimated waiting times mean, what they omit, and how Where To BTO handles unpublished HDB facts.',
  alternates: { canonical: '/guides/understanding-bto-price-and-wait-data' },
  openGraph: { title: 'Understanding BTO Prices and Waiting Times | Where To BTO', description: 'Read BTO price and wait data without turning incomplete facts into false precision.', url: '/guides/understanding-bto-price-and-wait-data', type: 'article' },
};

const sections = [
  ['Starting price is a project fact, not a household budget', 'Where To BTO compares your maximum against HDB’s published starting price for the selected flat type. It does not calculate grants, loan eligibility, downpayment timing, optional components, renovation, or other household costs. A “pass” means only that the published starting price is within your screen.'],
  ['Flat type must match', 'A low starting price for a 2-room Flexi flat says nothing about whether the same project fits a 4-room budget. The tool requires the selected flat type to be present before it can make a price comparison.'],
  ['Waiting time is an estimate', 'Where HDB publishes one number, the tool displays that estimate. Where the source gives a range, the range stays intact. Estimated completion dates and waiting-time estimates are not rewritten as guaranteed key-collection dates.'],
  ['Upcoming launches contain real unknowns', 'An announcement can identify a town or future site before HDB publishes the project name, classification, exact coordinate, flat mix, prices, or wait. Those fields display “Not published by HDB yet” and remain neutral in matching.'],
  ['Classification is not a quality score', 'Standard, Plus, and Prime are published project classifications with policy implications. Where To BTO presents the field as a fact and does not convert it into a recommendation or hidden weighting.'],
  ['Use the official decision gate', 'Before applying, check the live HDB project page and your HDB Flat Eligibility letter. The independent map is a shortlist tool, not an eligibility, grant, loan, or application service.'],
] as const;

export default function DataGuidePage() {
  const url = absoluteUrl('/guides/understanding-bto-price-and-wait-data');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Understanding BTO Prices and Waiting Times', description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Price and wait data</span></nav>
      <article>
        <header className="content-hero"><h1>How to read BTO price and waiting-time data</h1><p>Published figures are useful screens, but they answer narrower questions than “Can we afford this?” or “When can we move in?”</p><p className="data-line">Updated 29 Aug 2026 · 5 minute read · Confirm current figures with HDB</p></header>
        <GuideArticleBody sections={sections} />
        <aside className="official-callout"><strong>Official next step</strong><p>HDB says a valid HFE letter is required to apply in a sales exercise and recommends applying early.</p><a href="https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/finding-a-new-flat" rel="noreferrer">Read HDB’s finding-a-new-flat guidance <span>↗</span></a></aside>
        <section className="article-next"><h2>Use the data</h2><Link href="/bto-projects">Browse project fact pages <span>→</span></Link><Link href="/">Compare projects on the map <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
