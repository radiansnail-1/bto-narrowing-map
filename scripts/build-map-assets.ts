/**
 * Offline geospatial preprocessing for the map's visual layers.
 *
 * Inputs (raw downloads under work/geo-raw/, never shipped):
 *   - subzones.geojson              URA Master Plan 2019 Subzone Boundary (No Sea), via data.gov.sg
 *   - buildings/tile-*.json         OSM building footprints (Overpass, tiled)
 *   - roads.json                    OSM motorway/trunk/primary/secondary ways (Overpass)
 *   - mrt.json                      OSM route=subway|light_rail relations (Overpass)
 *   - stations-lrt-runways.json     OSM railway stations (Overpass)
 *   - runways.json                  OSM aeroway=runway ways (Overpass)
 *   - water.json / green.json       OSM natural=water and park/forest polygons (Overpass)
 *
 * Outputs (public/map/): compact binary layers in scene units plus manifest.json.
 * Run: node scripts/build-map-assets.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { ShapeUtils, Vector2 } from 'three';
import { geoToScenePosition, SCENE_KM_PER_UNIT } from '../lib/geo.ts';
import { LINE_CLASS, MAP_QUANT, type MapManifest, type PlaceHighlight, type PlaceHighlightData } from '../lib/map-format.ts';

type Pt = [number, number];
type OsmGeometryPoint = { lat: number; lon: number };
type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: OsmGeometryPoint[];
  members?: Array<{ type: string; ref: number; role: string; geometry?: OsmGeometryPoint[] }>;
};

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'work', 'geo-raw');
const OUT = path.join(ROOT, 'public', 'map');
const M_PER_UNIT = SCENE_KM_PER_UNIT * 1000;
const UNIT2_PER_KM2 = 1 / (SCENE_KM_PER_UNIT * SCENE_KM_PER_UNIT);
const TILE_SIZE = 3;
const MIN_BUILDING_M2 = 60;
const MASK_CELL = 0.05;

const project = (lon: number, lat: number): Pt => geoToScenePosition({ latitude: lat, longitude: lon }) as Pt;
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(RAW, file), 'utf8')) as T;

function signedArea(ring: Pt[]): number {
  let area = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, z1] = ring[i];
    const [x2, z2] = ring[(i + 1) % ring.length];
    area += x1 * z2 - x2 * z1;
  }
  return area / 2;
}

function centroid(ring: Pt[]): Pt {
  let x = 0; let z = 0;
  for (const p of ring) { x += p[0]; z += p[1]; }
  return [x / ring.length, z / ring.length];
}

function dedupeConsecutive(ring: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  return out;
}

function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1; keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  const tol2 = tolerance * tolerance;
  while (stack.length) {
    const [a, b] = stack.pop()!;
    if (b - a < 2) continue;
    const [ax, az] = points[a]; const [bx, bz] = points[b];
    const dx = bx - ax; const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    let best = -1; let bestDist = 0;
    for (let i = a + 1; i < b; i += 1) {
      const [px, pz] = points[i];
      let dist: number;
      if (len2 === 0) dist = (px - ax) ** 2 + (pz - az) ** 2;
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
        dist = (px - (ax + t * dx)) ** 2 + (pz - (az + t * dz)) ** 2;
      }
      if (dist > bestDist) { bestDist = dist; best = i; }
    }
    if (bestDist > tol2 && best >= 0) { keep[best] = 1; stack.push([a, best], [best, b]); }
  }
  return points.filter((_, i) => keep[i] === 1);
}

function simplifyRing(ring: Pt[], tolerance: number): Pt[] {
  if (ring.length < 4) return ring;
  const closed = simplify([...ring, ring[0]], tolerance);
  closed.pop();
  return closed.length >= 3 ? closed : ring;
}

function pointInRing(p: Pt, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, zi] = ring[i]; const [xj, zj] = ring[j];
    if (zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Raster of planning-area indices (0 = sea) used for clipping OSM data to Singapore land. */
