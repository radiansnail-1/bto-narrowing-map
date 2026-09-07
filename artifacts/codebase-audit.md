# Codebase cleanup and performance audit — 7 September 2026

Scope: application components, shared logic, tests, asset scripts and dependencies. One Astra low-effort agent independently reviewed complexity and the final rendering changes.

## Changes

- Render the full-quality map on demand, retaining shadows, postprocessing and all building geometry. Camera animation schedules a final settling frame; wheel zoom uses matching update/invalidation thresholds so high-refresh displays can return to idle.
- Stop fetching/parsing the water mesh: no scene component used it. Its source asset and regeneration contract remain intact.
- Remove four trivial navigation/media lookup wrappers, an unused explanation argument, an unused keyboard constant and the unused runtime work-hub travel-time field.
- Remove the constant-return wrapper test and duplicate uniqueness assertion. Replace arbitrary SEO copy-length thresholds with nonempty-content checks; retain sitemap, uniqueness, matching, geometry, media provenance, persistence and navigation coverage.
- Correct an existing readonly test fixture that TypeScript rejected as an `ExplorerAnswers` argument.

No dependencies were added or removed. The media dimension parser was retained: replacing it would require declaring another direct dependency for a small test-only simplification.

## Measurements

Local Next development server; Chromium's full browser (`channel: 'chromium'`), Apple M3 / ANGLE Metal, 1280 × 800 viewport. Fresh page, map ready plus six seconds to settle, then a three-second idle sample. Full effects and shadows were enabled in both runs.

| Measurement | Before | After |
| --- | ---: | ---: |
| Scene renders in idle sample | 267 | 0 |
| Main-thread TaskDuration during sample | 1.109 s | 0.002 s |
| Requested map assets | 8 | 7 |
| Unused water bytes loaded | 170,572 | 0 |
| Renderer geometry count | 355 | 355 |

These are local single-run measurements, not production FPS or battery-life estimates. A second post-change idle sample also recorded zero scene renders. Changing the commute answer woke rendering and changed actual project material opacities to 0.77/1; wheel zoom resumed and returned to zero idle renders. Full-quality focus/return transitions also returned to idle. Before/after overview screenshots were visually inspected.

To repeat the render-count measurement, run `npm run dev`, open the map in GPU-enabled Chromium, let the opening animation and geometry loading finish, then run in its console:

```js
let renders = 0;
const scene = window.__mapScene;
const previous = scene.onBeforeRender;
scene.onBeforeRender = () => { renders += 1; };
setTimeout(() => {
  scene.onBeforeRender = previous;
  console.log({ renders });
}, 3000);
```

The automated `e2e/map-rendering.spec.ts` checks idle rendering, fly-to/return, keyboard pan, wheel zoom and omitted water loading. It forces the animated camera branch and disables effects/shadows to remain practical on software-rendered CI; full effects were verified separately on the local GPU. One existing Guides navigation test timed out during the initial run and passed on rerun. The new camera test initially exceeded software-renderer time limits, then passed using full Chromium and explicit transition timeouts.

Rendering follows the existing control/animation invalidation hooks and [React Three Fiber's on-demand rendering contract](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

## Verification result

- `npm run test`: 57 tests passed across 9 files.
- `npm run lint`: passed.
- Browser coverage: all 8 existing flows passed across the initial run and targeted rerun; the new animated-map regression passed separately (9 checks total).
- `npm run build`: passed, including TypeScript validation and 41 generated static pages.
- `git diff --check`: passed.

Baseline: repository commit `b2af53c`. Changes are local and uncommitted.
