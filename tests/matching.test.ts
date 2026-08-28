import { describe, expect, it } from 'vitest';
import { btoProjects } from '@/data/bto-projects';
import { matchAllProjects, matchProject, projectOpacity, WORKPLACE_PROXIMITY_KM } from '@/lib/matching';
import type { ExplorerAnswers } from '@/lib/types';

const baseAnswers: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityCategories: [], waitingBand: null, customWorkplace: null };

describe('project matching', () => {
  it('leaves every criterion unanswered and every project bright by default', () => {
    const matches = matchAllProjects(btoProjects, baseAnswers);
    expect(matches['sembawang-voyage']).toMatchObject({ commute: 'unanswered', budget: 'unanswered', amenities: 'unanswered', waiting: 'unanswered', missCount: 0 });
    expect(projectOpacity(matches['sembawang-voyage'], false)).toBe(1);
  });

  it('uses equal-weighted straight-line proximity for one or two preset hubs', () => {
    const nearby = btoProjects.find((project) => project.id === 'redhill-peaks')!;
    const distant = btoProjects.find((project) => project.id === 'sembawang-voyage')!;
    expect(matchProject(nearby, { ...baseAnswers, workHubIds: ['raffles-place'] }).commute).toBe('pass');
    expect(matchProject(distant, { ...baseAnswers, workHubIds: ['raffles-place'] }).commute).toBe('miss');
    expect(matchProject(nearby, { ...baseAnswers, workHubIds: ['raffles-place', 'one-north'] }).commute).toBe('pass');
    expect(WORKPLACE_PROXIMITY_KM).toBe(5);
  });

  it('uses a labelled straight-line proximity rule for a custom pin', () => {
    const project = btoProjects.find((item) => item.id === 'tampines-nova')!;
    expect(matchProject(project, { ...baseAnswers, customWorkplace: project.position }).commute).toBe('pass');
    expect(matchProject(project, { ...baseAnswers, customWorkplace: [project.position![0] + 8, project.position![1]] }).commute).toBe('miss');
    expect(matchProject({ ...project, position: null }, { ...baseAnswers, customWorkplace: [0, 0] }).commute).toBe('unknown');
  });

  it('uses official minimum price and waiting-month ranges, keeping nulls neutral', () => {
    const result = matchProject(btoProjects.find((project) => project.id === 'sembawang-voyage')!, { ...baseAnswers, flatType: '4-room', maxBudget: 304000, waitingBand: 'mid' });
    expect(result.budget).toBe('pass');
    expect(result.waiting).toBe('pass');
    const unknownPrice = matchProject(btoProjects.find((project) => project.id === 'nov-2026-toa-payoh-west-caldecott')!, { ...baseAnswers, flatType: '4-room', maxBudget: 900000 });
    expect(unknownPrice.budget).toBe('unknown');
    const unknownWait = matchProject(btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')!, { ...baseAnswers, waitingBand: 'later' });
    expect(unknownWait.waiting).toBe('unknown');
  });

  it('requires every chosen amenity category and dims equally for misses', () => {
    const result = matchProject(btoProjects.find((project) => project.id === 'sembawang-voyage')!, { ...baseAnswers, amenityCategories: ['mrt', 'parks', 'schools'] });
    expect(result.amenities).toBe('miss');
    expect(result.missCount).toBe(1);
    expect(projectOpacity(result, false)).toBeCloseTo(0.82);
    expect(projectOpacity(result, true)).toBe(1);
  });
});
