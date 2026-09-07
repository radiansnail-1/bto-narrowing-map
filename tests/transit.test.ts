import { describe, expect, it } from 'vitest';
import { geoToScenePosition } from '@/lib/geo';
import { googleTransitUrl, sceneToTransitCoordinates } from '@/lib/transit';

describe('external transit directions', () => {
  it('round-trips geographic anchors through the map projection', () => {
    for (const point of [{ latitude: 1.283, longitude: 103.851 }, { latitude: 1.45, longitude: 103.72 }]) {
      const restored = sceneToTransitCoordinates(geoToScenePosition(point))!;
      expect(restored.latitude).toBeCloseTo(point.latitude, 10);
      expect(restored.longitude).toBeCloseTo(point.longitude, 10);
    }
  });

  it('encodes coordinates in latitude-longitude order and explicitly selects transit', () => {
    const href = googleTransitUrl({ latitude: 1.283, longitude: 103.851 }, { latitude: 1.31, longitude: 103.79 })!;
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('origin')).toBe('1.283000,103.851000');
    expect(url.searchParams.get('destination')).toBe('1.310000,103.790000');
    expect(url.searchParams.get('travelmode')).toBe('transit');
    expect(href).toContain('%2C');
    expect(url.searchParams.has('key')).toBe(false);
  });

  it('does not guess missing or malformed origins and destinations', () => {
    const valid = { latitude: 1.3, longitude: 103.8 };
    expect(googleTransitUrl(null, valid)).toBeNull();
    expect(googleTransitUrl(valid, null)).toBeNull();
    expect(googleTransitUrl({ latitude: NaN, longitude: 103.8 }, valid)).toBeNull();
    expect(googleTransitUrl(valid, { latitude: 91, longitude: 103.8 })).toBeNull();
    expect(googleTransitUrl(valid, { latitude: 1.3, longitude: 181 })).toBeNull();
    expect(sceneToTransitCoordinates(null)).toBeNull();
    expect(sceneToTransitCoordinates([Infinity, 0])).toBeNull();
    expect(sceneToTransitCoordinates([0, 1e6])).toBeNull();
  });
});
