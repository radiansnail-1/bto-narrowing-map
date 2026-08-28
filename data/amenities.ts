import snapshot from '@/data/official-data-snapshot.json';
import { geoToScenePosition } from '@/lib/geo';
import type { Amenity, AmenityCategory } from '@/lib/types';

export const amenityCategories: AmenityCategory[] = ['mrt', 'hawker', 'shopping', 'healthcare', 'schools', 'parks', 'sports'];

function category(value: string): AmenityCategory {
  if (value === 'school') return 'schools';
  if (value === 'park') return 'parks';
  return value as AmenityCategory;
}

export const amenities: Amenity[] = snapshot.amenities.map((record) => ({
  id: record.id,
  name: record.name,
  type: category(record.category),
  position: record.coordinates?.latitude != null && record.coordinates.longitude != null
    ? geoToScenePosition({ latitude: record.coordinates.latitude, longitude: record.coordinates.longitude })
    : null,
  sourceId: record.sourceId,
  screeningNote: record.screeningNote,
}));

export const amenityById = new Map(amenities.map((amenity) => [amenity.id, amenity]));
