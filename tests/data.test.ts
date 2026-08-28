import { describe, expect, it } from 'vitest';
import { amenities, amenityById } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { workHubs } from '@/data/work-hubs';
import { ONE_KM_SCENE_RADIUS, SCENE_KM_PER_UNIT } from '@/lib/geo';
import snapshot from '@/data/official-data-snapshot.json';

describe('official snapshot data integrity', () => {
  it('integrates all 21 official project/announcement records', () => {
    expect(btoProjects).toHaveLength(snapshot.scope.projectCount);
    expect(new Set(btoProjects.map((project) => project.id)).size).toBe(btoProjects.length);
    expect(btoProjects.filter((project) => project.launchStatus === 'launched')).toHaveLength(snapshot.scope.namedLaunchedProjectCount);
    expect(btoProjects.filter((project) => project.launchStatus !== 'launched')).toHaveLength(snapshot.scope.upcomingRecordCount);
  });

  it('keeps amenity IDs exact and resolves every project reference', () => {
    expect(amenities).toHaveLength(snapshot.amenities.length);
    expect(new Set(amenities.map((amenity) => amenity.id)).size).toBe(amenities.length);
    const missing = btoProjects.flatMap((project) => project.amenityIds.filter((id) => !amenityById.has(id)));
    expect(missing).toEqual([]);
    expect(btoProjects.find((project) => project.id === 'sembawang-voyage')?.amenityIds).toEqual(['sports-jelutung-harbour-park', 'school-northoaks']);
  });

  it('preserves official source/check metadata, nulls, and the unavailable-map record', () => {
    for (const project of btoProjects) {
      expect(project.sourceUrls.length).toBeGreaterThan(0);
      expect(project.sourceUrls[0]).toMatch(/^https:\/\//);
      expect(project.checkedDate).toBe(snapshot.snapshotDate);
    }
    expect(btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')?.position).toBeNull();
    expect(btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')?.dataNote).toMatch(/Map location unavailable/);
    expect(btoProjects.find((project) => project.id === 'berlayar-rise')?.estimatedWaitingTimeMonths).toMatchObject({ min: 49, max: 54 });
  });

  it('keeps official work hubs and the 1 km scene scale explicit', () => {
    expect(workHubs).toHaveLength(snapshot.workHubs.length);
    expect(workHubs.every((hub) => hub.travelTime === null)).toBe(true);
    expect(ONE_KM_SCENE_RADIUS * SCENE_KM_PER_UNIT).toBeCloseTo(1);
    expect(amenities.some((amenity) => (amenity.type as string) === 'bus')).toBe(false);
  });
});
