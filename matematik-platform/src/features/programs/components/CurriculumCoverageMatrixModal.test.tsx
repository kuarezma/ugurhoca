import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurriculumCoverageMatrixModal } from './CurriculumCoverageMatrixModal';
import { loadCurriculumCoverageDocuments } from '@/features/content/curriculum-queries';

vi.mock('@/features/content/curriculum-queries', () => ({ loadCurriculumCoverageDocuments: vi.fn() }));

describe('CurriculumCoverageMatrixModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadCurriculumCoverageDocuments).mockResolvedValue([
      { id: 'test', grade: [8], title: 'Çarpanlar ve Katlar', description: null, type: 'yaprak-test' },
      { id: 'notes', grade: [8], title: 'Çarpanlar ve Katlar', description: null, type: 'ders-notlari' },
    ]);
  });

  it('does not query or render when closed', () => {
    render(<CurriculumCoverageMatrixModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(loadCurriculumCoverageDocuments).not.toHaveBeenCalled();
  });

  it('renders real counts and readable missing content without manual toggles', async () => {
    localStorage.setItem('ugurhoca_curriculum_coverage_matrix_v1', '{"8":{}}');
    const setItem = vi.spyOn(localStorage, 'setItem');
    const onClose = vi.fn();
    render(<CurriculumCoverageMatrixModal isOpen onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Kazanım Kapsam & İçerik Haritası')).toBeInTheDocument();
    expect(await screen.findByText(/Genel Kapsam Oranı: %9/)).toBeInTheDocument();
    expect(screen.getAllByText('1 içerik')).toHaveLength(2);
    expect(screen.getByText('8. Sınıf · Kareköklü İfadeler: yaprak test yok')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mevcut/ })).not.toBeInTheDocument();
    expect(setItem).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    expect(onClose).toHaveBeenCalledOnce();
    setItem.mockRestore();
  });

  it('switches grade and filters topics using actual content', async () => {
    render(<CurriculumCoverageMatrixModal isOpen onClose={vi.fn()} />);
    await screen.findByText(/Genel Kapsam Oranı/);
    fireEvent.click(screen.getByRole('button', { name: 'Tam Hazır' }));
    expect(screen.getByText('8. Sınıf · Çarpanlar ve Katlar')).toBeInTheDocument();
    expect(screen.queryByText('8. Sınıf · Kareköklü İfadeler')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eksikli Konular' }));
    expect(screen.queryByText('8. Sınıf · Çarpanlar ve Katlar')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Sınıf' }), { target: { value: '5' } });
    expect(screen.getByText('5. Sınıf · Doğal Sayılar')).toBeInTheDocument();
  });

  it('does not report missing documents when the query fails, and can refresh', async () => {
    vi.mocked(loadCurriculumCoverageDocuments).mockRejectedValueOnce(new Error('offline'));
    render(<CurriculumCoverageMatrixModal isOpen onClose={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('yüklenemedi');
    expect(screen.queryByText(/yaprak test yok/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yenile' }));
    expect(await screen.findByText(/Genel Kapsam Oranı/)).toBeInTheDocument();
  });
});
