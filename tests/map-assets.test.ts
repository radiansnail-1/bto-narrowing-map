import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildBuildingGeometry, buildRibbonGeometry, parseLines, parsePolygonMesh } from '@/lib/map-assets';
import { LINE_CLASS, type MapManifest, type RailData } from '@/lib/map-format';
import { geoToScenePosition } from '@/lib/geo';

const MAP_DIR = join(process.cwd(), 'public', 'map');
const manifest = JSON.parse(readFileSync(join(MAP_DIR, 'manifest.json'), 'utf8')) as MapManifest;
const toArrayBuffer = (name: string): ArrayBuffer => { const b = readFileSync(join(MAP_DIR, name)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };

describe('preprocessed map assets', () => {
  it('ships only compact processed layers with source attribution, never raw GeoJSON', () => {
    const files = readdirSync(MAP_DIR);
    expect(files.some((file) => /\.geojson$|\.osm|\.pbf$/i.test(file))).toBe(false);
    const totalBytes = files.reduce((sum, file) => sum + statSync(join(MAP_DIR, file)).size, 0);
    expect(totalBytes).toBeLessThan(6 * 1024 * 1024);
    expect(manifest.sources.map((source) => source.name).join(' ')).toMatch(/URA Master Plan 2019/);
    expect(manifest.sources.map((source) => source.license).join(' ')).toMatch(/ODbL/);
    expect(manifest.heightMethod).toMatch(/visual approximation/);
  });

  it('uses the same projection as the BTO facts so sites sit inside the real grain', () => {
    expect(manifest.projection.originLatitude).toBe(1.37);
    expect(manifest.projection.originLongitude).toBe(103.87);
    expect(manifest.projection.unitsPerDegree).toBe(85);
    const marinaBay = geoToScenePosition({ latitude: 1.2836, longitude: 103.8607 })!;
    expect(marinaBay[0]).toBeGreaterThan(manifest.bounds.x0);
    expect(marinaBay[0]).toBeLessThan(manifest.bounds.x1);
    expect(marinaBay[1]).toBeGreaterThan(manifest.bounds.z0);
    expect(marinaBay[1]).toBeLessThan(manifest.bounds.z1);
  });

  it('parses land, water and green polygons into upward-facing triangle meshes', () => {
    for (const name of [manifest.files.land, manifest.files.water, manifest.files.green]) {
      const geometry = parsePolygonMesh(toArrayBuffer(name));
      const position = geometry.getAttribute('position');
      const index = geometry.getIndex()!;
      expect(position.count).toBeGreaterThan(1000);
      expect(index.count % 3).toBe(0);
      for (let t = 0; t < Math.min(index.count, 3000); t += 3) {
        const a = index.getX(t); const b = index.getX(t + 1); const c = index.getX(t + 2);
        const cross = (position.getX(b) - position.getX(a)) * (position.getZ(c) - position.getZ(a)) - (position.getX(c) - position.getX(a)) * (position.getZ(b) - position.getZ(a));
        expect(cross).toBeLessThanOrEqual(0);
      }
    }
  });

  it('extrudes every building tile into finite geometry with real-world height bands', () => {
    const buffer = toArrayBuffer(manifest.files.buildings);
    expect(manifest.tiles.length).toBeGreaterThan(20);
    expect(manifest.counts.buildings).toBeGreaterThan(80_000);
    expect(manifest.counts.buildingsWithTaggedLevels + manifest.counts.buildingsWithTaggedHeight).toBeGreaterThan(20_000);
    let vertices = 0;
    for (const tile of manifest.tiles) {
      const geometry = buildBuildingGeometry(buffer, tile);
      const position = geometry.getAttribute('position');
      vertices += position.count;
      const array = position.array as Float32Array;
      let finite = true;
      for (let i = 0; i < array.length; i += 1) if (!Number.isFinite(array[i])) { finite = false; break; }
      expect(finite).toBe(true);
      expect(geometry.boundingSphere!.radius).toBeLessThan(manifest.tileSize * 1.5);
      expect(tile.maxHeightM).toBeLessThanOrEqual(300);
      geometry.dispose();
    }
    expect(vertices).toBeLessThan(3_000_000);
  });

  it('keeps luminous infrastructure as separate classes: roads, rail, runways, coast and districts', () => {
    const lines = parseLines(toArrayBuffer(manifest.files.lines));
    const byClass = new Map<number, number>();
    for (const line of lines) byClass.set(line.cls, (byClass.get(line.cls) ?? 0) + 1);
    for (const cls of [LINE_CLASS.motorway, LINE_CLASS.primary, LINE_CLASS.rail, LINE_CLASS.runway, LINE_CLASS.coast, LINE_CLASS.district]) expect(byClass.get(cls) ?? 0).toBeGreaterThan(0);
    const ribbon = buildRibbonGeometry(lines.filter((line) => line.cls === LINE_CLASS.rail), 0.02, 0.04);
    expect(ribbon.getAttribute('aOffset').count).toBe(ribbon.getAttribute('position').count);
    const rail = JSON.parse(readFileSync(join(MAP_DIR, manifest.files.rail), 'utf8')) as RailData;
    expect(rail.lines.map((line) => line.ref)).toEqual(expect.arrayContaining(['NSL', 'EWL', 'NEL', 'CCL', 'DTL', 'TEL']));
    expect(rail.lines.some((line) => line.ref === 'JRL')).toBe(false);
    expect(rail.stations.length).toBeGreaterThan(150);
  });
});
