import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GuideArticleBody } from '@/components/GuideArticleBody';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Handle Unpublished BTO Information',
  description: 'Understand which BTO facts may be missing before a sales launch and how to compare upcoming projects without inventing precision.',
  alternates: { canonical: '/guides/handling-unpublished-bto-information' },
};

const sections = [
  ['An announced area is not a complete project record', 'HDB may announce a town or future supply before publishing the project name, exact site, classification, flat mix, starting prices, or estimated waiting time. Early information is useful for planning, but it cannot answer every comparison question.'],
  ['“Unknown” is different from “no”', 'If a coordinate or price has not been published, the project should not fail that criterion. Where To BTO keeps the result neutral until a defensible value is available.'],
  ['Do not borrow facts from a nearby project', 'Two projects in the same town can have different flat types, classifications, prices, waiting times, and access routes. A previous launch can provide context, but its facts should not be copied into an upcoming project.'],
  ['Keep a dated question list', 'For each possible launch, write down the missing facts that would change your decision. Check them again when the sales exercise material is released instead of relying on an old screenshot or memory.'],
  ['Use the live HDB page as the decision gate', 'Before applying, confirm the project page, flat types, eligibility requirements, prices, estimated timeline, and application dates on HDB. A comparison site can organise published facts but should not replace the official transaction path.'],
] as const;

export default function UnknownDataGuidePage() {
  const url = absoluteUrl('/guides/handling-unpublished-bto-information');
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: metadata.title, description: metadata.description, datePublished: '2026-08-29', dateModified: '2026-08-29', mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>Unpublished information</span></nav>
      <article>
        <header className="content-hero"><h1>How to handle BTO information HDB has not published yet</h1><p>Keep missing facts visible. Do not turn an early announcement into a more precise project than the source supports.</p><p className="data-line">Updated 29 Aug 2026 · 4 minute read</p></header>
        <GuideArticleBody sections={sections} />
        <aside className="content-callout"><h2>See what is known today</h2><p>Project pages separate published values from fields that HDB has not released yet and link back to their sources.</p><Link className="primary-link" href="/bto-projects">Browse project records</Link></aside>
        <section className="article-next"><h2>Next reads</h2><Link href="/guides/understanding-bto-price-and-wait-data">Read prices and waiting times carefully <span>→</span></Link><Link href="/methodology">See how unknowns affect matching <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
