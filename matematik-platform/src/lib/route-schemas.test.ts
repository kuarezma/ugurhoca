import {
  adminAnnouncementUpdateSchema,
  adminMessageSchema,
  adminResetPasswordSchema,
  contentDocumentCreateSchema,
  quizImportSchema,
  supportMessageSchema,
} from '@/lib/route-schemas';

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

  it('accepts image and audio attachments and rejects file or pdf attachment', () => {
    const validImage = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'image',
          name: 'soru.png',
          url: 'https://example.com/soru.png',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(validImage.success).toBe(true);

    const validAudio = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'audio',
          name: 'ses.webm',
          url: 'https://example.com/ses.webm',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(validAudio.success).toBe(true);

    const invalidFile = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'file',
          name: 'odev.pdf',
          url: 'https://example.com/odev.pdf',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(invalidFile.success).toBe(false);

    const invalidImageWithPdfName = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'image',
          name: 'odev.pdf',
          url: 'https://example.com/odev.pdf',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(invalidImageWithPdfName.success).toBe(false);

    const invalidGif = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'image',
          name: 'animasyon.gif',
          url: 'https://example.com/animasyon.gif',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(invalidGif.success).toBe(false);

    const invalidSvg = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'image',
          name: 'resim.svg',
          url: 'https://example.com/resim.svg',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(invalidSvg.success).toBe(false);

    const validJpg = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'image',
          name: 'soru.jpg',
          url: 'https://example.com/soru.jpg?token=123',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(validJpg.success).toBe(true);

    const invalidVideo = supportMessageSchema.safeParse({
      attachments: [
        {
          kind: 'video',
          name: 'video.mp4',
          url: 'https://example.com/video.mp4',
        },
      ],
      sender_id: 'student-1',
      text: '',
    });
    expect(invalidVideo.success).toBe(false);
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

  it('rejects admin message payload without text/title/image', () => {
    const parsed = adminMessageSchema.safeParse({
      message: '',
      student_id: 'student-1',
      title: '',
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe('Mesaj, başlık veya görsel zorunludur.');
  });

  it('accepts admin message payload when image_url is null', () => {
    const parsed = adminMessageSchema.safeParse({
      image_url: null,
      message: 'Merhaba',
      student_id: 'student-1',
      title: '',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts nullable optional text fields in admin message payload', () => {
    const parsed = adminMessageSchema.safeParse({
      image_url: null,
      message: 'Merhaba',
      sender_name: null,
      student_id: 'student-1',
      student_name: null,
      title: null,
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects content document payload without required fields', () => {
    const parsed = contentDocumentCreateSchema.safeParse({
      document: {
        title: '',
        type: '',
      },
    });

    expect(parsed.success).toBe(false);
  });

  it('validates adminAnnouncementUpdateSchema', () => {
    const valid = adminAnnouncementUpdateSchema.safeParse({
      announcement_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      updates: {
        title: 'Güncel Başlık',
      },
    });
    expect(valid.success).toBe(true);
  });

  describe('adminResetPasswordSchema', () => {
    it('rejects non-uuid student_id', () => {
      const parsed = adminResetPasswordSchema.safeParse({
        student_id: 'not-a-uuid',
        new_password: 'ValidPassword123',
      });
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe('Geçerli bir öğrenci ID giriniz.');
    });

    it('rejects passwords shorter than 8 characters', () => {
      const parsed = adminResetPasswordSchema.safeParse({
        student_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        new_password: 'Short1',
      });
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe('Şifre en az 8 karakter olmalıdır.');
    });

    it('rejects passwords without letters', () => {
      const parsed = adminResetPasswordSchema.safeParse({
        student_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        new_password: '12345678',
      });
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe('Şifre en az bir harf içermelidir.');
    });

    it('rejects passwords without numbers', () => {
      const parsed = adminResetPasswordSchema.safeParse({
        student_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        new_password: 'abcdefgh',
      });
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe('Şifre en az bir rakam içermelidir.');
    });

    it('accepts valid UUID and strong password', () => {
      const parsed = adminResetPasswordSchema.safeParse({
        student_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        new_password: 'ValidPassword123',
      });
      expect(parsed.success).toBe(true);
    });
  });
});
