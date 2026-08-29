'use client';

import { amenityById } from '@/data/amenities';
import Link from 'next/link';
import { AMENITY_GROUPS, AMENITY_TYPE_LABELS, amenityGroupStyle } from '@/lib/amenity-groups';
import type { FlowKind } from '@/lib/panel-view';
import { MATCH_STATUS_LABELS, criterionReason } from '@/lib/results';
import { CRITERIA, type Amenity, type BtoProject, type ExplorerAnswers, type ProjectMatch } from '@/lib/types';
import { NOT_PUBLISHED, flatTypeList, priceText, waitingText } from './format';

interface ProjectViewProps {
  project: BtoProject;
  match: ProjectMatch;
  answers: ExplorerAnswers;
  returnTo: FlowKind;
  onClose: () => void;
  onOpenAmenity: (amenity: Amenity) => void;
  isShortlisted: boolean;
  shortlistFull: boolean;
  onToggleShortlist: () => void;
}

export function ProjectView({ project, match, answers, returnTo, onClose, onOpenAmenity, isShortlisted, shortlistFull, onToggleShortlist }: ProjectViewProps) {
  const nearby = project.amenityIds.map((id) => amenityById.get(id)).filter((amenity): amenity is Amenity => Boolean(amenity));
  const prices = priceText(project);
  const flats = flatTypeList(project);
  return (
    <section className="project-card panel-card" data-testid="project-card">
      <button className="card-back" onClick={onClose}>← {returnTo === 'results' ? 'Back to results' : 'Back to narrowing'}</button>
      <div className="card-kicker"><span className="live-dot" /> Selected project <button type="button" className={`shortlist-toggle project-shortlist-toggle ${isShortlisted ? 'is-added' : ''}`} aria-pressed={isShortlisted} disabled={shortlistFull && !isShortlisted} onClick={onToggleShortlist}>{isShortlisted ? 'Remove from shortlist' : shortlistFull ? 'Shortlist full' : 'Add to shortlist'}</button></div>
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
          const detail = criterionReason(project, key, status, answers);
          return <div className="criteria-row" key={key}><span><strong>{label}</strong><em>{detail}</em></span><span className={`criteria-status ${status}`}>{MATCH_STATUS_LABELS[status]}</span></div>;
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
      <div className="project-guide-links"><strong>Useful next reads</strong>{!project.position && <Link href="/guides/handling-unpublished-bto-information">Why upcoming project data is incomplete →</Link>}{project.position && <Link href="/guides/comparing-bto-commutes">How to validate the commute →</Link>}{project.position && <Link href="/guides/checking-amenities-near-a-bto">What to check within 1 km →</Link>}<Link href="/guides/understanding-bto-price-and-wait-data">How to read price and wait data →</Link></div>
      <p className="project-note">{project.dataNote}</p>
      <div className="source-links">{project.sourceUrls.slice(0, 2).map((url, index) => <a className="source-link" href={url} key={url} target="_blank" rel="noreferrer">{index === 0 ? 'HDB source' : 'Official detail'} ↗</a>)}</div>
      <p className="data-stamp">Official snapshot · checked {project.checkedDate}</p>
    </section>
  );
}
