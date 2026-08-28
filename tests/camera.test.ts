import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  CAMERA_DISTANCE, FALLBACK_BOUNDS, KEY_PAN_PX_PER_SECOND, approach, clampTarget, clampZoom, groundAxes, groundPointAt, keyPanDirection,
  focusZoomForRadius, orbitFromOffset, orbitOffset, panDisplacement, wheelZoomFactor, zoomAboutCursor, zoomBounds,
} from '@/lib/camera';

function orthoCamera(zoom: number, azimuth = -0.36, elevation = 0.66, target = new THREE.Vector3(0.6, 0, 3.6)) {
  const camera = new THREE.OrthographicCamera(-800, 800, 500, -500, 0.5, 220);
  camera.zoom = zoom;
  camera.position.copy(target).add(orbitOffset(azimuth, elevation));
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return { camera, target };
}

describe('keyboard panning', () => {
  it('combines arrow keys into a unit screen direction and cancels opposites', () => {
    expect(keyPanDirection(['ArrowRight']).toArray()).toEqual([1, 0]);
    expect(keyPanDirection(['ArrowUp', 'ArrowRight']).length()).toBeCloseTo(1);
    expect(keyPanDirection(['ArrowLeft', 'ArrowRight']).length()).toBe(0);
    expect(keyPanDirection(['ArrowDown']).y).toBe(-1);
  });

  it('moves along the ground plane in the direction the camera faces, at a zoom-independent on-screen speed', () => {
    const azimuth = -0.36;
    const { right, forward } = groundAxes(azimuth);
    expect(right.y).toBe(0); expect(forward.y).toBe(0);
    expect(right.dot(forward)).toBeCloseTo(0);
    expect(right.dot(new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth)))).toBeCloseTo(1);
    const velocity = new THREE.Vector2(KEY_PAN_PX_PER_SECOND, 0);
    const near = panDisplacement(velocity, azimuth, 30, 1 / 60);
    const far = panDisplacement(velocity, azimuth, 120, 1 / 60);
    expect(near.y).toBe(0);
    expect(near.length() * 30).toBeCloseTo(far.length() * 120); // same pixels per second at any zoom
    expect(near.length()).toBeCloseTo(KEY_PAN_PX_PER_SECOND / 60 / 30);
    const up = panDisplacement(new THREE.Vector2(0, 1), 0, 1, 1);
    expect(up.z).toBeLessThan(0); // screen-up at azimuth 0 heads toward -z (away from the camera)
  });

  it('is frame-rate independent: one 32 ms step equals two 16 ms steps', () => {
    const one = approach(0, 1, 0.032, 0.11);
    const two = approach(approach(0, 1, 0.016, 0.11), 1, 0.016, 0.11);
    expect(one).toBeCloseTo(two, 10);
    expect(approach(0, 1, 5, 0.11)).toBeCloseTo(1);
  });

  it('keeps the orbit target on the island', () => {
    const clamped = clampTarget(new THREE.Vector3(999, 0.1, -999), FALLBACK_BOUNDS);
    expect(clamped.x).toBe(FALLBACK_BOUNDS.x1 + 3);
    expect(clamped.z).toBe(FALLBACK_BOUNDS.z0 - 3);
    expect(clamped.y).toBe(0.1);
    const inside = clampTarget(new THREE.Vector3(1, 0, 2), FALLBACK_BOUNDS);
    expect(inside.toArray()).toEqual([1, 0, 2]);
  });
});

describe('zoom stability and bounds', () => {
  it('derives overview, focus and wheel limits that nest correctly for the desktop viewport', () => {
    const bounds = zoomBounds(1600, 1000);
    expect(bounds.min).toBeLessThan(bounds.overview);
    expect(bounds.overview).toBeLessThan(bounds.focus);
    expect(bounds.focus).toBeLessThan(bounds.max);
    expect(clampZoom(1, bounds)).toBe(bounds.min);
    expect(clampZoom(1e6, bounds)).toBe(bounds.max);
    const small = zoomBounds(1100, 700);
    expect(small.overview).toBeGreaterThanOrEqual(20);
    expect(small.min).toBeLessThan(small.overview);
  });

  it('frames the complete 1 km context circle inside the desktop HUD safe area', () => {
    const radius = 1 / 1.31;
    const zoom = focusZoomForRadius(1600, 1000, radius);
    expect(zoom).toBeGreaterThanOrEqual(380);
    expect(radius * 2 * zoom).toBeLessThanOrEqual(1600 - 190 - 318);
    expect(radius * 2 * Math.sin(0.74) * zoom).toBeLessThanOrEqual(1000 - 30 - 170);
    expect(focusZoomForRadius(1100, 700, radius)).toBeLessThan(zoom);
  });

  it('scales wheel zoom with scrolled distance, symmetrically, and never inverts direction', () => {
    const notchIn = wheelZoomFactor(-100, 0, false);
    const notchOut = wheelZoomFactor(100, 0, false);
    expect(notchIn).toBeGreaterThan(1);
    expect(notchOut).toBeLessThan(1);
    expect(notchIn * notchOut).toBeCloseTo(1);
    expect(wheelZoomFactor(-10, 0, false)).toBeLessThan(notchIn); // a tiny trackpad tick is a small step
    expect(wheelZoomFactor(-10, 0, false)).toBeGreaterThan(1);
    expect(wheelZoomFactor(-5000, 0, false)).toBeLessThanOrEqual(Math.exp(240 * 0.0028)); // one event is capped
    expect(wheelZoomFactor(-1, 1, false)).toBeCloseTo(wheelZoomFactor(-16, 0, false)); // line mode normalised
    expect(wheelZoomFactor(-10, 0, true)).toBeGreaterThan(wheelZoomFactor(-10, 0, false)); // pinch amplified
  });

  it('zooms about the cursor without moving the ground point under it and without target drift', () => {
    const { camera, target } = orthoCamera(30);
    const cursor = new THREE.Vector2(0.55, -0.3);
    const before = groundPointAt(camera, cursor)!.clone();
    const offsetBefore = camera.position.clone().sub(target);
    for (const zoom of [45, 70, 120, 90]) {
      const shift = zoomAboutCursor(camera, target, zoom, cursor);
      camera.updateMatrixWorld();
      expect(shift.y).toBe(0);
      const after = groundPointAt(camera, cursor)!;
      expect(after.distanceTo(before)).toBeLessThan(1e-6);
      expect(camera.position.clone().sub(target).distanceTo(offsetBefore)).toBeLessThan(1e-6); // orbit geometry preserved
      expect(Math.abs(target.y)).toBeLessThan(1e-9);
    }
    const centre = groundPointAt(camera, new THREE.Vector2(0, 0))!;
    expect(centre.distanceTo(target)).toBeLessThan(1e-6); // target still sits at the screen centre
  });

  it('recovers azimuth and elevation from any camera offset so fly-to never jumps', () => {
    const offset = orbitOffset(-0.36, 0.66);
    const orbit = orbitFromOffset(offset);
    expect(orbit.azimuth).toBeCloseTo(-0.36);
    expect(orbit.elevation).toBeCloseTo(0.66);
    expect(orbit.distance).toBeCloseTo(CAMERA_DISTANCE);
    const stretched = orbitFromOffset(offset.clone().multiplyScalar(0.4));
    expect(stretched.azimuth).toBeCloseTo(-0.36);
    expect(stretched.elevation).toBeCloseTo(0.66);
  });
});
