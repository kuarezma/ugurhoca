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
});
