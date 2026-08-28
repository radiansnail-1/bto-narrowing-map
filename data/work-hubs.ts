import snapshot from '@/data/official-data-snapshot.json';
import { geoToScenePosition } from '@/lib/geo';
import type { WorkHub } from '@/lib/types';

export const workHubs: WorkHub[] = snapshot.workHubs.map((hub) => ({
  id: hub.id,
  name: hub.name,
  shortName: hub.name,
  position: geoToScenePosition(hub.coordinates)!,
  source: hub.source,
  travelTime: null,
}));
