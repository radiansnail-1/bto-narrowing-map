'use client';

import { amenityById } from '@/data/amenities';
import { AMENITY_GROUPS, AMENITY_TYPE_LABELS, amenityGroupStyle } from '@/lib/amenity-groups';
import type { FlowKind } from '@/lib/panel-view';
import { CRITERIA, type Amenity, type BtoProject, type MatchStatus, type ProjectMatch } from '@/lib/types';
import { NOT_PUBLISHED, flatTypeList, priceText, waitingText } from './format';

interface ProjectViewProps {
  project: BtoProject;
  match: ProjectMatch;
  returnTo: FlowKind;
  onClose: () => void;
  onOpenAmenity: (amenity: Amenity) => void;
}

const STATUS_LABELS: Record<MatchStatus, string> = { pass: 'Pass', miss: 'Miss', unknown: 'Awaiting data', unanswered: 'Not answered' };

function statusDetail(key: (typeof CRITERIA)[number]['key'], status: MatchStatus, project: BtoProject): string | null {
  if (status !== 'unknown') return null;
  if (key === 'commute') return project.position ? null : 'HDB has not published a map location for this project.';
  if (key === 'budget') return 'HDB has not published a price for the flat type you chose.';
  if (key === 'waiting') return 'HDB has not published an estimated waiting time.';
  return 'No official amenity record has been screened for this site yet.';
}

export function ProjectView({ project, match, returnTo, onClose, onOpenAmenity }: ProjectViewProps) {
  const nearby = project.amenityIds.map((id) => amenityById.get(id)).filter((amenity): amenity is Amenity => Boolean(amenity));
  const prices = priceText(project);
  const flats = flatTypeList(project);
  return (
    <section className="project-card panel-card" data-testid="project-card">
      <button className="card-back" onClick={onClose}>← {returnTo === 'results' ? 'Back to results' : 'Back to narrowing'}</button>
      <div className="card-kicker"><span className="live-dot" /> Selected project</div>
      <h2>{project.name}</h2>
      <p className="card-town">{project.town ?? 'Town not published'} <span>•</span> {project.launchLabel}</p>
      <div className="card-rule" />
      <div className="project-meta-grid">
        <div><span>Published prices</span><strong>{prices ?? (flats ? `${NOT_PUBLISHED}. Flat types: ${flats}` : NOT_PUBLISHED)}</strong></div>
        <div><span>Estimated wait</span><strong>{waitingText(project)}</strong></div>
        <div><span>MRT context</span><strong>{project.mrtAnchor ?? 'No station in the screened records'}</strong></div>
        <div><span>Classification</span><strong>{project.classification ?? NOT_PUBLISHED}</strong></div>
        <div><span>Map location</span><strong>{project.position ? 'Approximate anchor' : 'Unavailable'}</strong></div>
        {project.approxBtoUnits !== null && <div><span>Approx. BTO units</span><strong>{project.approxBtoUnits.toLocaleString()}</strong></div>}
      </div>
      <div className="criteria-summary" aria-label="Criteria comparison">
        <div className="criteria-summary-label">Your criteria</div>
        {CRITERIA.map(({ key, label }) => {
          const status = match[key];
          const detail = statusDetail(key, status, project);
          return <div className="criteria-row" key={key} title={detail ?? undefined}><span>{label}</span><span className={`criteria-status ${status}`}>{STATUS_LABELS[status]}</span></div>;
        })}
      </div>
      <div className="nearby-amenities" data-testid="project-amenities">
        <div className="criteria-summary-label">Screened within about 1 km</div>
        {nearby.length === 0 ? <p className="result-empty">{project.position ? 'No official amenity record has been screened for this site yet.' : 'Amenity screening needs a published location; HDB has not published one yet.'}</p> : (
          <ul className="nearby-list">
            {nearby.map((amenity) => (
              <li key={amenity.id}>
                <button type="button" className="nearby-row" style={amenityGroupStyle(amenity.group)} onClick={() => onOpenAmenity(amenity)} data-testid="project-amenity" data-amenity-id={amenity.id}>
                  <span className="group-swatch" aria-hidden="true" />
                  <span className="nearby-row-text"><strong>{amenity.name}</strong><small>{AMENITY_GROUPS[amenity.group].label} · {AMENITY_TYPE_LABELS[amenity.type]}{amenity.status === 'planned' ? ' · planned' : ''}</small></span>
                  <span className="nearby-chevron" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="project-summary">{project.summary}</p>
      <p className="project-note">{project.dataNote}</p>
      <div className="source-links">{project.sourceUrls.slice(0, 2).map((url, index) => <a className="source-link" href={url} key={url} target="_blank" rel="noreferrer">{index === 0 ? 'HDB source' : 'Official detail'} ↗</a>)}</div>
      <p className="data-stamp">Official snapshot · checked {project.checkedDate}</p>
    </section>
  );
}
