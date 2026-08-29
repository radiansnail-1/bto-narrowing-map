import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'What to Check Within 1 km of a BTO',
  description: 'Check whether nearby transport, food, healthcare, schools, parks, and shopping are genuinely useful before choosing a BTO location.',
  alternates: { canonical: '/guides/checking-amenities-near-a-bto' },
};

const sections = [
  ['Begin with daily needs', 'List the places you expect to use every week. Groceries, affordable meals, a clinic, childcare or school, exercise space, and transport may matter more than a long list of occasional destinations.'],
  ['Treat 1 km as context, not a walking promise', 'The circle on Where To BTO is approximate straight-line context. It does not follow gates, crossings, slopes, construction areas, sheltered links, or the actual route from a future block entrance.'],
  ['Check usefulness, not icon count', 'Two neighbourhoods can show the same amenity category but work very differently. A large supermarket is not equivalent to a convenience shop, and a popular hawker centre may not serve the hours or diet you need.'],
  ['Verify capacity and access rules', 'School admission depends on current rules and vacancies. Clinics, sports facilities, childcare, and parking can have capacity or booking constraints. Proximity alone does not guarantee access.'],
  ['Separate existing and planned places', 'A planned station, mall, park, or community facility can improve a future neighbourhood, but timing may change. Record whether each important amenity exists now, is under construction, or is only announced.'],
  ['Visit at the relevant time', 'Walk the area around meal time, after rain, at night, or during the school run if those conditions affect you. Note crossings, lighting, noise, gradients, shelter, and how the route feels rather than relying only on map distance.'],
] as const;

export default function AmenityGuidePage() {
  const url = absoluteUrl('/guides/checking-amenities-near-a-bto');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: metadata.title, description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Amenities</span></nav>
      <article>
        <header className="content-hero"><h1>What to check within 1 km of a BTO</h1><p>Nearby amenities are useful only when they fit your routines, routes, timing, and access needs.</p><p className="data-line">Updated 29 Aug 2026 · 5 minute read</p></header>
        <div className="article-body">{sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</div>
        <aside className="content-callout"><h2>Inspect each project’s context</h2><p>Select a mapped BTO site to see its approximate 1 km boundary and curated nearby amenities.</p><Link className="primary-link" href="/">Open the map</Link></aside>
        <section className="article-next"><h2>Next reads</h2><Link href="/guides/comparing-bto-commutes">Compare complete commutes <span>→</span></Link><Link href="/methodology">Read the amenity-data limits <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
