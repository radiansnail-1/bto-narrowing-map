import snapshot from '@/data/official-data-snapshot.json';
import { amenityById } from '@/data/amenities';
import type { BtoProject, FlatPrice, FlatType } from '@/lib/types';
import { geoToScenePosition } from '@/lib/geo';

type SnapshotProject = (typeof snapshot.projects)[number];
type SnapshotFlat = {
  type: string;
  units?: number | null;
  unitsAreApproximate?: boolean;
  estimatedFloorAreaSqm?: number | null;
  estimatedInternalFloorAreaSqm?: number | null;
  priceRangeSgd?: { min: number; max: number };
};

function flatPrices(record: (typeof snapshot.projects)[number]): FlatPrice[] {
  return ((record.flatTypes ?? []) as SnapshotFlat[]).map((flat) => ({
    type: flat.type as FlatType,
    minPrice: flat.priceRangeSgd?.min ?? null,
    maxPrice: flat.priceRangeSgd?.max ?? null,
    units: flat.units ?? null,
    unitsAreApproximate: flat.unitsAreApproximate,
    estimatedFloorAreaSqm: flat.estimatedFloorAreaSqm ?? null,
    estimatedInternalFloorAreaSqm: flat.estimatedInternalFloorAreaSqm ?? null,
  }));
}

function launchLabel(record: SnapshotProject): string {
  if (record.launch.status === 'launched') return `Launched · ${record.launch.exercise ?? 'published exercise'}`;
  if (record.launch.exercise) return `${record.launch.exercise} · upcoming`;
  if (record.launch.launchWindow) return `Planned · ${record.launch.launchWindow}`;
  return 'Planned · details pending';
}

function summary(record: SnapshotProject): string {
  const note = (record as { publishedNote?: string }).publishedNote;
  let base: string;
  if (record.launch.status === 'launched') base = `Officially launched in the ${record.launch.exercise ?? '2026'} exercise. See HDB's source materials for the complete project details.`;
  else if (record.town) base = `HDB has announced upcoming public housing supply for ${record.town}; project-level facts remain unpublished.`;
  else base = `HDB has announced a future public housing project here; the project name and town details remain unpublished.`;
  return note ? `${base} ${note}` : base;
}

function dataNote(record: SnapshotProject): string {
  if (!record.coordinates) return 'Map location unavailable: HDB has not published a defensible project coordinate.';
  return record.coordinates.accuracy;
}

export const btoProjects: BtoProject[] = snapshot.projects.map((record) => {
  const firstMrt = record.amenityIds.map((id) => amenityById.get(id)).find((amenity) => amenity?.type === 'mrt');
  const wait = typeof record.estimatedWaitingTimeMonths === 'object' && record.estimatedWaitingTimeMonths !== null
    ? { min: record.estimatedWaitingTimeMonths.min, max: record.estimatedWaitingTimeMonths.max, note: record.estimatedWaitingTimeMonths.note }
    : record.estimatedWaitingTimeMonths;
  return {
    id: record.id,
    name: record.displayName,
    canonicalName: record.canonicalName,
    town: record.town,
    region: record.region,
    launchStatus: record.launch.status as BtoProject['launchStatus'],
    launchExercise: record.launch.exercise,
    launchDate: record.launch.launchDate,
    launchWindow: record.launch.launchWindow ?? null,
    launchLabel: launchLabel(record),
    position: geoToScenePosition(record.coordinates?.latitude != null && record.coordinates.longitude != null ? { latitude: record.coordinates.latitude, longitude: record.coordinates.longitude } : null),
    coordinateAccuracy: record.coordinates?.accuracy ?? null,
    flatTypes: flatPrices(record),
    approxUnitsTotal: record.approxUnitsTotal ?? null,
    approxBtoUnits: record.approxBtoUnits ?? null,
    publicRentalUnitsApprox: record.publicRentalUnitsApprox ?? null,
    estimatedWaitingTimeMonths: wait,
    estimatedCompletionDate: record.estimatedCompletionDate,
    classification: record.classification as BtoProject['classification'],
    mrtAnchor: firstMrt?.name ?? null,
    amenityIds: record.amenityIds,
    summary: summary(record),
    sourceUrls: record.sourceUrls,
    checkedDate: record.checkedDate,
    dataNote: dataNote(record),
  };
});

export const projectById = new Map(btoProjects.map((project) => [project.id, project]));
