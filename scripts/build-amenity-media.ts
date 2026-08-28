import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const PICKS_PATH = path.join(ROOT, 'work', 'amenity-media', 'picks.json');
const CACHE_DIR = path.join(ROOT, 'work', 'amenity-media', 'cache');
const OUTPUT_DIR = path.join(ROOT, 'public', 'amenities');
const MANIFEST_PATH = path.join(ROOT, 'data', 'amenity-media.json');
const SNAPSHOT_PATH = path.join(ROOT, 'data', 'official-data-snapshot.json');
const API_URL = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'WhereToBTO-media-build/1.0 (https://github.com/radiansnail-1/bto-narrowing-map)';
const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/';
const PUBLIC_DOMAIN_URL = 'https://commons.wikimedia.org/wiki/Commons:Licensing';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    nbsp: ' ',
    lt: '<',
    quot: '"',
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const number = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isNaN(number) ? entity : String.fromCodePoint(number);
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function stripMarkup(value) {
  return decodeEntities(String(value).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get('retry-after');
  const retrySeconds = retryAfter ? Number.parseFloat(retryAfter) : Number.NaN;
  if (Number.isFinite(retrySeconds) && retrySeconds >= 0) return Math.min(retrySeconds * 1000, 10_000);
  return 500 * 2 ** (attempt - 1);
}

async function requestJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
      const body = await response.text();
      let json;
      try {
        json = JSON.parse(body);
      } catch {
        json = null;
      }
      const maxlag = json?.error?.code === 'maxlag' || json?.error?.code === 'ratelimited';
      if (isRetryableStatus(response.status) || maxlag) {
        lastError = new Error(`HTTP ${response.status}${json?.error?.info ? `: ${json.error.info}` : ''}`);
        if (attempt < 3) {
          await sleep(retryDelay(response, attempt));
          continue;
        }
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
      if (!json) throw new Error('Wikimedia returned invalid JSON');
      if (json.error) throw new Error(`${json.error.code ?? 'API error'}: ${json.error.info ?? 'unknown error'}`);
      return json;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
    }
  }
  throw lastError ?? new Error('Wikimedia request failed');
}

async function requestBuffer(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (isRetryableStatus(response.status)) {
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < 3) {
          await sleep(retryDelay(response, attempt));
          continue;
        }
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
    }
  }
  throw lastError ?? new Error('Wikimedia download failed');
}

function pickPage(apiResponse, requestedTitle) {
  const query = apiResponse?.query;
  const pages = Object.values(query?.pages ?? {});
  const aliases = new Map();
  for (const alias of [...(query?.normalized ?? []), ...(query?.redirects ?? [])]) aliases.set(alias.from, alias.to);
  let resolvedTitle = requestedTitle;
  const seen = new Set();
  while (aliases.has(resolvedTitle) && !seen.has(resolvedTitle)) {
    seen.add(resolvedTitle);
    resolvedTitle = aliases.get(resolvedTitle);
  }
  const page = pages.find((candidate) => candidate.title === resolvedTitle && !candidate.missing)
    ?? pages.find((candidate) => !candidate.missing);
  if (!page) throw new Error(`Wikimedia page not found for ${requestedTitle}`);
  return page;
}

function metadataValue(imageInfo, key) {
  return imageInfo?.extmetadata?.[key]?.value;
}

function classifyLicence(shortName) {
  const clean = stripMarkup(shortName);
  if (/^CC0(?:\s|$)/i.test(clean)) return { licence: 'CC0', defaultUrl: CC0_URL };
  if (/^(?:Public domain|PD)(?:\b|[-_])/i.test(clean)) return { licence: 'Public domain', defaultUrl: PUBLIC_DOMAIN_URL };
  const match = clean.match(/^CC BY(-SA)? (\d\.\d)$/i);
  if (match) return { licence: `CC BY${match[1] ? '-SA' : ''} ${match[2]}`, defaultUrl: '' };
  return null;
}

