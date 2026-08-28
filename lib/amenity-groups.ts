import type { AmenityCategory, AmenityGroup } from '@/lib/types';

/**
 * Single source of truth for the five user-facing amenity groups: which official amenity
 * types they contain, their labels, and the shared accessible palette used by the rail,
 * question choices, map overlays, legends and detail views.
 *
 * Palette rules: BTO housing is the only red/warm family in the product. No amenity group
 * uses red, orange or pink. `text` colours meet WCAG AA (≥ 4.5:1) on white and on `tint`;
 * `map` colours are tuned for the dark scene background.
 */
export interface AmenityGroupPalette {
  /** Text/border colour on white and on the group's tint. */
  text: string;
  /** Saturated swatch for dots, icons and rings on light surfaces (decorative, paired with a border). */
  swatch: string;
  /** Light background used for active rows and selected choices. */
  tint: string;
  /** Vivid colour for overlays on the dark map. */
  map: string;
  /** Border for tinted rows. */
  border: string;
}

export interface AmenityGroupDefinition {
  id: AmenityGroup;
  label: string;
  /** Short label for legends and chips. */
  shortLabel: string;
  description: string;
  types: AmenityCategory[];
  icon: string;
  palette: AmenityGroupPalette;
}

export const AMENITY_GROUP_ORDER: AmenityGroup[] = ['mrt', 'food-shopping', 'healthcare', 'schools', 'parks-recreation'];

export const AMENITY_GROUPS: Record<AmenityGroup, AmenityGroupDefinition> = {
  mrt: {
    id: 'mrt',
    label: 'MRT',
    shortLabel: 'MRT',
    description: 'MRT stations',
    types: ['mrt'],
    icon: '◈',
    palette: { text: '#1d5bbf', swatch: '#2f7ae5', tint: '#e7f0fe', map: '#5ab0ff', border: '#8fb7f0' },
  },
  'food-shopping': {
    id: 'food-shopping',
    label: 'Food & shopping',
    shortLabel: 'Food & shops',
    description: 'Hawker centres and shopping centres',
    types: ['hawker', 'shopping'],
    icon: '◇',
    palette: { text: '#6b5200', swatch: '#e6b800', tint: '#fff4c7', map: '#ffd84d', border: '#d9bd4a' },
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare',
    shortLabel: 'Healthcare',
    description: 'Polyclinics and hospitals',
    types: ['healthcare'],
    icon: '+',
    palette: { text: '#0f6e66', swatch: '#12a595', tint: '#ddf4f0', map: '#34d5c2', border: '#79cbc0' },
  },
  schools: {
    id: 'schools',
    label: 'Schools',
    shortLabel: 'Schools',
    description: 'MOE schools',
    types: ['schools'],
    icon: '⌂',
    palette: { text: '#4436b8', swatch: '#5b5fe0', tint: '#eaeafc', map: '#9aa0ff', border: '#aeb1ef' },
  },
  'parks-recreation': {
    id: 'parks-recreation',
    label: 'Parks & recreation',
    shortLabel: 'Parks & rec',
    description: 'Parks and sports facilities',
    types: ['parks', 'sports'],
    icon: '✳',
    palette: { text: '#1f7a36', swatch: '#2aa94f', tint: '#e3f5e8', map: '#5ae082', border: '#8fd4a3' },
  },
};

/** Labels for the specific official amenity type, shown in details alongside the group. */
export const AMENITY_TYPE_LABELS: Record<AmenityCategory, string> = {
  mrt: 'MRT station',
  hawker: 'Hawker centre',
  shopping: 'Shopping centre',
  healthcare: 'Healthcare',
  schools: 'School',
  parks: 'Park',
  sports: 'Sports facility',
};

export const AMENITY_CATEGORIES: AmenityCategory[] = ['mrt', 'hawker', 'shopping', 'healthcare', 'schools', 'parks', 'sports'];

const TYPE_TO_GROUP: Record<AmenityCategory, AmenityGroup> = Object.fromEntries(
  AMENITY_GROUP_ORDER.flatMap((group) => AMENITY_GROUPS[group].types.map((type) => [type, group])),
) as Record<AmenityCategory, AmenityGroup>;

export function groupOfType(type: AmenityCategory): AmenityGroup {
  return TYPE_TO_GROUP[type];
}

export function isAmenityGroup(value: unknown): value is AmenityGroup {
  return typeof value === 'string' && (AMENITY_GROUP_ORDER as string[]).includes(value);
}

export function isAmenityCategory(value: unknown): value is AmenityCategory {
  return typeof value === 'string' && (AMENITY_CATEGORIES as string[]).includes(value);
}

/**
 * Migrates a stored list of values that may contain legacy individual amenity types
 * (`hawker`, `sports`, …) and/or current group ids into a de-duplicated, ordered list of groups.
 * Unknown values are dropped rather than rejecting the whole list.
 */
export function migrateToAmenityGroups(values: unknown, limit = Number.POSITIVE_INFINITY): AmenityGroup[] {
  if (!Array.isArray(values)) return [];
  const groups: AmenityGroup[] = [];
  for (const value of values) {
    const group = isAmenityGroup(value) ? value : isAmenityCategory(value) ? groupOfType(value) : null;
    if (group && !groups.includes(group)) groups.push(group);
    if (groups.length >= limit) break;
  }
  return groups;
}

/** CSS custom properties for a group so components share one palette without duplicating hex values. */
export function amenityGroupStyle(group: AmenityGroup): Record<string, string> {
  const { palette } = AMENITY_GROUPS[group];
  return { '--group-text': palette.text, '--group-swatch': palette.swatch, '--group-tint': palette.tint, '--group-map': palette.map, '--group-border': palette.border };
}
