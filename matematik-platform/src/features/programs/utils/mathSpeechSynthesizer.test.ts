import { describe, expect, it } from 'vitest';
import { formulaToSpokenTurkish } from './mathSpeechSynthesizer';

describe('mathSpeechSynthesizer', () => {
  it('converts basic algebraic identities into spoken Turkish', () => {
    const speech = formulaToSpokenTurkish('$$(a + b)^2 = a^2 + 2ab + b^2$$');
    expect(speech).toContain('parantez içinde a artı b in karesi');
    expect(speech).toContain('eşittir');
    expect(speech).toContain('a kare');
    expect(speech).toContain('b kare');
  });

  it('converts trigonometric identities into spoken Turkish', () => {
    const speech = formulaToSpokenTurkish('$$\\sin^2(x) + \\cos^2(x) = 1$$');
    expect(speech).toContain('sinüs kare x');
    expect(speech).toContain('kosinüs kare x');
    expect(speech).toContain('eşittir 1');
  });

  it('converts fractions, roots and discriminant into spoken Turkish', () => {
    const speech = formulaToSpokenTurkish('\\Delta = b^2 - 4ac, \\quad \\frac{-b \\pm \\sqrt{\\Delta}}{2a}');
    expect(speech).toContain('delta eşittir b kare eksi 4ac');
    expect(speech).toContain('pay -b artı eksi karekök delta, payda 2a');
  });

  it('converts logarithms and combinations into spoken Turkish', () => {
    const logSpeech = formulaToSpokenTurkish('\\log_a(x)');
    expect(logSpeech).toContain('a tabanında logaritma x');

    const combSpeech = formulaToSpokenTurkish('\\binom{n}{r}');
    expect(combSpeech).toContain('n in r li kombinasyonu');
  });

  it('handles empty input gracefully', () => {
    expect(formulaToSpokenTurkish('')).toBe('');
  });

  describe('useMathSpeech hook', () => {
    it('manages speech synthesis lifecycle: speak, stop, toggle', async () => {
      const { act, renderHook } = await import('@testing-library/react');
      const { useFormulaSpeech } = await import('./mathSpeechSynthesizer');

      const mockCancel = vi.fn();
      let lastUtterance: {
        lang?: string;
        onend?: (() => void) | null;
        onerror?: (() => void) | null;
        onstart?: (() => void) | null;
      } | null = null;

      const mockSpeak = vi.fn().mockImplementation((utt) => {
        lastUtterance = utt;
        utt.onstart?.();
      });
      const getLastUtterance = () => lastUtterance;

      vi.stubGlobal('speechSynthesis', {
        cancel: mockCancel,
        speak: mockSpeak,
      });

      class MockUtterance {
        lang = '';
        onerror: (() => void) | null = null;
        onend: (() => void) | null = null;
        onstart: (() => void) | null = null;
        pitch = 1.0;
        rate = 1.0;
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      }
      vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);

      const { result, unmount } = renderHook(() => useFormulaSpeech());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isSpeaking).toBe(false);

      // 1. Speak
      act(() => {
        result.current.speak('a + b = c');
      });

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalled();
      expect(getLastUtterance()?.lang).toBe('tr-TR');
      expect(result.current.isSpeaking).toBe(true);

      // Utterance ends
      act(() => {
        getLastUtterance()?.onend?.();
      });
      expect(result.current.isSpeaking).toBe(false);

      // 2. Toggle when not speaking -> speaks
      act(() => {
        result.current.toggle('x^2');
      });
      expect(result.current.isSpeaking).toBe(true);

      // 3. Toggle when speaking -> stops
      act(() => {
        result.current.toggle('x^2');
      });
      expect(result.current.isSpeaking).toBe(false);

      // 4. Utterance error callback
      act(() => {
        result.current.speak('y = mx + b');
      });
      expect(result.current.isSpeaking).toBe(true);
      act(() => {
        getLastUtterance()?.onerror?.();
      });
      expect(result.current.isSpeaking).toBe(false);

      // 5. Unmount cleans up
      unmount();
      expect(mockCancel).toHaveBeenCalled();
    });
  });
});
