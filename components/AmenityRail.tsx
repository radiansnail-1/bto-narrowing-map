'use client';

import { AMENITY_LABELS, type AmenityCategory } from '@/lib/types';

const icons: Record<AmenityCategory, string> = {
  mrt: '◈',
  hawker: '◇',
  shopping: '▦',
  healthcare: '+',
  schools: '⌂',
  parks: '✳',
  sports: '○',
};

const colors: Record<AmenityCategory, string> = {
  mrt: '#63b9ff',
  hawker: '#f98f68',
  shopping: '#b497ff',
  healthcare: '#f376a4',
  schools: '#63d5a1',
  parks: '#8bd88b',
  sports: '#5de0dc',
};

interface AmenityRailProps {
  visible: AmenityCategory[];
  onToggle: (category: AmenityCategory) => void;
}

export function AmenityRail({ visible, onToggle }: AmenityRailProps) {
  return (
    <aside className="amenity-rail" aria-label="Map layers">
      <div className="rail-heading">
        <span className="rail-heading-mark" />
        <span>Layers</span>
      </div>
      <div className="rail-list">
        {(Object.keys(AMENITY_LABELS) as AmenityCategory[]).map((category) => {
          const isVisible = visible.includes(category);
          return (
            <button
              className={`rail-item ${isVisible ? 'is-active' : ''}`}
              data-testid={`layer-${category}`}
              key={category}
              onClick={() => onToggle(category)}
              aria-pressed={isVisible}
              title={`${isVisible ? 'Hide' : 'Show'} ${AMENITY_LABELS[category]}`}
            >
              <span className="rail-icon" style={{ color: colors[category] }}>{icons[category]}</span>
              <span className="rail-label">{AMENITY_LABELS[category]}</span>
              <span className={`rail-switch ${isVisible ? 'on' : ''}`}><i /></span>
            </button>
          );
        })}
      </div>
      <div className="rail-key"><span className="key-dot" /> 1 km context</div>
    </aside>
  );
}

export { colors as amenityColors };
