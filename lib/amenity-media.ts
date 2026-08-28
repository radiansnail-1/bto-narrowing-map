import manifest from '@/data/amenity-media.json';

/**
 * Curated visual context for amenities. This manifest is deliberately separate from the official
 * government data snapshot: it is joined by amenity ID at render time and never feeds matching.
 * Every record must point at a local, optimised asset with complete provenance so the credit can
 * be shown as first-class UI content.
 */
export interface AmenityMediaRecord {
  amenityId: string;
  /** Public path of the optimised local asset, e.g. `/amenities/mrt-redhill.webp`. */
  file: string;
  width: number;
  height: number;
  alt: string;
  creator: string;
  sourceTitle: string;
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  /** ISO date the source page was checked. */
  retrieved: string;
  /** Exact subject relationship: the venue itself, or labelled area context for a place that does not exist yet. */
  depicts: 'venue' | 'area-context';
  note?: string;
}

/** An amenity for which no defensibly reusable photo was found; the UI shows the reason instead of a substitute. */
export interface AmenityMediaBlocker {
  amenityId: string;
  reason: string;
  searched: string[];
  checked: string;
}

export interface AmenityMediaManifest {
  version: 1;
  generatedAt: string;
  policy: string;
  records: AmenityMediaRecord[];
  blockers?: AmenityMediaBlocker[];
}

export const amenityMedia = manifest as AmenityMediaManifest;

export const amenityMediaById = new Map(amenityMedia.records.map((record) => [record.amenityId, record]));
export const amenityMediaBlockerById = new Map((amenityMedia.blockers ?? []).map((blocker) => [blocker.amenityId, blocker]));

export function mediaForAmenity(amenityId: string): AmenityMediaRecord | null {
  return amenityMediaById.get(amenityId) ?? null;
}

export function mediaBlockerForAmenity(amenityId: string): AmenityMediaBlocker | null {
  return amenityMediaBlockerById.get(amenityId) ?? null;
}