class LandMask {
  readonly x0: number; readonly z0: number; readonly cols: number; readonly rows: number; readonly cells: Uint8Array;
  constructor(x0: number, z0: number, x1: number, z1: number) {
    this.x0 = x0; this.z0 = z0;
    this.cols = Math.ceil((x1 - x0) / MASK_CELL); this.rows = Math.ceil((z1 - z0) / MASK_CELL);
    this.cells = new Uint8Array(this.cols * this.rows);
  }
  paint(outer: Pt[], holes: Pt[][], value: number) {
    let minX = Infinity; let maxX = -Infinity; let minZ = Infinity; let maxZ = -Infinity;
    for (const [x, z] of outer) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); }
    const c0 = Math.max(0, Math.floor((minX - this.x0) / MASK_CELL)); const c1 = Math.min(this.cols - 1, Math.ceil((maxX - this.x0) / MASK_CELL));
    const r0 = Math.max(0, Math.floor((minZ - this.z0) / MASK_CELL)); const r1 = Math.min(this.rows - 1, Math.ceil((maxZ - this.z0) / MASK_CELL));
    for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) {
      const p: Pt = [this.x0 + (c + 0.5) * MASK_CELL, this.z0 + (r + 0.5) * MASK_CELL];
      if (pointInRing(p, outer) && !holes.some((hole) => pointInRing(p, hole))) this.cells[r * this.cols + c] = value;
    }
  }
  at(p: Pt): number {
    const c = Math.floor((p[0] - this.x0) / MASK_CELL); const r = Math.floor((p[1] - this.z0) / MASK_CELL);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return 0;
    return this.cells[r * this.cols + c];
  }
  dilated(radiusCells: number): LandMask {
    const out = new LandMask(this.x0, this.z0, this.x0 + this.cols * MASK_CELL, this.z0 + this.rows * MASK_CELL);
    for (let r = 0; r < this.rows; r += 1) for (let c = 0; c < this.cols; c += 1) {
      if (!this.cells[r * this.cols + c]) continue;
      for (let dr = -radiusCells; dr <= radiusCells; dr += 1) for (let dc = -radiusCells; dc <= radiusCells; dc += 1) {
        if (dr * dr + dc * dc > radiusCells * radiusCells) continue;
        const rr = r + dr; const cc = c + dc;
        if (rr >= 0 && cc >= 0 && rr < this.rows && cc < this.cols) out.cells[rr * this.cols + cc] = 1;
      }
    }
    return out;
  }
}

/** Joins OSM multipolygon member ways into closed rings by matching endpoints. */
function chainRings(ways: Pt[][]): Pt[][] {
  const pending = ways.filter((way) => way.length >= 2).map((way) => [...way]);
  const rings: Pt[][] = [];
  const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
  while (pending.length) {
    const ring = pending.shift()!;
    let extended = true;
    while (extended && !same(ring[0], ring[ring.length - 1])) {
      extended = false;
      for (let i = 0; i < pending.length; i += 1) {
        const candidate = pending[i];
        const tail = ring[ring.length - 1];
        if (same(candidate[0], tail)) { ring.push(...candidate.slice(1)); pending.splice(i, 1); extended = true; break; }
        if (same(candidate[candidate.length - 1], tail)) { ring.push(...candidate.slice(0, -1).reverse()); pending.splice(i, 1); extended = true; break; }
      }
    }
    if (same(ring[0], ring[ring.length - 1])) ring.pop();
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

function elementRings(element: OsmElement): Pt[][] {
  if (element.type === 'way' && element.geometry) {
    const ring = dedupeConsecutive(element.geometry.map((p) => project(p.lon, p.lat)));
    return ring.length >= 3 ? [ring] : [];
  }
  if (element.type === 'relation' && element.members) {
    const outers = element.members.filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '') && m.geometry).map((m) => m.geometry!.map((p) => project(p.lon, p.lat)));
    return chainRings(outers).map(dedupeConsecutive).filter((ring) => ring.length >= 3);
  }
  return [];
}

function elementHoles(element: OsmElement): Pt[][] {
  if (element.type !== 'relation' || !element.members) return [];
  const inners = element.members.filter((m) => m.type === 'way' && m.role === 'inner' && m.geometry).map((m) => m.geometry!.map((p) => project(p.lon, p.lat)));
  return chainRings(inners).map(dedupeConsecutive).filter((ring) => ring.length >= 3);
}

const hash01 = (id: number) => (((Math.imul(id | 0, 2654435761) >>> 0) % 100000) / 100000);
const quant = (v: number) => Math.max(-32768, Math.min(32767, Math.round(v * MAP_QUANT)));

/* ----------------------------------------------------------------------------------------------- */
/* Land: URA subzones                                                                                */
/* ----------------------------------------------------------------------------------------------- */

type SubzoneFeature = { properties: { PLN_AREA_N: string; SUBZONE_N: string; REGION_N: string }; geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] } };
const subzones = readJson<{ features: SubzoneFeature[] }>('subzones.geojson').features;
const areaNames = Array.from(new Set(subzones.map((f) => f.properties.PLN_AREA_N))).sort();
const areaIndex = new Map(areaNames.map((name, index) => [name, index]));

type LandPolygon = { area: number; outer: Pt[]; holes: Pt[][] };
const landPolygons: LandPolygon[] = [];
for (const feature of subzones) {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as number[][][]] : (feature.geometry.coordinates as number[][][][]);
  for (const polygon of polygons) {
    const rings = polygon.map((ring) => dedupeConsecutive(ring.map(([lon, lat]) => { const p = project(lon, lat); return [quant(p[0]) / MAP_QUANT, quant(p[1]) / MAP_QUANT] as Pt; })));
    if (rings[0].length < 3) continue;
    landPolygons.push({ area: areaIndex.get(feature.properties.PLN_AREA_N)!, outer: rings[0], holes: rings.slice(1).filter((r) => r.length >= 3) });
  }
}

