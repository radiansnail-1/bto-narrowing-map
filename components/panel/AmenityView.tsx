'use client';

import Image from 'next/image';
import { btoProjects } from '@/data/bto-projects';
import { officialSourceById } from '@/data/sources';
import { AMENITY_GROUPS, AMENITY_TYPE_LABELS, amenityGroupStyle } from '@/lib/amenity-groups';
import { mediaBlockerForAmenity, mediaForAmenity } from '@/lib/amenity-media';
import type { Amenity, BtoProject } from '@/lib/types';

interface AmenityViewProps {
  amenity: Amenity;
  selectedProject: BtoProject | null;
  backLabel: string;
  onBack: () => void;
}

export function AmenityView({ amenity, selectedProject, backLabel, onBack }: AmenityViewProps) {
  const group = AMENITY_GROUPS[amenity.group];
  const media = mediaForAmenity(amenity.id);
  const blocker = mediaBlockerForAmenity(amenity.id);
  const source = officialSourceById.get(amenity.sourceId);
  const listedFor = btoProjects.filter((project) => project.amenityIds.includes(amenity.id));
  const insideSelected = selectedProject ? selectedProject.amenityIds.includes(amenity.id) : null;
  return (
    <section className="amenity-card panel-card" style={amenityGroupStyle(amenity.group)} data-testid="amenity-card" data-amenity-id={amenity.id}>
      <button className="card-back" onClick={onBack} data-testid="amenity-back">← {backLabel}</button>
      <div className="card-kicker group-kicker"><span className="group-swatch" aria-hidden="true" /> {group.label} · {AMENITY_TYPE_LABELS[amenity.type]}{amenity.status === 'planned' ? ' · planned' : ''}</div>
      <h2>{amenity.name}</h2>
      {media ? (
        <figure className="amenity-figure" data-testid="amenity-figure">
          <div className="amenity-image-frame" style={{ aspectRatio: `${media.width} / ${media.height}` }}>
            <Image src={media.file} alt={media.alt} width={media.width} height={media.height} sizes="372px" className="amenity-image" data-testid="amenity-image" priority={false} />
          </div>
          <figcaption className="amenity-credit" data-testid="amenity-credit">
            {media.depicts === 'area-context' && <span className="amenity-credit-note">{media.note ?? 'Shows the surrounding area, not the place itself.'}</span>}
            <span>Photo: {media.creator}</span>
            <span><a href={media.licenceUrl} target="_blank" rel="noreferrer">{media.licence}</a> · <a href={media.sourceUrl} target="_blank" rel="noreferrer">{media.sourceTitle} ↗</a></span>
          </figcaption>
        </figure>
      ) : (
        <div className="amenity-figure amenity-figure-empty" data-testid="amenity-figure-empty" role="img" aria-label={`No licensed photo of ${amenity.name} yet`}>
          <span className="amenity-empty-icon" aria-hidden="true">{group.icon}</span>
          <span>No licensed photo yet</span>
          <small>{blocker ? `${blocker.reason} Checked ${blocker.checked}.` : 'We only show images with a verified reusable licence.'}</small>
        </div>
      )}
      <div className="project-meta-grid">
        <div><span>Official record</span><strong>{source ? <a className="source-link" href={source.url} target="_blank" rel="noreferrer">{source.agency} ↗</a> : amenity.sourceId}</strong></div>
        <div><span>Map location</span><strong>{amenity.position ? 'Official coordinate (approximate anchor)' : 'Not published yet'}</strong></div>
        {selectedProject && <div className="span-2"><span>{selectedProject.name.split(' — ')[0]}</span><strong>{insideSelected ? 'Inside the approximate 1 km screen' : 'Outside the approximate 1 km screen'}</strong></div>}
        {listedFor.length > 0 && <div className="span-2"><span>Screened for</span><strong>{listedFor.map((project) => project.name.split(' — ')[0]).join(' · ')}</strong></div>}
      </div>
      <p className="project-note">{amenity.screeningNote}</p>
      {amenity.geocodeSource && <div className="source-links"><a className="source-link" href={amenity.geocodeSource} target="_blank" rel="noreferrer">OneMap geocode ↗</a></div>}
      <p className="data-stamp">Official record from {source?.title ?? amenity.sourceId}{source ? ` · checked ${source.checkedDate}` : ''}</p>
    </section>
  );
}
