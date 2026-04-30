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
    });
  });

  it('returns the original text when encoded media json is invalid', () => {
    const broken = '[[UGURHOCA_MEDIA]]{not-json}\nAçıklama';

    expect(decodeQuizMediaExplanation(broken)).toEqual({
      explanation: broken,
      option_image_urls: null,
      question_image_url: null,
    });
  });
});
