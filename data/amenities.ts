import snapshot from '@/data/official-data-snapshot.json';
import { groupOfType } from '@/lib/amenity-groups';
import { geoToScenePosition } from '@/lib/geo';
import type { Amenity, AmenityCategory } from '@/lib/types';

export { AMENITY_CATEGORIES as amenityCategories } from '@/lib/amenity-groups';

function category(value: string): AmenityCategory {
  if (value === 'school') return 'schools';
  if (value === 'park') return 'parks';
  return value as AmenityCategory;
}

type SnapshotAmenity = (typeof snapshot.amenities)[number] & { status?: string; geocodeSource?: string };

export const amenities: Amenity[] = (snapshot.amenities as SnapshotAmenity[]).map((record) => {
  const type = category(record.category);
  return {
    id: record.id,
    name: record.name,
    type,
    group: groupOfType(type),
    position: record.coordinates?.latitude != null && record.coordinates.longitude != null
      ? geoToScenePosition({ latitude: record.coordinates.latitude, longitude: record.coordinates.longitude })
      : null,
    sourceId: record.sourceId,
    screeningNote: record.screeningNote,
    status: record.status === 'planned' ? 'planned' : null,
    geocodeSource: record.geocodeSource ?? null,
  };
});

export const amenityById = new Map(amenities.map((amenity) => [amenity.id, amenity]));
