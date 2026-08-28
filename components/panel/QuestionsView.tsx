'use client';

import { workHubs } from '@/data/work-hubs';
import { AMENITY_GROUP_ORDER, AMENITY_GROUPS, amenityGroupStyle } from '@/lib/amenity-groups';
import { answeredCriteria } from '@/lib/results';
import { CRITERIA, FLAT_TYPES, MAX_AMENITY_PREFERENCES, WAITING_BANDS, type AmenityGroup, type ExplorerAnswers, type FlatType, type WaitingBand } from '@/lib/types';

interface QuestionsViewProps {
  step: number;
  answers: ExplorerAnswers;
  pinMode: boolean;
  onDropCustomPin: () => void;
  onClearCustomPin: () => void;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  onAnswersChange: (next: ExplorerAnswers) => void;
}

const questions = [
  { eyebrow: '01 / 04', title: 'Where do you spend your weekdays?', hint: 'Choose up to two work hubs. We treat them equally.' },
  { eyebrow: '02 / 04', title: 'What kind of home fits your budget?', hint: 'Both fields are optional. Unpublished prices stay neutral.' },
  { eyebrow: '03 / 04', title: 'What should be close by?', hint: 'Pick the essentials you would like within 1 km.' },
  { eyebrow: '04 / 04', title: 'How patient can you be?', hint: 'We compare your preference with the official estimate.' },
];

function toggleGroup(answers: ExplorerAnswers, group: AmenityGroup): ExplorerAnswers {
  if (!answers.amenityGroups.includes(group) && answers.amenityGroups.length >= MAX_AMENITY_PREFERENCES) return answers;
  return {
    ...answers,
    amenityGroups: answers.amenityGroups.includes(group)
      ? answers.amenityGroups.filter((item) => item !== group)
      : [...answers.amenityGroups, group],
  };
}

export function QuestionsView({ step, answers, pinMode, onDropCustomPin, onClearCustomPin, onBack, onNext, onFinish, onAnswersChange }: QuestionsViewProps) {
  const question = questions[step];
  const answered = answeredCriteria(answers);
  const last = step === questions.length - 1;
  return (
    <section className="question-card panel-card" data-testid="question-card">
      <ul className="criteria-chips" aria-label="Criteria progress">
        {CRITERIA.map(({ key, label }, index) => {
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
      <div className="question-topline"><span>{question.eyebrow}</span><span className="question-status">{step === 0 ? 'Start here' : 'Narrowing'}</span></div>
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
          <p className="inline-note">Passes when the official minimum published price is at or below your maximum. Projects without a published price stay neutral.</p>
        </div>
      )}

      {step === 2 && (
        <div className="amenity-options">
          {AMENITY_GROUP_ORDER.map((group) => {
            const definition = AMENITY_GROUPS[group];
            const selected = answers.amenityGroups.includes(group);
            const disabled = !selected && answers.amenityGroups.length >= MAX_AMENITY_PREFERENCES;
            return (
              <button key={group} className={`tag-choice ${selected ? 'is-selected' : ''}`} style={amenityGroupStyle(group)} disabled={disabled} onClick={() => onAnswersChange(toggleGroup(answers, group))} aria-pressed={selected} data-testid={`amenity-choice-${group}`}>
                <span className="group-swatch" aria-hidden="true" />
                <span className="tag-choice-label">{definition.label}<small>{definition.description}</small></span>
                <span className="choice-check">{selected ? '✓' : ''}</span>
              </button>
            );
          })}
          <p className="inline-note">Choose up to {MAX_AMENITY_PREFERENCES}. A group passes when any official record of that group sits within the 1 km screen. No choice means amenities stay informational, not a filter.</p>
        </div>
      )}

      {step === 3 && (
        <div className="option-stack">
          {WAITING_BANDS.map((band) => <button key={band.value} className={`choice-row ${answers.waitingBand === band.value ? 'is-selected' : ''}`} onClick={() => onAnswersChange({ ...answers, waitingBand: band.value as WaitingBand })} aria-pressed={answers.waitingBand === band.value}><span className="choice-check">{answers.waitingBand === band.value ? '✓' : ''}</span><span>{band.label}</span><small>{band.description}</small></button>)}
          <p className="inline-note">Finish to see projects grouped by how they meet your answers. You can change any answer afterwards.</p>
        </div>
      )}

      <div className="question-actions">
        {step > 0 ? <button className="text-button" onClick={onBack}>‹ Back</button> : <span />}
        <button className="next-button" data-testid="next-question" onClick={last ? onFinish : onNext}>{last ? 'Finish narrowing' : 'Next question'} <span aria-hidden="true">→</span></button>
      </div>
      <div className="progress-bar"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
    </section>
  );
}
