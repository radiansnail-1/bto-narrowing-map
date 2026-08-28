'use client';

import { AMENITY_GROUP_ORDER, AMENITY_GROUPS, amenityGroupStyle } from '@/lib/amenity-groups';
import type { AmenityGroup } from '@/lib/types';

interface AmenityRailProps {
  visible: AmenityGroup[];
  onToggle: (group: AmenityGroup) => void;
}

export function AmenityRail({ visible, onToggle }: AmenityRailProps) {
  return (
    <aside className="amenity-rail" aria-label="Map layers">
      <div className="rail-heading">
        <span className="rail-heading-mark" />
        <span>Layers</span>
      </div>
      <div className="rail-list">
        {AMENITY_GROUP_ORDER.map((group) => {
          const definition = AMENITY_GROUPS[group];
          const isVisible = visible.includes(group);
          return (
            <button
              className={`rail-item ${isVisible ? 'is-active' : ''}`}
              style={amenityGroupStyle(group)}
              data-testid={`layer-${group}`}
              key={group}
              onClick={() => onToggle(group)}
              aria-pressed={isVisible}
              title={`${isVisible ? 'Hide' : 'Show'} ${definition.label}`}
            >
              <span className="rail-icon" aria-hidden="true">{definition.icon}</span>
              <span className="rail-label">{definition.label}<small>{definition.description}</small></span>
              <span className={`rail-switch ${isVisible ? 'on' : ''}`}><i /></span>
            </button>
          );
        })}
      </div>
      <div className="rail-key"><span className="key-dot" /> BTO site · 1 km context</div>
    </aside>
  );
}
