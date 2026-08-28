'use client';

import { useEffect, useMemo, useState } from 'react';
import { AmenityRail } from '@/components/AmenityRail';
import { MapScene } from '@/components/MapScene';
import { AmenityView } from '@/components/panel/AmenityView';
import { ProjectView } from '@/components/panel/ProjectView';
import { QuestionsView } from '@/components/panel/QuestionsView';
import { ResultsView } from '@/components/panel/ResultsView';
import { formatDate } from '@/components/panel/format';
import { amenityById } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { AMENITY_GROUP_ORDER, AMENITY_GROUPS } from '@/lib/amenity-groups';
import { matchAllProjects, projectOpacity } from '@/lib/matching';
import { QUESTIONS_VIEW, closeAmenity, closeProject, editAnswers, finishQuestions, flowKindOf, openAmenity, openProject, type PanelView } from '@/lib/panel-view';
import { DEFAULT_ANSWERS, DEFAULT_VISIBLE_GROUPS, MAX_STEP, loadStoredState, saveStoredState } from '@/lib/storage';
import type { Amenity, AmenityGroup, ExplorerAnswers } from '@/lib/types';

export function BtoExplorer() {
  const [answers, setAnswers] = useState<ExplorerAnswers>(DEFAULT_ANSWERS);
  const [visibleGroups, setVisibleGroups] = useState<AmenityGroup[]>(DEFAULT_VISIBLE_GROUPS);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [view, setView] = useState<PanelView>(QUESTIONS_VIEW);
  const [pinMode, setPinMode] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayHovered, setTrayHovered] = useState(false);
  const [trayFocused, setTrayFocused] = useState(false);

  useEffect(() => {
    const stored = loadStoredState(window.localStorage);
    if (stored.answers) setAnswers(stored.answers);
    if (stored.visibleGroups) setVisibleGroups(stored.visibleGroups);
    if (stored.step !== undefined) setStep(stored.step);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredState(window.localStorage, { answers, visibleGroups, step });
  }, [answers, visibleGroups, step, hydrated]);

  const matches = useMemo(() => matchAllProjects(btoProjects, answers), [answers]);
  const selectedProject = btoProjects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedMatch = selectedProject ? matches[selectedProject.id] : null;

  const toggleGroup = (group: AmenityGroup) => {
    setVisibleGroups((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group]);
  };

  const selectProject = (id: string) => {
    setPinMode(false);
    setSelectedProjectId(id);
    setView((current) => openProject(current));
  };

  const deselectProject = () => {
    setSelectedProjectId(null);
    setView((current) => closeProject(current));
  };

  const selectAmenity = (amenity: Amenity) => {
    setView((current) => openAmenity(current, amenity.id));
  };

  const placeCustomPin = (position: [number, number]) => {
    setAnswers((current) => ({ ...current, workHubIds: [], customWorkplace: position }));
    setPinMode(false);
  };

  const startPinMode = () => {
    setPinMode(true);
    setSelectedProjectId(null);
    setView(QUESTIONS_VIEW);
  };

  const renderPanel = () => {
    // A stale view can only happen if a selection disappears underneath it; fall back to the flow view.
    const effective: PanelView = view.kind === 'project' && !selectedProject ? { kind: view.returnTo }
      : view.kind === 'amenity' && view.returnTo.kind === 'project' && !selectedProject ? { kind: view.returnTo.returnTo }
      : view;
    if (effective.kind === 'amenity') {
      const amenity = amenityById.get(effective.amenityId);
      if (amenity) {
        const backLabel = effective.returnTo.kind === 'project' && selectedProject ? `Back to ${selectedProject.name.split(' — ')[0]}`
          : effective.returnTo.kind === 'results' ? 'Back to results' : 'Back to narrowing';
        return <AmenityView amenity={amenity} selectedProject={selectedProject} backLabel={backLabel} onBack={() => setView((current) => closeAmenity(current))} />;
      }
    }
    if (effective.kind === 'project' && selectedProject && selectedMatch) {
      return <ProjectView project={selectedProject} match={selectedMatch} returnTo={effective.returnTo} onClose={deselectProject} onOpenAmenity={selectAmenity} />;
    }
    if (flowKindOf(effective) === 'results') {
      return <ResultsView projects={btoProjects} matches={matches} answers={answers} selectedProjectId={selectedProjectId} onOpenProject={selectProject} onEditAnswers={() => { setStep(0); setView(editAnswers()); }} />;
    }
    return <QuestionsView step={step} answers={answers} pinMode={pinMode} onDropCustomPin={startPinMode} onClearCustomPin={() => setAnswers((current) => ({ ...current, customWorkplace: null }))} onBack={() => setStep((current) => Math.max(0, current - 1))} onNext={() => setStep((current) => Math.min(MAX_STEP, current + 1))} onFinish={() => setView(finishQuestions())} onAnswersChange={setAnswers} />;
  };

  return (
    <main className="explorer-shell">
      <MapScene matches={matches} visibleGroups={visibleGroups} selectedProjectId={selectedProjectId} customPin={answers.customWorkplace} pinMode={pinMode} onProjectSelect={selectProject} onAmenitySelect={selectAmenity} onGroundSelect={placeCustomPin} />
      <header className="app-header">
        <div className="brand-lockup"><span className="brand-mark" aria-hidden="true">W</span><div><strong>Where To BTO</strong><span>Narrow your BTO shortlist on the map</span></div><span className="beta-badge">Beta</span></div>
        <div className="header-context"><span className="signal-dot" /> {btoProjects.length} published project records <span className="header-separator">·</span> <span className="muted">Data checked {formatDate(DATA_CHECKED_DATE)}</span></div>
      </header>
      <div className="map-title"><span className="map-title-eyebrow">Map view</span><strong>{selectedProject ? (selectedProject.town ?? 'Future site') : 'Singapore'}</strong><span className="map-title-sub" data-testid="map-context-label">{selectedProject ? (selectedProject.position ? 'Approximate 1 km context' : 'Location unavailable · no 1 km context') : 'Launched and announced BTO supply'}</span></div>
      <AmenityRail visible={visibleGroups} onToggle={toggleGroup} />
      <div className="right-panel-wrap" data-testid="right-panel" data-panel-view={view.kind}>
        {renderPanel()}
      </div>
      <div className="map-legend" aria-label="Map legend">
        <div><i className="legend-bto" /> BTO site · dims per miss</div>
        {AMENITY_GROUP_ORDER.map((group) => <div key={group}><i className="legend-amenity" style={{ borderColor: AMENITY_GROUPS[group].palette.map, backgroundColor: `${AMENITY_GROUPS[group].palette.map}55` }} /> {AMENITY_GROUPS[group].shortLabel}</div>)}
        <div className="legend-instruction">Drag to orbit · arrows to move · scroll to zoom</div>
      </div>
      <div className={`project-tray ${trayOpen ? 'is-open' : ''}`} aria-label="BTO project shortcuts" onMouseEnter={() => setTrayHovered(true)} onMouseLeave={() => setTrayHovered(false)} onFocus={() => setTrayFocused(true)} onBlur={(event) => setTrayFocused(event.currentTarget.contains(event.relatedTarget))}>
        <div className="tray-strip">
          <span className="tray-label">Sites · {btoProjects.length}</span>
          {selectedProject && <span className="tray-current"><span className="tray-dot" style={{ opacity: projectOpacity(matches[selectedProject.id]) }} />{selectedProject.name}</span>}
          <button type="button" className="tray-toggle" aria-expanded={trayOpen || trayHovered || trayFocused} aria-controls="project-tray-list" onClick={() => setTrayOpen((current) => !current)}>Explore sites</button>
        </div>
        <div className="tray-list" id="project-tray-list">
          <div className="tray-list-inner">
            {btoProjects.map((project) => <button key={project.id} className={selectedProjectId === project.id ? 'is-selected' : ''} onClick={() => selectProject(project.id)} title={`Focus ${project.name}`}><span className="tray-dot" style={{ opacity: projectOpacity(matches[project.id]) }} />{project.name}</button>)}
          </div>
        </div>
      </div>
      <div className="freshness-note">Official snapshot · Source links in project cards · Checked {formatDate(DATA_CHECKED_DATE)}</div>
    </main>
  );
}
