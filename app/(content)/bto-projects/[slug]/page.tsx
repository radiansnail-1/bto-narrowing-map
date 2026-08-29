import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { formatDate, NOT_PUBLISHED, waitingText } from '@/components/panel/format';
import { amenities } from '@/data/amenities';
import { btoProjects, projectById } from '@/data/bto-projects';
import { AMENITY_GROUP_ORDER, AMENITY_GROUPS } from '@/lib/amenity-groups';
import { absoluteUrl } from '@/lib/site';

interface ProjectPageProps { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return btoProjects.map((project) => ({ slug: project.id }));
}

function conciseName(name: string): string {
  return name.replace(/ — .+$/, '');
}

function descriptionFor(slug: string): string {
  const project = projectById.get(slug);
  if (!project) return 'Singapore BTO project information.';
  const location = project.town ?? project.region;
  return `${project.name} in ${location}: published HDB launch status, flat types, prices, waiting time, nearby amenities, location context, and official source links.`;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectById.get(slug);
  if (!project) return {};
  const title = `${conciseName(project.name)} BTO`;
  const description = descriptionFor(slug);
  return {
    title,
    description,
    alternates: { canonical: `/bto-projects/${project.id}` },
    openGraph: { title: `${title} | Where To BTO`, description, url: `/bto-projects/${project.id}`, type: 'article' },
  };
}

