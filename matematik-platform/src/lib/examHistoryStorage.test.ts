import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedExamTrials,
  saveExamTrial,
  deleteExamTrial,
  clearAllExamTrials,
} from './examHistoryStorage';

describe('examHistoryStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no trials exist', () => {
    expect(getSavedExamTrials()).toEqual([]);
  });

  it('saves and filters trials by exam type', () => {
    saveExamTrial({
      examType: 'lgs',
      title: '1. Genel LGS Denemesi',
      score: 420.5,
      mathNet: 14.0,
      totalNet: 68.0,
    });

    saveExamTrial({
      examType: 'yks',
      title: 'TYT Deneme #1',
      score: 350.0,
      mathNet: 24.5,
      totalNet: 82.0,
    });

    expect(getSavedExamTrials().length).toBe(2);
    expect(getSavedExamTrials('lgs').length).toBe(1);
    expect(getSavedExamTrials('yks').length).toBe(1);
    expect(getSavedExamTrials('lgs')[0].mathNet).toBe(14.0);
  });

  it('deletes a trial by id', () => {
    const saved = saveExamTrial({
      examType: 'lgs',
      title: 'Silinecek Deneme',
      score: 400,
      mathNet: 12,
      totalNet: 60,
    });

    expect(getSavedExamTrials().length).toBe(1);
    deleteExamTrial(saved.id);
    expect(getSavedExamTrials().length).toBe(0);
  });

  it('clears trials by exam type or all', () => {
    saveExamTrial({
      examType: 'lgs',
      title: 'LGS 1',
      score: 410,
      mathNet: 13,
      totalNet: 62,
    });
    saveExamTrial({
      examType: 'yks',
      title: 'YKS 1',
      score: 380,
      mathNet: 26,
      totalNet: 85,
    });

    clearAllExamTrials('lgs');
    expect(getSavedExamTrials('lgs').length).toBe(0);
    expect(getSavedExamTrials('yks').length).toBe(1);

    clearAllExamTrials();
    expect(getSavedExamTrials().length).toBe(0);
  });
});
