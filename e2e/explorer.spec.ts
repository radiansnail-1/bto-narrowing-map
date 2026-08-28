import { test, expect, type Page } from '@playwright/test';

async function openReadyMap(page: Page) {
  await page.goto('/?lite=1');
  const map = page.getByTestId('map-boundary-state');
  await expect(map).toHaveAttribute('data-map-quality', 'lite');
  await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { __mapCamera?: unknown }).__mapCamera))).toBe(true);
}

test('finishes narrowing, shows grouped results, and preserves BTO context through amenity details', async ({ page }) => {
  await openReadyMap(page);
  await expect(page).toHaveTitle('Where To BTO');
  await expect(page.getByText('Prototype — not an official Government service')).toHaveCount(0);
  await expect(page.getByTestId('question-card')).toBeVisible();

  const targetBefore = await page.evaluate(() => (window as unknown as { __mapCamera: { target: number[] } }).__mapCamera.target);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(220);
  await page.keyboard.up('ArrowRight');
  await expect.poll(async () => (await page.evaluate(() => (window as unknown as { __mapCamera: { target: number[] } }).__mapCamera.target))[0]).not.toBeCloseTo(targetBefore[0], 2);

  await page.getByRole('button', { name: /Raffles Place CBD/ }).click();
  await page.getByTestId('next-question').click();
  await page.getByLabel('Preferred flat type').selectOption('4-room');
  await page.getByLabel('Maximum price').fill('500000');
  await page.getByTestId('next-question').click();

  await page.getByTestId('amenity-choice-mrt').click();
  await page.getByTestId('amenity-choice-food-shopping').click();
  await page.getByTestId('amenity-choice-parks-recreation').click();
  await expect(page.getByTestId('amenity-choice-healthcare')).toBeDisabled();
  await expect(page.locator('.tag-choice.is-selected')).toHaveCount(3);
  await page.getByTestId('next-question').click();
  await page.getByRole('button', { name: /Sooner/ }).click();

  await expect(page.getByTestId('next-question')).toHaveText(/Finish narrowing/);
  await page.getByTestId('next-question').click();
  await expect(page.getByTestId('right-panel')).toHaveAttribute('data-panel-view', 'results');
  await expect(page.getByTestId('results-card')).toBeVisible();
  await expect(page.getByTestId('result-bucket-fits')).toBeVisible();
  await expect(page.getByTestId('result-bucket-awaiting')).toBeVisible();
  await expect(page.getByTestId('result-bucket-tradeoffs')).toBeVisible();
  await expect(page.getByTestId('result-row')).toHaveCount(22);

  const trayToggle = page.getByRole('button', { name: 'Explore sites', exact: true });
  await trayToggle.click();
  await page.getByRole('button', { name: 'Redhill Peaks', exact: true }).click();
  await expect(page.getByTestId('project-card')).toBeVisible();
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-boundary-state', 'approximate-1km');
  const selectedOpacity = await page.locator('.map-label-project', { hasText: 'Redhill Peaks' }).getAttribute('data-fit-opacity');

  await page.locator('[data-testid="project-amenity"][data-amenity-id="park-tiong-bahru"]').click();
  await expect(page.getByTestId('right-panel')).toHaveAttribute('data-panel-view', 'amenity');
  await expect(page.getByTestId('amenity-card')).toHaveAttribute('data-amenity-id', 'park-tiong-bahru');
  await expect(page.getByTestId('amenity-image')).toBeVisible();
  await expect(page.getByTestId('amenity-credit')).toContainText('Photo:');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-boundary-state', 'approximate-1km');
  await expect(page.locator('.map-label-project', { hasText: 'Redhill Peaks' })).toHaveAttribute('data-fit-opacity', selectedOpacity ?? '');

  await page.getByTestId('amenity-back').click();
  await expect(page.getByRole('heading', { name: 'Redhill Peaks' })).toBeVisible();
  await page.getByRole('button', { name: /Back to results/ }).click();
  await expect(page.getByTestId('results-card')).toBeVisible();
  await page.getByTestId('edit-answers').click();
  await expect(page.getByRole('heading', { name: 'Where do you spend your weekdays?' })).toBeVisible();
});

