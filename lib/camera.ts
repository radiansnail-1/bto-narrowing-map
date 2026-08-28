import * as THREE from 'three';

/**
 * Pure camera helpers shared by the scene rig and its tests.
 * The map camera is orthographic and orbits a ground target at a fixed distance; zoom is the ortho zoom factor.
 */
export const CAMERA_DISTANCE = 60;
export const OVERVIEW_AZIMUTH = -0.36;
export const OVERVIEW_ELEVATION = 0.66;
export const FOCUS_ELEVATION = 0.74;
export const MAX_ZOOM = 520;
/** Screen-space keyboard pan speed. Divided by the camera zoom it becomes a constant on-screen speed at any zoom. */
export const KEY_PAN_PX_PER_SECOND = 760;
export const KEY_PAN_EASE_SECONDS = 0.11;
export const ZOOM_EASE_SECONDS = 0.085;
/** Fallback island extent in scene units (manifest bounds replace it once assets load). */
export const FALLBACK_BOUNDS = { x0: -22.5, z0: -8.6, x1: 18.6, z1: 18 };
export const PAN_MARGIN = 3;
export const FOCUS_SAFE_INSETS = { left: 260, right: 420, top: 24, bottom: 96 };

export type GroundBounds = { x0: number; z0: number; x1: number; z1: number };
export type ZoomBounds = { min: number; max: number; overview: number; focus: number };

export const PAN_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/** Overview/focus zoom for a viewport, plus the wheel/pinch limits that keep the island framed and buildings readable. */
export function zoomBounds(width: number, height: number): ZoomBounds {
  const overview = THREE.MathUtils.clamp(Math.min((width - 200) / 43, (height - 120) / 24), 20, 60);
  const focus = focusZoomForRadius(width, height, 1 / 1.31);
  return { min: Math.max(12, overview * 0.72), max: MAX_ZOOM, overview, focus };
}

/**
 * Largest zoom that keeps an entire ground-plane circle inside the unobscured map viewport.
 * The vertical ground projection is foreshortened by the camera elevation; a 10% breathing margin
 * keeps the boundary clear of the HUD, details card and bottom project tray.
 */
export function focusZoomForRadius(width: number, height: number, radius: number, elevation = FOCUS_ELEVATION): number {
  const usableWidth = Math.max(320, width - FOCUS_SAFE_INSETS.left - FOCUS_SAFE_INSETS.right);
  const usableHeight = Math.max(280, height - FOCUS_SAFE_INSETS.top - FOCUS_SAFE_INSETS.bottom);
  const horizontal = usableWidth / (radius * 2.2);
  const vertical = usableHeight / (radius * 2.2 * Math.sin(elevation));
  return THREE.MathUtils.clamp(Math.min(horizontal, vertical), 150, 420);
}

/** Camera offset from the target for an orbit azimuth/elevation at the fixed orbit distance. */
export function orbitOffset(azimuth: number, elevation: number, distance = CAMERA_DISTANCE): THREE.Vector3 {
  return new THREE.Vector3(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)).multiplyScalar(distance);
}

/** Inverse of orbitOffset for any offset length, so manual zoom-to-cursor or damping can never skew a later fly-to. */
export function orbitFromOffset(offset: THREE.Vector3): { azimuth: number; elevation: number; distance: number } {
  const distance = offset.length() || CAMERA_DISTANCE;
  return { azimuth: Math.atan2(offset.x, offset.z), elevation: Math.asin(THREE.MathUtils.clamp(offset.y / distance, -1, 1)), distance };
}

/** Ground-plane unit axes for the current view: screen-right and screen-up projected onto the ground. */
export function groundAxes(azimuth: number): { right: THREE.Vector3; forward: THREE.Vector3 } {
  return { right: new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth)), forward: new THREE.Vector3(-Math.sin(azimuth), 0, -Math.cos(azimuth)) };
}

