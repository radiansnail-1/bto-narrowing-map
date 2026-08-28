import { describe, expect, it } from 'vitest';
import {
  QUESTIONS_VIEW, RESULTS_VIEW, closeAmenity, closeProject, editAnswers, finishQuestions, flowKindOf, openAmenity, openProject,
} from '@/lib/panel-view';

describe('panel view transitions', () => {
  it('opens projects from questions or results and closes them back to the flow view', () => {
    const fromQuestions = openProject(QUESTIONS_VIEW);
    expect(fromQuestions).toEqual({ kind: 'project', returnTo: 'questions' });
    expect(closeProject(fromQuestions)).toEqual(QUESTIONS_VIEW);

    const fromResults = openProject(RESULTS_VIEW);
    expect(fromResults).toEqual({ kind: 'project', returnTo: 'results' });
    expect(closeProject(fromResults)).toEqual(RESULTS_VIEW);
  });

  it('opens amenities from every non-amenity view with the exact prior view', () => {
    expect(openAmenity(QUESTIONS_VIEW, 'mrt-redhill')).toEqual({ kind: 'amenity', amenityId: 'mrt-redhill', returnTo: QUESTIONS_VIEW });
    expect(openAmenity(RESULTS_VIEW, 'mrt-redhill')).toEqual({ kind: 'amenity', amenityId: 'mrt-redhill', returnTo: RESULTS_VIEW });
    const project = openProject(RESULTS_VIEW);
    expect(openAmenity(project, 'park-tiong-bahru')).toEqual({ kind: 'amenity', amenityId: 'park-tiong-bahru', returnTo: project });
  });

  it('does not nest amenity views and closes to the original prior view', () => {
    const project = openProject(RESULTS_VIEW);
    const firstAmenity = openAmenity(project, 'park-tiong-bahru');
    const secondAmenity = openAmenity(firstAmenity, 'mrt-redhill');
    expect(secondAmenity).toEqual({ kind: 'amenity', amenityId: 'mrt-redhill', returnTo: project });
    expect(closeAmenity(secondAmenity)).toEqual(project);
  });

  it('finds the underlying flow for nested amenity and project views', () => {
    const nested = openAmenity(openProject(RESULTS_VIEW), 'park-tiong-bahru');
    expect(flowKindOf(nested)).toBe('results');
    expect(flowKindOf(openAmenity(openProject(QUESTIONS_VIEW), 'mrt-redhill'))).toBe('questions');
  });

  it('transitions from finishing questions to results and back to editing answers', () => {
    expect(finishQuestions()).toEqual(RESULTS_VIEW);
    expect(editAnswers()).toEqual(QUESTIONS_VIEW);
  });
});
