import { describe, expect, it } from 'vitest';
import { amenities, amenityById } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { workHubs } from '@/data/work-hubs';
import { ONE_KM_SCENE_RADIUS, SCENE_KM_PER_UNIT } from '@/lib/geo';
import snapshot from '@/data/official-data-snapshot.json';

describe('official snapshot data integrity', () => {
  it('integrates every official project/announcement record in the snapshot', () => {
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
      expect(project.checkedDate >= snapshot.snapshotDate).toBe(true);
      // A partial announcement check does not advance the last whole-snapshot audit.
      if (project.checkedDate > snapshot.lastAuditDate) {
        expect(snapshot.sources.some((source) => project.sourceUrls.includes(source.url) && source.checkedDate === project.checkedDate)).toBe(true);
      }
    }
    expect(btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')?.position).toBeNull();
    expect(btoProjects.find((project) => project.id === 'nov-2026-bedok-unnamed')?.dataNote).toMatch(/Map location unavailable/);
    expect(btoProjects.find((project) => project.id === 'berlayar-rise')?.estimatedWaitingTimeMonths).toMatchObject({ min: 49, max: 54 });
  });

  it('keeps the 4 November launch facts separate from unknown prices and the full audit', () => {
    const november = snapshot.projects.filter(project => project.launch.exercise === 'November 2026 BTO');
    expect(november.map(project => [project.id, project.canonicalName, project.classification, project.approxBtoUnits])).toEqual([
      ['nov-2026-bedok-unnamed', 'Bayshore Sails', 'Plus', 1637],
      ['nov-2026-bayshore-oasis', 'Bayshore Oasis', 'Plus', 855],
      ['nov-2026-geylang-unnamed', 'Merpati Meadow', 'Plus', 438],
      ['nov-2026-sembawang-unnamed', 'Sembawang Anchor', 'Standard', 1310],
      ['nov-2026-tengah-unnamed', 'Plantation Dew', 'Standard', 710],
      ['nov-2026-yishun-unnamed', 'Chencharu Acres', 'Standard', 1582],
      ['nov-2026-toa-payoh-west-caldecott', 'Toa Payoh Hillside', 'Prime', 1432],
    ]);
    expect(november.reduce((sum, project) => sum + (project.approxBtoUnits ?? 0), 0)).toBe(7964);
    for (const project of november) {
      expect(project.launch).toMatchObject({ status: 'launched', launchDate: '2026-11-04', applicationWindow: ['2026-11-04', '2026-11-11'] });
      expect(project.checkedDate).toBe('2026-11-05');
      expect(project.sourceUrls).toContain('https://www.mynicehome.gov.sg/get-started/hdb-bto-sales-launch/');
      expect(btoProjects.find(item => item.id === project.id)?.flatTypes.every(flat => flat.minPrice === null && flat.maxPrice === null)).toBe(true);
    }
    const hillside = november.find(project => project.id === 'nov-2026-toa-payoh-west-caldecott');
    expect(hillside?.flatTypes?.map(flat => flat.units)).toEqual([592, 584, 256]);
    expect(hillside?.publicRentalUnitsApprox).toBe(230);
    expect(snapshot.lastAuditDate).toBe('2026-08-28');
    expect(btoProjects.find(project => project.id === 'nov-2026-sembawang-unnamed')?.estimatedWaitingTimeMonths).toBe(34);
    expect(btoProjects.find(project => project.id === 'nov-2026-bayshore-oasis')?.estimatedWaitingTimeMonths).toBe(38);
    expect(btoProjects.find(project => project.id === 'nov-2026-tengah-unnamed')?.estimatedWaitingTimeMonths).toBe(38);
  });

  it('keeps official work hubs and the 1 km scene scale explicit', () => {
    expect(workHubs).toHaveLength(snapshot.workHubs.length);
    expect(ONE_KM_SCENE_RADIUS * SCENE_KM_PER_UNIT).toBeCloseTo(1);
    expect(amenities.some((amenity) => (amenity.type as string) === 'bus')).toBe(false);
  });
});