/** Unit direction (screen-right, screen-up) requested by the held arrow keys; opposite keys cancel. */
export function keyPanDirection(keys: Iterable<string>): THREE.Vector2 {
  const direction = new THREE.Vector2();
  for (const key of keys) {
    if (key === 'ArrowRight') direction.x += 1;
    else if (key === 'ArrowLeft') direction.x -= 1;
    else if (key === 'ArrowUp') direction.y += 1;
    else if (key === 'ArrowDown') direction.y -= 1;
  }
  return direction.lengthSq() > 0 ? direction.normalize() : direction;
}

/** Frame-rate independent exponential approach: the same result for one 32 ms step or two 16 ms steps. */
export function approach(current: number, goal: number, dt: number, tau: number): number {
  if (tau <= 0) return goal;
  return goal + (current - goal) * Math.exp(-dt / tau);
}

/** Ground translation for one frame of keyboard panning at a screen-space velocity (px/s) and ortho zoom (px per unit). */
export function panDisplacement(velocity: THREE.Vector2, azimuth: number, zoom: number, dt: number): THREE.Vector3 {
  const { right, forward } = groundAxes(azimuth);
  return right.multiplyScalar((velocity.x * dt) / zoom).add(forward.multiplyScalar((velocity.y * dt) / zoom));
}

/**
 * Multiplicative zoom factor for a wheel event. Proportional to the scrolled distance so a trackpad flick and a
 * mouse notch feel alike; pinch gestures (ctrlKey) arrive as small deltas and are amplified.
 */
export function wheelZoomFactor(deltaY: number, deltaMode: number, pinch: boolean): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 100 : deltaY;
  const clamped = THREE.MathUtils.clamp(pixels, -240, 240);
  return Math.exp(-clamped * (pinch ? 0.012 : 0.0028));
}

export function clampZoom(zoom: number, bounds: ZoomBounds): number {
  return THREE.MathUtils.clamp(zoom, bounds.min, bounds.max);
}

/** Keeps the orbit target on the island so panning or zooming can never leave the model behind. */
export function clampTarget(target: THREE.Vector3, bounds: GroundBounds, margin = PAN_MARGIN): THREE.Vector3 {
  return new THREE.Vector3(THREE.MathUtils.clamp(target.x, bounds.x0 - margin, bounds.x1 + margin), target.y, THREE.MathUtils.clamp(target.z, bounds.z0 - margin, bounds.z1 + margin));
}

const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const scratchRay = new THREE.Ray();
const scratchNear = new THREE.Vector3();
const scratchFar = new THREE.Vector3();

/** World point on the y = 0 ground plane under a normalised device coordinate, or null when the ray misses. */
export function groundPointAt(camera: THREE.Camera, ndc: THREE.Vector2, out = new THREE.Vector3()): THREE.Vector3 | null {
  scratchNear.set(ndc.x, ndc.y, -1).unproject(camera);
  scratchFar.set(ndc.x, ndc.y, 1).unproject(camera);
  scratchRay.origin.copy(scratchNear);
  scratchRay.direction.copy(scratchFar).sub(scratchNear).normalize();
  return scratchRay.intersectPlane(groundPlane, out);
}

/**
 * Applies an ortho zoom while holding the ground point under `cursor` still. Returns the ground shift applied to
 * both camera and target so callers can keep the two in lockstep.
 */
export function zoomAboutCursor(camera: THREE.OrthographicCamera, target: THREE.Vector3, nextZoom: number, cursor: THREE.Vector2): THREE.Vector3 {
  const before = groundPointAt(camera, cursor, new THREE.Vector3());
  camera.zoom = nextZoom;
  camera.updateProjectionMatrix();
  const after = groundPointAt(camera, cursor, new THREE.Vector3());
  const shift = new THREE.Vector3();
  if (before && after) { shift.subVectors(before, after); shift.y = 0; }
  camera.position.add(shift);
  target.add(shift);
  return shift;
}

/** True when a keyboard event should stay with the focused form control instead of panning the map. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || target.getAttribute('role') === 'slider';
}