function sourceDetails(pick, imageInfo) {
  const shortName = stripMarkup(metadataValue(imageInfo, 'LicenseShortName') ?? '');
  const classified = classifyLicence(shortName);
  if (!classified) throw new Error(`licence is not allowed: ${shortName || '(missing)'}`);
  const creator = stripMarkup(pick.creatorOverride ?? metadataValue(imageInfo, 'Artist') ?? '');
  if (!creator) throw new Error('Artist metadata is missing (provide creatorOverride if appropriate)');
  const licenceUrl = stripMarkup(metadataValue(imageInfo, 'LicenseUrl') ?? '') || classified.defaultUrl;
  if (!licenceUrl) throw new Error('licence URL is missing');
  const originalUrl = String(imageInfo?.url ?? '').trim();
  const width = Number(imageInfo?.width);
  const height = Number(imageInfo?.height);
  const mime = String(imageInfo?.mime ?? '').trim();
  if (!originalUrl || !/^https?:\/\//i.test(originalUrl)) throw new Error('original URL is missing');
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) throw new Error('original dimensions are invalid');
  if (!mime.startsWith('image/')) throw new Error(`unsupported MIME type: ${mime || '(missing)'}`);
  return {
    originalUrl,
    originalWidth: width,
    originalHeight: height,
    mime,
    creator,
    licence: classified.licence,
    licenceUrl,
    credit: stripMarkup(metadataValue(imageInfo, 'Credit') ?? ''),
  };
}

async function fetchSourceDetails(pick) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    format: 'json',
    titles: pick.title,
    maxlag: '5',
  });
  const response = await requestJson(`${API_URL}?${params.toString()}`);
  const page = pickPage(response, pick.title);
  const imageInfo = page.imageinfo?.[0];
  if (!imageInfo) throw new Error('imageinfo is missing');
  return sourceDetails(pick, imageInfo);
}

