import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ChatBubble', async () => {
  const React = await import('react');

  return {
    default: function ChatBubbleMock() {
      const [message, setMessage] = React.useState('Sohbet');

      React.useEffect(() => {
        const handleQuestion = (event: Event) => {
          const detail = (event as CustomEvent<{ questionText?: string }>)
            .detail;
          setMessage(detail?.questionText || 'Sohbet açıldı');
        };
        window.addEventListener(
          'open-teacher-chat-with-question',
          handleQuestion,
        );
        return () =>
          window.removeEventListener(
            'open-teacher-chat-with-question',
            handleQuestion,
          );
      }, []);

      return <div data-testid="chat-bubble">{message}</div>;
    },
  };
});

import { ChatBubbleLoader } from './ChatBubbleLoader';

describe('ChatBubbleLoader', () => {
  const originalReadyState = document.readyState;

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: originalReadyState,
    });
  });

  it('loads chat after the fallback idle delay', async () => {
    render(<ChatBubbleLoader />);

    expect(screen.queryByTestId('chat-bubble')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(750);
    });
    await act(async () => Promise.resolve());

    expect(screen.getByTestId('chat-bubble')).toBeInTheDocument();
  });

  it('does not lose a question event before the idle load', async () => {
    render(<ChatBubbleLoader />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('open-teacher-chat-with-question', {
          detail: { questionText: 'Bu soruyu nasıl çözerim?' },
        }),
      );
    });
    await act(async () => Promise.resolve());
    act(() => vi.runAllTimers());

    expect(screen.getByTestId('chat-bubble')).toHaveTextContent(
      'Bu soruyu nasıl çözerim?',
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});
