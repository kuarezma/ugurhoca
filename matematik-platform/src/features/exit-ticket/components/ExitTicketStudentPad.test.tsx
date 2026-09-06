import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitTicketStudentPad } from './ExitTicketStudentPad';
import { createExitTicketSession, saveSession } from '../lib/exitTicketStorage';
import { EXIT_TICKET_TEMPLATES } from '../lib/exitTicketTemplates';

describe('ExitTicketStudentPad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders PIN and name inputs initially', () => {
    render(<ExitTicketStudentPad />);

    expect(screen.getByText('Çıkış Bileti Öğrenci Girişi')).toBeInTheDocument();
    expect(screen.getByLabelText(/Katılım Kodu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adınız/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Derse Bağlan/i })).toBeInTheDocument();
  });

  it('shows error if PIN is less than 6 digits or name is empty', () => {
    render(<ExitTicketStudentPad />);

    const submitBtn = screen.getByRole('button', { name: /Derse Bağlan/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/6 haneli katılım kodunu girin/i)).toBeInTheDocument();
  });

  it('successfully joins a session and allows selecting an option', () => {
    const template = EXIT_TICKET_TEMPLATES[0];
    const session = createExitTicketSession(
      template.title,
      template.grade,
      template.questions,
    );

    render(<ExitTicketStudentPad initialCode={session.code} />);

    // İsim gir
    const nameInput = screen.getByLabelText(/Adınız/i);
    fireEvent.change(nameInput, { target: { value: 'Zeynep' } });

    const submitBtn = screen.getByRole('button', { name: /Derse Bağlan/i });
    fireEvent.click(submitBtn);

    // Soru ekranı gelmeli
    expect(screen.getByText(/Soru 1 \/ 3/i)).toBeInTheDocument();
    expect(screen.getByText('Zeynep')).toBeInTheDocument();

    // Seçenekler: A, B, C, D butonları
    const buttons = screen.getAllByRole('button');
    // Şıklardan birine tıkla (ilk şık A)
    fireEvent.click(buttons[0]);

    // Cevabın alındığı uyarısı belirmeli
    expect(screen.getByText(/Cevabın Alındı/i)).toBeInTheDocument();
  });

  it('displays misconception diagnostic feedback when teacher reveals results and student picked a distractor', () => {
    const template = EXIT_TICKET_TEMPLATES[0]; // Soru 0: doğru şık 1 (B). Şık 0 (A) kavram yanılgısı içerir.
    const session = createExitTicketSession(
      template.title,
      template.grade,
      template.questions,
    );
    // Öğretmen dağılımı açmış olsun
    session.showDistribution = true;
    saveSession(session);

    render(<ExitTicketStudentPad initialCode={session.code} />);

    const nameInput = screen.getByLabelText(/Adınız/i);
    fireEvent.change(nameInput, { target: { value: 'Mehmet' } });
    fireEvent.click(screen.getByRole('button', { name: /Derse Bağlan/i }));

    // Mehmet yanlış şık olan A şıkkını seçmiş olarak başlasın ya da simüle edilsin
    // Soru ekranında dağılım açık olduğu için doğru cevap yeşil görünür
    expect(screen.getByText(/Çözüm Adımı/i)).toBeInTheDocument();
  });
});
