import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { REDDIT_GUIDES, PRACTICAL_GUIDES_CHECKED } from '@/data/reddit-guides';
import { absoluteUrl } from '@/lib/site';

interface Props { params: Promise<{ guide: string }> }
export const dynamicParams = false;
export function generateStaticParams() {
  return REDDIT_GUIDES.map(({ slug }) => ({ guide: slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guide } = await params;
  const article = REDDIT_GUIDES.find(({ slug }) => slug === guide);
  if (!article) return {};
  const url = `/guides/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: { title: `${article.title} | Where To BTO`, description: article.description, url, type: 'article', publishedTime: PRACTICAL_GUIDES_CHECKED, modifiedTime: PRACTICAL_GUIDES_CHECKED },
  };
}
export default async function PracticalGuidePage({ params }: Props) {
  const { guide } = await params;
  const article = REDDIT_GUIDES.find(({ slug }) => slug === guide);
  if (!article) notFound();
  return <>
    <JsonLd value={{ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, datePublished: PRACTICAL_GUIDES_CHECKED, dateModified: PRACTICAL_GUIDES_CHECKED, mainEntityOfPage: absoluteUrl(`/guides/${article.slug}`), publisher: { '@type': 'Organization', name: 'Where To BTO', url: absoluteUrl('/') } }} />
    <main className="content-main narrow-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>{article.category}</span></nav>
      <article>
        <header className="content-hero"><h1>{article.title}</h1><p>{article.answer}</p><p className="data-line">Published and sources checked <time dateTime={PRACTICAL_GUIDES_CHECKED}>7 Sep 2026</time> · Confirm your own terms with HDB</p></header>
        <div className="article-body">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.sources && <p className="data-line">Official sources: {section.sources.map((source, index) => <span key={source.href}>{index > 0 && ' · '}<a href={source.href} rel="noreferrer">{source.title} ↗</a></span>)}</p>}</section>)}</div>
        <aside className="official-callout"><strong>Use your household’s confirmed figures</strong><p>This independent guide explains planning decisions. Your HFE letter, HDB appointment documents and applicable official conditions determine your eligibility and payments.</p></aside>
        <section className="article-next"><h2>Continue planning</h2>{article.next.map((next) => <Link key={next.href} href={next.href}>{next.title} <span>→</span></Link>)}<Link href="/guides">All BTO guides <span>→</span></Link></section>
      </article>
    </main>
  </>;
}
