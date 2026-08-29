import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { FAQ_ITEMS } from '@/data/faq';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'BTO Map and Data FAQ',
  description: 'Answers about Where To BTO, its 1 km amenity context, budget and commute matching, official HDB sources, missing project facts, and eligibility limitations.',
  alternates: { canonical: '/faq' },
  openGraph: { title: 'BTO Map and Data FAQ | Where To BTO', description: 'How the independent BTO comparison map works and where its limits are.', url: '/faq' },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        url: absoluteUrl('/faq'),
        mainEntity: FAQ_ITEMS.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }} />
      <main className="content-main narrow-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>FAQ</span></nav>
        <header className="content-hero"><h1>About the BTO map and its data</h1><p>Clear answers about what Where To BTO does, how the four criteria work, and which decisions still belong on official HDB services.</p></header>
        <section className="faq-list" aria-label="Questions and answers">{FAQ_ITEMS.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<span aria-hidden="true">+</span></summary><div><p>{item.answer}</p>{index === 1 && <p><a href="https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/finding-a-new-flat" rel="noreferrer">Open HDB’s official new-flat guidance</a>.</p>}</div></details>)}</section>
        <aside className="content-callout"><h2>Still comparing locations?</h2><p>Use the map to answer only the criteria that matter to you, then inspect the grouped results without a hidden ranking.</p><Link className="primary-link" href="/">Open the interactive map</Link></aside>
      </main>
    </>
  );
}
