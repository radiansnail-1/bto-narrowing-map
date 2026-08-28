import * as THREE from 'three';
import { LINE_CLASS, MAP_QUANT, type LineClass, type MapManifest, type MapTile, type RailData } from '@/lib/map-format';

/** Scene units per metre of building height: a deliberate ~2.6× vertical exaggeration so massing reads at overview without turning slabs into needles. */
export const HEIGHT_SCALE = 0.002;

export interface ParsedLine { cls: LineClass; ref: number; points: Float32Array }

export interface MapAssets {
  manifest: MapManifest;
  rail: RailData;
  land: THREE.BufferGeometry;
  water: THREE.BufferGeometry;
  green: THREE.BufferGeometry;
  lines: ParsedLine[];
  buildingsBuffer: ArrayBuffer;
}

function unquant(value: number): number { return value / MAP_QUANT; }

/** Flat polygon mesh: [vertexCount u32][indexCount u32][x,z int16 × V][index u32 × I][areaIndex u8 × V]? */
export function parsePolygonMesh(buffer: ArrayBuffer, tint?: (areaIndex: number, vertex: number) => [number, number, number]): THREE.BufferGeometry {
  const header = new Uint32Array(buffer, 0, 2);
  const vertexCount = header[0]; const indexCount = header[1];
  const raw = new Int16Array(buffer, 8, vertexCount * 2);
  const indices = new Uint32Array(buffer, 8 + vertexCount * 4, indexCount);
  const positions = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i += 1) { positions[i * 3] = unquant(raw[i * 2]); positions[i * 3 + 1] = 0; positions[i * 3 + 2] = unquant(raw[i * 2 + 1]); }
  const normals = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i += 1) normals[i * 3 + 1] = 1;
  // Wind every triangle clockwise in (x, z) so the cap faces +y and survives front-face culling.
  const index = new Uint32Array(indices);
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t] * 2; const b = index[t + 1] * 2; const c = index[t + 2] * 2;
    const cross = (raw[b] - raw[a]) * (raw[c + 1] - raw[a + 1]) - (raw[c] - raw[a]) * (raw[b + 1] - raw[a + 1]);
    if (cross > 0) { index[t + 1] = c / 2; index[t + 2] = b / 2; }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  const areaOffset = 8 + vertexCount * 4 + indexCount * 4;
  if (tint && buffer.byteLength >= areaOffset + vertexCount) {
    const areas = new Uint8Array(buffer, areaOffset, vertexCount);
    const colors = new Uint8Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i += 1) { const [r, g, b] = tint(areas[i], i); colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b; }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
  }
  geometry.computeBoundingSphere();
  return geometry;
}

/** Polylines: records of [class u8][ref u8][n u16][x,z int16 × n]. */
export function parseLines(buffer: ArrayBuffer): ParsedLine[] {
  const view = new DataView(buffer);
  const lines: ParsedLine[] = [];
  let cursor = 0;
  while (cursor + 4 <= buffer.byteLength) {
    const cls = view.getUint8(cursor) as LineClass; const ref = view.getUint8(cursor + 1); const n = view.getUint16(cursor + 2, true);
    cursor += 4;
    const points = new Float32Array(n * 2);
    for (let i = 0; i < n; i += 1) { points[i * 2] = unquant(view.getInt16(cursor, true)); points[i * 2 + 1] = unquant(view.getInt16(cursor + 2, true)); cursor += 4; }
    lines.push({ cls, ref, points });
  }
  return lines;
}

const BASE_TINT: Array<[number, number, number]> = [
  [0.44, 0.50, 0.55], // generic
  [0.50, 0.56, 0.61], // residential (HDB blocks read slightly cooler and lighter)
  [0.62, 0.68, 0.73], // commercial / office / hotel
  [0.40, 0.44, 0.47], // industrial
  [0.47, 0.49, 0.51], // landed housing
  [0.54, 0.58, 0.61], // civic
  [0.36, 0.38, 0.40], // construction
  [0.56, 0.60, 0.64], // retail
  [0.50, 0.56, 0.60], // transport
];

/**
 * Extrudes one tile of footprints into a single flat-shaded mesh.
 * Vertex layout per building: n bottom-ring vertices then n top-ring vertices; caps are earcut triangles on the top ring.
 */
