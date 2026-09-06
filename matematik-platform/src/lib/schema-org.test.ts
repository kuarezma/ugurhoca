import { describe, it, expect } from 'vitest';
import {
  buildToolJsonLd,
  buildFaqJsonLd,
  buildHowToJsonLd,
} from './schema-org';

describe('schema-org JSON-LD helpers', () => {
  it('builds WebApplication JSON-LD correctly', () => {
    const jsonLd = buildToolJsonLd({
      name: 'LGS Puan Hesaplayıcı',
      description: 'LGS puanınızı netlere göre hesaplayın.',
      path: '/araclar/lgs-puan-hesaplama',
    });

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebApplication');
    expect(jsonLd.name).toBe('LGS Puan Hesaplayıcı');
    expect(jsonLd.url).toContain('/araclar/lgs-puan-hesaplama');
    expect(jsonLd.offers.price).toBe('0');
  });

  it('builds FAQPage JSON-LD correctly', () => {
    const faq = buildFaqJsonLd([
      {
        question: 'LGS puanı nasıl hesaplanır?',
        answer: 'MEB standart sapma ve ders katsayıları kullanılarak hesaplanır.',
      },
    ]);

    expect(faq['@context']).toBe('https://schema.org');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(1);
    expect(faq.mainEntity[0].name).toBe('LGS puanı nasıl hesaplanır?');
    expect(faq.mainEntity[0].acceptedAnswer.text).toContain('MEB standart sapma');
  });

  it('builds HowTo JSON-LD correctly', () => {
    const howTo = buildHowToJsonLd({
      name: 'EBOB EKOK Hesaplama',
      description: 'İki sayının asal bölen algoritması ile EBOB ve EKOK değerlerini bulun.',
      steps: [
        { name: '1. Adım: Sayıları Girin', text: 'Hesaplamak istediğiniz iki sayıyı kutulara yazın.' },
        { name: '2. Adım: Sonucu İnceleyin', text: 'Bölen listesi tablosundan ortak asal çarpanları görün.' },
      ],
    });

    expect(howTo['@type']).toBe('HowTo');
    expect(howTo.step).toHaveLength(2);
    expect(howTo.step[0].position).toBe(1);
    expect(howTo.step[1].position).toBe(2);
  });
});