let bx0 = Infinity; let bx1 = -Infinity; let bz0 = Infinity; let bz1 = -Infinity;
for (const poly of landPolygons) for (const [x, z] of poly.outer) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); bz0 = Math.min(bz0, z); bz1 = Math.max(bz1, z); }
const mask = new LandMask(bx0 - 1, bz0 - 1, bx1 + 1, bz1 + 1);
for (const poly of landPolygons) mask.paint(poly.outer, poly.holes, poly.area + 1);
const nearLand = mask.dilated(6);
console.log(`land: ${landPolygons.length} polygons, ${areaNames.length} planning areas, bounds x ${bx0.toFixed(2)}..${bx1.toFixed(2)} z ${bz0.toFixed(2)}..${bz1.toFixed(2)}`);

// Coastline vs district boundaries: edges used by exactly one subzone polygon are coast.
const edgeUse = new Map<string, { count: number; areas: Set<number>; a: Pt; b: Pt }>();
for (const poly of landPolygons) {
  for (const ring of [poly.outer, ...poly.holes]) {
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i]; const b = ring[(i + 1) % ring.length];
      const ka = `${a[0]},${a[1]}`; const kb = `${b[0]},${b[1]}`;
      const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      const entry = edgeUse.get(key) ?? { count: 0, areas: new Set<number>(), a, b };
      entry.count += 1; entry.areas.add(poly.area);
      edgeUse.set(key, entry);
    }
  }
}
const coastEdges: Array<[Pt, Pt]> = []; const districtEdges: Array<[Pt, Pt]> = [];
for (const entry of edgeUse.values()) {
  if (entry.count === 1) coastEdges.push([entry.a, entry.b]);
  else if (entry.areas.size > 1) districtEdges.push([entry.a, entry.b]);
}
function chainEdges(edges: Array<[Pt, Pt]>): Pt[][] {
  const key = (p: Pt) => `${p[0]},${p[1]}`;
  const adjacency = new Map<string, Array<[Pt, Pt]>>();
  for (const edge of edges) {
    for (const p of edge) { const list = adjacency.get(key(p)) ?? []; list.push(edge); adjacency.set(key(p), list); }
  }
  const used = new Set<[Pt, Pt]>();
  const lines: Pt[][] = [];
  for (const edge of edges) {
    if (used.has(edge)) continue;
    used.add(edge);
    const line: Pt[] = [edge[0], edge[1]];
    for (const direction of [1, -1] as const) {
      let guard = 0;
      while (guard++ < 100000) {
        const end = direction === 1 ? line[line.length - 1] : line[0];
        const next = (adjacency.get(key(end)) ?? []).find((candidate) => !used.has(candidate));
        if (!next) break;
        used.add(next);
        const other = key(next[0]) === key(end) ? next[1] : next[0];
        if (direction === 1) line.push(other); else line.unshift(other);
      }
    }
    lines.push(line);
  }
  return lines;
}
const coastLines = chainEdges(coastEdges).map((line) => simplify(line, 0.003)).filter((line) => line.length >= 2);
const districtLines = chainEdges(districtEdges).map((line) => simplify(line, 0.004)).filter((line) => line.length >= 2);
console.log(`coast polylines ${coastLines.length} (${coastLines.reduce((n, l) => n + l.length, 0)} pts), district polylines ${districtLines.length}`);

// Triangulated land cap with per-vertex planning-area index.
const landPositions: number[] = []; const landIndices: number[] = []; const landAreas: number[] = [];
const areaAccum = areaNames.map(() => ({ x: 0, z: 0, w: 0 }));
for (const poly of landPolygons) {
  const outer = simplifyRing(poly.outer, 0.002);
  const holes = poly.holes.map((hole) => simplifyRing(hole, 0.002));
  const contour = outer.map(([x, y]) => new Vector2(x, y));
  const triangles = ShapeUtils.triangulateShape(contour, holes.map((hole) => hole.map(([x, y]) => new Vector2(x, y))));
  const base = landPositions.length / 2;
  for (const ring of [outer, ...holes]) for (const [x, z] of ring) { landPositions.push(x, z); landAreas.push(poly.area); }
  const flat = [...outer, ...holes.flat()];
  for (const [a, b, c] of triangles) {
    landIndices.push(base + a, base + b, base + c);
    const w = Math.abs(signedArea([flat[a], flat[b], flat[c]]));
    const acc = areaAccum[poly.area];
    acc.x += ((flat[a][0] + flat[b][0] + flat[c][0]) / 3) * w; acc.z += ((flat[a][1] + flat[b][1] + flat[c][1]) / 3) * w; acc.w += w;
  }
}
console.log(`land mesh: ${landPositions.length / 2} vertices, ${landIndices.length / 3} triangles`);

/* ----------------------------------------------------------------------------------------------- */
/* Buildings: OSM footprints, heights from tags where present, deterministic bands otherwise        */
/* ----------------------------------------------------------------------------------------------- */