test('legacy storage migrates to grouped amenities and the v2 key', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('bto-narrowing-map:v1', JSON.stringify({
      answers: {
        workHubIds: [], maxBudget: null, flatType: null,
        amenityCategories: ['hawker', 'sports', 'shopping', 'mrt', 'bus'],
        waitingBand: null, customWorkplace: null,
      },
      visibleAmenities: ['mrt', 'parks', 'bus'],
      step: 2,
    }));
  });
  await openReadyMap(page);
  await expect(page.getByRole('heading', { name: 'What should be close by?' })).toBeVisible();
  await expect(page.getByTestId('amenity-choice-food-shopping')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('amenity-choice-parks-recreation')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('amenity-choice-mrt')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('layer-mrt')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('layer-parks-recreation')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => ({ current: Boolean(localStorage.getItem('where-to-bto:v2')), legacy: Boolean(localStorage.getItem('bto-narrowing-map:v1')) }))).toEqual({ current: true, legacy: false });
});

test('map amenity click opens the full panel and back restores the selected project', async ({ page }) => {
  await openReadyMap(page);
  await page.locator('.map-label-project', { hasText: 'Redhill Peaks' }).click();
  await expect(page.getByTestId('project-card')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __mapCamera: { zoom: number } }).__mapCamera.zoom)).toBeGreaterThanOrEqual(340);

  const footprintState = await page.evaluate(() => {
    type GeometryLike = { getIndex: () => { count: number } | null; computeBoundingBox: () => void; boundingBox: { getCenter: (target: VectorLike) => VectorLike } | null; getAttribute: (name: string) => { count: number } };
    type VectorLike = { x: number; y: number; z: number; project: (camera: { position: VectorLike }) => VectorLike };
    type SceneNode = { name: string; userData: { source?: string }; children: Array<{ type?: string; geometry?: GeometryLike }> };
    const win = window as unknown as { __mapCam: { position: VectorLike & { constructor: new (x: number, y: number, z: number) => VectorLike } }; __mapGl: { domElement: HTMLCanvasElement }; __mapScene: { traverse: (visitor: (object: SceneNode) => void) => void } };
    const groups: Array<{ source?: string; triangleCount: number; ringVertexCount: number }> = [];
    let point: { x: number; y: number } | null = null;
    win.__mapScene.traverse((object) => {
      if (!object.name.startsWith('amenity-highlight-')) return;
      const fill = object.children.find((child) => child.geometry?.getIndex());
      const ring = object.children.find((child) => child.type === 'LineLoop');
      if (!fill?.geometry) return;
      const index = fill.geometry.getIndex();
      if (!index) return;
      groups.push({ source: object.userData.source, triangleCount: index.count / 3, ringVertexCount: ring?.geometry?.getAttribute('position').count ?? 0 });
      if (object.name === 'amenity-highlight-park-tiong-bahru') {
        fill.geometry.computeBoundingBox();
        const centre = fill.geometry.boundingBox?.getCenter(new win.__mapCam.position.constructor(0, 0.055, 0));
        if (centre) {
          const projected = new win.__mapCam.position.constructor(centre.x, centre.y, centre.z).project(win.__mapCam);
          const rect = win.__mapGl.domElement.getBoundingClientRect();
          point = { x: rect.left + ((projected.x + 1) / 2) * rect.width, y: rect.top + ((1 - projected.y) / 2) * rect.height };
        }
      }
    });
    return { groups, point };
  });
  expect(footprintState.groups.length).toBeGreaterThan(0);
  expect(footprintState.groups.every((group) => group.triangleCount >= 1)).toBe(true);
  expect(footprintState.groups.some((group) => group.source === 'osm-footprint' && group.ringVertexCount > 12)).toBe(true);
  const point = footprintState.point as { x: number; y: number } | null;
  if (!point) throw new Error('Tiong Bahru amenity highlight was not found in the scene');
  await page.mouse.click(point.x, point.y);
  await expect(page.getByTestId('amenity-card')).toHaveAttribute('data-amenity-id', 'park-tiong-bahru');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-boundary-state', 'approximate-1km');
  await page.getByTestId('amenity-back').click();
  await expect(page.getByRole('heading', { name: 'Redhill Peaks' })).toBeVisible();
});

test('branding and visible interface typography use Hanken Grotesk only', async ({ page }) => {
  await openReadyMap(page);
  await expect(page.getByText('Where To BTO', { exact: true })).toBeVisible();
  const families = await page.evaluate(() => ['body', 'h1', 'button', '.rail-label', '.map-label'].map((selector) => getComputedStyle(document.querySelector(selector)!).fontFamily));
  for (const family of families) {
    expect(family).toMatch(/hanken/i);
    expect(family).not.toMatch(/Inter|DM Mono/i);
  }
});
