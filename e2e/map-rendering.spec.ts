import { test, expect, type Page } from '@playwright/test';
import type { OrthographicCamera, WebGLRenderer } from 'three';

type MapWindow = Window & {
  __mapGl: WebGLRenderer;
  __mapCam: OrthographicCamera;
  __mapPendingFrames: number;
};

async function expectIdle(page: Page) {
  // A gap between slow software-rendered frames is not proof of idle.
  // Wait until R3F has no queued frame, then verify the render counter stays put.
  const frame = () => page.evaluate(() => (window as unknown as MapWindow).__mapGl.info.render.frame);
  await expect.poll(() => page.evaluate(() => (window as unknown as MapWindow).__mapPendingFrames), { timeout: 15_000 }).toBe(0);
  const before = await frame();
  await page.waitForTimeout(750);
  expect(await frame()).toBe(before);
}

test('animated map wakes for camera changes and sleeps when idle without fetching unused water', async ({ page }) => {
  test.setTimeout(90_000);
  // Exercise the animated camera path even on software WebGL CI hosts.
  // Disable expensive effects/shadows via the existing debug flags below.
  await page.addInitScript(() => {
    for (const context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const getParameter = context.prototype.getParameter;
      context.prototype.getParameter = function (parameter: number) {
        return parameter === 0x9246 ? 'Animated camera test renderer' : getParameter.call(this, parameter);
      };
    }
  });
  const mapRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/map/')) mapRequests.push(new URL(request.url()).pathname);
  });
  await page.goto('/?nofx&noshadow');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  await page.waitForFunction(() => Boolean((window as unknown as MapWindow).__mapGl));
  await expectIdle(page);
  expect(mapRequests).toContain('/map/buildings.bin');
  expect(mapRequests).not.toContain('/map/water.bin');

  const zoom = () => page.evaluate(() => (window as unknown as MapWindow).__mapCam.zoom);
  const overviewZoom = await zoom();
  await page.locator('.map-label-project', { hasText: 'Redhill Peaks' }).click();
  await expect.poll(zoom, { timeout: 20_000 }).toBeGreaterThan(150);
  await expectIdle(page);
  await page.getByRole('button', { name: /Back to narrowing/ }).click();
  await expect.poll(zoom, { timeout: 20_000 }).toBeLessThan(overviewZoom + 1);
  await expectIdle(page);

  const positionX = () => page.evaluate(() => (window as unknown as MapWindow).__mapCam.position.x);
  const beforePan = await positionX();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowRight');
  await expect.poll(positionX).toBeGreaterThan(beforePan);
  await expectIdle(page);

  await page.mouse.move(600, 450);
  await page.mouse.wheel(0, -200);
  await expect.poll(zoom).toBeGreaterThan(overviewZoom + 5);
  await expectIdle(page);
});

test('an arrow tap queued between frames still moves the map', async ({ page }) => {
  await page.goto('/?lite=1');
  await expect(page.getByTestId('map-boundary-state')).toHaveAttribute('data-map-ready', 'true', { timeout: 30_000 });
  await page.waitForFunction(() => Boolean((window as unknown as MapWindow).__mapCam));
  await expectIdle(page);
  const before = await page.evaluate(() => (window as unknown as MapWindow).__mapCam.position.x);
  // Reproduce a busy renderer delivering both keyboard events before its next frame.
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as MapWindow).__mapCam.position.x)).toBeGreaterThan(before);
  await expectIdle(page);
});
