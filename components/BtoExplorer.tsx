'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AmenityRail } from '@/components/AmenityRail';
import { AmenityView } from '@/components/panel/AmenityView';
import { ProjectView } from '@/components/panel/ProjectView';
import { QuestionsView } from '@/components/panel/QuestionsView';
import { ResultsView } from '@/components/panel/ResultsView';
import { SiteHeader } from '@/components/SiteHeader';
import { formatDate } from '@/components/panel/format';
import { amenityById } from '@/data/amenities';
import { btoProjects } from '@/data/bto-projects';
import { DATA_CHECKED_DATE } from '@/data/sources';
import { AMENITY_GROUP_ORDER, AMENITY_GROUPS } from '@/lib/amenity-groups';
import { matchAllProjects, projectOpacity } from '@/lib/matching';
import { filterProjectsByLaunchStatus } from '@/lib/results';
import { QUESTIONS_VIEW, RESULTS_VIEW, closeAmenity, closeProject, flowKindOf, openAmenity, openProject, type PanelView } from '@/lib/panel-view';
import { DEFAULT_ANSWERS, DEFAULT_VISIBLE_GROUPS, MAX_STEP, loadStoredState, saveStoredState, type StoredPanelView } from '@/lib/storage';
import type { Amenity, AmenityGroup, BtoProject, ExplorerAnswers } from '@/lib/types';

const MapScene = dynamic(() => import('@/components/MapScene').then((module) => module.MapScene), {
  ssr: false,
  loading: () => <div className="map-canvas map-loading" role="status">Loading the Singapore map…</div>,
});

