import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GuideArticleBody } from '@/components/GuideArticleBody';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Use Where To BTO',
  description: 'A short, practical walkthrough for narrowing BTO projects, understanding the result groups, building a shortlist, and checking official HDB information before applying.',
  alternates: { canonical: '/guides/start-here' },
};

const steps = [
  ['1. Start with what you know', 'Answer any of the four optional questions: regular destinations, HDB published starting price, nearby amenity groups, and how long you can wait. Skip a question if the answer is not known yet. A skipped criterion stays out of matching.'],
  ['2. Read groups, not a score', 'Results are grouped into fits all criteria, could fit while awaiting published data, and has trade-offs. Projects are not ranked. A confirmed miss dims the map, while unknown and unanswered facts stay neutral.'],
  ['3. Open the reason', 'Every result shows the status and a plain-language reason for each criterion. A pass means the published record fits the screen; a miss identifies the trade-off; awaiting data means HDB has not published enough to decide.'],
  ['4. Save a small shortlist', 'Add two to four projects to Your shortlist. The comparison table keeps launch stage, commute status, published price, screened amenities, and estimated wait visible together without inventing a composite recommendation.'],
  ['5. Verify before applying', 'Use the linked HDB sources to check the live sales exercise, flat types, prices, eligibility, HFE, application dates, and estimated timeline. This tool organises a dated record; it is not an HDB application or eligibility service.'],
] as const;

export default function StartHereGuidePage() {
  const url = absoluteUrl('/guides/start-here');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Use Where To BTO', description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Start here</span></nav>
      <article>
        <header className="content-hero"><h1>How to use Where To BTO</h1><p>A short walkthrough from first question to a small, explainable BTO shortlist.</p><p className="data-line">Updated 29 Aug 2026 · 3 minute read</p></header>
        <section className="article-intro"><p>Where To BTO is a transparent first screen. It helps you organise the constraints that matter in an ordinary week, then shows which project facts are confirmed, missing, or a trade-off. It does not calculate eligibility, financing, or routed travel times.</p></section>
        <GuideArticleBody sections={steps} />
        <aside className="content-callout"><h2>Try the flow</h2><p>Answer only the questions you can answer today. You can return to this guide and the map will keep your saved answers, results, project view, and shortlist on this device.</p><Link className="primary-link" href="/">Start narrowing</Link></aside>
        <section className="article-next"><h2>Next reads</h2><Link href="/guides/how-to-choose-a-bto-location">Build a location shortlist <span>→</span></Link><Link href="/guides/handling-unpublished-bto-information">Handle unpublished project information <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
