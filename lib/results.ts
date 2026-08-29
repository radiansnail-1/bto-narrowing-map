import { CRITERIA, type BtoProject, type CriterionKey, type ExplorerAnswers, type MatchStatus, type ProjectMatch } from '@/lib/types';
import { AMENITY_GROUPS } from '@/lib/amenity-groups';
import { WAITING_BANDS } from '@/lib/types';
import { workHubs } from '@/data/work-hubs';

/**
 * Results are grouped, never ranked. Order inside a bucket is the official snapshot order.
 *
 * - fits:      every answered criterion is a confirmed pass
 * - awaiting:  no confirmed failure, at least one answered criterion is unknown (unpublished fact)
 * - tradeoffs: at least one confirmed failure, regardless of unknowns
 */
export type ResultBucket = 'fits' | 'awaiting' | 'tradeoffs';

export const RESULT_BUCKETS: ReadonlyArray<{ id: ResultBucket; title: string; description: string }> = [
  { id: 'fits', title: 'Fits all criteria', description: 'Every answered criterion is a confirmed pass.' },
  { id: 'awaiting', title: 'Could fit — awaiting published data', description: 'No confirmed miss, but at least one answer depends on a fact HDB has not published yet.' },
  { id: 'tradeoffs', title: 'Has trade-offs', description: 'At least one answered criterion is a confirmed miss.' },
];

export type LaunchStatusFilter = 'all' | BtoProject['launchStatus'];

export function filterProjectsByLaunchStatus(projects: BtoProject[], filter: LaunchStatusFilter): BtoProject[] {
  return filter === 'all' ? projects : projects.filter((project) => project.launchStatus === filter);
}

export function criterionStatuses(match: ProjectMatch): MatchStatus[] {
  return CRITERIA.map((criterion) => match[criterion.key]);
}

export function bucketFor(match: ProjectMatch): ResultBucket {
  const statuses = criterionStatuses(match);
  if (statuses.includes('miss')) return 'tradeoffs';
  if (statuses.includes('unknown')) return 'awaiting';
  return 'fits';
}

export function groupResults(projects: BtoProject[], matches: Record<string, ProjectMatch>): Record<ResultBucket, BtoProject[]> {
  const grouped: Record<ResultBucket, BtoProject[]> = { fits: [], awaiting: [], tradeoffs: [] };
  for (const project of projects) {
    const match = matches[project.id];
    if (!match) continue;
    grouped[bucketFor(match)].push(project);
  }
  return grouped;
}

export function answeredCriteria(answers: ExplorerAnswers): Record<CriterionKey, boolean> {
  return {
    commute: answers.workHubIds.length > 0 || answers.customWorkplace !== null,
    budget: answers.flatType !== null || answers.maxBudget !== null,
    amenities: answers.amenityGroups.length > 0,
    waiting: answers.waitingBand !== null,
  };
}

export function answeredCount(answers: ExplorerAnswers): number {
  return Object.values(answeredCriteria(answers)).filter(Boolean).length;
}

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  pass: 'Pass',
  miss: 'Miss',
  unknown: 'Awaiting data',
  unanswered: 'Not used',
};

export function criterionAnswerLabel(key: CriterionKey, answers: ExplorerAnswers): string {
  if (key === 'commute') {
    if (answers.customWorkplace) return 'Custom regular destination';
    const hubs = answers.workHubIds.map((id) => workHubs.find((hub) => hub.id === id)?.shortName ?? id);
    return hubs.length ? hubs.join(' + ') : 'No destination chosen';
  }
  if (key === 'budget') {
    const flat = answers.flatType ?? 'Any flat type';
    const budget = answers.maxBudget === null ? 'No price ceiling' : `$${answers.maxBudget.toLocaleString('en-SG')} max`;
    return `${flat} · ${budget}`;
  }
  if (key === 'amenities') return answers.amenityGroups.length ? answers.amenityGroups.map((group) => AMENITY_GROUPS[group].label).join(', ') : 'No amenity groups chosen';
  return WAITING_BANDS.find((band) => band.value === answers.waitingBand)?.label ?? 'No wait preference';
}

export function criterionReason(project: BtoProject, key: CriterionKey, status: MatchStatus, answers: ExplorerAnswers): string {
  if (status === 'unanswered') return 'Not used';
  if (key === 'commute') {
    if (status === 'unknown') return 'Location not published';
    return status === 'pass' ? 'Inside 5 km screen' : 'Outside 5 km screen';
  }
  if (key === 'budget') {
    if (status === 'unknown') {
      if (answers.flatType === null) return 'Choose a flat type';
      if (answers.maxBudget === null) return 'Add a maximum price to compare';
      return 'Price not published';
    }
    return status === 'pass' ? 'Starting price fits' : 'Starting price is above ceiling';
  }
  if (key === 'amenities') {
    if (status === 'unknown') return 'Amenity records not attached';
    return status === 'pass' ? 'All chosen groups found' : 'Chosen groups missing';
  }
  if (status === 'unknown') return 'Wait estimate not published';
  return status === 'pass' ? 'Wait within selected band' : 'Wait outside selected band';
}
