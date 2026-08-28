'use client';

import { useEffect, useMemo, useState } from 'react';
import { AmenityRail } from '@/components/AmenityRail';
import { MapScene } from '@/components/MapScene';
import { QuestionPanel } from '@/components/QuestionPanel';
import { btoProjects } from '@/data/bto-projects';
import { amenityCategories } from '@/data/amenities';
import { workHubs } from '@/data/work-hubs';
import { matchAllProjects } from '@/lib/matching';
import { FLAT_TYPES, MAX_AMENITY_PREFERENCES, WAITING_BANDS } from '@/lib/types';
import type { Amenity, AmenityCategory, ExplorerAnswers } from '@/lib/types';

const STORAGE_KEY = 'bto-narrowing-map:v1';
const DEFAULT_ANSWERS: ExplorerAnswers = { workHubIds: [], maxBudget: null, flatType: null, amenityCategories: [], waitingBand: null, customWorkplace: null };
const DEFAULT_VISIBLE: AmenityCategory[] = amenityCategories;

function isAnswers(value: unknown): value is ExplorerAnswers {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ExplorerAnswers>;
  const validHubIds = new Set(workHubs.map((hub) => hub.id));
  const validAmenityCategories = new Set(amenityCategories);
  const validWaitingBands = new Set(WAITING_BANDS.map((band) => band.value));
  const validCoordinate = (position: unknown): position is [number, number] => Array.isArray(position)
    && position.length === 2
    && position.every((value) => typeof value === 'number' && Number.isFinite(value));
  const hubIdsValid = Array.isArray(candidate.workHubIds)
    && candidate.workHubIds.length <= 2
    && new Set(candidate.workHubIds).size === candidate.workHubIds.length
    && candidate.workHubIds.every((id) => typeof id === 'string' && validHubIds.has(id));
  const amenityCategoriesValid = Array.isArray(candidate.amenityCategories)
    && candidate.amenityCategories.length <= MAX_AMENITY_PREFERENCES
    && new Set(candidate.amenityCategories).size === candidate.amenityCategories.length
    && candidate.amenityCategories.every((category) => typeof category === 'string' && validAmenityCategories.has(category));
  const budgetValid = candidate.maxBudget === null || (typeof candidate.maxBudget === 'number' && Number.isFinite(candidate.maxBudget) && candidate.maxBudget >= 0);
  const flatTypeValid = candidate.flatType === null || (typeof candidate.flatType === 'string' && FLAT_TYPES.includes(candidate.flatType));
  const waitingValid = candidate.waitingBand === null || (typeof candidate.waitingBand === 'string' && validWaitingBands.has(candidate.waitingBand));
  const customWorkplaceValid = candidate.customWorkplace === null || validCoordinate(candidate.customWorkplace);
  const workplaceModesValid = candidate.customWorkplace === null || (Array.isArray(candidate.workHubIds) && candidate.workHubIds.length === 0);
  return hubIdsValid && amenityCategoriesValid && budgetValid && flatTypeValid && waitingValid && customWorkplaceValid && workplaceModesValid;
}

