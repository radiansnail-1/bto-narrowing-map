import { describe, expect, it } from 'vitest';
import { btoProjects } from '@/data/bto-projects';
import { answeredCount, bucketFor, groupResults } from '@/lib/results';
import type { ExplorerAnswers, MatchStatus, ProjectMatch } from '@/lib/types';

const baseAnswers: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityGroups: [], waitingBand: null, customWorkplace: null };

function match(statuses: Partial<Record<keyof Omit<ProjectMatch, 'missCount'>, MatchStatus>> = {}): ProjectMatch {
  const full = { commute: 'pass', budget: 'pass', amenities: 'pass', waiting: 'pass', ...statuses } as Omit<ProjectMatch, 'missCount'>;
  return { ...full, missCount: Object.values(full).filter((status) => status === 'miss').length };
}

describe('result grouping', () => {
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
