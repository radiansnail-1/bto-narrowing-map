'use client';

import { projectOpacity } from '@/lib/matching';
import { RESULT_BUCKETS, answeredCount, groupResults } from '@/lib/results';
import { CRITERIA, type BtoProject, type ExplorerAnswers, type ProjectMatch } from '@/lib/types';

interface ResultsViewProps {
  projects: BtoProject[];
  matches: Record<string, ProjectMatch>;
  answers: ExplorerAnswers;
  selectedProjectId: string | null;
  onOpenProject: (id: string) => void;
  onEditAnswers: () => void;
}

const STATUS_TITLES = { pass: 'Pass', miss: 'Miss', unknown: 'Awaiting published data', unanswered: 'Not answered' } as const;

export function ResultsView({ projects, matches, answers, selectedProjectId, onOpenProject, onEditAnswers }: ResultsViewProps) {
  const grouped = groupResults(projects, matches);
  const answeredTotal = answeredCount(answers);
  return (
    <section className="results-card panel-card" data-testid="results-card">
      <div className="question-topline"><span>Results</span><button type="button" className="text-button text-button-inline" onClick={onEditAnswers} data-testid="edit-answers">Edit answers</button></div>
      <h1>Projects grouped by fit</h1>
      <p className="question-hint">{answeredTotal === 0 ? 'You have not answered any criteria yet, so every project fits by default. Edit answers to narrow the map.' : `${answeredTotal} of ${CRITERIA.length} criteria answered. Groups are not a ranking — inside each group, projects keep HDB's published order.`}</p>
      {RESULT_BUCKETS.map((bucket) => {
        const items = grouped[bucket.id];
        return (
          <section key={bucket.id} className={`result-bucket result-bucket-${bucket.id}`} data-testid={`result-bucket-${bucket.id}`} aria-label={bucket.title}>
            <header className="result-bucket-head">
              <h2>{bucket.title} <span className="result-count">{items.length}</span></h2>
              <p>{bucket.description}</p>
            </header>
            {items.length === 0 ? <p className="result-empty">No projects in this group.</p> : (
              <ul className="result-list">
                {items.map((project) => {
                  const match = matches[project.id];
                  return (
                    <li key={project.id}>
                      <button type="button" className={`result-row ${project.id === selectedProjectId ? 'is-selected' : ''}`} onClick={() => onOpenProject(project.id)} data-testid="result-row" data-bucket={bucket.id}>
                        <span className="tray-dot" style={{ opacity: projectOpacity(match) }} aria-hidden="true" />
                        <span className="result-row-text"><strong>{project.canonicalName ?? `${project.name.split(' — ')[0]} · name not published`}</strong><small>{project.town ?? 'Town not published'} · {project.launchLabel}</small></span>
                        <span className="result-marks" aria-label={CRITERIA.map(({ key, label }) => `${label}: ${STATUS_TITLES[match[key]]}`).join(', ')}>
                          {CRITERIA.map(({ key, label }) => <i key={key} className={`result-mark ${match[key]}`} title={`${label}: ${STATUS_TITLES[match[key]]}`} />)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
      <p className="data-stamp">Fit dims by 23 percentage points per confirmed miss; unpublished facts never count against a project.</p>
    </section>
  );
}
