import { describe, expect, it } from 'vitest';
import { LEGACY_STORAGE_KEY, STORAGE_KEY, loadStoredState, parseStoredState, saveStoredState } from '@/lib/storage';
import type { StoredState } from '@/lib/storage';

function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

const legacyAnswers = {
  workHubIds: ['raffles-place'],
  maxBudget: 500000,
  flatType: '4-room',
  amenityCategories: ['hawker', 'sports', 'shopping', 'mrt'],
  waitingBand: 'soon',
  customWorkplace: null,
};

describe('stored explorer state', () => {
  it('migrates legacy amenity types into first-seen, deduped, capped groups', () => {
    const parsed = parseStoredState(JSON.stringify({ answers: legacyAnswers, visibleAmenities: ['mrt', 'parks'], step: 2 }));
    expect(parsed.answers).toMatchObject({ workHubIds: ['raffles-place'], maxBudget: 500000, flatType: '4-room', waitingBand: 'soon', amenityGroups: ['food-shopping', 'parks-recreation', 'mrt'] });
    expect(parsed.visibleGroups).toEqual(['mrt', 'parks-recreation']);
    expect(parsed.step).toBe(2);
  });

  it('drops unknown values from amenity lists while retaining known values', () => {
    const parsed = parseStoredState(JSON.stringify({ answers: { ...legacyAnswers, amenityCategories: ['bus', 'hawker', 'bus', 'parks-recreation'] }, visibleAmenities: ['bus', 'mrt', 'garbage', 'parks'] }));
    expect(parsed.answers?.amenityGroups).toEqual(['food-shopping', 'parks-recreation']);
    expect(parsed.visibleGroups).toEqual(['mrt', 'parks-recreation']);
  });

  it('rejects a fully malformed answers object and out-of-range steps', () => {
    const parsed = parseStoredState(JSON.stringify({
      answers: { workHubIds: ['not-a-hub'], maxBudget: 'free', flatType: 'penthouse', amenityCategories: ['bus'], waitingBand: 'never', customWorkplace: ['x', 3] },
      step: 99,
    }));
    expect(parsed).not.toHaveProperty('answers');
    expect(parsed).not.toHaveProperty('step');
  });

  it('returns an empty state for invalid JSON', () => {
    expect(parseStoredState('{not json')).toEqual({});
    expect(parseStoredState(null)).toEqual({});
  });

  it('prefers the v2 key and otherwise migrates then removes the legacy key', () => {
    const current = fakeStorage({
      [STORAGE_KEY]: JSON.stringify({ answers: { ...legacyAnswers, amenityCategories: ['mrt'] }, visibleGroups: ['mrt'], step: 1 }),
      [LEGACY_STORAGE_KEY]: JSON.stringify({ answers: { ...legacyAnswers, amenityCategories: ['hawker'] }, step: 3 }),
    });
    expect(loadStoredState(current)).toMatchObject({ step: 1, answers: { amenityGroups: ['mrt'] } });
    expect(current.values.has(LEGACY_STORAGE_KEY)).toBe(true);

    const legacy = fakeStorage({ [LEGACY_STORAGE_KEY]: JSON.stringify({ answers: legacyAnswers, visibleAmenities: ['mrt'], step: 2 }) });
    expect(loadStoredState(legacy)).toMatchObject({ step: 2, answers: { amenityGroups: ['food-shopping', 'parks-recreation', 'mrt'] }, visibleGroups: ['mrt'] });
    expect(legacy.values.has(LEGACY_STORAGE_KEY)).toBe(false);
  });

  it('saves the current state under the v2 key', () => {
    const storage = fakeStorage();
    const state: StoredState = { answers: { workHubIds: [], maxBudget: null, flatType: null, amenityGroups: ['mrt'], waitingBand: null, customWorkplace: null }, visibleGroups: ['mrt'], step: 2 };
    saveStoredState(storage, state);
    expect(storage.values.get(STORAGE_KEY)).toBe(JSON.stringify(state));
  });

  it('does not throw when storage reads fail', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => undefined, removeItem: () => undefined };
    expect(() => loadStoredState(broken)).not.toThrow();
    expect(loadStoredState(broken)).toEqual({});
  });
});
