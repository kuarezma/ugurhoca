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
});
