import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  WeeklyMockLeagueModal,
  type LeagueParticipant,
} from './WeeklyMockLeagueModal';

const participants: LeagueParticipant[] = [
  {
    rank: 1,
    alias: 'ArfMatematik 👑',
    avatarBg: 'bg-amber-500',
    correct: 20,
    wrong: 0,
    empty: 0,
    netScore: 20,
  },
  {
    rank: 2,
    alias: 'Sen (Öğrenci) 🎯',
    avatarBg: 'bg-emerald-500',
    correct: 16,
    wrong: 3,
    empty: 1,
    netScore: 15,
    isSelf: true,
  },
];

const expectNoFabricatedClaims = () => {
  for (const claim of [
    /Lig #4/i,
    /Sonraki Deneme/i,
    /Pazar 10:00/i,
    /20 soruluk LGS matematik denemesi/i,
    /%78 Başarı/i,
    /%54 Başarı/i,
    /%26 Başarı/i,
    /Soru 14 \(Eğim ve Doğrusal Denklem\)/i,
    /Sıralama her pazar/i,
    /Öğrencilerin %46/i,
  ]) {
    expect(screen.queryByText(claim)).not.toBeInTheDocument();
  }
};

describe('WeeklyMockLeagueModal', () => {
  it('renders an honest empty state and hides start buttons without an available exam', () => {
    render(<WeeklyMockLeagueModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Haftalık LGS Deneme Ligi')).toBeInTheDocument();
    expect(
      screen.getByText('Bu hafta için henüz lig sıralaması oluşmadı.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Henüz Yok')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /Sınava Başla|Deneme Sınavına Katıl/i,
      }),
    ).not.toBeInTheDocument();
    expectNoFabricatedClaims();
  });

  it('renders only supplied participants and calculated stats', () => {
    render(
      <WeeklyMockLeagueModal
        isOpen
        onClose={vi.fn()}
        participants={participants}
      />,
    );

    expect(screen.getByText('2 Öğrenci')).toBeInTheDocument();
    expect(screen.getByText('17.50 Net')).toBeInTheDocument();
    expect(screen.getByText('2. / 2')).toBeInTheDocument();
    expect(screen.getByText('ArfMatematik 👑')).toBeInTheDocument();
    expect(screen.getByText('Sen (Öğrenci) 🎯')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Deneme Sınavına Katıl/i }),
    ).not.toBeInTheDocument();
    expectNoFabricatedClaims();
  });

  it.each([{ list: [] }, { list: participants }])(
    'shows an honest analysis placeholder even with leaderboard data (%#)',
    ({ list }) => {
      render(
        <WeeklyMockLeagueModal isOpen onClose={vi.fn()} participants={list} />,
      );
      fireEvent.click(
        screen.getByRole('button', { name: /Soru & Zorluk Analizi/i }),
      );

      expect(
        screen.getByText(
          'Deneme sınavı tamamlandığında soru dağılımı ve kazanım analizi burada görüntülenir.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          /Kolay Sorular|Orta Seviye Yeni Nesil|Seçici \/ Zor Sorular/i,
        ),
      ).not.toBeInTheDocument();
      expectNoFabricatedClaims();
      fireEvent.click(
        screen.getByRole('button', { name: /Sıralama Listesi/i }),
      );
      expect(
        screen.queryByText(
          'Deneme sınavı tamamlandığında soru dağılımı ve kazanım analizi burada görüntülenir.',
        ),
      ).not.toBeInTheDocument();
    },
  );

  it.each(['Sınava Başla', 'Deneme Sınavına Katıl'])(
    'starts the exam before closing when %s is clicked',
    (label) => {
      const onStartExam = vi.fn();
      const onClose = vi.fn();
      render(
        <WeeklyMockLeagueModal
          isOpen
          onClose={onClose}
          onStartExam={onStartExam}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: label }));

      expect(onStartExam).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onStartExam.mock.invocationCallOrder[0]).toBeLessThan(
        onClose.mock.invocationCallOrder[0],
      );
    },
  );

  it('can start an available exam from the analysis tab with participants', () => {
    const onStartExam = vi.fn();
    const onClose = vi.fn();
    render(
      <WeeklyMockLeagueModal
        isOpen
        onClose={onClose}
        onStartExam={onStartExam}
        participants={participants}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Soru & Zorluk Analizi/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Deneme Sınavına Katıl' }),
    );
    expect(onStartExam).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps row keys unique for tied ranks and repeated aliases', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <WeeklyMockLeagueModal
          isOpen
          onClose={vi.fn()}
          participants={[participants[0], { ...participants[0], netScore: 18 }]}
        />,
      );
      expect(screen.getAllByText(participants[0].alias)).toHaveLength(2);
      expect(errorSpy.mock.calls.flat().join(' ')).not.toMatch(
        /same key|unique.*key/i,
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('does not start an exam when dismissed', () => {
    const onStartExam = vi.fn();
    const onClose = vi.fn();
    render(
      <WeeklyMockLeagueModal
        isOpen
        onClose={onClose}
        onStartExam={onStartExam}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Kapat' })[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStartExam).not.toHaveBeenCalled();
  });

  it('renders nothing while closed', () => {
    render(<WeeklyMockLeagueModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
