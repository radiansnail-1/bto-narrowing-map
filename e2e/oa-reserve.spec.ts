import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const path = '/guides/cpf-oa-reserve-for-bto';
const title = 'Should you keep $20,000 in CPF OA for your BTO?';

for (const width of [390, 1440]) {
  test(`OA reserve guide is readable and navigable at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page).toHaveTitle(`${title} | Where To BTO`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://wheretobto.com${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /each buyer’s \$20,000 CPF OA retention option/);
    await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-10-19');
    await expect(page.locator('article time')).toHaveCount(2);
    for (const time of await page.locator('article time').all()) await expect(time).toHaveAttribute('datetime', '2026-10-19');
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(schema).toMatchObject({ '@type': 'Article', headline: title, datePublished: '2026-10-19', dateModified: '2026-10-19', mainEntityOfPage: `https://wheretobto.com${path}` });
    await expect(page.locator('.article-body h2')).toHaveCount(5);
    await expect(page.locator('.article-body a')).toHaveCount(6);
    for (const href of await page.locator('.article-body a').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))) expect(new URL(href).hostname).toBe('www.cpf.gov.sg');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: `test-results/oa-reserve-${width}-hero.png` });
    expect(await page.locator('.content-shell').evaluate(element => element.scrollWidth)).toBe(width);
    for (const [index, section] of (await page.locator('.article-body section').all()).entries()) {
      await section.evaluate(element => {
        const shell = element.closest('.content-shell')!;
        const header = document.querySelector('.site-header')!;
        shell.scrollTop += element.getBoundingClientRect().top - header.getBoundingClientRect().bottom - 16;
      });
      await page.screenshot({ path: `test-results/oa-reserve-${width}-section-${index + 1}.png` });
    }
    await page.locator('.content-shell').evaluate(element => { element.scrollTop = 0; });
    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, outline: getComputedStyle(document.activeElement!).outlineStyle }));
    expect(firstFocus.tag).toBe('A');
    expect(firstFocus.outline).not.toBe('none');
    const roadmap = page.getByRole('link', { name: 'Compare reserve choices in the funding roadmap' });
    await roadmap.focus();
    await expect(roadmap).toBeFocused();
    expect((await roadmap.boundingBox())!.width).toBeGreaterThan(0);
    mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: `test-results/oa-reserve-${width}.png`, fullPage: true });
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'BTO funding roadmap' })).toBeVisible();
    await page.getByText('Advanced assumptions · fees and reserves', { exact: true }).click();
    await expect(page.locator('#roadmap-cpfReserve')).toBeVisible();
    await page.getByRole('link', { name: 'Decide how much CPF OA to retain' }).click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await page.getByRole('link', { name: 'Compare BTO locations on the map' }).click();
    await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
    await page.goto('/guides/bto-cash-cpf-payment-timeline');
    await page.getByRole('link', { name: 'Decide how much CPF OA to retain' }).click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await page.goto('/guides');
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`https://wheretobto.com${path}`);
    expect(errors).toEqual([]);
    if (width === 390) {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    }
  });
}
