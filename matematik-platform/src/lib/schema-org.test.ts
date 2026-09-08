import { describe, it, expect } from 'vitest';
import {
  buildToolJsonLd,
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildEduQuizJsonLd,
} from './schema-org';
import { SITE_URL } from './site-metadata';

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

  it('generates valid LearningResource and Quiz JSON-LD with MEB outcome and questions', () => {
    const jsonLd = buildEduQuizJsonLd({
      name: 'Pisagor Bağıntısı Testi',
      description: '8. Sınıf Pisagor teoremi soru çözümleri',
      path: '/icerikler/lgs-ucgenler',
      educationalLevel: 'Ortaokul 8. Sınıf',
      mebOutcomeCode: 'M.8.3.1.5',
      mebOutcomeName: 'Pisagor bağıntısını oluşturur, ilgili problemleri çözer.',
      questions: [
        {
          name: 'Soru 1: 6-8-10 Üçgeni',
          text: 'Dik kenarları 6 cm ve 8 cm olan üçgenin hipotenüsü kaç cm?',
          answers: [
            { text: '10', isCorrect: true, comment: 'Doğru, 6-8-10 özel üçgeni' },
            { text: '12', isCorrect: false, comment: 'Hatalı' },
            { text: '14', isCorrect: false },
          ],
        },
      ],
    });

    expect(jsonLd['@context']).toBe('https://schema.org');
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;
    expect(graph).toHaveLength(2);

    const resource = graph[0];
    expect(resource['@type']).toBe('LearningResource');
    expect(resource.name).toBe('Pisagor Bağıntısı Testi');
    expect(resource.educationalAlignment).toBeDefined();

    const quiz = graph[1];
    expect(quiz['@type']).toBe('Quiz');
    expect(quiz.isPartOf).toEqual({ '@id': `${SITE_URL}/icerikler/lgs-ucgenler#resource` });
    expect(quiz.hasPart).toHaveLength(1);

    const question = (quiz.hasPart as Array<Record<string, unknown>>)[0];
    expect(question['@type']).toBe('Question');
    expect(question.acceptedAnswer).toEqual({
      '@type': 'Answer',
      text: '10',
      comment: { '@type': 'Comment', text: 'Doğru, 6-8-10 özel üçgeni' },
    });
  });
});
