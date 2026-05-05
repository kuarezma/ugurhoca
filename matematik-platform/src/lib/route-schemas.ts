import { z } from 'zod';

const difficultySchema = z.enum(['Kolay', 'Orta', 'Zor']);

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
        option_image_urls: z
          .array(z.string().trim().url().or(z.literal('')))
          .length(4)
          .optional(),
        options: z.array(z.string().trim().min(1)).length(4),
        question: z.string().trim().min(1),
        question_image_url: z.string().trim().url().optional(),
      }),
    )
    .min(1, 'En az 1 geçerli soru gereklidir.')
    .max(30, 'Maksimum 30 soru yüklenebilir.'),
});

export const supportAttachmentSchema = z.object({
  kind: z.literal('image'),
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

export const adminMessageSchema = z
  .object({
    image_url: z.string().trim().url().nullable().optional().or(z.literal('')),
    message: z.string().trim().nullable().optional().transform((value) => value ?? ''),
    sender_id: z.string().trim().nullable().optional(),
    sender_name: z.string().trim().nullable().optional(),
    student_id: z.string().trim().min(1, 'Öğrenci seçimi zorunludur.'),
    student_name: z.string().trim().nullable().optional(),
    title: z.string().trim().nullable().optional().transform((value) => value ?? ''),
  })
  .refine(
    (payload) =>
      payload.message.length > 0 ||
      payload.title.length > 0 ||
      Boolean(payload.image_url?.trim()),
    {
      message: 'Mesaj, başlık veya görsel zorunludur.',
      path: ['message'],
    },
  );

const contentDocumentSchema = z
  .object({
    title: z.string().trim().min(1, 'Başlık zorunludur.'),
    type: z.string().trim().min(1, 'Kategori zorunludur.'),
  })
  .passthrough();

export const contentDocumentCreateSchema = z.object({
  document: contentDocumentSchema,
});

const adminAnnouncementPayloadSchema = z.object({
  content: z.string().trim().nullable().optional(),
  image_url: z.string().trim().url().optional(),
  image_urls: z.array(z.string().trim().url()).default([]),
  link_url: z.string().trim().url().optional(),
  title: z.string().trim().min(1, 'Duyuru başlığı gerekli.'),
});

export const adminAnnouncementCreateSchema = z.object({
  announcement: adminAnnouncementPayloadSchema,
  recipient_user_ids: z.array(z.string().uuid()).default([]),
});

export const adminAnnouncementUpdateSchema = z.object({
  announcement_id: z.string().uuid(),
  updates: adminAnnouncementPayloadSchema.partial().refine(
    (payload) => Object.keys(payload).length > 0,
    { message: 'Güncellenecek en az bir alan gerekli.' },
  ),
});

export const adminAnnouncementDeleteSchema = z.object({
  announcement_id: z.string().uuid(),
});
