import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgramsHubPage from './ProgramsHubPage';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

describe('ProgramsHubPage', () => {
  it('renders all 4 educational program cards and triggers calculator/checklist modals', () => {
    render(<ProgramsHubPage />);

    expect(screen.getByText('LGS Puan ve Lise Tercih Sihirbazı')).toBeInTheDocument();
    expect(screen.getByText('YKS Puan ve Üniversite Tercih Sihirbazı')).toBeInTheDocument();
    expect(screen.getByText('İnteraktif Sınav Puanı & Net Hesaplayıcı')).toBeInTheDocument();
    expect(screen.getByText('MEB Matematik Konu Takip Çizelgesi')).toBeInTheDocument();

    // Hesaplayıcıyı aç
    const calcBtn = screen.getByRole('button', { name: /İnteraktif Sınav Puanı & Net Hesaplayıcı aracını aç/i });
    fireEvent.click(calcBtn);
    expect(screen.getAllByText(/İnteraktif Sınav Puanı & Net Hesaplayıcı/i).length).toBe(2);

    // Çizelgeyi aç
    const checklistBtn = screen.getByRole('button', { name: /MEB Matematik Konu Takip Çizelgesi aracını aç/i });
    fireEvent.click(checklistBtn);
    expect(screen.getAllByText('MEB Matematik Konu Takip Çizelgesi').length).toBe(2);

    // Proje Atölyesini doğrula
    expect(screen.getByText('Matematik Proje Atölyesi & Araştırma Görevleri')).toBeInTheDocument();
  });
});
