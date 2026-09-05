import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionSpeech, latexToSpeechText } from './useQuestionSpeech';

describe('latexToSpeechText', () => {
  it('converts fractions into spoken Turkish words', () => {
    expect(latexToSpeechText('\\frac{3}{4}')).toBe('3 bölü 4');
  });

  it('converts powers and roots into natural math words', () => {
    expect(latexToSpeechText('x^2 + y^3')).toBe('x kare + y küp');
    expect(latexToSpeechText('\\sqrt{16}')).toBe('karekök 16');
  });

  it('converts math operators and removes dollar delimiters', () => {
    const raw = '$a \\le 5$ ve $b \\neq 0$';
    const spoken = latexToSpeechText(raw);
    expect(spoken).toContain('küçük eşittir');
    expect(spoken).toContain('eşit değildir');
    expect(spoken).not.toContain('$');
  });
});

describe('useQuestionSpeech', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    // Mock SpeechSynthesis in window
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
      },
      writable: true,
      configurable: true,
    });

    class MockUtterance {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      writable: true,
      configurable: true,
    });
  });

  it('speaks formatted text and cancels on stop', () => {
    const { result } = renderHook(() => useQuestionSpeech());

    expect(result.current.isSupported).toBe(true);

    act(() => {
      result.current.speak('2x + 4 = 10');
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();

    act(() => {
      result.current.stop();
    });

    expect(mockCancel).toHaveBeenCalledTimes(2);
  });
});
