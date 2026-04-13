import { z } from 'zod';

const difficultySchema = z.enum(['Kolay', 'Orta', 'Zor']);

export const chatRegisterSchema = z.object({
  full_name: z.string().trim().min(1, 'İsim soyisim girin.'),
  grade: z.number().int().min(1, 'Sınıf 1-12 arasında olmalıdır.').max(12),
  school_number: z.string().trim().min(1, 'Okul numarası girin.'),
});

export const quizImportSchema = z.object({
  meta: z.object({
    description: z.string().optional().default(''),
    difficulty: difficultySchema,
    grade: z.number().int().min(5).max(12),
    time_limit: z.number().int().min(1).max(180),
    title: z.string().trim().min(1, 'Test bilgileri eksik.'),
  }),
  questions: z
    .array(
      z.object({
        correct_index: z.number().int().min(0).max(3),
        explanation: z.string().optional().default(''),
        options: z.array(z.string().trim().min(1)).length(4),
        question: z.string().trim().min(1),
      }),
    )
    .min(1, 'En az 1 geçerli soru gereklidir.')
    .max(30, 'Maksimum 30 soru yüklenebilir.'),
});

export const supportAttachmentSchema = z.object({
  kind: z.enum(['image', 'file']),
  name: z.string().trim().min(1),
  url: z.string().trim().url(),
});

export const supportMessageSchema = z
  .object({
    attachments: z.array(supportAttachmentSchema).default([]),
    sender_email: z.string().trim().email().or(z.literal('')).optional(),
    sender_id: z.string().trim().min(1),
    sender_name: z.string().trim().optional(),
    text: z.string().trim().default(''),
  })
  .refine(
    (payload) => payload.text.length > 0 || payload.attachments.length > 0,
    {
      message: 'Mesaj içeriği eksik.',
      path: ['text'],
    },
  );
