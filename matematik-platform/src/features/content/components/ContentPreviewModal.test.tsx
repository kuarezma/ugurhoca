import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentPreviewModal from './ContentPreviewModal';
import type { ContentDocument } from '@/types';

const mockDoc: ContentDocument = {
  id: 'test-doc-123',
  title: '5. Sınıf Doğal Sayılar Testi',
  description: 'Doğal sayılar yaprak test',
  type: 'yaprak-test',
  grade: [5],
  file_url: 'https://example.com/test.pdf',
  views: 12,
  downloads: 3,
  likes: 5,
};

describe('ContentPreviewModal', () => {
  it('renders title and closes when close button is clicked', () => {
    const onClose = vi.fn();
    const onDownload = vi.fn();
    const onToggleAnswerKey = vi.fn();
    const onToggleCompleted = vi.fn();

    render(
      <ContentPreviewModal
        isCompleted={false}
        onClose={onClose}
        onDownload={onDownload}
        onToggleAnswerKey={onToggleAnswerKey}
        onToggleCompleted={onToggleCompleted}
        previewDoc={mockDoc}
        showAnswerKey={false}
      />,
    );

    expect(screen.getByText('5. Sınıf Doğal Sayılar Testi')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Kapat' });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop is clicked', () => {
    const onClose = vi.fn();

    const { container } = render(
      <ContentPreviewModal
        isCompleted={false}
        onClose={onClose}
        onDownload={vi.fn()}
        onToggleAnswerKey={vi.fn()}
        onToggleCompleted={vi.fn()}
        previewDoc={mockDoc}
        showAnswerKey={false}
      />,
    );

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClose when dialog body is clicked', () => {
    const onClose = vi.fn();

    render(
      <ContentPreviewModal
        isCompleted={false}
        onClose={onClose}
        onDownload={vi.fn()}
        onToggleAnswerKey={vi.fn()}
        onToggleCompleted={vi.fn()}
        previewDoc={mockDoc}
        showAnswerKey={false}
      />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders İşlem Tahtası (Scratchpad) button', () => {
    render(
      <ContentPreviewModal
        isCompleted={false}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onToggleAnswerKey={vi.fn()}
        onToggleCompleted={vi.fn()}
        previewDoc={mockDoc}
        showAnswerKey={false}
      />,
    );

    const scratchpadBtn = screen.getByRole('button', { name: /İşlem Tahtası/i });
    expect(scratchpadBtn).toBeInTheDocument();
    fireEvent.click(scratchpadBtn);
  });
});
