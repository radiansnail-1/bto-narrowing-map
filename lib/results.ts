import { CRITERIA, type BtoProject, type CriterionKey, type ExplorerAnswers, type MatchStatus, type ProjectMatch } from '@/lib/types';

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
