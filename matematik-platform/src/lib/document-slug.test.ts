import { describe, expect, it } from 'vitest';
import {
  buildDocumentSlug,
  extractDocumentIdFromSlug,
} from '@/lib/document-slug';

describe('document-slug', () => {
  const sampleUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('buildDocumentSlug', () => {
    it('creates a clean lowercase slug with turkish characters replaced', () => {
      const doc = {
        id: sampleUuid,
        title: 'Çarpanlar ve Katlar Çalışma Kağıdı (Özel Şablon)',
        grade: [8],
      };

      const slug = buildDocumentSlug(doc);
      expect(slug).toBe(
        `8-sinif-carpanlar-ve-katlar-calisma-kagidi-ozel-sablon--${sampleUuid}`,
      );
    });

    it('does not duplicate grade prefix if title already includes it', () => {
      const doc = {
        id: sampleUuid,
        title: '8. Sınıf Üslü İfadeler Yaprak Test 01',
        grade: [8],
      };

      const slug = buildDocumentSlug(doc);
      expect(slug).toBe(`8-sinif-uslu-ifadeler-yaprak-test-01--${sampleUuid}`);
    });

    it('handles mezun grade correctly', () => {
      const doc = {
        id: sampleUuid,
        title: 'Türev ve İntegral Tekrar',
        grade: ['Mezun'],
      };

      const slug = buildDocumentSlug(doc);
      expect(slug).toBe(`mezun-turev-ve-integral-tekrar--${sampleUuid}`);
    });

    it('works without grade information', () => {
      const doc = {
        id: sampleUuid,
        title: 'Genel Matematik Formülleri',
        grade: null,
      };

      const slug = buildDocumentSlug(doc);
      expect(slug).toBe(`genel-matematik-formulleri--${sampleUuid}`);
    });

    it('uses fallback if title is empty', () => {
      const doc = {
        id: sampleUuid,
        title: '',
        grade: null,
      };

      const slug = buildDocumentSlug(doc);
      expect(slug).toBe(`icerik--${sampleUuid}`);
    });
  });

  describe('extractDocumentIdFromSlug', () => {
    it('extracts uuid from standard slug with title', () => {
      const slug = `8-sinif-uslu-ifadeler-yaprak-test--${sampleUuid}`;
      expect(extractDocumentIdFromSlug(slug)).toBe(sampleUuid);
    });

    it('extracts uuid when only uuid is provided', () => {
      expect(extractDocumentIdFromSlug(sampleUuid)).toBe(sampleUuid);
    });

    it('extracts uuid with multiple double dashes in title', () => {
      const slug = `birinci--bolum--uslu--sayilar--${sampleUuid}`;
      expect(extractDocumentIdFromSlug(slug)).toBe(sampleUuid);
    });

    it('returns null for invalid slug without valid uuid', () => {
      expect(extractDocumentIdFromSlug('8-sinif-uslu-sayilar')).toBeNull();
      expect(
        extractDocumentIdFromSlug('8-sinif-uslu-sayilar--12345'),
      ).toBeNull();
      expect(extractDocumentIdFromSlug('')).toBeNull();
      expect(extractDocumentIdFromSlug('   ')).toBeNull();
    });
  });
});
