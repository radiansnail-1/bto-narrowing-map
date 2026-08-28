import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, 'data', 'amenity-media.json');
const SNAPSHOT_PATH = join(ROOT, 'data', 'official-data-snapshot.json');
const PUBLIC_DIR = join(ROOT, 'public');

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as {
  records: Array<Record<string, unknown>>;
  blockers?: Array<Record<string, unknown>>;
};
const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as { amenities: Array<{ id: string }> };

function parseWebpDimensions(bytes: Buffer): { width: number; height: number } {
  if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
    throw new Error('not a WebP RIFF container');
  }
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = bytes.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + chunkSize > bytes.length) throw new Error(`truncated ${chunkType} chunk`);
    if (chunkType === 'VP8X' && chunkSize >= 10) {
      return {
        width: 1 + bytes.readUIntLE(data + 4, 3),
        height: 1 + bytes.readUIntLE(data + 7, 3),
      };
    }
    if (chunkType === 'VP8 ' && chunkSize >= 10 && bytes[data + 3] === 0x9d && bytes[data + 4] === 0x01 && bytes[data + 5] === 0x2a) {
      return {
        width: bytes.readUInt16LE(data + 6) & 0x3fff,
        height: bytes.readUInt16LE(data + 8) & 0x3fff,
      };
    }
    if (chunkType === 'VP8L' && chunkSize >= 5 && bytes[data] === 0x2f) {
      return {
        width: 1 + ((bytes[data + 1] | (bytes[data + 2] << 8)) & 0x3fff),
        height: 1 + (((bytes[data + 2] >> 6) | (bytes[data + 3] << 2) | (bytes[data + 4] << 10)) & 0x3fff),
      };
    }
    offset = data + chunkSize + (chunkSize % 2);
  }
  throw new Error('WebP dimension chunk not found');
}

describe('amenity media manifest', () => {
  it('has exactly one local record, or one explicit blocker, for every official amenity', () => {
    const snapshotIds = snapshot.amenities.map((amenity) => amenity.id);
    const recordIds = manifest.records.map((record) => String(record.amenityId));
    const blockerIds = (manifest.blockers ?? []).map((blocker) => String(blocker.amenityId));
    const allIds = [...recordIds, ...blockerIds];
    const expected = new Set(snapshotIds);
    const actual = new Set(allIds);
    const missing = snapshotIds.filter((id) => !actual.has(id));
    const extra = allIds.filter((id) => !expected.has(id));
    const duplicates = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];

    expect(missing, `Amenities with neither a media record nor a blocker: ${missing.join(', ')}`).toEqual([]);
    expect(extra, `Unexpected amenity IDs: ${extra.join(', ')}`).toEqual([]);
    expect(duplicates, `Amenities with more than one record/blocker: ${duplicates.join(', ')}`).toEqual([]);
    expect(allIds, `Expected one record or blocker for each of ${snapshotIds.length} amenities`).toHaveLength(snapshotIds.length);
    expect(manifest.records.length, 'Expected a majority of amenities to ship a licensed photo').toBeGreaterThan(snapshotIds.length / 2);
    for (const blocker of manifest.blockers ?? []) {
      const amenityId = String(blocker.amenityId);
      expect(typeof blocker.reason === 'string' && blocker.reason.trim().length > 20, `${amenityId}: blocker needs an explicit reason`).toBe(true);
      expect(Array.isArray(blocker.searched) && blocker.searched.length > 0, `${amenityId}: blocker must record what was searched`).toBe(true);
      expect(String(blocker.checked ?? ''), `${amenityId}: blocker checked date must be YYYY-MM-DD`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('ships valid, attributed, bounded WebP assets for every record', () => {
    for (const record of manifest.records) {
      const amenityId = String(record.amenityId);
      const file = String(record.file ?? '');
      expect(file, `${amenityId}: file must be a local amenity path`).toMatch(/^\/amenities\//);
      expect(file, `${amenityId}: file must not be an external hotlink`).not.toMatch(/^https?:\/\//i);
      expect(String(record.sourceUrl ?? ''), `${amenityId}: sourceUrl must be a Commons File page or a Flickr photo page`).toMatch(/^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.flickr\.com\/photos\/[^/]+\/\d+)/);
      expect(String(record.licenceUrl ?? ''), `${amenityId}: licenceUrl must point at creativecommons.org or Commons licensing`).toMatch(/^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//);

      const assetPath = resolve(PUBLIC_DIR, file.replace(/^\//, ''));
      expect(assetPath.startsWith(`${resolve(PUBLIC_DIR)}${sep}`), `${amenityId}: file escapes public/`).toBe(true);
      expect(existsSync(assetPath), `${amenityId}: missing ${file}`).toBe(true);
      if (!existsSync(assetPath)) continue;
      const bytes = readFileSync(assetPath);
      expect(bytes.length, `${amenityId}: WebP is too small`).toBeGreaterThan(5 * 1024);
      expect(bytes.length, `${amenityId}: WebP is too large`).toBeLessThan(600 * 1024);
      expect(bytes.subarray(0, 4).toString('ascii'), `${amenityId}: missing RIFF magic`).toBe('RIFF');
      expect(bytes.subarray(8, 12).toString('ascii'), `${amenityId}: missing WEBP magic`).toBe('WEBP');

      const width = typeof record.width === 'number' ? record.width : Number.NaN;
      const height = typeof record.height === 'number' ? record.height : Number.NaN;
      expect(Number.isInteger(width) && width > 0, `${amenityId}: width must be a positive integer`).toBe(true);
      expect(Number.isInteger(height) && height > 0, `${amenityId}: height must be a positive integer`).toBe(true);
      expect(Math.max(Number(width), Number(height)), `${amenityId}: dimensions exceed 1600px`).toBeLessThanOrEqual(1600);
      const actual = parseWebpDimensions(bytes);
      expect(actual.width, `${amenityId}: manifest width does not match WebP`).toBe(width);
      expect(actual.height, `${amenityId}: manifest height does not match WebP`).toBe(height);

      for (const key of ['alt', 'creator', 'sourceTitle', 'sourceUrl', 'licence', 'licenceUrl', 'retrieved']) {
        expect(typeof record[key] === 'string' && String(record[key]).trim().length > 0, `${amenityId}: ${key} must be non-empty`).toBe(true);
      }
      expect(String(record.licence), `${amenityId}: licence is not allowed`).toMatch(/^(CC0|CC BY(-SA)? \d\.\d|Public domain)/);
      expect(String(record.retrieved), `${amenityId}: retrieved must be YYYY-MM-DD`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['venue', 'area-context'], `${amenityId}: depicts must be venue or area-context`).toContain(record.depicts);
    }
  });
});
