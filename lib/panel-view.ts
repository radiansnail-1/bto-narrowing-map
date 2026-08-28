/**
 * One typed view state for the right panel. Plain React state — no store, no router.
 *
 *   questions ──Finish──▶ results ──Edit answers──▶ questions
 *       │                    │
 *       │ select project     │ select project / click result
 *       ▼                    ▼
 *   project(returnTo: questions | results) ──Back──▶ returnTo
 *       │
 *       │ click amenity (from any view)
 *       ▼
 *   amenity(returnTo: previous non-amenity view) ──Back──▶ returnTo
 *
 * Opening an amenity never touches the selected project, so a selected BTO keeps its map focus
 * and 1 km boundary while the amenity detail is shown; Back returns to the exact prior view.
 */
export type FlowKind = 'questions' | 'results';

export type PanelView =
  | { kind: 'questions' }
  | { kind: 'results' }
  | { kind: 'project'; returnTo: FlowKind }
  | { kind: 'amenity'; amenityId: string; returnTo: NonAmenityView };

export type NonAmenityView = Exclude<PanelView, { kind: 'amenity' }>;

export const QUESTIONS_VIEW: PanelView = { kind: 'questions' };
export const RESULTS_VIEW: PanelView = { kind: 'results' };

/** The questions/results flow underneath any view. */
export function flowKindOf(view: PanelView): FlowKind {
  if (view.kind === 'questions' || view.kind === 'results') return view.kind;
  if (view.kind === 'project') return view.returnTo;
  return flowKindOf(view.returnTo);
}

export function openProject(view: PanelView): PanelView {
  return { kind: 'project', returnTo: flowKindOf(view) };
}

export function closeProject(view: PanelView): PanelView {
  return { kind: flowKindOf(view) };
}

export function openAmenity(view: PanelView, amenityId: string): PanelView {
  return { kind: 'amenity', amenityId, returnTo: view.kind === 'amenity' ? view.returnTo : view };
}

export function closeAmenity(view: PanelView): PanelView {
  return view.kind === 'amenity' ? view.returnTo : view;
}

export function finishQuestions(): PanelView {
  return RESULTS_VIEW;
}

export function editAnswers(): PanelView {
  return QUESTIONS_VIEW;
}
