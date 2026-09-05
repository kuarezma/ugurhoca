import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminTrackingTab from './AdminTrackingTab';

describe('AdminTrackingTab', () => {
  const mockStudents = [
    {
      id: 'student-1',
      name: 'Burak Demir',
      email: 'burak@example.com',
      grade: 8,
      isAdmin: false,
    },
  ];

  it('renders tracking dashboard and handles CSV export click', () => {
    // Mock URL and createElement for download test
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(
      <AdminTrackingTab
        activityEvents={[]}
        adminStatuses={[]}
        assignments={[]}
        documents={[]}
        notifications={[]}
        onCreateWeeklyPlan={vi.fn()}
        onSendMessage={vi.fn()}
        onUpdateStatus={vi.fn()}
        onViewProfile={vi.fn()}
        quizResults={[]}
        studyGoals={[]}
        studySessions={[]}
        students={mockStudents}
        submissions={[]}
        weeklyPlans={[]}
      />
    );

    expect(screen.getByText('Takip Merkezi')).toBeInTheDocument();
    const downloadBtn = screen.getByRole('button', { name: /Excel \/ CSV Raporu İndir/i });
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});
