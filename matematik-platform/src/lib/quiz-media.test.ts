import {
  decodeQuizMediaExplanation,
  encodeQuizMediaExplanation,
} from '@/lib/quiz-media';

describe('quiz media helpers', () => {
  it('keeps plain explanations unchanged when no media exists', () => {
    expect(
      encodeQuizMediaExplanation('  Pisagor bağıntısını kullan.  ', {}),
    ).toBe('Pisagor bağıntısını kullan.');

    expect(decodeQuizMediaExplanation('Açıklama')).toEqual({
      explanation: 'Açıklama',
      option_image_urls: null,
      question_image_url: null,
      distractor_explanations: null,
    });
  });

  it('encodes and decodes question and option media', () => {
    const encoded = encodeQuizMediaExplanation('Çözüm metni', {
      option_image_urls: [' https://example.com/a.png ', '', 'https://example.com/b.webp'],
      question_image_url: ' https://example.com/q.jpg ',
    });

    expect(decodeQuizMediaExplanation(encoded)).toEqual({
      explanation: 'Çözüm metni',
      option_image_urls: [
        'https://example.com/a.png',
        'https://example.com/b.webp',
      ],
      question_image_url: 'https://example.com/q.jpg',
      distractor_explanations: null,
    });
  });

  it('encodes and decodes distractor explanations for misconception feedback', () => {
    const encoded = encodeQuizMediaExplanation('Karekök açıklaması', {
      distractor_explanations: {
        1: 'Kökleri ayrı ayrı çıkarmak yanlıştır: sqrt(a+b) != sqrt(a) + sqrt(b)',
      },
    });

    expect(decodeQuizMediaExplanation(encoded)).toEqual({
      explanation: 'Karekök açıklaması',
      option_image_urls: null,
      question_image_url: null,
      distractor_explanations: {
        1: 'Kökleri ayrı ayrı çıkarmak yanlıştır: sqrt(a+b) != sqrt(a) + sqrt(b)',
      },
    });
  });

  it('returns the original text when encoded media json is invalid', () => {
    const broken = '[[UGURHOCA_MEDIA]]{not-json}\nAçıklama';

    expect(decodeQuizMediaExplanation(broken)).toEqual({
      explanation: broken,
      option_image_urls: null,
      question_image_url: null,
      distractor_explanations: null,
    });
  });
});
