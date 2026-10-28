import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/components/panel/format';
import { btoProjects } from '@/data/bto-projects';
import { amenities } from '@/data/amenities';
import { DATA_CHECKED_DATE, officialSources } from '@/data/sources';

export const metadata: Metadata = {
  title: 'Data and Matching Methodology',
  description: 'How Where To BTO sources project facts, handles unpublished HDB data, defines its approximate 1 km amenity context, and applies four equal-weight criteria.',
  alternates: { canonical: '/methodology' },
};

export default function MethodologyPage() {
  return <main className="content-main narrow-content">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>Methodology</span></nav>
    <header className="content-hero"><h1>Data and matching methodology</h1><p>The map narrows a shortlist. It does not predict applications, rank neighbourhoods, or replace official HDB information.</p><p className="data-line">{btoProjects.length} project records · {amenities.length} amenity records · Snapshot audited {formatDate(DATA_CHECKED_DATE)}</p></header>
    <div className="article-body">
      <section><h2>Official facts and visual context are separate</h2><p>Project facts come from a dated static snapshot linked to HDB, OneMap, and agency datasets. The 3D city is orientation context built from processed URA and OpenStreetMap geometry; it does not alter project facts.</p></section>
      <section><h2>Missing information stays missing</h2><p>If HDB has not published a project name, classification, coordinate, flat mix, price, or waiting time, the field remains empty and the page says “Not published by HDB yet.” The matching result for that criterion is neutral rather than pass or miss.</p></section>
      <section><h2>Four criteria, equal visual treatment</h2><p>Commute, budget, nearby amenities, and waiting time are evaluated independently. Every confirmed miss reduces the project opacity by exactly 23 percentage points: 100%, 77%, 54%, 31%, then 8%. Selection adds an outline but never restores opacity.</p></section>
      <section><h2>Workplace proximity is straight-line only</h2><p>Users may select up to two workplace anchors or place one custom pin. A project passes the screen when its available coordinate is within 5 km straight-line distance of the selected point or points. This is not travel time or routing.</p></section>
      <section><h2>Amenity context is approximate</h2><p>The selected project displays an approximate 1 km straight-line context. A chosen amenity group passes when at least one curated record in that group is attached to the project snapshot. The list is not a complete commercial or civic directory.</p></section>
      <section><h2>Results are grouped, never ranked</h2><p>Projects are shown as fits, awaiting published data, or trade-offs. There is no winner, composite score, probability, or hidden weighting. Snapshot order is preserved inside each group.</p></section>
      <section><h2>Media never affects matching</h2><p>Open-licence amenity photographs are stored in a separate manifest with creator, licence, and source. When no defensible licensed image was found, the detail view shows an explicit no-photo state.</p></section>
    </div>
    <section className="content-section"><div className="section-heading"><div><h2>Source register</h2><p>Primary sources recorded in the checked snapshot.</p></div><span>{officialSources.length}</span></div><ul className="source-register">{officialSources.filter((source) => source.id !== 'data-gov-bus').map((source) => <li key={source.id}><div><strong>{source.agency}</strong><span>Checked {formatDate(source.checkedDate)}</span></div><a href={source.url} rel="noreferrer">{source.title} <span>↗</span></a></li>)}</ul></section>
    <aside className="content-callout"><h2>Inspect the records directly</h2><p>Each project page shows its exact published fields, missing fields, check date, and source URLs.</p><Link className="primary-link" href="/bto-projects">Browse BTO projects</Link></aside>
  </main>;
}
