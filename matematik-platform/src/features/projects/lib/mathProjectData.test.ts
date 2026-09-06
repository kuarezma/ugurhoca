import { describe, expect, it, beforeEach } from 'vitest';
import {
  MATH_PROJECTS,
  getProjectProgress,
  toggleProjectStep,
} from './mathProjectData';

describe('mathProjectData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains valid predefined projects with rubrics and milestones', () => {
    expect(MATH_PROJECTS.length).toBeGreaterThanOrEqual(3);
    const p1 = MATH_PROJECTS[0];
    expect(p1.rubric.length).toBeGreaterThan(0);
    expect(p1.milestones.length).toBe(3);

    // Sum of maxPoints in rubric should equal 100
    const totalPoints = p1.rubric.reduce((acc, r) => acc + r.maxPoints, 0);
    expect(totalPoints).toBe(100);
  });

  it('toggles project milestone step completion correctly in localStorage', () => {
    const projectId = 'proj-energy-linear';
    expect(getProjectProgress(projectId).completedSteps).toEqual([]);

    // Step 1 complete
    const r1 = toggleProjectStep(projectId, 1);
    expect(r1.completedSteps).toEqual([1]);

    // Step 2 complete
    const r2 = toggleProjectStep(projectId, 2);
    expect(r2.completedSteps).toEqual([1, 2]);

    // Step 1 toggle back (uncheck)
    const r3 = toggleProjectStep(projectId, 1);
    expect(r3.completedSteps).toEqual([2]);
  });
});
