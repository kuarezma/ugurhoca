import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScratchpadDocumentPanel } from './ScratchpadDocumentPanel';

describe('ScratchpadDocumentPanel', () => {
  it('prefers Drive preview and toggles the answer key', () => {
    const onToggleExpanded = vi.fn();
    render(
      <ScratchpadDocumentPanel
        documentContext={{
          title: 'Çalışma',
          driveId: 'drive-123',
          fileUrl: 'https://example.com/test.pdf',
          answerKeyText: '1: A',
        }}
        expanded={false}
        onToggleExpanded={onToggleExpanded}
      />,
    );
    expect(screen.getByTitle('Çalışma — PDF önizleme')).toHaveAttribute(
      'src',
      'https://drive.google.com/file/d/drive-123/preview',
    );
    expect(screen.queryByText('1: A')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Cevap anahtarını göster' }),
    );
    expect(screen.getByText('1: A')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Cevap anahtarını gizle' }),
    );
    expect(screen.queryByText('1: A')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dokümanı genişlet' }));
    expect(onToggleExpanded).toHaveBeenCalledOnce();
  });

  it('embeds direct PDFs in a sandbox and offers a separate tab', () => {
    render(
      <ScratchpadDocumentPanel
        documentContext={{
          title: 'PDF',
          fileUrl: 'https://example.com/test.PDF?token=demo',
        }}
        expanded={false}
        onToggleExpanded={vi.fn()}
      />,
    );
    const frame = screen.getByTitle('PDF — PDF önizleme');
    expect(frame).toHaveAttribute('sandbox', 'allow-same-origin');
    expect(frame).toHaveAttribute('allowfullscreen');
    expect(
      screen.getByRole('link', { name: 'Ayrı sekmede aç' }),
    ).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.queryByRole('button', { name: /Cevap anahtarı/ }),
    ).not.toBeInTheDocument();
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', undefined])(
    'rejects unsafe or missing URL %s',
    (fileUrl) => {
      const { container } = render(
        <ScratchpadDocumentPanel
          documentContext={{ title: 'Dosya', fileUrl }}
          expanded={false}
          onToggleExpanded={vi.fn()}
        />,
      );
      expect(container.querySelector('iframe')).toBeNull();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(
        screen.getByText(/görüntülenebilir bir doküman bulunamadı/),
      ).toBeVisible();
    },
  );
});
