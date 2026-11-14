import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dir = new URL('../.github/workflows/', import.meta.url);

describe('workflow runners', () => {
  it('runs every job on a pinned runner image', () => {
    const files = readdirSync(dir).filter((name) => /\.ya?ml$/.test(name));
    expect(files.length).toBeGreaterThan(0);
    for (const name of files) {
      const runners = [...readFileSync(new URL(name, dir), 'utf8').matchAll(/^\s*runs-on:\s*(.+)$/gm)].map((m) => m[1].trim());
      expect(runners.length, `${name} has no runs-on`).toBeGreaterThan(0);
      for (const runner of runners) expect(runner, `${name} uses unpinned runner ${runner}`).not.toMatch(/-latest\b/);
    }
  });
});
