/** Scene units used by the map's local Singapore projection. */
export const SCENE_SCALE = 85;
export const SCENE_KM_PER_UNIT = 1.31;
export const ONE_KM_SCENE_RADIUS = 1 / SCENE_KM_PER_UNIT;
const SCENE_ORIGIN = { latitude: 1.37, longitude: 103.87 };

export function geoToScenePosition(coordinates: { latitude: number; longitude: number } | null): [number, number] | null {
  if (!coordinates || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) return null;
  return [(coordinates.longitude - SCENE_ORIGIN.longitude) * SCENE_SCALE, (SCENE_ORIGIN.latitude - coordinates.latitude) * SCENE_SCALE];
}
