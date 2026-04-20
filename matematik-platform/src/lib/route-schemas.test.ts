import { quizImportSchema, supportMessageSchema } from '@/lib/route-schemas';

describe('route-schemas', () => {
  it('rejects an empty support message without attachments', () => {
    const parsed = supportMessageSchema.safeParse({
      attachments: [],
      sender_id: 'student-1',
      text: '',
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe('Mesaj içeriği eksik.');
  });

  it('accepts a valid quiz import payload', () => {
    const parsed = quizImportSchema.safeParse({
      meta: {
        difficulty: 'Kolay',
        grade: 8,
        time_limit: 20,
        title: 'Cebir Testi',
      },
      questions: [
        {
          correct_index: 1,
          option_image_urls: [
            '',
            'https://example.com/option-b.png',
            '',
            '',
          ],
          options: ['1', '2', '3', '4'],
          question: '1 + 1 kaç eder?',
          question_image_url: 'https://example.com/question.png',
        },
      ],
    });

    expect(parsed.success).toBe(true);
  });
});
