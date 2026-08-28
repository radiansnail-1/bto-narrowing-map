'use client';

import { workHubs } from '@/data/work-hubs';
import {
  AMENITY_LABELS,
  FLAT_TYPES,
  MAX_AMENITY_PREFERENCES,
  WAITING_BANDS,
  type AmenityCategory,
  type ExplorerAnswers,
  type FlatType,
  type ProjectMatch,
  type WaitingBand,
} from '@/lib/types';
import type { BtoProject } from '@/lib/types';

interface QuestionPanelProps {
  step: number;
  answers: ExplorerAnswers;
  selectedProject: BtoProject | null;
  selectedMatch: ProjectMatch | null;
  pinMode: boolean;
  onDropCustomPin: () => void;
  onClearCustomPin: () => void;
  onBack: () => void;
  onNext: () => void;
  onAnswersChange: (next: ExplorerAnswers) => void;
  onCloseProject: () => void;
}

const questions = [
  { eyebrow: '01 / 04', title: 'Where do you spend your weekdays?', hint: 'Choose up to two work hubs. We treat them equally.' },
  { eyebrow: '02 / 04', title: 'What kind of home fits your budget?', hint: 'Both fields are optional. Unknown prices stay neutral.' },
  { eyebrow: '03 / 04', title: 'What should be close by?', hint: 'Pick the essentials you would like within 1 km.' },
  { eyebrow: '04 / 04', title: 'How patient can you be?', hint: 'We compare your preference with the official estimate.' },
];

function toggleCategory(answers: ExplorerAnswers, category: AmenityCategory): ExplorerAnswers {
  if (!answers.amenityCategories.includes(category) && answers.amenityCategories.length >= MAX_AMENITY_PREFERENCES) return answers;
  return {
    ...answers,
    amenityCategories: answers.amenityCategories.includes(category)
      ? answers.amenityCategories.filter((item) => item !== category)
      : [...answers.amenityCategories, category],
  };
}

function priceText(project: BtoProject): string {
  return project.flatTypes
    .filter((item) => item.minPrice !== null)
    .map((item) => `${item.type.replace(' Flexi', '')} $${Math.round((item.minPrice as number) / 1000)}–${item.maxPrice === null ? '?' : Math.round(item.maxPrice / 1000)}k`)
    .join('  ·  ');
}

function waitingText(project: BtoProject): string {
  const waiting = project.estimatedWaitingTimeMonths;
  if (typeof waiting === 'number') return `${waiting} months`;
  if (waiting) return `${waiting.min}–${waiting.max} months`;
  return 'Not published';
}

const criteriaLabels = [
  ['Commute', 'commute'],
  ['Budget', 'budget'],
  ['Amenities', 'amenities'],
  ['Waiting', 'waiting'],
] as const;

