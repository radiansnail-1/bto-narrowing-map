import { amenityById } from '@/data/amenities';
import { workHubs } from '@/data/work-hubs';
import { SCENE_KM_PER_UNIT } from '@/lib/geo';
import type { BtoProject, ExplorerAnswers, MatchStatus, ProjectMatch, WaitingBand } from '@/lib/types';

export const WORKPLACE_PROXIMITY_KM = 5;

function isWithinStraightLineThreshold(project: BtoProject, points: Array<[number, number]>): MatchStatus {
  if (!project.position) return 'unknown';
  if (points.length === 0) return 'unknown';
  const averageDistanceKm = points.reduce((sum, point) => {
    const dx = project.position![0] - point[0];
    const dz = project.position![1] - point[1];
    return sum + Math.sqrt(dx * dx + dz * dz) * SCENE_KM_PER_UNIT;
  }, 0) / points.length;
  return averageDistanceKm <= WORKPLACE_PROXIMITY_KM ? 'pass' : 'miss';
}

function matchCommute(project: BtoProject, answers: ExplorerAnswers): MatchStatus {
  if (answers.workHubIds.length === 0 && answers.customWorkplace === null) return 'unanswered';

  // The official snapshot has no static transit times. Both curated hubs and a
  // dropped pin use the same transparent, straight-line distance screen instead.
  if (answers.customWorkplace) return isWithinStraightLineThreshold(project, [answers.customWorkplace]);
  const selectedHubs = answers.workHubIds
    .map((hubId) => workHubs.find((hub) => hub.id === hubId))
    .filter((hub): hub is (typeof workHubs)[number] => Boolean(hub));
  return isWithinStraightLineThreshold(project, selectedHubs.map((hub) => hub.position));
}

function matchBudget(project: BtoProject, answers: ExplorerAnswers): MatchStatus {
  if (answers.maxBudget === null && answers.flatType === null) return 'unanswered';
  if (answers.maxBudget === null || answers.flatType === null) return 'unknown';

  const flat = project.flatTypes.find((item) => item.type === answers.flatType);
  if (!flat || flat.minPrice === null) return 'unknown';
  return flat.minPrice <= answers.maxBudget ? 'pass' : 'miss';
}

function matchAmenities(project: BtoProject, answers: ExplorerAnswers): MatchStatus {
  if (answers.amenityCategories.length === 0) return 'unanswered';
  if (project.amenityIds.length === 0) return 'unknown';

  const availableCategories = new Set(
    project.amenityIds
      .map((amenityId) => amenityById.get(amenityId)?.type)
      .filter((category): category is NonNullable<typeof category> => Boolean(category)),
  );
  return answers.amenityCategories.every((category) => availableCategories.has(category)) ? 'pass' : 'miss';
}

function matchWaiting(project: BtoProject, waitingBand: WaitingBand | null): MatchStatus {
  if (!waitingBand) return 'unanswered';
  const published = project.estimatedWaitingTimeMonths;
  if (published === null) return 'unknown';
  const min = typeof published === 'number' ? published : published.min;
  const max = typeof published === 'number' ? published : published.max;
  if (waitingBand === 'soon') return max <= 36 ? 'pass' : 'miss';
  if (waitingBand === 'mid') return min >= 37 && max <= 48 ? 'pass' : 'miss';
  return min >= 49 ? 'pass' : 'miss';
}

export function matchProject(project: BtoProject, answers: ExplorerAnswers): ProjectMatch {
  const criteria = {
    commute: matchCommute(project, answers),
    budget: matchBudget(project, answers),
    amenities: matchAmenities(project, answers),
    waiting: matchWaiting(project, answers.waitingBand),
  } satisfies Omit<ProjectMatch, 'missCount'>;

  return {
    ...criteria,
    missCount: Object.values(criteria).filter((status) => status === 'miss').length,
  };
}

export function matchAllProjects(projects: BtoProject[], answers: ExplorerAnswers): Record<string, ProjectMatch> {
  return Object.fromEntries(projects.map((project) => [project.id, matchProject(project, answers)]));
}

export function projectOpacity(match: ProjectMatch, selected: boolean): number {
  if (selected) return 1;
  return Math.max(0.24, 1 - match.missCount * 0.18);
}