const HDB_TOWNS = new Set(['ANG MO KIO', 'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST', 'JURONG WEST', 'KALLANG', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN', 'SEMBAWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN', 'TENGAH']);
const CBD_AREAS = new Set(['DOWNTOWN CORE', 'ORCHARD', 'MUSEUM', 'ROCHOR', 'SINGAPORE RIVER', 'OUTRAM', 'NEWTON', 'NOVENA', 'RIVER VALLEY', 'MARINA SOUTH', 'STRAITS VIEW']);
const EXCLUDED_TYPES = new Set(['roof', 'garage', 'garages', 'shed', 'hut', 'shelter', 'carport', 'parking', 'service', 'storage_tank', 'kiosk', 'toilets', 'ruins', 'greenhouse', 'no', 'bridge', 'grandstand']);
// Hand-modelled landmarks in MapScene replace the raw footprints near these anchors (lat, lon, radius m).
const LANDMARK_EXCLUSIONS: Array<[number, number, number]> = [
  [1.2836, 103.8607, 190], // Marina Bay Sands towers
  [1.2893, 103.8632, 90], // Singapore Flyer
  [1.2899, 103.8556, 120], // Esplanade
  [1.2868, 103.8545, 35], // Merlion
];
const landmarkCentres = LANDMARK_EXCLUSIONS.map(([lat, lon, r]) => ({ p: project(lon, lat), r: r / M_PER_UNIT }));

const KIND = { generic: 0, residential: 1, commercial: 2, industrial: 3, house: 4, civic: 5, construction: 6, retail: 7, transport: 8 } as const;
function classify(tags: Record<string, string>): number {
  const b = tags.building ?? 'yes';
  if (['residential', 'apartments', 'dormitory'].includes(b)) return KIND.residential;
  if (['house', 'terrace', 'semidetached_house', 'detached', 'bungalow', 'villa'].includes(b)) return KIND.house;
  if (['commercial', 'office', 'hotel'].includes(b)) return KIND.commercial;
  if (['industrial', 'warehouse', 'manufacture', 'factory', 'hangar'].includes(b)) return KIND.industrial;
  if (['retail', 'mall', 'supermarket'].includes(b)) return KIND.retail;
  if (['school', 'public', 'university', 'college', 'hospital', 'temple', 'church', 'mosque', 'civic', 'government', 'kindergarten', 'religious', 'stadium', 'sports_centre'].includes(b)) return KIND.civic;
  if (b === 'construction') return KIND.construction;
  if (['train_station', 'transportation', 'bus_station'].includes(b)) return KIND.transport;
  return KIND.generic;
}
function parseMetres(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function heightMetres(id: number, tags: Record<string, string>, kind: number, areaM2: number, areaName: string): number {
  const tagged = parseMetres(tags.height);
  if (tagged) return Math.min(tagged, 300);
  const levels = parseMetres(tags['building:levels']);
  if (levels) return Math.min(levels * (kind === KIND.commercial ? 3.6 : kind === KIND.house ? 3.2 : 3.0) + 1.5, 300);
  const h = hash01(id);
  const cbd = CBD_AREAS.has(areaName);
  const hdbTown = HDB_TOWNS.has(areaName);
  switch (kind) {
    case KIND.residential: return areaM2 > 500 ? (10 + Math.floor(h * 7)) * 2.9 : areaM2 > 200 ? (4 + Math.floor(h * 6)) * 2.9 : (2 + Math.floor(h * 3)) * 3;
    case KIND.house: return (2 + (h > 0.7 ? 1 : 0)) * 3.2;
    case KIND.industrial: return (2 + Math.floor(h * 4)) * 4.5;
    case KIND.commercial: return cbd ? (12 + Math.floor(h * 28)) * 3.6 : (4 + Math.floor(h * 8)) * 3.6;
    case KIND.retail: return (2 + Math.floor(h * 3)) * 4;
    case KIND.civic: return (3 + Math.floor(h * 3)) * 3.6;
    case KIND.construction: return 6;
    case KIND.transport: return 6;
    default:
      if (cbd && areaM2 > 800) return (8 + Math.floor(h * 20)) * 3.6;
      if (hdbTown && areaM2 >= 600 && areaM2 <= 3200) return (9 + Math.floor(h * 7)) * 2.9;
      if (areaM2 < 120) return (1 + Math.floor(h * 2)) * 3.2;
      if (areaM2 < 400) return (2 + Math.floor(h * 3)) * 3.2;
      if (areaM2 < 1200) return (3 + Math.floor(h * 4)) * 3.2;
      return (4 + Math.floor(h * 5)) * 3.2;
  }
}

type BuildingRecord = { ring: Pt[]; kind: number; heightM: number; cx: number; cz: number; tagged: boolean };
const buildingsByTile = new Map<string, BuildingRecord[]>();
const seenBuildings = new Set<number>();
const buildingStats = { total: 0, kept: 0, taggedHeight: 0, taggedLevels: 0, excludedType: 0, small: 0, offshore: 0, landmark: 0 };
for (const file of fs.readdirSync(path.join(RAW, 'buildings')).filter((name) => name.endsWith('.json')).sort()) {
  const data = readJson<{ elements: OsmElement[] }>(path.join('buildings', file));
  for (const element of data.elements) {
    if (seenBuildings.has(element.id)) continue;
    seenBuildings.add(element.id);
    buildingStats.total += 1;
    const tags = element.tags ?? {};
    if (EXCLUDED_TYPES.has(tags.building ?? 'yes') || tags['building:part']) { buildingStats.excludedType += 1; continue; }
    for (const rawRing of elementRings(element)) {
      const areaM2 = Math.abs(signedArea(rawRing)) * M_PER_UNIT * M_PER_UNIT;
      if (areaM2 < MIN_BUILDING_M2) { buildingStats.small += 1; continue; }
      const c = centroid(rawRing);
      const areaCode = mask.at(c);
      if (!areaCode) { buildingStats.offshore += 1; continue; }
      if (landmarkCentres.some((mark) => Math.hypot(c[0] - mark.p[0], c[1] - mark.p[1]) < mark.r)) { buildingStats.landmark += 1; continue; }
      let ring = simplifyRing(rawRing, 0.0018);
      if (ring.length > 14) ring = simplifyRing(rawRing, 0.004);
      if (ring.length > 24) ring = simplifyRing(rawRing, 0.008);
      if (ring.length > 32) ring = simplifyRing(rawRing, 0.016).slice(0, 32);
      if (signedArea(ring) < 0) ring.reverse();
      const kind = classify(tags);
      const areaName = areaNames[areaCode - 1];
      const heightM = heightMetres(element.id, tags, kind, areaM2, areaName);
      if (tags.height) buildingStats.taggedHeight += 1; else if (tags['building:levels']) buildingStats.taggedLevels += 1;
      const key = `${Math.floor(c[0] / TILE_SIZE)},${Math.floor(c[1] / TILE_SIZE)}`;
      const list = buildingsByTile.get(key) ?? [];
      list.push({ ring, kind, heightM, cx: c[0], cz: c[1], tagged: Boolean(tags.height || tags['building:levels']) });
      buildingsByTile.set(key, list);
      buildingStats.kept += 1;
    }
  }
}
console.log('buildings:', buildingStats);

/* ----------------------------------------------------------------------------------------------- */
/* Lines: roads, rail, runways                                                                       */
/* ----------------------------------------------------------------------------------------------- */

type LineRecord = { cls: number; ref: number; points: Pt[] };
const lines: LineRecord[] = [];
function splitByMask(points: Pt[], test: LandMask): Pt[][] {
  const runs: Pt[][] = []; let current: Pt[] = [];
  for (const p of points) {
    if (test.at(p)) current.push(p);
    else { if (current.length >= 2) runs.push(current); current = []; }
  }
  if (current.length >= 2) runs.push(current);
  return runs;
}
const roadClass: Record<string, number> = { motorway: LINE_CLASS.motorway, trunk: LINE_CLASS.trunk, primary: LINE_CLASS.primary, secondary: LINE_CLASS.secondary, motorway_link: LINE_CLASS.link, trunk_link: LINE_CLASS.link };
const roadStats: Record<number, number> = {};
for (const way of readJson<{ elements: OsmElement[] }>('roads.json').elements) {
  if (!way.geometry || !way.tags) continue;
  const cls = roadClass[way.tags.highway];
  if (cls === undefined) continue;
  const points = simplify(dedupeConsecutive(way.geometry.map((p) => project(p.lon, p.lat))), 0.002);
  for (const run of splitByMask(points, nearLand)) { lines.push({ cls, ref: 0, points: run }); roadStats[cls] = (roadStats[cls] ?? 0) + 1; }
}
console.log('roads by class:', roadStats);

const railRefs: string[] = [];
const railColours: Record<string, string> = {};
const seenRailWays = new Set<number>();
const OPEN_LINES = new Set(['NSL', 'EWL', 'NEL', 'CCL', 'DTL', 'TEL', 'SKLRT']);
for (const relation of readJson<{ elements: OsmElement[] }>('mrt.json').elements) {
  const ref = relation.tags?.ref ?? '';
  if (!OPEN_LINES.has(ref) || !relation.members) continue;
  if (!railRefs.includes(ref)) { railRefs.push(ref); railColours[ref] = relation.tags?.colour ?? '#5fe0f2'; }
  const refIndex = railRefs.indexOf(ref);
  for (const member of relation.members) {
    if (member.type !== 'way' || !member.geometry || seenRailWays.has(member.ref)) continue;
    seenRailWays.add(member.ref);
    const points = simplify(dedupeConsecutive(member.geometry.map((p) => project(p.lon, p.lat))), 0.0015);
    for (const run of splitByMask(points, nearLand)) lines.push({ cls: LINE_CLASS.rail, ref: refIndex, points: run });
  }
}
console.log('rail lines:', railRefs.join(', '), 'ways', seenRailWays.size);

const stationsRaw = readJson<{ elements: OsmElement[] }>('stations-lrt-runways.json').elements;
const stations: Array<{ name: string; x: number; z: number }> = [];
const seenStationNames = new Set<string>();
for (const element of stationsRaw) {
  const tags = element.tags ?? {};
  if (tags.railway === 'station' && tags.station === 'subway') {
    const lat = element.lat ?? element.center?.lat; const lon = element.lon ?? element.center?.lon;
    const name = tags.name;
    if (lat === undefined || lon === undefined || !name || seenStationNames.has(name)) continue;
    const p = project(lon, lat);
    if (!mask.at(p)) continue;
    seenStationNames.add(name);
    stations.push({ name, x: Math.round(p[0] * MAP_QUANT) / MAP_QUANT, z: Math.round(p[1] * MAP_QUANT) / MAP_QUANT });
  }
}
for (const element of readJson<{ elements: OsmElement[] }>('runways.json').elements) {
  if (!element.geometry) continue;
  const points = simplify(dedupeConsecutive(element.geometry.map((p) => project(p.lon, p.lat))), 0.002);
  for (const run of splitByMask(points, nearLand)) lines.push({ cls: LINE_CLASS.runway, ref: 0, points: run });
}
for (const line of coastLines) lines.push({ cls: LINE_CLASS.coast, ref: 0, points: line });
for (const line of districtLines) lines.push({ cls: LINE_CLASS.district, ref: 0, points: line });
console.log(`stations ${stations.length}, total polylines ${lines.length}`);

/* ----------------------------------------------------------------------------------------------- */
/* Water and green polygons                                                                          */
/* ----------------------------------------------------------------------------------------------- */

function polygonLayer(file: string, minKm2: number, accept: (tags: Record<string, string>) => boolean): { positions: number[]; indices: number[]; count: number } {
  const positions: number[] = []; const indices: number[] = []; let count = 0;
  const seen = new Set<string>();
  for (const element of readJson<{ elements: OsmElement[] }>(file).elements) {
    const tags = element.tags ?? {};
    const key = `${element.type}${element.id}`;
    if (seen.has(key) || !accept(tags)) continue;
    seen.add(key);
    const holes = elementHoles(element).map((hole) => simplifyRing(hole, 0.003)).filter((hole) => Math.abs(signedArea(hole)) > 0.002);
    for (const rawRing of elementRings(element)) {
      const areaKm2 = Math.abs(signedArea(rawRing)) / UNIT2_PER_KM2;
      if (areaKm2 < minKm2) continue;
      const c = centroid(rawRing);
      if (!nearLand.at(c)) continue;
      const ring = simplifyRing(rawRing, 0.003);
      const innerHoles = holes.filter((hole) => pointInRing(hole[0], ring));
      const triangles = ShapeUtils.triangulateShape(ring.map(([x, y]) => new Vector2(x, y)), innerHoles.map((hole) => hole.map(([x, y]) => new Vector2(x, y))));
      const base = positions.length / 2;
      for (const r of [ring, ...innerHoles]) for (const [x, z] of r) positions.push(x, z);
      for (const [a, b, cc] of triangles) indices.push(base + a, base + b, base + cc);
      count += 1;
    }
  }
  return { positions, indices, count };
}
const water = polygonLayer('water.json', 0.02, (tags) => !['strait', 'sea', 'ocean'].includes(tags.water ?? ''));
const green = polygonLayer('green.json', 0.12, (tags) => tags.landuse !== 'military');
console.log(`water polygons ${water.count} (${water.indices.length / 3} tris), green polygons ${green.count} (${green.indices.length / 3} tris)`);

/* ----------------------------------------------------------------------------------------------- */
/* Curated amenity highlights: real venue footprints when defensible, area glyphs otherwise         */
/* ----------------------------------------------------------------------------------------------- */

type SnapshotAmenity = { id: string; category: string; name: string; coordinates: { latitude: number; longitude: number } | null };
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'official-data-snapshot.json'), 'utf8')) as { amenities: SnapshotAmenity[] };
const placeElements = readJson<{ elements: OsmElement[] }>('places.json').elements;
const STOP_WORDS = new Set(['singapore', 'the', 'at', 'and', 'of', 'blk', 'block', 'street', 'road', 'avenue', 'lorong', 'market', 'food', 'hawker', 'centre', 'center', 'school', 'community', 'club', 'sports', 'facilities', 'hospital', 'polyclinic', 'clinic', 'park', 'mall', 'station', 'mrt']);
const words = (name: string) => name.toLowerCase().replace(/\bst\.?\b/g, 'saint').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter((word) => word.length > 1 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
const nameScore = (a: string, b: string) => {
  const aa = new Set(words(a)); const bb = new Set(words(b));
  if (!aa.size || !bb.size) return 0;
  let overlap = 0;
  for (const token of aa) if (bb.has(token) || Array.from(bb).some((other) => token.length > 4 && other.length > 4 && (token.startsWith(other) || other.startsWith(token)))) overlap += 1;
  return overlap / Math.min(aa.size, bb.size);
};
const relevant = (category: string, tags: Record<string, string>) => {
  const values = [tags.amenity, tags.leisure, tags.building, tags.shop, tags.healthcare, tags.railway, tags.public_transport].filter(Boolean);
  if (category === 'hawker') return values.some((v) => ['food_court', 'marketplace'].includes(v)) || /hawker|market|food centre/i.test(tags.name ?? '');
  if (category === 'park') return values.some((v) => ['park', 'garden', 'nature_reserve', 'playground'].includes(v));
  if (category === 'sports') return values.some((v) => ['sports_centre', 'stadium', 'pitch', 'track', 'fitness_centre', 'swimming_pool', 'school', 'college', 'community_centre'].includes(v));
  if (category === 'school') return values.some((v) => ['school', 'college', 'kindergarten', 'university'].includes(v));
  if (category === 'shopping') return values.some((v) => ['mall', 'retail', 'commercial', 'supermarket'].includes(v));
  if (category === 'healthcare') return values.some((v) => ['hospital', 'clinic', 'doctors', 'healthcare'].includes(v));
  if (category === 'mrt') return values.some((v) => ['station', 'subway_entrance', 'train_station', 'transportation'].includes(v));
  return false;
};
type PlaceCandidate = { name: string; tags: Record<string, string>; rings: Pt[][]; centre: Pt };
const placeCandidates: PlaceCandidate[] = [];
for (const element of placeElements) {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags['name:en'];
  const rings = elementRings(element).map((ring) => simplifyRing(ring, 0.0015)).filter((ring) => ring.length >= 3);
  if (!name || !rings.length) continue;
  const all = rings.flat();
  placeCandidates.push({ name, tags, rings, centre: centroid(all) });
}

function fallbackRings(amenity: SnapshotAmenity): Pt[][] {
  const centre = project(amenity.coordinates!.longitude, amenity.coordinates!.latitude);
  const radius = amenity.category === 'park' ? 0.065 : amenity.category === 'mrt' ? 0.045 : 0.052;
  const count = amenity.category === 'mrt' ? 4 : amenity.category === 'shopping' || amenity.category === 'healthcare' ? 8 : 10;
  const rotation = amenity.category === 'mrt' ? Math.PI / 4 : Math.PI / count;
  return [[...Array(count)].map((_, i) => [centre[0] + Math.cos(rotation + (i / count) * Math.PI * 2) * radius, centre[1] + Math.sin(rotation + (i / count) * Math.PI * 2) * radius] as Pt)];
}

const placeHighlights: PlaceHighlight[] = snapshot.amenities.filter((amenity) => amenity.coordinates).map((amenity) => {
  const anchor = project(amenity.coordinates!.longitude, amenity.coordinates!.latitude);
  const matches = placeCandidates.map((candidate) => {
    const distanceM = Math.hypot(candidate.centre[0] - anchor[0], candidate.centre[1] - anchor[1]) * M_PER_UNIT;
    return { candidate, distanceM, score: nameScore(amenity.name, candidate.name) };
  }).filter(({ candidate, distanceM, score }) => relevant(amenity.category, candidate.tags) && distanceM <= 220 && (score >= 0.7 || (distanceM <= 75 && score >= 0.65) || distanceM <= 18))
    .sort((a, b) => (b.score * 140 - b.distanceM) - (a.score * 140 - a.distanceM));
  const match = matches[0];
  if (!match) return { amenityId: amenity.id, source: 'coordinate-fallback', rings: fallbackRings(amenity) };
  return {
    amenityId: amenity.id,
    source: 'osm-footprint',
    sourceName: match.candidate.name,
    distanceM: Math.round(match.distanceM),
    rings: match.candidate.rings.map((ring) => ring.length > 48 ? simplifyRing(ring, 0.004) : ring).map((ring) => ring.map(([x, z]) => [Math.round(x * 10000) / 10000, Math.round(z * 10000) / 10000] as Pt)),
  };
});
const placeData: PlaceHighlightData = { version: 1, places: placeHighlights };
const footprintCount = placeHighlights.filter((place) => place.source === 'osm-footprint').length;
console.log(`amenity highlights ${placeHighlights.length}: ${footprintCount} OSM footprints, ${placeHighlights.length - footprintCount} coordinate area glyphs`);

/* ----------------------------------------------------------------------------------------------- */
/* Writers                                                                                           */
/* ----------------------------------------------------------------------------------------------- */

fs.mkdirSync(OUT, { recursive: true });
for (const stale of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, stale));