export function QuestionPanel({ step, answers, selectedProject, selectedMatch, pinMode, onDropCustomPin, onClearCustomPin, onBack, onNext, onAnswersChange, onCloseProject }: QuestionPanelProps) {
  if (selectedProject) {
    return (
      <section className="project-card panel-card" data-testid="project-card">
        <button className="card-back" onClick={onCloseProject}>← Back to narrowing</button>
        <div className="card-kicker"><span className="live-dot" /> Selected project</div>
        <h2>{selectedProject.name}</h2>
        <p className="card-town">{selectedProject.town ?? 'Town not published'} <span>•</span> {selectedProject.launchLabel}</p>
        <div className="card-rule" />
        <div className="project-meta-grid">
          <div><span>Flat types</span><strong>{priceText(selectedProject) || 'Price not published'}</strong></div>
          <div><span>Estimated wait</span><strong>{waitingText(selectedProject)}</strong></div>
          <div><span>MRT context</span><strong>{selectedProject.mrtAnchor ?? 'Not mapped'}</strong></div>
          <div><span>Classification</span><strong>{selectedProject.classification ?? 'To be confirmed'}</strong></div>
          <div><span>Map location</span><strong>{selectedProject.position ? 'Approximate anchor' : 'Unavailable'}</strong></div>
          {selectedProject.approxBtoUnits !== null && <div><span>Approx. BTO units</span><strong>{selectedProject.approxBtoUnits.toLocaleString()}</strong></div>}
        </div>
        <div className="criteria-summary" aria-label="Criteria comparison">
          <div className="criteria-summary-label">Your criteria</div>
          {criteriaLabels.map(([label, key]) => {
            const status = selectedMatch?.[key] ?? 'unanswered';
            return <div className="criteria-row" key={key}><span>{label}</span><span className={`criteria-status ${status}`}>{status}</span></div>;
          })}
        </div>
        <p className="project-summary">{selectedProject.summary}</p>
        <p className="project-note">{selectedProject.dataNote}</p>
        <div className="source-links">{selectedProject.sourceUrls.slice(0, 2).map((url, index) => <a className="source-link" href={url} key={url} target="_blank" rel="noreferrer">{index === 0 ? 'HDB source' : 'Official detail'} ↗</a>)}</div>
        <p className="data-stamp">Official snapshot · checked {selectedProject.checkedDate}</p>
      </section>
    );
  }

  const question = questions[step];
  const answered: Record<(typeof criteriaLabels)[number][1], boolean> = {
    commute: answers.workHubIds.length > 0 || answers.customWorkplace !== null,
    budget: answers.flatType !== null || answers.maxBudget !== null,
    amenities: answers.amenityCategories.length > 0,
    waiting: answers.waitingBand !== null,
  };
  return (
    <section className="question-card panel-card" data-testid="question-card">
      <ul className="criteria-chips" aria-label="Criteria progress">
        {criteriaLabels.map(([label, key], index) => {
          const done = answered[key];
          return (
            <li key={key} className={`criteria-chip ${done ? 'is-answered' : ''} ${index === step ? 'is-current' : ''}`}>
              {label}
              {done && <span className="criteria-chip-tick" aria-hidden="true">✓</span>}
              <span className="sr-only">{done ? ', answered' : ', not answered'}</span>
            </li>
          );
        })}
      </ul>
      <div className="question-topline"><span>{question.eyebrow}</span><span className="question-status">{step === 0 ? 'START HERE' : 'NARROWING'}</span></div>
      <h1>{question.title}</h1>
      <p className="question-hint">{question.hint}</p>

      {step === 0 && (
        <div className="option-stack">
          {workHubs.map((hub) => {
            const checked = answers.workHubIds.includes(hub.id);
            const disabled = !checked && answers.workHubIds.length >= 2;
            return <button key={hub.id} disabled={disabled} className={`choice-row ${checked ? 'is-selected' : ''}`} onClick={() => {
              const next = checked ? answers.workHubIds.filter((id) => id !== hub.id) : answers.workHubIds.length < 2 ? [...answers.workHubIds, hub.id] : answers.workHubIds;
              onAnswersChange({ ...answers, workHubIds: next, customWorkplace: null });
            }} aria-pressed={checked}><span className="choice-check">{checked ? '✓' : ''}</span><span>{hub.name}</span><small>straight-line screen</small></button>;
          })}
          <button className={`custom-pin-button ${answers.customWorkplace ? 'is-placed' : ''}`} onClick={answers.customWorkplace ? onClearCustomPin : onDropCustomPin} data-testid="custom-pin-action">{pinMode ? 'Click the map to place pin' : answers.customWorkplace ? 'Remove custom workplace pin' : `＋ Drop custom workplace pin${answers.workHubIds.length ? ' · replaces hubs' : ''}`}</button>
          <p className="inline-note">Hubs use an equally weighted straight-line proximity screen (≤ 5 km); official transit times are not included. {answers.customWorkplace ? 'Custom pin uses the same straight-line rule, not a routed journey.' : 'Or skip this question and explore freely.'}</p>
        </div>
      )}

      {step === 1 && (
        <div className="budget-form">
          <label htmlFor="flat-type">Preferred flat type</label>
          <select id="flat-type" value={answers.flatType ?? ''} onChange={(event) => onAnswersChange({ ...answers, flatType: (event.target.value || null) as FlatType | null })}>
            <option value="">Any flat type</option>
            {FLAT_TYPES.map((flatType) => <option key={flatType} value={flatType}>{flatType}</option>)}
          </select>
          <label htmlFor="max-budget">Maximum price <span>optional</span></label>
          <div className="input-prefix"><span>$</span><input id="max-budget" type="number" min="0" step="10000" placeholder="e.g. 500000" value={answers.maxBudget ?? ''} onChange={(event) => onAnswersChange({ ...answers, maxBudget: event.target.value ? Number(event.target.value) : null })} /></div>
          <p className="inline-note">Passes when the official minimum published price is at or below your maximum.</p>
        </div>
      )}

      {step === 2 && (
        <div className="amenity-options">
          {(Object.keys(AMENITY_LABELS) as AmenityCategory[]).map((category) => {
            const selected = answers.amenityCategories.includes(category);
            const disabled = !selected && answers.amenityCategories.length >= MAX_AMENITY_PREFERENCES;
            return <button key={category} className={`tag-choice ${selected ? 'is-selected' : ''}`} disabled={disabled} onClick={() => onAnswersChange(toggleCategory(answers, category))}>{AMENITY_LABELS[category]}</button>;
          })}
          <p className="inline-note">Choose up to {MAX_AMENITY_PREFERENCES}. No choice means amenities stay informational, not a filter.</p>
        </div>
      )}

      {step === 3 && (
        <div className="option-stack">
          {WAITING_BANDS.map((band) => <button key={band.value} className={`choice-row ${answers.waitingBand === band.value ? 'is-selected' : ''}`} onClick={() => onAnswersChange({ ...answers, waitingBand: band.value as WaitingBand })} aria-pressed={answers.waitingBand === band.value}><span className="choice-check">{answers.waitingBand === band.value ? '✓' : ''}</span><span>{band.label}</span><small>{band.description}</small></button>)}
          <p className="inline-note">You can change any answer by using the ‹ back button.</p>
        </div>
      )}

      <div className="question-actions">
        {step > 0 ? <button className="text-button" onClick={onBack}>‹ Back</button> : <span />}
        <button className="next-button" data-testid="next-question" onClick={onNext}>{step === 3 ? 'Finish narrowing' : 'Next question'} <span>→</span></button>
      </div>
      <div className="progress-bar"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
    </section>
  );
}
