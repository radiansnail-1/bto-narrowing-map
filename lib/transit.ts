import { geoToScenePosition, SCENE_SCALE } from '@/lib/geo';

export interface TransitCoordinates { latitude: number; longitude: number }

function validCoordinates(point: TransitCoordinates): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

/** Invert the map projection without maintaining a second copy of its origin. */
export function sceneToTransitCoordinates(position: [number, number] | null): TransitCoordinates | null {
  if (!position || !position.every(Number.isFinite)) return null;
  const zero = geoToScenePosition({ latitude: 0, longitude: 0 })!;
  const coordinates = {
    latitude: (zero[1] - position[1]) / SCENE_SCALE,
    longitude: (position[0] - zero[0]) / SCENE_SCALE,
  };
  return validCoordinates(coordinates) ? coordinates : null;
}

/** Google Maps URLs are free external directions links, not a travel-time API. */
export function googleTransitUrl(origin: TransitCoordinates | null, destination: TransitCoordinates | null): string | null {
  if (!origin || !destination || !validCoordinates(origin) || !validCoordinates(destination)) return null;
  const format = (point: TransitCoordinates) => `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`;
  const parameters = new URLSearchParams({ api: '1', origin: format(origin), destination: format(destination), travelmode: 'transit' });
  return `https://www.google.com/maps/dir/?${parameters.toString()}`;
}
