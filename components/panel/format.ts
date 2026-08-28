import type { BtoProject } from '@/lib/types';

/** Copy for facts HDB has not published. Never a generic "Unknown". */
export const NOT_PUBLISHED = 'Not published by HDB yet';

export function priceText(project: BtoProject): string | null {
  const priced = project.flatTypes.filter((item) => item.minPrice !== null);
  if (priced.length === 0) return null;
  return priced
    .map((item) => `${item.type.replace(' Flexi', '')} $${Math.round((item.minPrice as number) / 1000)}–${item.maxPrice === null ? '?' : Math.round(item.maxPrice / 1000)}k`)
    .join('  ·  ');
}

export function flatTypeList(project: BtoProject): string | null {
  if (project.flatTypes.length === 0) return null;
  return project.flatTypes.map((item) => item.units !== null ? `${item.type}${item.unitsAreApproximate ? ' ≈' : ' '}${item.units.toLocaleString()}` : item.type).join('  ·  ');
}

export function waitingText(project: BtoProject): string {
  const waiting = project.estimatedWaitingTimeMonths;
  if (typeof waiting === 'number') return `${waiting} months`;
  if (waiting) return `${waiting.min}–${waiting.max} months`;
  return NOT_PUBLISHED;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month) return iso;
  const date = new Date(Date.UTC(year, month - 1, day || 1));
  return date.toLocaleDateString('en-SG', { day: day ? 'numeric' : undefined, month: 'short', year: 'numeric', timeZone: 'UTC' });
}
