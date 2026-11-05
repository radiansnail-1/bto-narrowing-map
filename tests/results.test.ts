import { describe, expect, it } from 'vitest';
import { btoProjects } from '@/data/bto-projects';
import snapshot from '@/data/official-data-snapshot.json';
import { answeredCount, bucketFor, criterionAnswerLabel, criterionReason, filterProjectsByLaunchStatus, groupResults } from '@/lib/results';
import type { ExplorerAnswers, MatchStatus, ProjectMatch } from '@/lib/types';

const baseAnswers: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityGroups: [], waitingBand: null, customWorkplace: null };

function match(statuses: Partial<Record<keyof Omit<ProjectMatch, 'missCount'>, MatchStatus>> = {}): ProjectMatch {
  const full = { commute: 'pass', budget: 'pass', amenities: 'pass', waiting: 'pass', ...statuses } as Omit<ProjectMatch, 'missCount'>;
  return { ...full, missCount: Object.values(full).filter((status) => status === 'miss').length };
}

describe('result grouping', () => {
  it('filters projects by launch stage without changing their source order', () => {
    for (const stage of ['all', 'launched', 'announced_upcoming', 'planned'] as const) {
      const expected = snapshot.projects.filter((project) => stage === 'all' || project.launch.status === stage).map((project) => project.id);
      expect(filterProjectsByLaunchStatus(btoProjects, stage).map((project) => project.id)).toEqual(expected);
    }
  });
  it('filters an interleaved fixture by actual membership and preserves input order', () => {
    const projects = [
      { ...btoProjects[0], id: 'planned-a', launchStatus: 'planned' as const },
      { ...btoProjects[0], id: 'launched-a', launchStatus: 'launched' as const },
      { ...btoProjects[0], id: 'announced-a', launchStatus: 'announced_upcoming' as const },
      { ...btoProjects[0], id: 'planned-b', launchStatus: 'planned' as const },
      { ...btoProjects[0], id: 'launched-b', launchStatus: 'launched' as const },
    ];
    const ids = (stage: 'all' | 'launched' | 'announced_upcoming' | 'planned') => filterProjectsByLaunchStatus(projects, stage).map((project) => project.id);
    expect(ids('all')).toEqual(['planned-a', 'launched-a', 'announced-a', 'planned-b', 'launched-b']);
    expect(ids('planned')).toEqual(['planned-a', 'planned-b']);
    expect(ids('launched')).toEqual(['launched-a', 'launched-b']);
    expect(ids('announced_upcoming')).toEqual(['announced-a']);
  });
  it('puts all-pass, pass-plus-unknown, miss-plus-unknown, and unanswered-only matches in the right buckets', () => {
    expect(bucketFor(match())).toBe('fits');
    expect(bucketFor(match({ budget: 'unknown' }))).toBe('awaiting');
    expect(bucketFor(match({ commute: 'miss', waiting: 'unknown' }))).toBe('tradeoffs');
    expect(bucketFor(match({ commute: 'unanswered', budget: 'unanswered', amenities: 'unanswered', waiting: 'unanswered' }))).toBe('fits');
  });

  it('preserves input order inside each bucket without ranking', () => {
    const projects = btoProjects.slice(0, 5);
    const matches = {
      [projects[0].id]: match(),
      [projects[1].id]: match({ amenities: 'unknown' }),
      [projects[2].id]: match({ commute: 'miss' }),
      [projects[3].id]: match(),
      [projects[4].id]: match({ waiting: 'unknown' }),
    };
    const grouped = groupResults(projects, matches);
    expect(grouped.fits.map((project) => project.id)).toEqual([projects[0].id, projects[3].id]);
    expect(grouped.awaiting.map((project) => project.id)).toEqual([projects[1].id, projects[4].id]);
    expect(grouped.tradeoffs.map((project) => project.id)).toEqual([projects[2].id]);
  });

  it('puts every project in exactly one bucket', () => {
    const projects = btoProjects.slice(0, 8);
    const matches = Object.fromEntries(projects.map((project, index) => [project.id, match(index % 3 === 0 ? { commute: 'miss' } : index % 3 === 1 ? { budget: 'unknown' } : {})]));
    const grouped = groupResults(projects, matches);
    const bucketed = [...grouped.fits, ...grouped.awaiting, ...grouped.tradeoffs];
    expect(bucketed).toHaveLength(projects.length);
    expect(new Set(bucketed.map((project) => project.id))).toHaveLength(projects.length);
  });
});

describe('answered criteria', () => {
  it('counts each criterion once for representative answer shapes', () => {
    expect(answeredCount(baseAnswers)).toBe(0);
    expect(answeredCount({ ...baseAnswers, workHubIds: ['raffles-place'] })).toBe(1);
    expect(answeredCount({ ...baseAnswers, customWorkplace: [1, 2] })).toBe(1);
    expect(answeredCount({ ...baseAnswers, flatType: '4-room' })).toBe(1);
    expect(answeredCount({ ...baseAnswers, maxBudget: 500000 })).toBe(1);
    expect(answeredCount({ ...baseAnswers, amenityGroups: ['mrt'] })).toBe(1);
    expect(answeredCount({ ...baseAnswers, waitingBand: 'soon' })).toBe(1);
    expect(answeredCount({ ...baseAnswers, workHubIds: ['raffles-place'], flatType: '4-room', maxBudget: 500000, amenityGroups: ['mrt'], waitingBand: 'soon' })).toBe(4);
  });
});

describe('explainable result criteria', () => {
  it('labels the chosen answer without creating a ranking score', () => {
    expect(criterionAnswerLabel('commute', { ...baseAnswers, workHubIds: ['raffles-place'] })).toContain('Raffles');
    expect(criterionAnswerLabel('budget', { ...baseAnswers, flatType: '4-room', maxBudget: 500000 })).toContain('$500,000');
  });

  it('explains pass, miss, unknown, and unanswered states plainly', () => {
    const answers = { ...baseAnswers, waitingBand: 'soon' as const };
    expect(criterionReason('waiting', 'pass', answers)).toContain('within');
    expect(criterionReason('waiting', 'miss', answers)).toContain('outside');
    expect(criterionReason('waiting', 'unknown', answers)).toBe('Wait estimate not verified in this record');
    expect(criterionReason('waiting', 'unanswered', baseAnswers)).toContain('Not used');
  });

  it('does not call a missing budget ceiling an unpublished price', () => {
    expect(criterionReason('budget', 'unknown', { ...baseAnswers, flatType: '4-room' })).toBe('Add a maximum price to compare');
  });
});
