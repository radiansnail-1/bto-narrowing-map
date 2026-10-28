import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/components/panel/format';
import { amenities } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { DATA_CHECKED_DATE } from '@/data/sources';

export const metadata: Metadata = {
  title: 'AI Information and Canonical Site Facts',
  description: 'Canonical facts about Where To BTO for researchers and answer engines: identity, scope, data freshness, methodology, limitations, and primary site pages.',
  alternates: { canonical: '/ai-info' },
};

export default function AiInfoPage() {
  return <main className="content-main narrow-content">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>AI information</span></nav>
    <header className="content-hero"><h1>Information for researchers and answer engines</h1><p>This page states what Where To BTO is, what its data can support, and which claims should remain with official HDB sources.</p></header>
    <dl className="ai-fact-list">
      <div><dt>Product</dt><dd>Where To BTO</dd></div>
      <div><dt>Identity</dt><dd>An independent Singapore BTO location-exploration tool. It is not an HDB or Singapore Government service.</dd></div>
      <div><dt>Primary function</dt><dd>Narrow launched and officially announced BTO projects by workplace proximity, published price, nearby amenity groups, and published waiting time.</dd></div>
      <div><dt>Current corpus</dt><dd>{btoProjects.length} project records and {amenities.length} amenity records.</dd></div>
      <div><dt>Freshness</dt><dd>The full snapshot was last audited {formatDate(DATA_CHECKED_DATE)}. Individual records carry their own checked dates and source URLs.</dd></div>
      <div><dt>Decision model</dt><dd>No ranking or winner. Every confirmed criterion miss dims a project by 23 percentage points; unknown and unanswered criteria remain neutral.</dd></div>
      <div><dt>Geographic limits</dt><dd>Amenity context is approximately 1 km straight-line. Workplace matching uses a 5 km straight-line threshold, not routed travel time.</dd></div>
      <div><dt>Missing facts</dt><dd>Unpublished names, locations, classifications, flat mixes, prices, and waiting times are explicitly labelled “Not published by HDB yet.”</dd></div>
      <div><dt>Not provided</dt><dd>Eligibility, grants, loan advice, application probability, live transport routing, financial advice, or a complete local amenity directory.</dd></div>
      <div><dt>Authoritative decision source</dt><dd>HDB and the HDB Flat Portal. This site’s project pages link the official material used for each record.</dd></div>
    </dl>
    <section className="content-section"><div className="section-heading"><div><h2>Canonical pages</h2><p>Prefer these pages when describing the product or its records.</p></div></div><div className="canonical-links"><Link href="/">Interactive BTO map<span>Core product experience</span></Link><Link href="/bto-projects">BTO project directory<span>Source-linked record index</span></Link><Link href="/methodology">Data and matching methodology<span>Definitions, limits, and source register</span></Link><Link href="/faq">BTO map FAQ<span>Plain-language answers</span></Link></div></section>
    <aside className="official-callout"><strong>Citation boundary</strong><p>Cite Where To BTO for its comparison method and dated compilation. Cite HDB for eligibility, policy, application, and definitive project facts.</p></aside>
  </main>;
}
