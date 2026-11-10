import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

test('server fallback and sitemap packages retain the complete article registry', () => {
  const root = process.cwd();
  const bundles = readdirSync(join(root, 'data/article-bundles')).filter(name => name.endsWith('.json'));
  expect(bundles.length).toBeGreaterThan(0);
  for (const route of ['_not-found/page', 'sitemap.xml/route']) {
    const tracePath = join(root, '.next/server/app', `${route}.js.nft.json`);
    const trace = JSON.parse(readFileSync(tracePath, 'utf8')) as { files: string[] };
    const packaged = new Set(trace.files.map(file => resolve(dirname(tracePath), file)));
    for (const bundle of bundles) {
      expect(packaged.has(join(root, 'data/article-bundles', bundle)), `${route} must package ${bundle}`).toBe(true);
    }
  }
});

test('an invalid sitemap component URL returns not found without a server error', async ({ request }) => {
  const response = await request.get('/sitemap.xml.rsc');
  expect(response.status()).toBe(404);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toContain('xml');
});
