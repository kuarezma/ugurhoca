import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FORBIDDEN_PRIVACY_PATTERNS,
  assertTextPrivacy,
  assertPdfPrivacy,
  resolveWriteMode,
  normalizeForPrivacyMatch,
} from './lib/privacy-guard.mjs';
import child_process from 'node:child_process';
import fs from 'node:fs';

describe('privacy-guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FORBIDDEN_PRIVACY_PATTERNS', () => {
    it('contains all required privacy regex patterns', () => {
      const patterns = FORBIDDEN_PRIVACY_PATTERNS.map((p) => p.source);
      expect(patterns.some((s) => s.includes('okul\\s+müdürü'))).toBe(true);
      expect(patterns.some((s) => s.includes('mustafa\\s+özkan'))).toBe(true);
      expect(patterns.some((s) => s.includes('ali\\s+rıza\\s+hacıoğlu'))).toBe(true);
      expect(patterns.some((s) => s.includes('özel\\s+ders'))).toBe(true);
    });
  });

  describe('normalizeForPrivacyMatch', () => {
    it('normalizes Turkish characters and ASCII folding correctly', () => {
      expect(normalizeForPrivacyMatch('Ali Rıza HACIOĞLU')).toBe('ali riza hacioglu');
      expect(normalizeForPrivacyMatch('OKUL MÜDÜRÜ')).toBe('okul muduru');
      expect(normalizeForPrivacyMatch('ÖZEL DERS')).toBe('ozel ders');
      expect(normalizeForPrivacyMatch('Şapka Çanta')).toBe('sapka canta');
    });
  });

  describe('assertTextPrivacy', () => {
    it('passes for safe text', () => {
      expect(() =>
        assertTextPrivacy('5. Sınıf Matematik 1. Dönem Yazılı Soruları', 'test'),
      ).not.toThrow();
    });

    it('throws error when forbidden phrase "Okul Müdürü" is present', () => {
      expect(() =>
        assertTextPrivacy('Onay: Okul   Müdürü tarafından imzalandı', 'title'),
      ).toThrow(/Gizlilik ihlali tespit edildi/);
    });

    it('throws error when "Mustafa Özkan" is present', () => {
      expect(() =>
        assertTextPrivacy('Hazırlayan: Mustafa ÖZKAN', 'metadata'),
      ).toThrow(/Gizlilik ihlali tespit edildi/);
    });

    it('throws error when "Ali Rıza Hacıoğlu" is present', () => {
      expect(() =>
        assertTextPrivacy('Denetleyen: Ali Rıza Hacıoğlu', 'metadata'),
      ).toThrow(/Gizlilik ihlali tespit edildi/);
    });

    it('throws error when "özel ders" is present', () => {
      expect(() =>
        assertTextPrivacy('Bu döküman özel ders materyalidir', 'desc'),
      ).toThrow(/Gizlilik ihlali tespit edildi/);
    });

    it('throws error for all uppercase and Turkish dotted/dotless I variants: "Ali Rıza HACIOĞLU", "ALİ RIZA HACIOĞLU", "OKUL MÜDÜRÜ", "MUSTAFA ÖZKAN", "ÖZEL DERS"', () => {
      const forbiddenVariants = [
        'Ali Rıza HACIOĞLU',
        'ALİ RIZA HACIOĞLU',
        'OKUL MÜDÜRÜ',
        'MUSTAFA ÖZKAN',
        'ÖZEL DERS',
      ];
      for (const variant of forbiddenVariants) {
        expect(
          () => assertTextPrivacy(`Örnek metin: ${variant}`, 'variant-test'),
          `Failed for variant: ${variant}`,
        ).toThrow(/Gizlilik ihlali tespit edildi/);
      }
    });
  });

  describe('assertPdfPrivacy', () => {
    it('throws when pdf file does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      expect(() => assertPdfPrivacy('/tmp/nonexistent.pdf')).toThrow(
        /PDF dosyası bulunamadı/,
      );
    });

    it('throws when pdftotext fails', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(child_process, 'execFileSync').mockImplementation(() => {
        throw new Error('Command failed');
      });
      expect(() => assertPdfPrivacy('/tmp/corrupted.pdf')).toThrow(
        /pdftotext çalıştırılamadı/,
      );
    });

    it('throws when pdftotext returns empty text', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(child_process, 'execFileSync').mockReturnValue('' as never);
      expect(() => assertPdfPrivacy('/tmp/empty.pdf')).toThrow(
        /PDF içeriği boş veya pdftotext tarafından okunamadı/,
      );
    });

    it('throws when pdf text contains forbidden patterns', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(child_process, 'execFileSync').mockReturnValue(
        'Sınav Kağıdı - Okul Müdürü Onayı' as never,
      );
      expect(() => assertPdfPrivacy('/tmp/forbidden.pdf')).toThrow(
        /Gizlilik ihlali tespit edildi/,
      );
    });

    it('passes when pdf text is clean and non-empty', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(child_process, 'execFileSync').mockReturnValue(
        '5. Sınıf Matematik Yazılı Soruları Uğur Yaşayan' as never,
      );
      expect(() => assertPdfPrivacy('/tmp/clean.pdf')).not.toThrow();
    });
  });

  describe('resolveWriteMode', () => {
    it('defaults to dry-run when called without arguments', () => {
      expect(resolveWriteMode([])).toEqual({
        dryRun: true,
        confirmed: false,
      });
    });

    it('returns dry-run when --dry-run is present even with --confirm', () => {
      expect(resolveWriteMode(['node', 'script.js', '--confirm', '--dry-run'])).toEqual({
        dryRun: true,
        confirmed: false,
      });
    });

    it('returns confirmed write mode only when --confirm is present without --dry-run', () => {
      expect(resolveWriteMode(['node', 'script.js', '--confirm'])).toEqual({
        dryRun: false,
        confirmed: true,
      });
    });
  });
});
