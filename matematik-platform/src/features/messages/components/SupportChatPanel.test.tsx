import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SupportChatPanel } from './SupportChatPanel';
import type { ThreadMessage } from '@/features/messages/types';

describe('SupportChatPanel Component', () => {
  const dummyMessages: ThreadMessage[] = [
    {
      id: 'msg-1',
      text: '$\\sqrt{16} = 4$ olduğunu unutma.',
      created_at: new Date().toISOString(),
      isOwn: false,
    },
    {
      id: 'msg-2',
      text: 'Teşekkürler hocam! $\\frac{1}{2}$ tamam.',
      created_at: new Date().toISOString(),
      isOwn: true,
    },
  ];

  it('matematik formülleri içeren mesajları ve sembol çubuğunu render eder', () => {
    const handleDraftChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={handleDraftChange}
        onSubmit={handleSubmit}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    expect(screen.getByText('Uğur Hoca')).toBeInTheDocument();
    expect(screen.getByText('Sembol:')).toBeInTheDocument();
    expect(screen.getByText('√x')).toBeInTheDocument();
    expect(screen.getByText('x²')).toBeInTheDocument();
    expect(screen.getByText('a/b')).toBeInTheDocument();

    // Sembole tıklandığında snippet taslağa eklenir
    fireEvent.click(screen.getByText('√x'));
    expect(handleDraftChange).toHaveBeenCalledWith('$\\sqrt{x}$');
  });

  it('boş mesaj durumunda Uğur Hoca karşılama metnini gösterir', () => {
    const handleDraftChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={[]}
        onDraftChange={handleDraftChange}
        onSubmit={handleSubmit}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    expect(
      screen.getByText('Uğur Hoca ile Matematik Sohbeti'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Takıldığın bir soru, ödev veya çalışma programın hakkında Uğur Hoca'ya doğrudan yazabilirsin./i,
      ),
    ).toBeInTheDocument();
  });

  it('admin görünümünde hızlı not şablonlarını gösterir ve tıklandığında taslağa yazar', () => {
    const handleDraftChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <SupportChatPanel
        appearance="admin"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={handleDraftChange}
        onSubmit={handleSubmit}
        peerDisplayName="Ahmet Yılmaz"
        sending={false}
      />,
    );

    expect(screen.getByText('Hızlı Not:')).toBeInTheDocument();
    const feedbackBtn = screen.getByText('Harika çözüm! 👏');
    expect(feedbackBtn).toBeInTheDocument();

    fireEvent.click(feedbackBtn);
    expect(handleDraftChange).toHaveBeenCalledWith('Harika çözüm! 👏');
  });

  it('taslak içinde $ varsa canlı formül önizleme kutusunu gösterir', () => {
    const handleDraftChange = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <SupportChatPanel
        appearance="navbar"
        draft="$x^2 + 5 = 9$"
        error={null}
        messages={dummyMessages}
        onDraftChange={handleDraftChange}
        onSubmit={handleSubmit}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    expect(screen.getByText('Canlı Formül Önizleme:')).toBeInTheDocument();
  });

  it('peerTyping true olduğunda canlı yazıyor göstergesini görüntüler', () => {
    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn()}
        peerDisplayName="Uğur Hoca"
        peerTyping={true}
        sending={false}
      />,
    );

    expect(screen.getByText('Uğur Hoca yazıyor')).toBeInTheDocument();
  });

  it('öğrenci görünümünde soru şablonlarını gösterir ve tıklandığında taslağa aktarır', () => {
    const handleDraftChange = vi.fn();

    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={handleDraftChange}
        onSubmit={vi.fn()}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    expect(screen.getByText('Soru Şablonu:')).toBeInTheDocument();
    const questionBtn = screen.getByText('❓ Çözüm adımlarını anlayamadım');
    expect(questionBtn).toBeInTheDocument();

    fireEvent.click(questionBtn);
    expect(handleDraftChange).toHaveBeenCalledWith('❓ Çözüm adımlarını anlayamadım');
  });

  it('sohbette ara butonuna tıklandığında arama çubuğunu açar ve filtreler', () => {
    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn()}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    const searchBtn = screen.getByLabelText('Sohbette ara');
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText('Mesajlarda ara...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Teşekkürler' } });
    expect(screen.getByText(/1 eşleşme/i)).toBeInTheDocument();
  });

  it('sembol ızgara butonuna tıklandığında tüm sembolleri ızgara formatında açar ve kapatır', () => {
    render(
      <SupportChatPanel
        appearance="navbar"
        draft=""
        error={null}
        messages={dummyMessages}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn()}
        peerDisplayName="Uğur Hoca"
        sending={false}
      />,
    );

    const toggleGridBtn = screen.getByLabelText('Tüm sembolleri ızgara olarak göster');
    expect(toggleGridBtn).toBeInTheDocument();

    fireEvent.click(toggleGridBtn);
    expect(screen.getByText('Matematik Sembolleri (Tümü):')).toBeInTheDocument();
    expect(screen.getByText('Kapat')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Kapat'));
    expect(screen.getByText('Sembol:')).toBeInTheDocument();
  });
});
