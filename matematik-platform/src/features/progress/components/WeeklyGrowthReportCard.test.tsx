import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyGrowthReportCard } from './WeeklyGrowthReportCard';
import type { StudyGoal, StudySession } from '@/features/progress/types';

describe('WeeklyGrowthReportCard', () => {
  const mockGoal: StudyGoal = {
    target_duration: 120,
    week_start: new Date().toISOString(),
  };

  const mockSessions: StudySession[] = [
    {
      id: 'session-1',
      date: new Date().toISOString(),
      duration: 60,
      topics: ['Üslü İfadeler'],
    },
  ];

  it('renders correctly and calculates weekly metrics and motivational message', () => {
    render(
      <WeeklyGrowthReportCard
        goal={mockGoal}
        sessions={mockSessions}
        streak={4}
        solvedQuestionsCount={45}
        liveLessonsCount={2}
        studentName="Zeynep"
      />
    );

    expect(screen.getByText('Haftalık Gelişim Karnesi')).toBeInTheDocument();
    expect(screen.getByText(/Harika Gidiyorsun, Zeynep!/i)).toBeInTheDocument();
    expect(screen.getByText('4 Gün Seri')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument(); // minutes
    expect(screen.getByText('45')).toBeInTheDocument(); // questions
    expect(screen.getByText('2')).toBeInTheDocument(); // lessons
  });
});
