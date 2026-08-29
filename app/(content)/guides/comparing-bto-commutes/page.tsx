import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GuideArticleBody } from '@/components/GuideArticleBody';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Compare Commutes Before Choosing a BTO',
  description: 'A practical way to compare BTO commutes using repeated journeys, first- and last-mile access, transfers, peak conditions, and official journey planners.',
  alternates: { canonical: '/guides/comparing-bto-commutes' },
};

const sections = [
  ['Start with an ordinary week', 'Write down the journeys each applicant repeats: workplace, parents or caregivers, school, medical appointments, and regular evening or weekend commitments. A location can be close to the CBD and still be inconvenient for your actual week.'],
  ['Use straight-line distance only as a first screen', 'Where To BTO uses straight-line distance to workplace hubs. It does not calculate travel time. Rail alignment, interchange walking, bus frequency, road congestion, and the route from the block to the station can all change the real journey.'],
  ['Check the first and last kilometre', 'Look beyond the nearest station name. Check how you reach it, whether the walking route is sheltered, whether a feeder bus is needed, and how far the destination is from the station at the other end.'],
  ['Count transfers, not just stops', 'A journey with one reliable transfer may be easier than a shorter route with several tight connections. Trace the complete trip in a current journey planner and note where a missed connection adds a long wait.'],
  ['Test the time you will actually travel', 'Compare weekday peak conditions if that is when you commute. If work hours change, check the early morning or late evening service pattern too. A weekend test ride can understate weekday crowding and delays.'],
  ['Compare both applicants separately', 'Do not average two very different journeys into one number. Keep each commute visible, decide whose travel is less flexible, and make the trade-off explicit before ranking locations.'],
] as const;

export default function CommuteGuidePage() {
  const url = absoluteUrl('/guides/comparing-bto-commutes');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: metadata.title, description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Commutes</span></nav>
      <article>
        <header className="content-hero"><h1>How to compare commutes before choosing a BTO</h1><p>A commute check should describe the complete weekly journey, not just the nearest station or distance to the city centre.</p><p className="data-line">Updated 29 Aug 2026 · 5 minute read</p></header>
        <GuideArticleBody sections={sections} />
        <aside className="content-callout"><h2>Start with a rough screen</h2><p>The map can compare up to two preset workplace hubs or one custom point. Validate the final shortlist with current routing information.</p><Link className="primary-link" href="/">Compare workplace locations</Link></aside>
        <section className="article-next"><h2>Next reads</h2><Link href="/guides/how-to-choose-a-bto-location">Build a location shortlist <span>→</span></Link><Link href="/methodology">See how workplace matching works <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