export function buildBuildingGeometry(buffer: ArrayBuffer, tile: MapTile): THREE.BufferGeometry {
  const view = new DataView(buffer, tile.byteOffset, tile.byteLength);
  let cursor = 0;
  let vertexTotal = 0; let indexTotal = 0;
  const headers: Array<{ offset: number; n: number; kind: number; height: number }> = [];
  for (let b = 0; b < tile.count; b += 1) {
    const n = view.getUint8(cursor); const kind = view.getUint8(cursor + 1); const height = view.getUint16(cursor + 2, true) / 10;
    headers.push({ offset: cursor + 4, n, kind, height });
    cursor += 4 + n * 4;
    vertexTotal += n * 2; indexTotal += n * 6 + (n - 2) * 3;
  }
  const positions = new Float32Array(vertexTotal * 3);
  const colors = new Uint8Array(vertexTotal * 3);
  const indices = new Uint32Array(indexTotal);
  let v = 0; let idx = 0;
  const ring: THREE.Vector2[] = [];
  for (let b = 0; b < headers.length; b += 1) {
    const { offset, n, kind, height } = headers[b];
    const h = height * HEIGHT_SCALE;
    ring.length = 0;
    for (let i = 0; i < n; i += 1) ring.push(new THREE.Vector2(unquant(view.getInt16(offset + i * 4, true)), unquant(view.getInt16(offset + i * 4 + 2, true))));
    const tint = BASE_TINT[kind] ?? BASE_TINT[0];
    const seed = ((b * 7919 + tile.count * 31) % 97) / 97;
    const lift = 0.7 + 0.5 * Math.min(1, height / 160) + (seed - 0.5) * 0.14;
    const base = v;
    for (let level = 0; level < 2; level += 1) {
      const y = level === 0 ? 0 : h;
      const shade = level === 0 ? 0.42 : 1.0;
      for (let i = 0; i < n; i += 1) {
        const p = ring[i];
        positions[v * 3] = p.x; positions[v * 3 + 1] = y; positions[v * 3 + 2] = p.y;
        colors[v * 3] = Math.min(255, Math.round(tint[0] * lift * shade * 255));
        colors[v * 3 + 1] = Math.min(255, Math.round(tint[1] * lift * shade * 255));
        colors[v * 3 + 2] = Math.min(255, Math.round(tint[2] * lift * shade * 255));
        v += 1;
      }
    }
    // Rings are counter-clockwise in (x, z); (A, C, B) / (A, D, C) gives outward-facing side quads.
    for (let i = 0; i < n; i += 1) {
      const a = base + i; const bIdx = base + ((i + 1) % n); const c = base + n + ((i + 1) % n); const d = base + n + i;
      indices[idx++] = a; indices[idx++] = c; indices[idx++] = bIdx;
      indices[idx++] = a; indices[idx++] = d; indices[idx++] = c;
    }
    const triangles = THREE.ShapeUtils.triangulateShape(ring, []).slice(0, n - 2);
    for (const tri of triangles) {
      const p0 = ring[tri[0]]; const p1 = ring[tri[1]]; const p2 = ring[tri[2]];
      const area = (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);
      // Top caps must face +y, which in (x, z) means clockwise winding.
      if (area > 0) { indices[idx++] = base + n + tri[0]; indices[idx++] = base + n + tri[2]; indices[idx++] = base + n + tri[1]; }
      else { indices[idx++] = base + n + tri[0]; indices[idx++] = base + n + tri[1]; indices[idx++] = base + n + tri[2]; }
    }
    if (triangles.length < n - 2) idx += (n - 2 - triangles.length) * 3; // degenerate footprint: leave zeroed indices
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}

/**
 * Turns polylines into a ribbon strip. Positions hold the centreline; `aOffset` holds the per-vertex
 * half-width offset so the shader can scale ribbon width with camera zoom.
 */
export function buildRibbonGeometry(lines: ParsedLine[], halfWidth: number, y: number): THREE.BufferGeometry {
  let vertexCount = 0; let indexCount = 0;
  for (const line of lines) { const n = line.points.length / 2; if (n >= 2) { vertexCount += n * 2; indexCount += (n - 1) * 6; } }
  const positions = new Float32Array(vertexCount * 3);
  const offsets = new Float32Array(vertexCount * 2);
  const sides = new Float32Array(vertexCount);
  const indices = new Uint32Array(indexCount);
  let v = 0; let idx = 0;
  for (const line of lines) {
    const n = line.points.length / 2;
    if (n < 2) continue;
    const base = v;
    for (let i = 0; i < n; i += 1) {
      const x = line.points[i * 2]; const z = line.points[i * 2 + 1];
      const px = i > 0 ? line.points[(i - 1) * 2] : x; const pz = i > 0 ? line.points[(i - 1) * 2 + 1] : z;
      const nx = i < n - 1 ? line.points[(i + 1) * 2] : x; const nz = i < n - 1 ? line.points[(i + 1) * 2 + 1] : z;
      let tx = nx - px; let tz = nz - pz;
      const len = Math.hypot(tx, tz) || 1;
      tx /= len; tz /= len;
      // Mitre: average the two segment normals and scale to keep the strip width constant at gentle bends.
      let ox = -tz; let oz = tx;
      if (i > 0 && i < n - 1) {
        const sx = x - px; const sz = z - pz; const sl = Math.hypot(sx, sz) || 1;
        const segNx = -sz / sl; const segNz = sx / sl;
        const dot = Math.max(0.5, ox * segNx + oz * segNz);
        ox /= dot; oz /= dot;
      }
      for (const side of [1, -1]) {
        positions[v * 3] = x; positions[v * 3 + 1] = y; positions[v * 3 + 2] = z;
        offsets[v * 2] = ox * halfWidth * side; offsets[v * 2 + 1] = oz * halfWidth * side;
        sides[v] = side;
        v += 1;
      }
    }
    for (let i = 0; i < n - 1; i += 1) {
      const a = base + i * 2; const b = a + 1; const c = a + 2; const d = a + 3;
      indices[idx++] = a; indices[idx++] = b; indices[idx++] = c;
      indices[idx++] = b; indices[idx++] = d; indices[idx++] = c;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 2));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius += halfWidth * 2;
  return geometry;
}

/** Vertical wall hung below the coastline so the island reads as a raised model plinth. */
export function buildCoastWallGeometry(lines: ParsedLine[], depth: number): THREE.BufferGeometry {
  let segments = 0;
  for (const line of lines) segments += Math.max(0, line.points.length / 2 - 1);
  const positions = new Float32Array(segments * 4 * 3);
  const indices = new Uint32Array(segments * 6);
  let v = 0; let idx = 0;
  for (const line of lines) {
    const n = line.points.length / 2;
    for (let i = 0; i < n - 1; i += 1) {
      const ax = line.points[i * 2]; const az = line.points[i * 2 + 1]; const bx = line.points[i * 2 + 2]; const bz = line.points[i * 2 + 3];
      const base = v / 3;
      positions.set([ax, 0, az, bx, 0, bz, bx, -depth, bz, ax, -depth, az], v); v += 12;
      indices.set([base, base + 1, base + 2, base, base + 2, base + 3], idx); idx += 6;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function linesOfClass(lines: ParsedLine[], ...classes: LineClass[]): ParsedLine[] {
  return lines.filter((line) => classes.includes(line.cls));
}

let cached: Promise<MapAssets> | null = null;

/** Fetches the preprocessed layers once per session. Never touches raw GeoJSON. */
export function loadMapAssets(base = '/map'): Promise<MapAssets> {
  if (cached) return cached;
  cached = (async () => {
    const manifest = (await (await fetch(`${base}/manifest.json`)).json()) as MapManifest;
    const [rail, landBuffer, waterBuffer, greenBuffer, linesBuffer, buildingsBuffer] = await Promise.all([
      fetch(`${base}/${manifest.files.rail}`).then((r) => r.json() as Promise<RailData>),
      fetch(`${base}/${manifest.files.land}`).then((r) => r.arrayBuffer()),
      fetch(`${base}/${manifest.files.water}`).then((r) => r.arrayBuffer()),
      fetch(`${base}/${manifest.files.green}`).then((r) => r.arrayBuffer()),
      fetch(`${base}/${manifest.files.lines}`).then((r) => r.arrayBuffer()),
      fetch(`${base}/${manifest.files.buildings}`).then((r) => r.arrayBuffer()),
    ]);
    const land = parsePolygonMesh(landBuffer, (areaIndex) => {
      // Faint per-planning-area lightness variation so districts read without hard fills.
      const wobble = ((areaIndex * 37) % 11) / 11;
      const l = 0.082 + wobble * 0.022;
      return [Math.round((l * 0.92) * 255), Math.round((l * 1.02) * 255), Math.round((l * 1.06) * 255)];
    });
    return { manifest, rail, land, water: parsePolygonMesh(waterBuffer), green: parsePolygonMesh(greenBuffer), lines: parseLines(linesBuffer), buildingsBuffer };
  })();
  cached.catch(() => { cached = null; });
  return cached;
}

export { LINE_CLASS };
