/** Shared contract between scripts/build-map-assets.ts and the runtime loader in lib/map-assets.ts. */
export const MAP_QUANT = 1000;

export const LINE_CLASS = { motorway: 0, trunk: 1, primary: 2, secondary: 3, link: 4, rail: 5, runway: 6, coast: 7, district: 8 } as const;
export type LineClass = (typeof LINE_CLASS)[keyof typeof LINE_CLASS];

export interface MapTile {
  x0: number; z0: number; x1: number; z1: number;
  byteOffset: number; byteLength: number; count: number; maxHeightM: number;
}

export interface MapManifest {
  version: number;
  generatedAt: string;
  projection: { originLatitude: number; originLongitude: number; unitsPerDegree: number; kmPerUnit: number; quant: number };
  bounds: { x0: number; z0: number; x1: number; z1: number };
  sources: Array<{ name: string; role: string; url: string; license: string; retrieved: string }>;
  heightMethod: string;
  counts: Record<string, number>;
  tileSize: number;
  tiles: MapTile[];
  areas: Array<{ name: string; x: number; z: number; areaKm2: number }>;
  files: { land: string; water: string; green: string; buildings: string; lines: string; rail: string; places: string };
}

export interface RailData {
  lines: Array<{ ref: string; colour: string }>;
  stations: Array<{ name: string; x: number; z: number }>;
}

export interface PlaceHighlight {
  amenityId: string;
  source: 'osm-footprint' | 'coordinate-fallback';
  sourceName?: string;
  distanceM?: number;
  rings: Array<Array<[number, number]>>;
}

export interface PlaceHighlightData { version: 1; places: PlaceHighlight[] }
