'use client';

import Link from 'next/link';
import { waitingText, priceText, NOT_PUBLISHED } from './format';
import { projectOpacity } from '@/lib/matching';
import { MATCH_STATUS_LABELS, RESULT_BUCKETS, answeredCount, criterionAnswerLabel, criterionReason, filterProjectsByLaunchStatus, groupResults, type LaunchStatusFilter } from '@/lib/results';
import { CRITERIA, type BtoProject, type ExplorerAnswers, type ProjectMatch } from '@/lib/types';

interface ResultsViewProps {
  projects: BtoProject[];
  matches: Record<string, ProjectMatch>;
  answers: ExplorerAnswers;
  selectedProjectId: string | null;
  shortlistIds: string[];
  launchStatusFilter: LaunchStatusFilter;
  onLaunchStatusFilterChange: (value: LaunchStatusFilter) => void;
  onToggleShortlist: (id: string) => void;
  onOpenProject: (id: string) => void;
  onEditAnswers: () => void;
}

export function ResultsView({ projects, matches, answers, selectedProjectId, shortlistIds, launchStatusFilter, onLaunchStatusFilterChange, onToggleShortlist, onOpenProject, onEditAnswers }: ResultsViewProps) {
  const visibleProjects = filterProjectsByLaunchStatus(projects, launchStatusFilter);
  const grouped = groupResults(visibleProjects, matches);
  const answeredTotal = answeredCount(answers);
  const shortlistedProjects = shortlistIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is BtoProject => Boolean(project));
  return (
    <section className="results-card panel-card" data-testid="results-card">
      <div className="question-topline"><span>Results</span><button type="button" className="text-button text-button-inline" onClick={onEditAnswers} data-testid="edit-answers">Edit answers</button></div>
      <h1>Projects grouped by fit</h1>
      <p className="question-hint">{answeredTotal === 0 ? 'You have not answered any criteria yet, so every project fits by default. Edit answers to narrow the map.' : `${answeredTotal} of ${CRITERIA.length} criteria answered. Groups are not a ranking — inside each group, projects keep HDB’s published order.`}</p>
      <div className="chosen-criteria" aria-label="Your chosen criteria"><strong>Your answers</strong>{CRITERIA.map(({ key, label }) => <span key={key}><b>{label}</b>{criterionAnswerLabel(key, answers)}</span>)}</div>
      <label className="results-filter" htmlFor="results-status-filter"><span>Show launch stage</span><select id="results-status-filter" value={launchStatusFilter} onChange={(event) => onLaunchStatusFilterChange(event.target.value as LaunchStatusFilter)}><option value="all">All stages</option><option value="launched">Past launches</option><option value="announced_upcoming">Upcoming</option><option value="planned">Planned</option></select></label>
      <nav className="results-guide-links" aria-label="Relevant guides"><strong>Decision guides</strong><Link href="/guides/how-to-choose-a-bto-location">Build a shortlist</Link>{answers.workHubIds.length > 0 || answers.customWorkplace ? <Link href="/guides/comparing-bto-commutes">Validate the commute</Link> : null}{answers.amenityGroups.length > 0 ? <Link href="/guides/checking-amenities-near-a-bto">Check the 1 km context</Link> : null}{answers.flatType || answers.maxBudget !== null || answers.waitingBand ? <Link href="/guides/understanding-bto-price-and-wait-data">Read price and wait data</Link> : null}<Link href="/guides/handling-unpublished-bto-information">Understand unknowns</Link></nav>

      <section className="shortlist-panel" aria-labelledby="shortlist-heading" data-testid="shortlist-panel">
        <div className="shortlist-heading"><div><h2 id="shortlist-heading">Your shortlist <span className="result-count">{shortlistedProjects.length}/4</span></h2><p>{shortlistedProjects.length < 2 ? 'Add 2–4 projects to compare the trade-offs side by side.' : 'Side-by-side comparison; no project is ranked.'}</p></div></div>
        {shortlistedProjects.length > 0 && <div className="shortlist-chips">{shortlistedProjects.map((project) => <span key={project.id} className="shortlist-chip"><button type="button" onClick={() => onOpenProject(project.id)}>{project.canonicalName ?? project.name.split(' — ')[0]}</button><button type="button" aria-label={`Remove ${project.canonicalName ?? project.name} from shortlist`} onClick={() => onToggleShortlist(project.id)}>×</button></span>)}</div>}
        {shortlistedProjects.length >= 2 && <div className="compare-wrap"><table className="compare-table"><caption>Shortlisted project comparison</caption><thead><tr><th scope="col">Field</th>{shortlistedProjects.map((project) => <th scope="col" key={project.id}><button type="button" onClick={() => onOpenProject(project.id)}>{project.canonicalName ?? project.name.split(' — ')[0]}</button></th>)}</tr></thead><tbody>
          <tr><th scope="row">Launch stage</th>{shortlistedProjects.map((project) => <td key={project.id}>{project.launchStatus === 'launched' ? 'Past launch' : project.launchStatus === 'planned' ? 'Planned' : 'Upcoming'}</td>)}</tr>
          <tr><th scope="row">Commute</th>{shortlistedProjects.map((project) => <td key={project.id}>{MATCH_STATUS_LABELS[matches[project.id].commute]}</td>)}</tr>
          <tr><th scope="row">Published price</th>{shortlistedProjects.map((project) => <td key={project.id}>{priceText(project) ?? NOT_PUBLISHED}</td>)}</tr>
          <tr><th scope="row">Amenities screened</th>{shortlistedProjects.map((project) => <td key={project.id}>{project.position ? `${project.amenityIds.length} records` : NOT_PUBLISHED}</td>)}</tr>
          <tr><th scope="row">Estimated wait</th>{shortlistedProjects.map((project) => <td key={project.id}>{waitingText(project)}</td>)}</tr>
        </tbody></table></div>}
      </section>
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
                      <div className={`result-row ${project.id === selectedProjectId ? 'is-selected' : ''}`} data-bucket={bucket.id}>
                        <button type="button" className="result-row-main" onClick={() => onOpenProject(project.id)} data-testid="result-row">
                          <span className="tray-dot" style={{ opacity: projectOpacity(match) }} aria-hidden="true" />
                          <span className="result-row-text"><strong>{project.canonicalName ?? `${project.name.split(' — ')[0]} · name not published`}</strong><small>{project.town ?? 'Town not published'} · {project.launchStatus === 'launched' ? 'Past launch' : project.launchStatus === 'planned' ? 'Planned' : 'Upcoming'}</small></span>
                          <span className="result-status-line">{CRITERIA.map(({ key, label }) => <span key={key} className={`result-criterion ${match[key]}`}><b>{label}</b><em>{MATCH_STATUS_LABELS[match[key]]}</em><small>{criterionReason(project, key, match[key], answers)}</small></span>)}</span>
                        </button>
                        <button type="button" className={`shortlist-toggle ${shortlistIds.includes(project.id) ? 'is-added' : ''}`} aria-pressed={shortlistIds.includes(project.id)} disabled={shortlistIds.length >= 4 && !shortlistIds.includes(project.id)} onClick={() => onToggleShortlist(project.id)}>{shortlistIds.includes(project.id) ? 'Shortlisted' : shortlistIds.length >= 4 ? 'Shortlist full' : 'Add to shortlist'}</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
      {answeredTotal > 0 && grouped.fits.length === 0 && <div className="results-guidance"><strong>No projects fit every answered criterion.</strong><p>That does not mean there is no good option. Edit one answer to see which trade-off opens the most possibilities, then compare a small shortlist.</p><button type="button" className="text-button" onClick={onEditAnswers}>Review one answer →</button><Link href="/guides/how-to-choose-a-bto-location">Read the shortlisting guide →</Link></div>}
      <div className="results-next-step"><strong>Next step</strong><span>Open a project to inspect its published facts, reasons, and official sources.</span></div>
      <p className="data-stamp">Fit dims by 23 percentage points per confirmed miss; unpublished facts never count against a project.</p>
    </section>
  );
}
