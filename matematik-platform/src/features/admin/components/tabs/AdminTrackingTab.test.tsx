import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import AdminTrackingTab from './AdminTrackingTab';
import type { ComponentProps } from 'react';

const baseProps: ComponentProps<typeof AdminTrackingTab> = {
  activityEvents: [],
  adminStatuses: [],
  assignments: [],
  documents: [],
  notifications: [],
  onCreateWeeklyPlan: vi.fn(),
  onSendMessage: vi.fn(),
  onUpdateStatus: vi.fn(),
  onViewProfile: vi.fn(),
  quizResults: [],
  studyGoals: [],
  studySessions: [],
  students: [{ id: 's1', name: 'Ada', email: 'ada@example.com', grade: 8 }],
  submissions: [],
  weeklyPlans: [],
};

afterEach(() => vi.useRealTimers());

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
      />,
    );

    expect(screen.getByText('Takip Merkezi')).toBeInTheDocument();
    const downloadBtn = screen.getByRole('button', {
      name: /Excel \/ CSV Raporu İndir/i,
    });
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});

describe('K3.2 takip arayüzü', () => {
  it('tüm takip tarihi seçeneklerini uygular ve diğer filtrelerle birlikte sıfırlar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T12:00:00'));
    const students = ['Geçen', 'Bugün', 'Yaklaşan', 'Tarihsiz'].map(
      (name, i) => ({ ...baseProps.students[0], id: `s${i}`, name }),
    );
    render(
      <AdminTrackingTab
        {...baseProps}
        students={students}
        adminStatuses={[
          {
            student_id: 's0',
            status: 'watch',
            labels: ['Kontrol'],
            follow_up_at: '2026-11-09T10:00:00',
          },
          {
            student_id: 's1',
            status: 'watch',
            labels: [],
            follow_up_at: '2026-11-10T18:00:00',
          },
          {
            student_id: 's2',
            status: 'watch',
            labels: [],
            follow_up_at: '2026-11-12T10:00:00',
          },
        ]}
      />,
    );
    const filter = screen.getByRole('combobox', {
      name: 'Takip tarihi filtresi',
    });
    for (const [value, names] of [
      ['overdue', ['Geçen']],
      ['today', ['Bugün']],
      ['upcoming', ['Yaklaşan']],
      ['scheduled', ['Geçen', 'Bugün', 'Yaklaşan']],
      ['all', students.map((s) => s.name)],
    ] as const) {
      fireEvent.change(filter, { target: { value } });
      expect(screen.getAllByRole('article')).toHaveLength(names.length);
      for (const name of names)
        expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    fireEvent.change(filter, { target: { value: 'scheduled' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Öğrenci ara' }), {
      target: { value: 'Geçen' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Takip etiketi' }), {
      target: { value: 'Kontrol' },
    });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Filtreyi Sıfırla' }));
    expect(filter).toHaveValue('all');
    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(
      screen.queryByRole('button', { name: 'Filtreyi Sıfırla' }),
    ).not.toBeInTheDocument();
  });

  it('etiketi doğru öğrenciye mevcut durum ve etiketleri koruyarak ekler', async () => {
    const onUpdateStatus = vi.fn();
    render(
      <AdminTrackingTab
        {...baseProps}
        onUpdateStatus={onUpdateStatus}
        adminStatuses={[
          { student_id: 's1', status: 'normal', labels: ['Kontrol'] },
        ]}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Ada için yeni etiket' });
    const button = screen.getByRole('button', { name: 'Etiket ekle' });
    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: '   ' } });
    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: 'kontrol' } });
    fireEvent.click(button);
    expect(onUpdateStatus).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Bu etiket zaten var');
    fireEvent.change(input, { target: { value: '  Düzenli çalışma  ' } });
    fireEvent.click(button);
    await waitFor(() => expect(input).toHaveValue(''));
    expect(onUpdateStatus).toHaveBeenCalledWith(
      baseProps.students[0],
      'normal',
      ['Kontrol', 'Düzenli çalışma'],
    );
  });

  it('durumu olmayan öğrencinin risk durumunu kullanır ve kayıt hatasında taslağı korur', async () => {
    const onUpdateStatus = vi.fn().mockRejectedValue(new Error('save failed'));
    render(
      <AdminTrackingTab
        {...baseProps}
        onUpdateStatus={onUpdateStatus}
        quizResults={[
          {
            id: 'old',
            user_id: 's1',
            score: 1,
            total_questions: 10,
            completed_at: '2020-01-01T10:00:00Z',
          },
        ]}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Ada için yeni etiket' });
    fireEvent.change(input, { target: { value: 'Yeni' } });
    fireEvent.click(screen.getByRole('button', { name: 'Etiket ekle' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Etiket eklenemedi'),
    );
    expect(input).toHaveValue('Yeni');
    expect(onUpdateStatus).toHaveBeenCalledWith(baseProps.students[0], 'risk', [
      'Yeni',
    ]);
  });

  it('etiket kaydı sürerken yeniden göndermeyi engeller ve taslakları öğrenciye göre ayırır', async () => {
    let finish!: () => void;
    const onUpdateStatus = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <AdminTrackingTab
        {...baseProps}
        students={[
          ...baseProps.students,
          { ...baseProps.students[0], id: 's2', name: 'Ece' },
        ]}
        onUpdateStatus={onUpdateStatus}
      />,
    );
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Ada için yeni etiket' }),
      { target: { value: 'Yeni' } },
    );
    expect(
      screen.getByRole('textbox', { name: 'Ece için yeni etiket' }),
    ).toHaveValue('');
    fireEvent.submit(screen.getByRole('form', { name: 'Ada etiket ekleme' }));
    expect(screen.getByRole('button', { name: 'Ekleniyor…' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('form', { name: 'Ada etiket ekleme' }));
    expect(onUpdateStatus).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'Ada için yeni etiket' }),
      ).toHaveValue(''),
    );
  });

  it('7 ve 30 günlük test, ödev, çalışma ve aktif öğrenci özetlerini gösterir', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T12:00:00Z'));
    render(
      <AdminTrackingTab
        {...baseProps}
        quizResults={[
          {
            id: 'q1',
            user_id: 's1',
            score: 8,
            total_questions: 10,
            completed_at: '2026-11-09T10:00:00Z',
          },
          {
            id: 'q2',
            user_id: 's2',
            score: 4,
            total_questions: 10,
            completed_at: '2026-10-25T10:00:00Z',
          },
        ]}
        submissions={[
          {
            id: 'sub1',
            student_id: 's1',
            assignment_id: 'a1',
            submitted_at: '2026-11-09T10:00:00Z',
          },
          {
            id: 'sub2',
            student_id: 's2',
            assignment_id: 'a2',
            submitted_at: '2026-10-25T10:00:00Z',
          },
        ]}
        studySessions={[
          { id: 'ss1', user_id: 's1', date: '2026-11-09', duration: 45 },
          { id: 'ss2', user_id: 's2', date: '2026-10-25', duration: 60 },
        ]}
      />,
    );
    for (const [days, values] of [
      [7, ['1', '1', '%80', '1', '45 dk']],
      [30, ['2', '2', '%60', '2', '105 dk']],
    ] as const) {
      const region = within(
        screen.getByRole('region', { name: `${days} günlük eğilim` }),
      );
      expect(
        region.getAllByRole('definition').map((el) => el.textContent),
      ).toEqual(values);
    }
  });

  it('CWV ortalamasını, birimini, durumunu ve ölçüm sayısını gösterir', () => {
    render(
      <AdminTrackingTab
        {...baseProps}
        activityEvents={[
          {
            id: 'wv1',
            user_id: 's1',
            event_type: 'web_vital',
            created_at: new Date().toISOString(),
            metadata: { name: 'LCP', value: 2000 },
          },
          {
            id: 'wv2',
            user_id: 's1',
            event_type: 'web_vital',
            created_at: new Date().toISOString(),
            metadata: { name: 'LCP', value: 4000 },
          },
          {
            id: 'wv3',
            user_id: 's1',
            event_type: 'web_vital',
            created_at: new Date().toISOString(),
            metadata: { name: 'CLS', value: 0.05 },
          },
        ]}
      />,
    );
    const region = within(
      screen.getByRole('region', { name: 'Core Web Vitals özeti' }),
    );
    expect(region.getByText('3 ölçüm · Ortalama değerler')).toBeInTheDocument();
    expect(
      region.getByText('3000 ms · İyileştirilmeli (2 ölçüm)'),
    ).toBeInTheDocument();
    expect(region.getByText('0.05 · İyi (1 ölçüm)')).toBeInTheDocument();
    expect(region.getAllByText('Ölçüm yok')).toHaveLength(3);
  });

  it('boş veri için sıfır eğilim ve anlaşılır CWV mesajı gösterir', () => {
    render(<AdminTrackingTab {...baseProps} />);
    expect(
      screen.getByText('Henüz performans ölçümü yok.'),
    ).toBeInTheDocument();
    for (const days of [7, 30]) {
      expect(
        within(screen.getByRole('region', { name: `${days} günlük eğilim` }))
          .getAllByRole('definition')
          .map((el) => el.textContent),
      ).toEqual(['0', '0', '%0', '0', '0 dk']);
    }
  });
});
