import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { formatDate, waitingText } from '@/components/panel/format';
import { btoProjects } from '@/data/bto-projects';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Singapore BTO Projects',
  description: `Browse ${btoProjects.length} launched and officially announced Singapore BTO records with published prices, waiting times, location context, nearby amenities, and HDB source links.`,
  alternates: { canonical: '/bto-projects' },
  openGraph: {
    title: 'Singapore BTO Projects | Where To BTO',
    description: 'A source-linked directory of launched and officially announced BTO projects in Singapore.',
    url: '/bto-projects',
  },
};

const GROUPS = [
  { key: 'launched', title: 'Launched projects', description: 'Projects with a published BTO sales exercise.' },
  { key: 'announced_upcoming', title: 'Upcoming projects', description: 'Supply announced by HDB; some project-level facts are not published yet.' },
  { key: 'planned', title: 'Planned projects', description: 'Future projects announced without a confirmed sales exercise.' },
] as const;

export default function ProjectsPage() {
  return (
    <>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Singapore BTO projects',
        numberOfItems: btoProjects.length,
        itemListElement: btoProjects.map((project, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: project.name,
          url: absoluteUrl(`/bto-projects/${project.id}`),
        })),
      }} />
      <main className="content-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Map</Link><span>/</span><span>Projects</span></nav>
        <section className="content-hero">
          <h1>Singapore BTO projects</h1>
          <p>Browse {btoProjects.length} launched and officially announced project records. Every page separates published facts from information HDB has not released yet.</p>
          <div className="hero-actions">
            <Link className="primary-link" href="/">Narrow projects on the map</Link>
            <Link className="secondary-link" href="/guides/how-to-choose-a-bto-location">Read the location checklist</Link>
          </div>
          <p className="data-line">Snapshot audited {formatDate(DATA_CHECKED_DATE)} · HDB source links on every project page</p>
        </section>

        {GROUPS.map((group) => {
          const projects = btoProjects.filter((project) => project.launchStatus === group.key);
          if (projects.length === 0) return null;
          return (
            <section className="content-section" key={group.key}>
              <div className="section-heading"><div><h2>{group.title}</h2><p>{group.description}</p></div><span>{projects.length}</span></div>
              <div className="project-directory-grid">
                {projects.map((project) => (
                  <article className="directory-card" key={project.id}>
                    <div className="directory-card-top"><span>{project.town ?? project.region}</span><span className={`status-pill status-${project.launchStatus}`}>{project.launchStatus === 'launched' ? 'Launched' : project.launchStatus === 'planned' ? 'Planned' : 'Upcoming'}</span></div>
                    <h3><Link href={`/bto-projects/${project.id}`}>{project.name}</Link></h3>
                    <p>{project.launchLabel}</p>
                    <dl className="compact-facts">
                      <div><dt>Classification</dt><dd>{project.classification ?? 'Not published yet'}</dd></div>
                      <div><dt>Waiting time</dt><dd>{waitingText(project)}</dd></div>
                      <div><dt>Flat types</dt><dd>{project.flatTypes.length ? project.flatTypes.map((flat) => flat.type).join(', ') : 'Not published yet'}</dd></div>
                    </dl>
                    <Link className="card-link" href={`/bto-projects/${project.id}`}>View published project facts <span aria-hidden="true">→</span></Link>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