function validatePicks(input, snapshot) {
  const errors = [];
  if (!input || typeof input !== 'object') errors.push('picks.json must contain an object');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input?.retrieved ?? '')) errors.push('retrieved must be YYYY-MM-DD');
  if (!Array.isArray(input?.picks)) errors.push('picks must be an array');
  if (errors.length) throw new Error(errors.join('; '));

  const snapshotIds = new Set(snapshot.amenities.map((amenity) => amenity.id));
  const seen = new Set();
  const picks = [];
  for (const [index, pick] of input.picks.entries()) {
    const prefix = `picks[${index}]`;
    if (!pick || typeof pick !== 'object') {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    const amenityId = typeof pick.amenityId === 'string' ? pick.amenityId.trim() : '';
    const title = typeof pick.title === 'string' ? pick.title.trim() : '';
    const alt = typeof pick.alt === 'string' ? pick.alt.trim() : '';
    if (!amenityId) errors.push(`${prefix}.amenityId is required`);
    else if (!snapshotIds.has(amenityId)) errors.push(`${amenityId}: amenityId is not in the official snapshot`);
    else if (seen.has(amenityId)) errors.push(`${amenityId}: duplicate amenityId`);
    else seen.add(amenityId);
    const isFlickr = pick.source === 'flickr';
    if (pick.source !== undefined && pick.source !== 'commons' && pick.source !== 'flickr') errors.push(`${amenityId || prefix}: source must be commons or flickr`);
    if (!isFlickr && !/^File:.+/i.test(title)) errors.push(`${amenityId || prefix}: title must be a Wikimedia File: title`);
    if (isFlickr) {
      if (!/^https:\/\/www\.flickr\.com\/photos\/[^/]+\/\d+/.test(String(pick.sourceUrl ?? ''))) errors.push(`${amenityId || prefix}: flickr picks need a sourceUrl photo page`);
      if (!/^https:\/\/live\.staticflickr\.com\//.test(String(pick.originalUrl ?? ''))) errors.push(`${amenityId || prefix}: flickr picks need an originalUrl on live.staticflickr.com`);
      if (!title) errors.push(`${amenityId || prefix}: flickr picks need a title`);
      if (typeof pick.creator !== 'string' || !pick.creator.trim()) errors.push(`${amenityId || prefix}: flickr picks need a creator`);
      if (!/^CC (BY|BY-SA) \d\.\d$|^CC0$|^Public domain$/.test(String(pick.licence ?? ''))) errors.push(`${amenityId || prefix}: flickr picks need an allowed licence (CC BY x.x, CC BY-SA x.x, CC0, Public domain)`);
      if (!/^https:\/\/creativecommons\.org\//.test(String(pick.licenceUrl ?? ''))) errors.push(`${amenityId || prefix}: flickr picks need a creativecommons.org licenceUrl`);
    }
    if (!alt) errors.push(`${amenityId || prefix}: alt must be non-empty`);
    if (pick.depicts !== 'venue' && pick.depicts !== 'area-context') errors.push(`${amenityId || prefix}: depicts must be venue or area-context`);
    if (pick.note !== undefined && typeof pick.note !== 'string') errors.push(`${amenityId || prefix}: note must be a string`);
    if (pick.creatorOverride !== undefined && typeof pick.creatorOverride !== 'string') errors.push(`${amenityId || prefix}: creatorOverride must be a string`);
    picks.push({
      ...pick,
      amenityId,
      title,
      alt,
      note: typeof pick.note === 'string' ? pick.note.trim() : undefined,
      creatorOverride: typeof pick.creatorOverride === 'string' ? pick.creatorOverride.trim() : undefined,
    });
  }
  const blockers = [];
  for (const [index, blocker] of (Array.isArray(input.blockers) ? input.blockers : []).entries()) {
    const prefix = `blockers[${index}]`;
    const amenityId = typeof blocker?.amenityId === 'string' ? blocker.amenityId.trim() : '';
    if (!amenityId) errors.push(`${prefix}.amenityId is required`);
    else if (!snapshotIds.has(amenityId)) errors.push(`${amenityId}: blocker amenityId is not in the official snapshot`);
    else if (seen.has(amenityId)) errors.push(`${amenityId}: amenity has both a pick and a blocker`);
    else seen.add(amenityId);
    if (typeof blocker?.reason !== 'string' || !blocker.reason.trim()) errors.push(`${amenityId || prefix}: blocker reason is required`);
    if (!Array.isArray(blocker?.searched) || blocker.searched.length === 0) errors.push(`${amenityId || prefix}: blocker must list what was searched`);
    blockers.push({ amenityId, reason: String(blocker?.reason ?? '').trim(), searched: Array.isArray(blocker?.searched) ? blocker.searched.map(String) : [], checked: input.retrieved });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { retrieved: input.retrieved, picks, blockers };
}

/**
 * Flickr picks come from Openverse/Flickr with an explicit CC licence. The photo page is fetched and
 * must itself link to the declared Creative Commons licence, so the licence is verified at source.
 */
async function fetchFlickrSourceDetails(pick) {
  let page;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(pick.sourceUrl, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' } });
      if (isRetryableStatus(response.status)) throw new Error(`HTTP ${response.status}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      page = await response.text();
      break;
    } catch (error) {
      if (attempt === 3) throw new Error(`flickr page fetch failed: ${error instanceof Error ? error.message : String(error)}`);
      await sleep(700 * attempt);
    }
  }
  const licencePath = pick.licenceUrl.replace(/^https:\/\/creativecommons\.org/, '').replace(/\/$/, '');
  if (!page.includes(licencePath)) throw new Error(`flickr page does not declare ${pick.licenceUrl}`);
  const head = await fetch(pick.originalUrl, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } });
  if (!head.ok) throw new Error(`flickr original unavailable: HTTP ${head.status}`);
  return {
    originalUrl: pick.originalUrl,
    originalWidth: 0,
    originalHeight: 0,
    mime: head.headers.get('content-type') ?? 'image/jpeg',
    creator: pick.creator.trim(),
    licence: pick.licence,
    licenceUrl: pick.licenceUrl,
    credit: '',
  };
}

function cachePath(amenityId) {
  return path.join(CACHE_DIR, `${amenityId}.json`);
}

function readCache(amenityId) {
  const filePath = cachePath(amenityId);
  if (!fs.existsSync(filePath)) return null;
  try {
    return readJson(filePath);
  } catch {
    return null;
  }
}

function cachedOutputMatches(cache, pick, source) {
  return Boolean(
    cache
      && cache.sourceTitle === pick.title
      && cache.originalUrl === source.originalUrl
      && Number.isInteger(cache.width)
      && Number.isInteger(cache.height)
      && Number.isInteger(cache.bytes)
      && cache.bytes > 0,
  );
}

function outputPath(amenityId) {
  return path.join(OUTPUT_DIR, `${amenityId}.webp`);
}

async function optimiseSource(source, amenityId) {
  const original = await requestBuffer(source.originalUrl);
  await sharp(original)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath(amenityId));
  return readOutputDimensions(outputPath(amenityId));
}

async function readOutputDimensions(filePath) {
  const metadata = await sharp(filePath).metadata();
  if (!Number.isInteger(metadata.width) || !Number.isInteger(metadata.height)) throw new Error('optimised WebP dimensions are missing');
  return { width: metadata.width, height: metadata.height, bytes: fs.statSync(filePath).size };
}

function makeRecord(pick, source, dimensions, retrieved) {
  const fileName = pick.title.replace(/^File:/i, '');
  const flickr = pick.source === 'flickr';
  const record = {
    amenityId: pick.amenityId,
    file: `/amenities/${pick.amenityId}.webp`,
    width: dimensions.width,
    height: dimensions.height,
    alt: pick.alt,
    creator: source.creator,
    sourceTitle: flickr ? `Flickr: ${fileName}` : `Wikimedia Commons: ${fileName}`,
    sourceUrl: flickr ? pick.sourceUrl : `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`,
    licence: source.licence,
    licenceUrl: source.licenceUrl,
    retrieved,
    depicts: pick.depicts,
  };
  if (pick.note) record.note = pick.note;
  return record;
}

function printSummary(rows, dryRun) {
  console.log('amenityId\tlicence\tWxH\tbytes');
  for (const row of rows) console.log(`${row.amenityId}\t${row.licence}\t${row.width}x${row.height}\t${dryRun ? 'n/a' : row.bytes}`);
  const totalBytes = rows.reduce((sum, row) => sum + (dryRun ? 0 : row.bytes), 0);
  console.log(`Totals: ${rows.length} assets${dryRun ? '' : `, ${totalBytes} bytes`}`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (!fs.existsSync(PICKS_PATH)) throw new Error(`Missing ${PICKS_PATH}; create picks.json before running the media build.`);
  const input = readJson(PICKS_PATH);
  const snapshot = readJson(SNAPSHOT_PATH);
  const picks = validatePicks(input, snapshot);
  const sourceResults = [];
  const metadataErrors = [];

  for (const pick of picks.picks) {
    try {
      sourceResults.push({ pick, source: pick.source === 'flickr' ? await fetchFlickrSourceDetails(pick) : await fetchSourceDetails(pick) });
    } catch (error) {
      metadataErrors.push(`${pick.amenityId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (metadataErrors.length) throw new Error(`Media source validation failed:\n${metadataErrors.join('\n')}`);

  if (dryRun) {
    printSummary(sourceResults.map(({ pick, source }) => ({ amenityId: pick.amenityId, licence: source.licence, width: source.originalWidth, height: source.originalHeight, bytes: 0 })), true);
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const currentManifest = readJson(MANIFEST_PATH);
  const records = [];
  const rows = [];
  for (const { pick, source } of sourceResults) {
    const existingCache = readCache(pick.amenityId);
    const destination = outputPath(pick.amenityId);
    let dimensions;
    if (fs.existsSync(destination) && cachedOutputMatches(existingCache, pick, source)) {
      dimensions = await readOutputDimensions(destination);
    } else {
      dimensions = await optimiseSource(source, pick.amenityId);
    }
    records.push(makeRecord(pick, source, dimensions, picks.retrieved));
    rows.push({ amenityId: pick.amenityId, licence: source.licence, width: dimensions.width, height: dimensions.height, bytes: dimensions.bytes });
    writeJson(cachePath(pick.amenityId), {
      version: 1,
      sourceTitle: pick.title,
      originalUrl: source.originalUrl,
      originalWidth: source.originalWidth,
      originalHeight: source.originalHeight,
      mime: source.mime,
      creator: source.creator,
      licence: source.licence,
      licenceUrl: source.licenceUrl,
      credit: source.credit || undefined,
      width: dimensions.width,
      height: dimensions.height,
      bytes: dimensions.bytes,
    });
  }

  records.sort((a, b) => a.amenityId.localeCompare(b.amenityId));
  const blockers = [...picks.blockers].sort((a, b) => a.amenityId.localeCompare(b.amenityId));
  writeJson(MANIFEST_PATH, {
    version: 1,
    generatedAt: new Date().toISOString(),
    policy: currentManifest.policy,
    records,
    blockers,
  });
  if (blockers.length) console.log(`Blockers (no licensed photo found): ${blockers.map((blocker) => blocker.amenityId).join(', ')}`);
  printSummary(rows.sort((a, b) => a.amenityId.localeCompare(b.amenityId)), false);
}

main().catch((error) => {
  console.error(`Amenity media build failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
