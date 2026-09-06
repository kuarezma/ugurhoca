import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeacherFeedbackLibraryModal from './TeacherFeedbackLibraryModal';

vi.mock('@/components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe('TeacherFeedbackLibraryModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders correctly when open and displays default templates', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <TeacherFeedbackLibraryModal
        isOpen={true}
        onClose={onClose}
        onSelectTemplate={onSelect}
      />,
    );

    expect(
      screen.getByText('Öğretmen Geri Bildirim Kütüphanesi'),
    ).toBeInTheDocument();
    expect(screen.getByText('🌟 Kusursuz')).toBeInTheDocument();
    expect(screen.getByText('⚠️ İşlem Hatası')).toBeInTheDocument();
  });

  it('filters templates by search term', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <TeacherFeedbackLibraryModal
        isOpen={true}
        onClose={onClose}
        onSelectTemplate={onSelect}
      />,
    );

    const searchInput = screen.getByPlaceholderText('Geri bildirim ara...');
    fireEvent.change(searchInput, { target: { value: 'Payda Eşitleme' } });

    expect(screen.getByText('🎯 Payda Eşitleme')).toBeInTheDocument();
    expect(screen.queryByText('🌟 Kusursuz')).not.toBeInTheDocument();
  });

  it('filters templates by category chip', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <TeacherFeedbackLibraryModal
        isOpen={true}
        onClose={onClose}
        onSelectTemplate={onSelect}
      />,
    );

    const conceptBtn = screen.getByRole('button', { name: /Kavram Yanılgısı/i });
    fireEvent.click(conceptBtn);

    expect(screen.getByText('💡 Kuralı İncele')).toBeInTheDocument();
    expect(screen.queryByText('🌟 Kusursuz')).not.toBeInTheDocument();
  });

  it('allows adding a new custom template and persists to localStorage', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <TeacherFeedbackLibraryModal
        isOpen={true}
        onClose={onClose}
        onSelectTemplate={onSelect}
      />,
    );

    // Click "Yeni Not Ekle" toggle
    const addToggleBtn = screen.getByRole('button', { name: /Yeni Not Ekle/i });
    fireEvent.click(addToggleBtn);

    // Fill in form
    const labelInput = screen.getByPlaceholderText(/Şablon Başlığı/i);
    const textInput = screen.getByPlaceholderText(/Geri bildirim metni/i);

    fireEvent.change(labelInput, { target: { value: 'Ortak Parantez' } });
    fireEvent.change(textInput, {
      target: { value: 'Ortak paranteze alırken en büyük ortak böleni bul.' },
    });

    // Save
    const saveBtn = screen.getByRole('button', { name: /Kütüphaneye Kaydet/i });
    fireEvent.click(saveBtn);

    // Newly added note should be rendered
    expect(screen.getByText('Ortak Parantez')).toBeInTheDocument();
    expect(
      screen.getByText('Ortak paranteze alırken en büyük ortak böleni bul.'),
    ).toBeInTheDocument();

    // Verify localStorage
    const saved = localStorage.getItem('ugurhoca_teacher_custom_feedback_notes');
    expect(saved).toBeTruthy();
    expect(saved).toContain('Ortak Parantez');
  });

  it('calls onSelectTemplate when template action button is clicked', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <TeacherFeedbackLibraryModal
        isOpen={true}
        onClose={onClose}
        onSelectTemplate={onSelect}
        selectedStepPrefix="[1. Adım]"
      />,
    );

    const attachBtns = screen.getAllByRole('button', { name: /İliştir/i });
    fireEvent.click(attachBtns[0]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        label: '🌟 Kusursuz',
      }),
      'append',
    );
  });
});
