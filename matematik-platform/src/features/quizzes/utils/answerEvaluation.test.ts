import { describe, it, expect } from 'vitest';
import {
  normalizeMathShortAnswer,
  evaluateShortAnswer,
  parseFraction,
  parseNumericValue,
} from './answerEvaluation';

describe('answerEvaluation', () => {
  describe('normalizeMathShortAnswer', () => {
    it('boşlukları ve Türkçe virgülü düzeltir', () => {
      expect(normalizeMathShortAnswer('  2,5  ')).toBe('2.5');
      expect(normalizeMathShortAnswer('12,0')).toBe('12');
    });

    it('basit ve bileşik kesirleri sadeleştirir', () => {
      expect(normalizeMathShortAnswer('2/4')).toBe('1/2');
      expect(normalizeMathShortAnswer('6/3')).toBe('2');
      expect(normalizeMathShortAnswer('-4/8')).toBe('-1/2');
    });

    it('pozitif işaretleri ve değişken ön eklerini ayıklar', () => {
      expect(normalizeMathShortAnswer('+15')).toBe('15');
      expect(normalizeMathShortAnswer('x = 7')).toBe('7');
      expect(normalizeMathShortAnswer('y= 3/6')).toBe('1/2');
    });
  });

  describe('parseFraction & parseNumericValue', () => {
    it('kesirleri doğru ayrıştırır', () => {
      expect(parseFraction('3/4')).toEqual({
        numerator: 3,
        denominator: 4,
        value: 0.75,
      });
      expect(parseFraction('invalid')).toBeNull();
    });

    it('ondalık ve yüzde değerleri hesaplar', () => {
      expect(parseNumericValue('2,5')).toBe(2.5);
      expect(parseNumericValue('%25')).toBe(0.25);
      expect(parseNumericValue('50%')).toBe(0.5);
    });
  });

  describe('evaluateShortAnswer', () => {
    it('tam eşleşen tam sayı ve ondalık cevapları kabul eder', () => {
      expect(evaluateShortAnswer('42', '42')).toBe(true);
      expect(evaluateShortAnswer('2,5', '2.5')).toBe(true);
      expect(evaluateShortAnswer('2.5', '2,5')).toBe(true);
    });

    it('kesir ve ondalık eşdeğerliğini doğrular (2/4 === 1/2 === 0.5)', () => {
      expect(evaluateShortAnswer('2/4', '1/2')).toBe(true);
      expect(evaluateShortAnswer('1/2', '0.5')).toBe(true);
      expect(evaluateShortAnswer('0,5', '1/2')).toBe(true);
      expect(evaluateShortAnswer('3/6', '0,5')).toBe(true);
    });

    it('çoklu beklenen yanıt alternatiflerini destekler', () => {
      const expected = '1/2|0,5|0.5';
      expect(evaluateShortAnswer('1/2', expected)).toBe(true);
      expect(evaluateShortAnswer('0.5', expected)).toBe(true);
      expect(evaluateShortAnswer('0,5', expected)).toBe(true);
      expect(evaluateShortAnswer('2/4', expected)).toBe(true);
      expect(evaluateShortAnswer('3/4', expected)).toBe(false);
    });

    it('değişkenli yazımları ve negatif sayıları değerlendirir', () => {
      expect(evaluateShortAnswer('x = -3', '-3')).toBe(true);
      expect(evaluateShortAnswer('+8', '8')).toBe(true);
    });

    it('boş ve geçersiz girdileri reddeder', () => {
      expect(evaluateShortAnswer('', '5')).toBe(false);
      expect(evaluateShortAnswer('abc', '5')).toBe(false);
    });
  });
});
