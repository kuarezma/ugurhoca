import { Suspense, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminQuestionFields from './AdminQuestionFields';

// Bu test modalın yaşam döngüsünü ölçer; KaTeX ayrı bileşen testlerinde doğrulanır.
vi.mock('@/components/MathText', () => ({
  default: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

describe('AdminQuestionFields lazy formula helper', () => {
  it('loads on first open and retains the formula draft across close and reopen', async () => {
    render(
      <Suspense fallback={<div>Yükleniyor</div>}>
        <AdminQuestionFields formData={{}} updateFormData={vi.fn()} />
      </Suspense>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const open = screen.getByRole('button', {
      name: 'Formül / LaTeX Asistanı',
    });
    fireEvent.click(open);
    // Suspense geçişi mevcut formu korur; boş/yeni bir yer tutucu çizilmez.
    expect(screen.getByLabelText('Soru Metni')).toBeInTheDocument();
    expect(screen.queryByText('Yükleniyor')).not.toBeInTheDocument();
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByPlaceholderText(/LaTeX kodu/), {
      target: { value: 'x+1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(open);
    await screen.findByRole('dialog');
    expect(screen.getByPlaceholderText(/LaTeX kodu/)).toHaveValue('x+1');
  });
});