function writePolygonMesh(name: string, positions: number[], indices: number[], areas?: number[]) {
  const vertexCount = positions.length / 2;
  const header = new Uint32Array([vertexCount, indices.length]);
  const pos = new Int16Array(vertexCount * 2);
  for (let i = 0; i < positions.length; i += 1) pos[i] = quant(positions[i]);
  const idx = new Uint32Array(indices);
  const parts = [Buffer.from(header.buffer), Buffer.from(pos.buffer), Buffer.from(idx.buffer)];
  if (areas) parts.push(Buffer.from(new Uint8Array(areas).buffer));
  fs.writeFileSync(path.join(OUT, name), Buffer.concat(parts));
}
writePolygonMesh('land.bin', landPositions, landIndices, landAreas);
writePolygonMesh('water.bin', water.positions, water.indices);
writePolygonMesh('green.bin', green.positions, green.indices);

// Buildings: records of [n:u8][kind:u8][heightDm:u16][x,z int16 × n], grouped by tile.
const tileKeys = Array.from(buildingsByTile.keys()).sort();
const tiles: MapManifest['tiles'] = [];
const buildingChunks: Buffer[] = [];
let byteOffset = 0;
for (const key of tileKeys) {
  const records = buildingsByTile.get(key)!;
  const [tx, tz] = key.split(',').map(Number);
  const bytes = records.reduce((n, r) => n + 4 + r.ring.length * 4, 0);
  const buffer = Buffer.alloc(bytes);
  let cursor = 0;
  let maxH = 0;
  for (const record of records) {
    buffer.writeUInt8(record.ring.length, cursor); buffer.writeUInt8(record.kind, cursor + 1);
    buffer.writeUInt16LE(Math.min(65535, Math.round(record.heightM * 10)), cursor + 2);
    cursor += 4;
    for (const [x, z] of record.ring) { buffer.writeInt16LE(quant(x), cursor); buffer.writeInt16LE(quant(z), cursor + 2); cursor += 4; }
    maxH = Math.max(maxH, record.heightM);
  }
  tiles.push({ x0: tx * TILE_SIZE, z0: tz * TILE_SIZE, x1: (tx + 1) * TILE_SIZE, z1: (tz + 1) * TILE_SIZE, byteOffset, byteLength: bytes, count: records.length, maxHeightM: Math.round(maxH) });
  buildingChunks.push(buffer);
  byteOffset += bytes;
}
fs.writeFileSync(path.join(OUT, 'buildings.bin'), Buffer.concat(buildingChunks));