export function BtoExplorer() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const panelLocation = useRef<string | null>(null);
  const mapRegion = useRef<HTMLDivElement>(null);
  const tray = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const [answers, setAnswers] = useState<ExplorerAnswers>(DEFAULT_ANSWERS);
  const [visibleGroups, setVisibleGroups] = useState<AmenityGroup[]>(DEFAULT_VISIBLE_GROUPS);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [view, setView] = useState<PanelView>(QUESTIONS_VIEW);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [launchStatusFilter, setLaunchStatusFilter] = useState<'all' | BtoProject['launchStatus']>('all');
  const [pinMode, setPinMode] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayHovered, setTrayHovered] = useState(false);
  const [trayFocused, setTrayFocused] = useState(false);

  useEffect(() => {
    const stored = loadStoredState(window.localStorage);
    if (stored.answers) setAnswers(stored.answers);
    if (stored.visibleGroups) setVisibleGroups(stored.visibleGroups);
    if (stored.step !== undefined) setStep(stored.step);
    if (stored.shortlistIds) setShortlistIds(stored.shortlistIds);
    if (stored.launchStatusFilter) setLaunchStatusFilter(stored.launchStatusFilter);
    if (stored.view) {
      const restored = stored.view as StoredPanelView;
      if (restored.selectedProjectId) setSelectedProjectId(restored.selectedProjectId);
      if (restored.kind === 'results') setView({ kind: 'results' });
      else if (restored.kind === 'project' && restored.selectedProjectId) setView({ kind: 'project', returnTo: restored.returnTo === 'results' ? 'results' : 'questions' });
      else if (restored.kind === 'amenity' && restored.amenityId) {
        const returnTo = restored.returnTo === 'project' && restored.selectedProjectId
          ? { kind: 'project' as const, returnTo: restored.projectReturnTo ?? 'results' }
          : { kind: restored.returnTo === 'results' ? 'results' as const : 'questions' as const };
        setView({ kind: 'amenity', amenityId: restored.amenityId, returnTo });
      } else setView(QUESTIONS_VIEW);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persistedView: StoredPanelView = {
      kind: view.kind,
      selectedProjectId,
      amenityId: view.kind === 'amenity' ? view.amenityId : null,
      returnTo: view.kind === 'project' ? view.returnTo : view.kind === 'amenity' ? view.returnTo.kind === 'project' ? 'project' : flowKindOf(view.returnTo) : null,
      projectReturnTo: view.kind === 'amenity' && view.returnTo.kind === 'project' ? view.returnTo.returnTo : null,
    };
    saveStoredState(window.localStorage, { answers, visibleGroups, step, shortlistIds, launchStatusFilter, view: persistedView });
  }, [answers, visibleGroups, step, shortlistIds, launchStatusFilter, view, selectedProjectId, hydrated]);

  const activeAmenityId = view.kind === 'amenity' ? view.amenityId : null;
  const launchStatusLabel = launchStatusFilter === 'all' ? 'All launch stages' : launchStatusFilter === 'launched' ? 'Past launches' : launchStatusFilter === 'planned' ? 'Planned projects' : 'Upcoming projects';
  const selectedProject = btoProjects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedProjectVisible = selectedProject === null || launchStatusFilter === 'all' || selectedProject.launchStatus === launchStatusFilter;
  const visibleSelectedProject = selectedProjectVisible ? selectedProject : null;
  const visibleProjects = filterProjectsByLaunchStatus(btoProjects, launchStatusFilter);
  useEffect(() => {
    if (!selectedProject || selectedProjectVisible) return;
    setSelectedProjectId(null);
    setView((current) => {
      if (current.kind === 'project') return { kind: current.returnTo };
      if (current.kind === 'amenity') return current.returnTo.kind === 'project' ? { kind: current.returnTo.returnTo } : current.returnTo;
      return current;
    });
  }, [launchStatusFilter, selectedProject, selectedProjectVisible]);
  useEffect(() => {
    const panel = document.querySelector<HTMLElement>('[data-testid="right-panel"]');
    if (panel) panel.scrollTop = 0;
    const location = `${view.kind}:${selectedProjectId}:${activeAmenityId}:${step}`;
    if (panelLocation.current !== null && panelLocation.current !== location && window.matchMedia('(max-width: 1023px)').matches) {
      panel?.scrollIntoView({ block: 'start' });
    }
    panelLocation.current = location;
  }, [view.kind, selectedProjectId, activeAmenityId, step]);
  useEffect(() => {
    if (pinMode && isMobile) mapRegion.current?.scrollIntoView({ block: 'center' });
  }, [pinMode, isMobile]);

  const matches = useMemo(() => matchAllProjects(btoProjects, answers), [answers]);
  const selectedMatch = visibleSelectedProject ? matches[visibleSelectedProject.id] : null;

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

  const toggleShortlist = (id: string) => {
    setShortlistIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  };

  const selectAmenity = (amenity: Amenity) => {
    setView((current) => openAmenity(current, amenity.id));
  };

  const placeCustomPin = (position: [number, number]) => {
    setAnswers((current) => ({ ...current, workHubIds: [], customWorkplace: position }));
    setPinMode(false);
    if (isMobile) document.querySelector('[data-testid="right-panel"]')?.scrollIntoView({ block: 'start' });
  };

  const startPinMode = () => {
    setPinMode(true);
    setSelectedProjectId(null);
    setView(QUESTIONS_VIEW);
  };

  const renderPanel = () => {
    // A stale view can only happen if a selection disappears underneath it; fall back to the flow view.
    const effective: PanelView = view.kind === 'project' && !visibleSelectedProject ? { kind: view.returnTo }
      : view.kind === 'amenity' && view.returnTo.kind === 'project' && !visibleSelectedProject ? { kind: view.returnTo.returnTo }
      : view;
    if (effective.kind === 'amenity') {
      const amenity = amenityById.get(effective.amenityId);
      if (amenity) {
        const backLabel = effective.returnTo.kind === 'project' && visibleSelectedProject ? `Back to ${visibleSelectedProject.name.split(' — ')[0]}`
          : effective.returnTo.kind === 'results' ? 'Back to results' : 'Back to narrowing';
        return <AmenityView amenity={amenity} selectedProject={selectedProject} backLabel={backLabel} onBack={() => setView((current) => closeAmenity(current))} />;
      }
    }
    if (effective.kind === 'project' && visibleSelectedProject && selectedMatch) {
      return <ProjectView project={visibleSelectedProject} match={selectedMatch} answers={answers} returnTo={effective.returnTo} isShortlisted={shortlistIds.includes(visibleSelectedProject.id)} shortlistFull={shortlistIds.length >= 4} onToggleShortlist={() => toggleShortlist(visibleSelectedProject.id)} onClose={deselectProject} onOpenAmenity={selectAmenity} />;
    }
    if (flowKindOf(effective) === 'results') {
      return <ResultsView projects={btoProjects} matches={matches} answers={answers} selectedProjectId={visibleSelectedProject?.id ?? null} shortlistIds={shortlistIds} launchStatusFilter={launchStatusFilter} onLaunchStatusFilterChange={setLaunchStatusFilter} onToggleShortlist={toggleShortlist} onOpenProject={selectProject} onEditAnswers={() => { setStep(0); setView(QUESTIONS_VIEW); }} />;
    }
    return <QuestionsView projectCount={visibleProjects.length} step={step} answers={answers} pinMode={pinMode} onDropCustomPin={startPinMode} onClearCustomPin={() => setAnswers((current) => ({ ...current, customWorkplace: null }))} onBack={() => setStep((current) => Math.max(0, current - 1))} onNext={() => setStep((current) => Math.min(MAX_STEP, current + 1))} onFinish={() => setView(RESULTS_VIEW)} onAnswersChange={setAnswers} />;
  };

  return (
    <main className="explorer-shell">
      <div className="map-region" id="explorer-map" ref={mapRegion}>
        <MapScene matches={matches} visibleGroups={visibleGroups} selectedProjectId={visibleSelectedProject?.id ?? null} customPin={answers.customWorkplace} pinMode={pinMode} launchStatusFilter={launchStatusFilter} onProjectSelect={selectProject} onAmenitySelect={selectAmenity} onGroundSelect={placeCustomPin} onCancelPin={() => setPinMode(false)} />
      </div>
      <h1 className="sr-only">Where To BTO</h1>
      <SiteHeader />
      <div className="map-title"><span className="map-title-eyebrow">Map view</span><strong>{visibleSelectedProject ? (visibleSelectedProject.town ?? 'Future site') : 'Singapore'}</strong><span className="map-title-sub" data-testid="map-context-label">{visibleSelectedProject ? (visibleSelectedProject.position ? 'Approximate 1 km context' : 'Location unavailable · no 1 km context') : launchStatusLabel}</span></div>
      <label className="launch-filter" htmlFor="launch-status-filter"><span>Show</span><select id="launch-status-filter" value={launchStatusFilter} onChange={(event) => setLaunchStatusFilter(event.target.value as typeof launchStatusFilter)}><option value="all">All launch stages</option><option value="launched">Past launches</option><option value="announced_upcoming">Upcoming</option><option value="planned">Planned</option></select></label>
      <div className="mobile-explorer-tools">
        <p>{pinMode ? 'Tap the map to place your workplace pin.' : 'One finger to pan · pinch to zoom · two-finger drag to rotate. Tap a project to explore.'}</p>
        <div><button type="button" onClick={() => document.querySelector('[data-testid="right-panel"]')?.scrollIntoView({ block: 'start' })}>{view.kind === 'questions' ? 'Narrow your options ↓' : view.kind === 'results' ? 'View your results ↓' : 'View details ↓'}</button>
          <button type="button" onClick={() => { setTrayOpen(true); tray.current?.scrollIntoView({ block: 'start' }); }}>Browse {visibleProjects.length} projects</button></div>
        <p>Scroll outside the map to reach the questions.</p>
      </div>
      <AmenityRail visible={visibleGroups} onToggle={toggleGroup} />
      <div className="right-panel-wrap" data-testid="right-panel" data-panel-view={view.kind}>
        {renderPanel()}
      </div>
      <div className="map-legend" aria-label="Map legend">
        <div><i className="legend-bto" /> BTO site · dims per miss</div>
        {AMENITY_GROUP_ORDER.map((group) => <div key={group}><i className="legend-amenity" style={{ borderColor: AMENITY_GROUPS[group].palette.map, backgroundColor: `${AMENITY_GROUPS[group].palette.map}55` }} /> {AMENITY_GROUPS[group].shortLabel}</div>)}
        <div className="legend-instruction">Drag to orbit · arrows to move · scroll to zoom</div>
      </div>
      <div ref={tray} className={`project-tray ${trayOpen ? 'is-open' : ''}`} aria-label="BTO project shortcuts" onMouseEnter={() => setTrayHovered(true)} onMouseLeave={() => setTrayHovered(false)} onFocus={() => setTrayFocused(true)} onBlur={(event) => setTrayFocused(event.currentTarget.contains(event.relatedTarget))}>
        <div className="tray-strip">
          <span className="tray-label">Sites · {visibleProjects.length}</span>
          {visibleSelectedProject && <span className="tray-current"><span className="tray-dot" style={{ opacity: projectOpacity(matches[visibleSelectedProject.id]) }} />{visibleSelectedProject.name}</span>}
          <button type="button" className="tray-toggle" aria-expanded={trayOpen || trayHovered || trayFocused} aria-controls="project-tray-list" onClick={() => setTrayOpen((current) => !current)}>Explore sites</button>
        </div>
        <div className="tray-list" id="project-tray-list">
          <div className="tray-list-inner">
            {visibleProjects.map((project) => <button key={project.id} className={selectedProjectId === project.id ? 'is-selected' : ''} onClick={() => selectProject(project.id)} title={`Focus ${project.name}`}><span className="tray-dot" style={{ opacity: projectOpacity(matches[project.id]) }} />{project.name}</button>)}
          </div>
        </div>
      </div>
      <div className="freshness-note">Official snapshot · Source links in project cards · Checked {formatDate(DATA_CHECKED_DATE)}</div>
    </main>
  );
}
