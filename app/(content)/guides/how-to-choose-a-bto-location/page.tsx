import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GuideArticleBody } from '@/components/GuideArticleBody';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Choose a BTO Location',
  description: 'A practical checklist for comparing Singapore BTO locations by commute, recurring trips, nearby amenities, budget, waiting time, and unpublished facts.',
  alternates: { canonical: '/guides/how-to-choose-a-bto-location' },
  openGraph: { title: 'How to Choose a BTO Location | Where To BTO', description: 'Build a transparent BTO shortlist without a hidden overall score.', url: '/guides/how-to-choose-a-bto-location', type: 'article' },
};

const sections = [
  ['1. Start with the trips you repeat', 'List the places that will shape an ordinary week: work, parents or caregivers, school, worship, healthcare, and recurring activities. A central location is not automatically convenient if it is far from the trips you actually make.'],
  ['2. Separate map distance from journey time', 'Straight-line distance is useful for a first screen, but transfers, walking routes, bus frequency, and peak conditions can change the real trip. Use the map to narrow; use an official journey planner to validate the remaining options.'],
  ['3. Choose amenity groups, not a giant wish list', 'Identify up to three groups that would materially change daily life: MRT, food and shopping, healthcare, schools, or parks and recreation. Treat a missing curated record as incomplete evidence, not proof that an area lacks the amenity.'],
  ['4. Compare the right flat type and published price', 'A project only has a useful budget comparison when HDB has published the chosen flat type and its starting price. Starting prices do not include your full financing position, grants, optional components, or later transaction costs.'],
  ['5. Decide how much waiting time matters', 'Published waiting time can be a real constraint if you need housing sooner. It should be considered alongside interim living arrangements and life plans, but an unpublished wait should remain an open question rather than an optimistic assumption.'],
  ['6. Keep unknowns visible', 'Upcoming launches may lack a name, exact coordinate, classification, flat mix, price, or wait. Put those projects in an “awaiting data” lane and revisit them when HDB publishes the sales exercise details.'],
  ['7. Make the trade-off explicit', 'A good shortlist is not the highest-scoring list. It is a small set where each project’s advantages, confirmed misses, and unknowns are easy for both applicants to explain.'],
] as const;

export default function LocationGuidePage() {
  const url = absoluteUrl('/guides/how-to-choose-a-bto-location');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Choose a BTO Location', description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Location checklist</span></nav>
      <article>
        <header className="content-hero"><h1>How to compare BTO locations</h1><p>Use a sequence of real constraints to get from “every launch looks possible” to a shortlist with visible trade-offs.</p><p className="data-line">Updated 29 Aug 2026 · 6 minute read</p></header>
        <section className="article-intro"><p>The location question is personal, but the comparison method can still be rigorous. Keep each criterion separate, distinguish confirmed misses from missing data, and validate the shortlist against official sources.</p></section>
        <GuideArticleBody sections={sections} />
        <aside className="content-callout"><h2>Turn the checklist into a shortlist</h2><p>Answer four questions on the map. Each confirmed miss dims a project by exactly 23 percentage points; unknown facts remain neutral.</p><Link className="primary-link" href="/">Start narrowing</Link></aside>
        <section className="article-next"><h2>Next reads</h2><Link href="/guides/understanding-bto-price-and-wait-data">Understand published prices and waiting times <span>→</span></Link><Link href="/methodology">See the complete matching methodology <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
