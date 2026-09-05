import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from './CommandPalette';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens on keyboard shortcut (Cmd+K) and shows new educational tools', () => {
    render(<CommandPalette />);

    // Cmd+K tetikle
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    // Modalların ve yeni araçların arama listesinde olduğunu doğrula
    expect(screen.getByText('LGS & YKS Puan / Net Hesaplayıcı')).toBeInTheDocument();
    expect(screen.getByText('Matematik Odak & Pomodoro Sayacı')).toBeInTheDocument();
    expect(screen.getByText('MEB Matematik Konu Takip Çizelgesi')).toBeInTheDocument();
    expect(screen.getByText('Formül & Bilgi Kartları')).toBeInTheDocument();
    expect(screen.getByText('Akıllı Hata Defterim')).toBeInTheDocument();
  });

  it('filters tools by search query and executes action', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    render(<CommandPalette />);

    // Cmd+K ile aç
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const searchInput = screen.getByPlaceholderText(/sayfa ya da komut ara/i);
    fireEvent.change(searchInput, { target: { value: 'pomodoro' } });

    expect(screen.getByText('Matematik Odak & Pomodoro Sayacı')).toBeInTheDocument();

    // Seçeneğe tıkla
    const pomodoroItem = screen.getByText('Matematik Odak & Pomodoro Sayacı');
    fireEvent.click(pomodoroItem);

    // Event tetiklendi mi
    expect(dispatchSpy).toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });

  it('searches math games and curriculum topics with category badges', () => {
    render(<CommandPalette />);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const searchInput = screen.getByPlaceholderText(/sayfa ya da komut ara/i);
    fireEvent.change(searchInput, { target: { value: 'pisagor' } });

    expect(screen.getByText('Pisagor Bağıntısı ve Özel Üçgenler')).toBeInTheDocument();
    expect(screen.getByText('Konu')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'düello' } });
    expect(screen.getByText('Matematik Düellosu (1v1 Hızlı İşlem)')).toBeInTheDocument();
    expect(screen.getByText('Oyun')).toBeInTheDocument();
  });
});
