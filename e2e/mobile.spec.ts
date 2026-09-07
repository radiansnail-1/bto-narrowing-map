import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('mobile loads the map and can narrow and open transit routes', async ({ page }) => {
  const mapRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/map/')) mapRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  for (const width of [320, 390, 844, 1023]) {
    await page.setViewportSize({ width, height: width > 767 ? 390 : 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const next = await page.getByTestId('next-question').boundingBox();
    expect(next!.x).toBeGreaterThanOrEqual(0);
    expect(next!.x + next!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Raffles Place CBD/ }).click();
  for (let step = 0; step < 4; step++) await page.getByTestId('next-question').click();
  await expect(page.getByTestId('result-row')).toHaveCount(22);
  await page.getByTestId('result-row').filter({ hasText: 'Redhill Peaks' }).click();
  await expect(page.getByTestId('project-card')).toBeVisible();
  const route = page.getByRole('link', { name: /Transit to Raffles Place/ });
  await expect(route).toHaveAttribute('href', /www.google.com\/maps\/dir\/\?api=1&origin=.+&destination=.+&travelmode=transit/);
  expect(mapRequests.some((url) => url.endsWith('/buildings.bin'))).toBe(true);
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('mobile map supports pan, pinch, rotate, reset and reframes selection on resize', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const map = page.getByTestId('map-boundary-state');
  await expect(map).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  await map.scrollIntoViewIfNeeded();
  type CameraWindow = Window & { __mapCamera: { zoom: number; target: number[]; position: number[] } };
  const zoom = () => page.evaluate(() => (window as unknown as CameraWindow).__mapCamera.zoom);
  await expect.poll(zoom).toBeGreaterThan(0);
  const before = await zoom();
  const box = (await page.locator('canvas').boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const session = await context.newCDPSession(page);
  const camera = () => page.evaluate(() => (window as unknown as CameraWindow).__mapCamera);
  const beforePan = await camera();
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 80, y: y + 100, id: 1 }] });
  for (const shift of [20, 40, 60]) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 80 + shift, y: y + 100, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await camera()).target[0]).not.toBeCloseTo(beforePan.target[0], 1);
  const orbit = (state: typeof beforePan) => Math.atan2(state.position[0] - state.target[0], state.position[2] - state.target[2]);
  expect(orbit(await camera())).toBeCloseTo(orbit(beforePan), 2);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  const fingers = (distance: number) => [{ x: x - distance, y, id: 1 }, { x: x + distance, y, id: 2 }];
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(30) });
  for (const distance of [40, 55, 70, 85]) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: fingers(distance) });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(zoom).toBeGreaterThan(before * 1.2);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect.poll(zoom).toBeCloseTo(before, 1);
  const beforeRotate = await camera();
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(40) });
  for (const shift of [15, 30, 45]) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: fingers(40).map((point) => ({ ...point, x: point.x + shift })) });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => orbit(await camera())).not.toBeCloseTo(orbit(beforeRotate), 1);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.setViewportSize({ width: 767, height: 844 });
  await page.getByRole('button', { name: /Browse 22 projects/ }).click();
  await page.getByRole('button', { name: 'Redhill Peaks', exact: true }).click();
  await expect.poll(zoom).toBeGreaterThan(270);
  await page.setViewportSize({ width: 320, height: 844 });
  await expect.poll(zoom).toBeLessThan(180);
  await expect.poll(zoom).toBeGreaterThan(150);
});

test('mobile workplace pin can be placed and cancelled', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  await page.getByTestId('custom-pin-action').click();
  await expect(page.getByRole('button', { name: 'Cancel pin', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel pin', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reset view', exact: true })).toBeVisible();
  await page.getByTestId('custom-pin-action').click();
  const box = (await page.locator('canvas').boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId('custom-pin-action')).toHaveText('Remove custom workplace pin');
  await expect(page.getByRole('button', { name: 'Cancel pin', exact: true })).toHaveCount(0);
});

test('mobile DIA calculator validates inputs and guides expose canonical content', async ({ page }) => {
  await page.goto('/tools/dia-calculator');
  await expect(page.getByRole('heading', { name: 'Your payment picture' })).toBeVisible();
  await page.locator('#dia-price').fill('400000');
  await page.locator('#dia-cpfAtSigning').fill('0');
  await expect(page.locator('section[aria-labelledby="dia-results"]')).toContainText('$10,000');
  await page.locator('#dia-price').fill('');
  await expect(page.locator('#dia-price')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Check the highlighted inputs to see your estimate.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset example' }).click();
  await expect(page.locator('#dia-price')).toHaveAttribute('aria-invalid', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  for (const slug of ['dia-hfe-and-housing-grants', 'bto-cash-cpf-payment-timeline', 'standard-plus-prime-bto-restrictions']) {
    const response = await page.goto(`/guides/${slug}`);
    expect(response!.status()).toBe(200);
    await expect(page.locator('article h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://wheretobto.com/guides/${slug}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
});
