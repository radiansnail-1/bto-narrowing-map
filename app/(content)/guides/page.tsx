import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/data/guides';

export const metadata: Metadata = {
  title: 'BTO Comparison Guides',
  description: 'Answers to common BTO questions about DIA, HFE, downpayments, CPF, Standard/Plus/Prime flats, commute and choosing a location.',
  alternates: { canonical: '/guides' },
};

export default function GuidesPage() {
  return <main className="content-main">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>Guides</span></nav>
    <header className="content-hero"><h1>BTO comparison guides</h1><p>Clear answers to the questions couples ask before applying: payments, DIA, grants, flat restrictions, commute and choosing a location.</p></header>
    <section className="guide-list" aria-label="BTO guides">{GUIDES.map((guide) => <article className="guide-row" key={guide.href}><span>{guide.category}</span><div><h2><Link href={guide.href}>{guide.title}</Link></h2><p>{guide.description}</p></div><Link href={guide.href} aria-label={`Read ${guide.title}`}><span aria-hidden="true">→</span></Link></article>)}</section>
    <aside className="content-callout"><h2>Planning around Deferred Income Assessment?</h2><p>Model the payment at signing, future loan, and cash or CPF needed at key collection.</p><Link className="secondary-link" href="/tools/dia-calculator">Try the DIA calculator</Link></aside>
    <aside className="content-callout"><h2>Want the underlying records?</h2><p>Each project page carries its checked date, explicit missing fields, and direct HDB source links.</p><Link className="secondary-link" href="/bto-projects">Browse all project records</Link></aside>
  </main>;
}
