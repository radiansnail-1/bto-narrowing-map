import { workHubs } from '@/data/work-hubs';
import { amenities } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { AMENITY_GROUP_ORDER, isAmenityGroup, migrateToAmenityGroups } from '@/lib/amenity-groups';
import type { FlowKind, PanelView } from '@/lib/panel-view';
import { FLAT_TYPES, MAX_AMENITY_PREFERENCES, WAITING_BANDS, type AmenityGroup, type BtoProject, type ExplorerAnswers } from '@/lib/types';

/** Current persisted shape. The legacy key is read once, migrated, then removed. */
export const STORAGE_KEY = 'where-to-bto:v2';
export const LEGACY_STORAGE_KEY = 'bto-narrowing-map:v1';
export const MAX_STEP = 3;

export const DEFAULT_ANSWERS: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityGroups: [], waitingBand: null, customWorkplace: null };
export const DEFAULT_VISIBLE_GROUPS: AmenityGroup[] = [...AMENITY_GROUP_ORDER];

export interface StoredState {
  answers: ExplorerAnswers;
  visibleGroups: AmenityGroup[];
  step: number;
  shortlistIds?: string[];
  view?: StoredPanelView;
  launchStatusFilter?: 'all' | BtoProject['launchStatus'];
}

/** The only panel state that is safe to restore after a content-page navigation. */
export interface StoredPanelView {
  kind: PanelView['kind'];
  selectedProjectId: string | null;
  amenityId: string | null;
  returnTo: FlowKind | 'project' | null;
  /** Original flow beneath an amenity opened from a project. */
  projectReturnTo: FlowKind | null;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const isCoordinate = (position: unknown): position is [number, number] => Array.isArray(position)
  && position.length === 2
  && position.every((value) => typeof value === 'number' && Number.isFinite(value));

/**
 * Validates stored answers. Legacy `amenityCategories` (individual amenity types) migrate to
 * `amenityGroups`; unknown amenity values are dropped instead of discarding every other answer.
 * Any other invalid field still rejects the whole object, matching the previous safe behaviour.
 */
export function parseAnswers(value: unknown): ExplorerAnswers | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ExplorerAnswers> & { amenityCategories?: unknown };
  const validHubIds = new Set(workHubs.map((hub) => hub.id));
  const validWaitingBands = new Set<string>(WAITING_BANDS.map((band) => band.value));

  const hubIdsValid = Array.isArray(candidate.workHubIds)
    && candidate.workHubIds.length <= 2
    && new Set(candidate.workHubIds).size === candidate.workHubIds.length
    && candidate.workHubIds.every((id) => typeof id === 'string' && validHubIds.has(id));
  const budgetValid = candidate.maxBudget === null || (typeof candidate.maxBudget === 'number' && Number.isFinite(candidate.maxBudget) && candidate.maxBudget >= 0);
  const flatTypeValid = candidate.flatType === null || (typeof candidate.flatType === 'string' && FLAT_TYPES.includes(candidate.flatType));
  const waitingValid = candidate.waitingBand === null || (typeof candidate.waitingBand === 'string' && validWaitingBands.has(candidate.waitingBand));
  const customWorkplaceValid = candidate.customWorkplace === null || isCoordinate(candidate.customWorkplace);
  const workplaceModesValid = candidate.customWorkplace === null || (Array.isArray(candidate.workHubIds) && candidate.workHubIds.length === 0);
  if (!(hubIdsValid && budgetValid && flatTypeValid && waitingValid && customWorkplaceValid && workplaceModesValid)) return null;

  let amenityGroups: AmenityGroup[];
  if (Array.isArray(candidate.amenityGroups)) {
    const strict = candidate.amenityGroups.every(isAmenityGroup)
      && new Set(candidate.amenityGroups).size === candidate.amenityGroups.length
      && candidate.amenityGroups.length <= MAX_AMENITY_PREFERENCES;
    if (!strict) return null;
    amenityGroups = [...candidate.amenityGroups];
  } else if (Array.isArray(candidate.amenityCategories)) {
    amenityGroups = migrateToAmenityGroups(candidate.amenityCategories, MAX_AMENITY_PREFERENCES);
  } else {
    return null;
  }

