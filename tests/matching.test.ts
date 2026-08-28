import { describe, expect, it } from 'vitest';
import { amenities } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { FIT_OPACITY_STEP, matchAllProjects, matchProject, projectOpacity, WORKPLACE_PROXIMITY_KM } from '@/lib/matching';
import type { ExplorerAnswers, ProjectMatch } from '@/lib/types';

const baseAnswers: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityGroups: [], waitingBand: null, customWorkplace: null };

describe('project matching', () => {
  it('leaves every criterion unanswered and every project bright by default', () => {
    const matches = matchAllProjects(btoProjects, baseAnswers);
    expect(matches['sembawang-voyage']).toMatchObject({ commute: 'unanswered', budget: 'unanswered', amenities: 'unanswered', waiting: 'unanswered', missCount: 0 });
    expect(projectOpacity(matches['sembawang-voyage'])).toBe(1);
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
    const result = matchProject(btoProjects.find((project) => project.id === 'sembawang-voyage')!, { ...baseAnswers, amenityGroups: ['mrt', 'parks-recreation', 'schools'] });
    expect(result.amenities).toBe('miss');
    expect(result.missCount).toBe(1);
    expect(projectOpacity(result)).toBe(0.77);
  });

  it('uses the exact five-step fit-opacity sequence and a fixed step size', () => {
    expect(FIT_OPACITY_STEP).toBe(0.23);
    const statuses: ProjectMatch['commute'][] = ['pass', 'miss', 'unknown', 'unanswered'];
    expect([0, 1, 2, 3, 4].map((missCount) => projectOpacity({ commute: 'pass', budget: 'pass', amenities: 'pass', waiting: 'pass', missCount }))).toEqual([1, 0.77, 0.54, 0.31, 0.08]);
    for (const status of statuses.filter((item) => item !== 'miss')) {
      expect(projectOpacity({ commute: status, budget: 'pass', amenities: 'pass', waiting: 'pass', missCount: 0 })).toBe(1);
    }
    expect(projectOpacity({ commute: 'unknown', budget: 'unanswered', amenities: 'pass', waiting: 'unknown', missCount: 0 })).toBe(1);
  });

  it('matches either food type through the shared food-and-shopping group', () => {
    const template = btoProjects.find((project) => project.id === 'tampines-bliss')!;
    const answers = { ...baseAnswers, amenityGroups: ['food-shopping'] as const };
    expect(matchProject({ ...template, amenityIds: ['hawker-tampines-round'] }, answers).amenities).toBe('pass');
    expect(matchProject({ ...template, amenityIds: ['shopping-tampines-mall'] }, answers).amenities).toBe('pass');
    expect(matchProject({ ...template, amenityIds: ['mrt-tampines-east'] }, answers).amenities).toBe('miss');
  });

  it('preserves official amenity types while exposing their user-facing groups', () => {
    const hawker = amenities.find((amenity) => amenity.id === 'hawker-tampines-round');
    expect(hawker).toMatchObject({ type: 'hawker', group: 'food-shopping' });
  });

  it('keeps an empty amenity reference set unknown rather than a confirmed miss', () => {
    const template = btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')!;
    expect(matchProject({ ...template, amenityIds: [] }, { ...baseAnswers, amenityGroups: ['parks-recreation'] }).amenities).toBe('unknown');
  });
});