function money(value: number | null): string {
  return value === null ? NOT_PUBLISHED : new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }).format(value);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projectById.get(slug);
  if (!project) notFound();

  const nearby = amenities.filter((amenity) => project.amenityIds.includes(amenity.id));
  const related = btoProjects.filter((candidate) => candidate.id !== project.id && (candidate.town === project.town || candidate.region === project.region)).slice(0, 4);
  const canonicalUrl = absoluteUrl(`/bto-projects/${project.id}`);

  return (
    <>
      <JsonLd value={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${conciseName(project.name)} BTO`,
          description: descriptionFor(project.id),
          url: canonicalUrl,
          dateModified: project.checkedDate,
          isPartOf: { '@type': 'WebSite', name: 'Where To BTO', url: absoluteUrl('/') },
          about: { '@type': 'Place', name: project.name, address: { '@type': 'PostalAddress', addressLocality: project.town ?? project.region, addressCountry: 'SG' } },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Map', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'BTO projects', item: absoluteUrl('/bto-projects') },
            { '@type': 'ListItem', position: 3, name: project.name, item: canonicalUrl },
          ],
        },
      ]} />
      <main className="content-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><Link href="/bto-projects">Projects</Link><span>/</span><span>{conciseName(project.name)}</span></nav>
        <article>
          <header className="content-hero project-hero">
            <div className="project-hero-line"><span>{project.launchLabel}</span><span className={`status-pill status-${project.launchStatus}`}>{project.launchStatus === 'launched' ? 'Launched' : project.launchStatus === 'planned' ? 'Planned' : 'Upcoming'}</span></div>
            <h1>{project.name}</h1>
            <p>{project.summary}</p>
            <div className="hero-actions"><Link className="primary-link" href="/">Compare on the interactive map</Link><Link className="secondary-link" href={project.position ? '/guides/checking-amenities-near-a-bto' : '/guides/handling-unpublished-bto-information'}>{project.position ? 'Check the nearby context' : 'Understand unpublished facts'}</Link><Link className="secondary-link" href="/guides/understanding-bto-price-and-wait-data">Read price and wait guidance</Link></div>
            <p className="data-line">Record checked {formatDate(project.checkedDate)} · Confirm all facts with HDB</p>
          </header>

          <section className="content-section" aria-labelledby="facts-heading">
            <div className="section-heading"><div><h2 id="facts-heading">Published project facts</h2><p>Empty fields stay explicit instead of being estimated.</p></div></div>
            <dl className="fact-grid">
              <div><dt>Town</dt><dd>{project.town ?? NOT_PUBLISHED}</dd></div>
              <div><dt>Region</dt><dd>{project.region}</dd></div>
              <div><dt>Launch exercise</dt><dd>{project.launchExercise ?? project.launchWindow ?? NOT_PUBLISHED}</dd></div>
              <div><dt>Classification</dt><dd>{project.classification ?? NOT_PUBLISHED}</dd></div>
              <div><dt>Estimated BTO units</dt><dd>{project.approxBtoUnits?.toLocaleString() ?? project.approxUnitsTotal?.toLocaleString() ?? NOT_PUBLISHED}</dd></div>
              <div><dt>Estimated waiting time</dt><dd>{waitingText(project)}</dd></div>
              <div><dt>Nearest curated MRT anchor</dt><dd>{project.mrtAnchor ?? NOT_PUBLISHED}</dd></div>
              <div><dt>Map location</dt><dd>{project.position ? `Approximate · ${project.coordinateAccuracy ?? 'source-linked coordinate'}` : NOT_PUBLISHED}</dd></div>
            </dl>
          </section>

          <section className="content-section" aria-labelledby="flat-heading">
            <div className="section-heading"><div><h2 id="flat-heading">Flat types and published prices</h2><p>Price ranges are HDB snapshot facts, not affordability or financing advice.</p></div></div>
            {project.flatTypes.length ? (
              <div className="table-wrap"><table className="content-table"><thead><tr><th>Flat type</th><th>Units</th><th>Published price range</th><th>Floor area</th></tr></thead><tbody>
                {project.flatTypes.map((flat) => <tr key={flat.type}><th scope="row">{flat.type}</th><td>{flat.units === null ? NOT_PUBLISHED : `${flat.unitsAreApproximate ? 'About ' : ''}${flat.units.toLocaleString()}`}</td><td>{flat.minPrice === null ? NOT_PUBLISHED : `${money(flat.minPrice)}–${money(flat.maxPrice)}`}</td><td>{flat.estimatedFloorAreaSqm ? `${flat.estimatedFloorAreaSqm} m²` : NOT_PUBLISHED}</td></tr>)}
              </tbody></table></div>
            ) : <div className="empty-state"><strong>{NOT_PUBLISHED}</strong><p>HDB has announced this supply but has not published the project-level flat mix or prices.</p></div>}
          </section>

          <section className="content-section" aria-labelledby="amenities-heading">
            <div className="section-heading"><div><h2 id="amenities-heading">Nearby amenities in the project snapshot</h2><p>Curated within the tool’s approximate 1 km context; not a complete local directory.</p></div><span>{nearby.length}</span></div>
            {nearby.length ? <div className="amenity-content-groups">{AMENITY_GROUP_ORDER.map((group) => {
              const records = nearby.filter((amenity) => amenity.group === group);
              if (!records.length) return null;
              return <div className="amenity-content-group" key={group}><h3><span style={{ background: AMENITY_GROUPS[group].palette.map }} />{AMENITY_GROUPS[group].label}</h3><ul>{records.map((amenity) => <li key={amenity.id}>{amenity.name}<small>{amenity.status === 'planned' ? 'Planned' : amenity.type.replace('-', ' ')}</small></li>)}</ul></div>;
            })}</div> : <div className="empty-state"><strong>No amenity records attached yet</strong><p>This remains neutral in matching rather than being treated as a confirmed miss.</p></div>}
          </section>

          <section className="content-section source-section" aria-labelledby="sources-heading">
            <div className="section-heading"><div><h2 id="sources-heading">Official sources</h2><p>Open these before relying on the record for an application decision.</p></div></div>
            <ol className="source-list">{project.sourceUrls.map((url, index) => <li key={url}><a href={url} rel="noreferrer">Source {index + 1}: {new URL(url).hostname.replace(/^www\./, '')}</a></li>)}</ol>
          </section>

          {related.length > 0 && <section className="content-section" aria-labelledby="related-heading"><div className="section-heading"><div><h2 id="related-heading">Related project records</h2><p>Other records in {project.town ?? project.region} or the same region.</p></div></div><div className="related-links">{related.map((candidate) => <Link href={`/bto-projects/${candidate.id}`} key={candidate.id}><strong>{candidate.name}</strong><span>{candidate.launchLabel}</span></Link>)}</div></section>}
        </article>
      </main>
    </>
  );
}