  return {
    workHubIds: [...(candidate.workHubIds as string[])],
    maxBudget: candidate.maxBudget as number | null,
    flatType: candidate.flatType as ExplorerAnswers['flatType'],
    amenityGroups,
    waitingBand: candidate.waitingBand as ExplorerAnswers['waitingBand'],
    customWorkplace: candidate.customWorkplace as ExplorerAnswers['customWorkplace'],
  };
}

/** Visible layers: accepts current group ids or legacy individual types; drops unknown values. */
export function parseVisibleGroups(value: unknown): AmenityGroup[] | null {
  if (!Array.isArray(value)) return null;
  return migrateToAmenityGroups(value);
}

export function parseStep(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_STEP ? value : null;
}

export function parseShortlistIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > 4) return null;
  const validIds = new Set(btoProjects.map((project) => project.id));
  if (value.some((id) => typeof id !== 'string' || !validIds.has(id))) return null;
  return [...new Set(value)];
}

export function parsePanelView(value: unknown): StoredPanelView | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<StoredPanelView>;
  const kinds = new Set<PanelView['kind']>(['questions', 'results', 'project', 'amenity']);
  const flowKinds = new Set<FlowKind>(['questions', 'results']);
  const projectIds = new Set(btoProjects.map((project) => project.id));
  const amenityIds = new Set(amenities.map((amenity) => amenity.id));
  const selectedProjectId = record.selectedProjectId === null ? null : typeof record.selectedProjectId === 'string' && projectIds.has(record.selectedProjectId) ? record.selectedProjectId : null;
  const amenityId = record.amenityId === null ? null : typeof record.amenityId === 'string' && amenityIds.has(record.amenityId) ? record.amenityId : null;
  const returnTo = record.returnTo === null ? null : record.returnTo === 'project' ? 'project' : flowKinds.has(record.returnTo as FlowKind) ? record.returnTo as FlowKind : null;
  const projectReturnTo = record.projectReturnTo === null || record.projectReturnTo === undefined ? null : flowKinds.has(record.projectReturnTo as FlowKind) ? record.projectReturnTo as FlowKind : null;
  if (!kinds.has(record.kind as PanelView['kind'])) return null;
  if (record.kind === 'project' && !selectedProjectId) return null;
  if (record.kind === 'amenity' && (!amenityId || !returnTo || (returnTo === 'project' && (!selectedProjectId || !projectReturnTo)))) return null;
  return { kind: record.kind as PanelView['kind'], selectedProjectId, amenityId, returnTo, projectReturnTo };
}

export function parseLaunchStatusFilter(value: unknown): StoredState['launchStatusFilter'] | null {
  return value === 'all' || value === 'launched' || value === 'announced_upcoming' || value === 'planned' ? value : null;
}

/** Parses a raw JSON string from either storage generation into the fields that validated. */
export function parseStoredState(raw: string | null): Partial<StoredState> {
  if (!raw) return {};
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== 'object') return {};
  const record = parsed as { answers?: unknown; visibleGroups?: unknown; visibleAmenities?: unknown; step?: unknown; shortlistIds?: unknown; view?: unknown; launchStatusFilter?: unknown };
  const state: Partial<StoredState> = {};
  const answers = parseAnswers(record.answers);
  if (answers) state.answers = answers;
  const visible = parseVisibleGroups(record.visibleGroups !== undefined ? record.visibleGroups : record.visibleAmenities);
  if (visible) state.visibleGroups = visible;
  const step = parseStep(record.step);
  if (step !== null) state.step = step;
  const shortlistIds = parseShortlistIds(record.shortlistIds);
  if (shortlistIds) state.shortlistIds = shortlistIds;
  const view = parsePanelView(record.view);
  if (view) state.view = view;
  const launchStatusFilter = parseLaunchStatusFilter(record.launchStatusFilter);
  if (launchStatusFilter) state.launchStatusFilter = launchStatusFilter;
  return state;
}

/** Reads the current key, falling back to (and clearing) the legacy key. Never throws. */
export function loadStoredState(storage: StorageLike): Partial<StoredState> {
  try {
    const current = storage.getItem(STORAGE_KEY);
    if (current) return parseStoredState(current);
    const legacy = storage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return {};
    const migrated = parseStoredState(legacy);
    try { storage.removeItem(LEGACY_STORAGE_KEY); } catch { /* storage may be read-only */ }
    return migrated;
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
    return {};
  }
}

export function saveStoredState(storage: StorageLike, state: StoredState): void {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage may be unavailable */ }
}