export function BtoExplorer() {
  const [answers, setAnswers] = useState<ExplorerAnswers>(DEFAULT_ANSWERS);
  const [visibleAmenities, setVisibleAmenities] = useState<AmenityCategory[]>(DEFAULT_VISIBLE);
  const [step, setStep] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [pinMode, setPinMode] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayHovered, setTrayHovered] = useState(false);
  const [trayFocused, setTrayFocused] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { answers?: unknown; visibleAmenities?: unknown; step?: unknown } | null;
      if (!parsed || typeof parsed !== 'object') return;
      if (isAnswers(parsed.answers)) setAnswers(parsed.answers);
      if (Array.isArray(parsed.visibleAmenities)) {
        const nextVisible = parsed.visibleAmenities.filter((item): item is AmenityCategory => DEFAULT_VISIBLE.includes(item as AmenityCategory));
        if (nextVisible.length === parsed.visibleAmenities.length && new Set(nextVisible).size === nextVisible.length) setVisibleAmenities(nextVisible);
      }
      if (typeof parsed.step === 'number' && Number.isInteger(parsed.step) && parsed.step >= 0 && parsed.step <= 3) setStep(parsed.step);
    } catch {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, visibleAmenities, step })); } catch { /* storage may be unavailable */ }
  }, [answers, visibleAmenities, step]);

  const matches = useMemo(() => matchAllProjects(btoProjects, answers), [answers]);
  const selectedProject = btoProjects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedMatch = selectedProject ? matches[selectedProject.id] : null;

  const toggleAmenity = (category: AmenityCategory) => {
    setVisibleAmenities((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
    setSelectedAmenity(null);
  };

  const selectProject = (id: string) => {
    setPinMode(false);
    setSelectedProjectId(id);
    setSelectedAmenity(null);
  };

  const placeCustomPin = (position: [number, number]) => {
    setAnswers((current) => ({ ...current, workHubIds: [], customWorkplace: position }));
    setPinMode(false);
    setSelectedAmenity(null);
  };

  return (
    <main className="explorer-shell">
      <MapScene matches={matches} visibleAmenities={visibleAmenities} selectedProjectId={selectedProjectId} customPin={answers.customWorkplace} pinMode={pinMode} onProjectSelect={selectProject} onAmenitySelect={setSelectedAmenity} onGroundSelect={placeCustomPin} />
      <header className="app-header">
        <div className="brand-lockup"><span className="brand-mark">∷</span><div><strong>NARROW DOWN</strong><span>YOUR BTO</span></div></div>
        <div className="header-context"><span className="signal-dot" /> Singapore · {btoProjects.length} official records <span className="header-separator">/</span> <span className="muted">desktop map study</span></div>
      </header>
      <div className="map-title"><span className="map-title-eyebrow">LIVE MAP</span><strong>{selectedProject ? (selectedProject.town ?? 'Future site') : 'Singapore'}</strong><span className="map-title-sub" data-testid="map-context-label">{selectedProject ? (selectedProject.position ? '1 km approximate context' : 'location unavailable · no 1 km context') : 'named launches + announced supply'}</span></div>
      <AmenityRail visible={visibleAmenities} onToggle={toggleAmenity} />
      <div className="right-panel-wrap">
        <QuestionPanel step={step} answers={answers} selectedProject={selectedProject} selectedMatch={selectedMatch} pinMode={pinMode} onDropCustomPin={() => { setPinMode(true); setSelectedProjectId(null); }} onClearCustomPin={() => setAnswers((current) => ({ ...current, customWorkplace: null }))} onBack={() => setStep((current) => Math.max(0, current - 1))} onNext={() => setStep((current) => Math.min(3, current + 1))} onAnswersChange={setAnswers} onCloseProject={() => { setSelectedProjectId(null); setSelectedAmenity(null); }} />
      </div>
      <div className="map-legend"><div><i className="legend-bto" /> BTO fit</div><div><i className="legend-amenity" /> selected layer</div><div className="legend-instruction">Drag to orbit · scroll to zoom</div></div>
      <div className={`project-tray ${trayOpen ? 'is-open' : ''}`} aria-label="BTO project shortcuts" onMouseEnter={() => setTrayHovered(true)} onMouseLeave={() => setTrayHovered(false)} onFocus={() => setTrayFocused(true)} onBlur={(event) => setTrayFocused(event.currentTarget.contains(event.relatedTarget))}>
        <div className="tray-strip">
          <span className="tray-label">Sites · {btoProjects.length}</span>
          {selectedProject && <span className="tray-current"><span className="tray-dot" style={{ opacity: Math.max(0.35, 1 - matches[selectedProject.id].missCount * 0.18) }} />{selectedProject.name}</span>}
          <button type="button" className="tray-toggle" aria-expanded={trayOpen || trayHovered || trayFocused} aria-controls="project-tray-list" onClick={() => setTrayOpen((current) => !current)}>Explore sites</button>
        </div>
        <div className="tray-list" id="project-tray-list">
          <div className="tray-list-inner">
            {btoProjects.map((project) => <button key={project.id} className={selectedProjectId === project.id ? 'is-selected' : ''} onClick={() => selectProject(project.id)} title={`Focus ${project.name}`}><span className="tray-dot" style={{ opacity: Math.max(0.35, 1 - matches[project.id].missCount * 0.18) }} />{project.name}</button>)}
          </div>
        </div>
      </div>
      {selectedAmenity && <div className="amenity-popover" role="status"><span style={{ backgroundColor: '#63b9ff' }} /> <div><strong>{selectedAmenity.name}</strong><small>{selectedAmenity.type.replace('-', ' ')}</small></div><button aria-label="Close amenity details" onClick={() => setSelectedAmenity(null)}>×</button></div>}
      <div className="freshness-note">OFFICIAL SNAPSHOT · Source links in project cards · Checked 27 Aug 2026</div>
    </main>
  );
}
