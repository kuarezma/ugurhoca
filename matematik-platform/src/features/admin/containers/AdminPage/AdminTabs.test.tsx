import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AdminTabs } from './AdminTabs';

describe('AdminTabs', () => {
  it('renders dynamic category counts and WAI-ARIA tablist/tab attributes', () => {
    const setActiveTab = vi.fn();
    const setTabCategory = vi.fn();

    render(
      <AdminTabs
        activeTab="tracking"
        setActiveTab={setActiveTab}
        tabCategory="all"
        setTabCategory={setTabCategory}
        studentUsers={[]}
        documents={[]}
        quizzes={[]}
        assignments={[]}
        liveLessons={
          {
            lessons: [],
            questions: [],
            savedQuestions: [],
          } as never
        }
        annualPlanItems={[]}
        worksheetCandidates={[]}
        announcements={[]}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Tümü (13)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '📊 Genel & Takip (4)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '📚 Eğitim & İçerik (4)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '⚙️ Plan & Otomasyon (5)' }),
    ).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: 'Yönetici sekmeleri' });
    expect(tablist).toBeInTheDocument();

    const trackingTab = screen.getByRole('tab', { name: /Takip Merkezi/i });
    expect(trackingTab).toHaveAttribute('aria-selected', 'true');
    expect(trackingTab).toHaveAttribute(
      'aria-controls',
      'admin-tabpanel-tracking',
    );
    expect(trackingTab).toHaveAttribute('id', 'admin-tab-tracking');

    const annualPlanTab = screen.getByRole('tab', { name: /Yıllık Plan/i });
    expect(annualPlanTab).toHaveAttribute('aria-selected', 'false');
    expect(annualPlanTab).toHaveAttribute(
      'aria-controls',
      'admin-tabpanel-annualPlan',
    );

    fireEvent.click(annualPlanTab);
    expect(setActiveTab).toHaveBeenCalledWith('annualPlan');
  });
});
