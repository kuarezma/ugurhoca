import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminWeeklyPlanModal } from './AdminWeeklyPlanModal';
import type {
  AdminAssignment,
  AdminDocument,
  AdminQuiz,
  AdminUser,
  StudentWeeklyPlan,
} from '@/features/admin/types';

const studentOne: AdminUser = {
  email: 'ayse@example.com',
  grade: 8,
  id: 'student-1',
  isAdmin: false,
  name: 'Ayşe Yılmaz',
};

const studentTwo: AdminUser = {
  email: 'mehmet@example.com',
  grade: 7,
  id: 'student-2',
  isAdmin: false,
  name: 'Mehmet Demir',
};

const quizzes: AdminQuiz[] = [
  {
    created_at: '2026-04-01T10:00:00Z',
    description: 'Üslü ifadeler',
    difficulty: 'Orta',
    grade: 8,
    id: 'quiz-1',
    is_active: true,
    time_limit: 20,
    title: 'Üslü İfadeler Tarama',
  },
];

const assignments: AdminAssignment[] = [
  {
    created_at: '2026-04-01T10:00:00Z',
    description: 'Ödev',
    due_date: '2026-05-01T12:00:00Z',
    grade: 8,
    id: 'assn-1',
    title: 'Kareköklü Sayılar Ödevi',
  },
];

const documents: AdminDocument[] = [
  {
    category: 'Çalışma Kağıdı',
    created_at: '2026-04-01T10:00:00Z',
    description: 'Karma föy',
    file_url: 'https://example.com/foy.pdf',
    grade: [7, 8],
    id: 'doc-1',
    title: '7-8 Karma Föy',
    type: 'pdf',
  },
];

describe('AdminWeeklyPlanModal', () => {
  it('prefills fields from existingPlan for a single student and supports linked resources plus custom tasks', async () => {
    const existingPlan: StudentWeeklyPlan = {
      id: 'plan-1',
      status: 'active',
      student_id: 'student-1',
      target_minutes: 450,
      title: 'Mevcut Plan',
      week_start: '2026-04-27',
      student_weekly_plan_items: [
        {
          id: 'item-1',
          kind: 'custom',
          plan_id: 'plan-1',
          sort_order: 1,
          title: 'İkinci Görev',
        },
        {
          id: 'item-0',
          kind: 'quiz',
          linked_id: 'quiz-prev',
          plan_id: 'plan-1',
          sort_order: 0,
          title: 'İlk Test',
        },
      ],
    };
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminWeeklyPlanModal
        isOpen={true}
        onClose={vi.fn()}
        students={[studentOne]}
        existingPlan={existingPlan}
        quizzes={quizzes}
        assignments={assignments}
        documents={documents}
        onSave={onSave}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Ayşe Yılmaz — Haftalık Plan' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Plan Başlığı')).toHaveValue('Mevcut Plan');
    expect(screen.getByLabelText('Haftalık Hedef Süre (dk)')).toHaveValue(450);

    // Belgeler sekmesinde dizi grade ([7, 8]) düzgün filtrelenir ve eklenebilir
    fireEvent.click(screen.getByRole('button', { name: 'Belgeler' }));
    expect(screen.getByText('7-8 Karma Föy')).toBeInTheDocument();
    expect(screen.getByText('7., 8. Sınıf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));

    // Testler ve Ödevler sekmeleri
    fireEvent.click(screen.getByRole('button', { name: 'Ödevler' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Testler' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));

    // Özel görev ekle
    fireEvent.change(screen.getByLabelText('Özel Görev Ekle'), {
      target: { value: 'Deneme analizi yap' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Görev Ekle' }));

    // İlk öğeyi aşağı taşı ve İkinci Görev'i sil
    fireEvent.click(
      screen.getByRole('button', { name: 'İlk Test maddesini aşağı taşı' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'İkinci Görev maddesini sil' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Planı Kaydet' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    expect(onSave).toHaveBeenCalledWith({
      studentIds: ['student-1'],
      targetMinutes: 450,
      title: 'Mevcut Plan',
      items: [
        {
          due_at: null,
          href: null,
          kind: 'quiz',
          linked_id: 'quiz-prev',
          title: 'İlk Test',
        },
        {
          href: '/icerikler?id=doc-1',
          kind: 'content',
          linked_id: 'doc-1',
          title: '7-8 Karma Föy',
        },
        {
          due_at: '2026-05-01T12:00:00Z',
          href: '/odevler',
          kind: 'assignment',
          linked_id: 'assn-1',
          title: 'Kareköklü Sayılar Ödevi',
        },
        {
          href: '/testler?quizId=quiz-1',
          kind: 'quiz',
          linked_id: 'quiz-1',
          title: 'Üslü İfadeler Tarama',
        },
        {
          kind: 'custom',
          title: 'Deneme analizi yap',
        },
      ],
    });
  });

  it('shows bulk mode header and validates empty title or empty items inline', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminWeeklyPlanModal
        isOpen={true}
        onClose={vi.fn()}
        students={[studentOne, studentTwo]}
        quizzes={quizzes}
        assignments={assignments}
        documents={documents}
        onSave={onSave}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Toplu Haftalık Plan (2 öğrenci)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Toplu Atama · 2 Öğrenci')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Plan Başlığı'), {
      target: { value: '   ' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: '2 Öğrenciye Planı Ata' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Plan başlığı boş bırakılamaz.',
    );

    fireEvent.change(screen.getByLabelText('Plan Başlığı'), {
      target: { value: 'Ortak Hafta Planı' },
    });
    // Varsayılan 3 görevi sil
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Eksik konuyu tekrar et maddesini sil',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: '1 konu tarama testi çöz maddesini sil',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Ödevleri kontrol et maddesini sil' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: '2 Öğrenciye Planı Ata' }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'En az bir plan maddesi ekleyin.',
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});