// Lines: records of [class:u8][ref:u8][n:u16][x,z int16 × n].
const lineBytes = lines.reduce((n, l) => n + 4 + l.points.length * 4, 0);
const lineBuffer = Buffer.alloc(lineBytes);
let lineCursor = 0;
for (const line of lines) {
  lineBuffer.writeUInt8(line.cls, lineCursor); lineBuffer.writeUInt8(line.ref, lineCursor + 1); lineBuffer.writeUInt16LE(line.points.length, lineCursor + 2);
  lineCursor += 4;
  for (const [x, z] of line.points) { lineBuffer.writeInt16LE(quant(x), lineCursor); lineBuffer.writeInt16LE(quant(z), lineCursor + 2); lineCursor += 4; }
}
fs.writeFileSync(path.join(OUT, 'lines.bin'), lineBuffer);
fs.writeFileSync(path.join(OUT, 'rail.json'), JSON.stringify({ lines: railRefs.map((ref) => ({ ref, colour: railColours[ref] })), stations }));
fs.writeFileSync(path.join(OUT, 'places.json'), JSON.stringify(placeData));

const manifest: MapManifest = {
  version: 2,
  generatedAt: new Date().toISOString().slice(0, 10),
  projection: { originLatitude: 1.37, originLongitude: 103.87, unitsPerDegree: 85, kmPerUnit: SCENE_KM_PER_UNIT, quant: MAP_QUANT },
  bounds: { x0: bx0, z0: bz0, x1: bx1, z1: bz1 },
  sources: [
    { name: 'URA Master Plan 2019 Subzone Boundary (No Sea)', role: 'land, coastline, planning-area boundaries', url: 'https://data.gov.sg/datasets/d_8594ae9ff96d0c708bc2af633048edfb/view', license: 'Singapore Open Data Licence', retrieved: '2026-08-28' },
    { name: 'OpenStreetMap (Overpass API extract)', role: 'building and matched amenity footprints, roads, MRT routes and stations, water, parks, runways', url: 'https://www.openstreetmap.org/copyright', license: 'ODbL 1.0 — © OpenStreetMap contributors', retrieved: '2026-08-28' },
  ],
  heightMethod: 'OSM height tag when present; else building:levels × storey height; else deterministic band from building type, footprint area and planning area (visual approximation, not survey data).',
  counts: { buildings: buildingStats.kept, buildingsWithTaggedHeight: buildingStats.taggedHeight, buildingsWithTaggedLevels: buildingStats.taggedLevels, landPolygons: landPolygons.length, roads: Object.values(roadStats).reduce((a, b) => a + b, 0), railWays: seenRailWays.size, stations: stations.length, waterPolygons: water.count, greenPolygons: green.count, amenityHighlights: placeHighlights.length, amenityFootprints: footprintCount },
  tileSize: TILE_SIZE,
  tiles,
  areas: areaNames.map((name, index) => ({ name, x: areaAccum[index].w ? Math.round((areaAccum[index].x / areaAccum[index].w) * 1000) / 1000 : 0, z: areaAccum[index].w ? Math.round((areaAccum[index].z / areaAccum[index].w) * 1000) / 1000 : 0, areaKm2: Math.round((areaAccum[index].w / UNIT2_PER_KM2) * 100) / 100 })),
  files: { land: 'land.bin', water: 'water.bin', green: 'green.bin', buildings: 'buildings.bin', lines: 'lines.bin', rail: 'rail.json', places: 'places.json' },
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
for (const file of fs.readdirSync(OUT)) console.log(`${file}: ${(fs.statSync(path.join(OUT, file)).size / 1024).toFixed(0)} KB`);
