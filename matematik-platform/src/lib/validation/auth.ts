import { z } from 'zod';

const turkishNamePattern = /^[A-Za-zÇĞİÖŞÜçğıöşü\s-']+$/;

export const fullNameSchema = z
  .string({ message: 'Ad ve soyad gerekli.' })
  .trim()
  .min(3, 'Ad soyad en az 3 karakter olmalı.')
  .max(80, 'Ad soyad en fazla 80 karakter olabilir.')
  .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
    message: 'Lütfen ad ve soyadı birlikte girin (örn: Ahmet Yılmaz).',
  })
  .refine((value) => turkishNamePattern.test(value), {
    message: 'Ad ve soyad yalnızca harf, boşluk ve kesme işareti içerebilir.',
  });

export const passwordSchema = z
  .string({ message: 'Şifre gerekli.' })
  .min(6, 'Şifre en az 6 karakter olmalı.')
  .max(100, 'Şifre en fazla 100 karakter olabilir.');

export const strongPasswordSchema = passwordSchema
  .refine((value) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(value), {
    message: 'Şifre en az bir harf içermeli.',
  })
  .refine((value) => /\d/.test(value), {
    message: 'Şifre en az bir rakam içermeli.',
  });

export const emailSchema = z
  .string({ message: 'E-posta gerekli.' })
  .trim()
  .email('Geçerli bir e-posta girin.');

export const gradeSchema = z.coerce
  .number({ message: 'Sınıf seçimi gerekli.' })
  .int('Sınıf tam sayı olmalı.')
  .min(5, 'Sınıf 5 ile 12 arasında olmalı.')
  .max(12, 'Sınıf 5 ile 12 arasında olmalı.');

export const loginSchema = z.object({
  fullName: fullNameSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string({ message: 'Şifre tekrarı gerekli.' }),
    grade: gradeSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Şifreler eşleşmiyor.',
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: strongPasswordSchema,
    confirmNewPassword: z.string({ message: 'Yeni şifre tekrarı gerekli.' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Yeni şifreler eşleşmiyor.',
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'Yeni şifre mevcut şifreden farklı olmalı.',
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const supportMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir.')
    .optional()
    .default(''),
  attachmentCount: z.number().int().min(0).max(5).default(0),
}).refine(
  (data) => data.message.trim().length > 0 || data.attachmentCount > 0,
  {
    path: ['message'],
    message: 'Mesaj yaz ya da en az bir dosya ekle.',
  },
);

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'çok zayıf' | 'zayıf' | 'orta' | 'iyi' | 'güçlü';
} {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-ZÇĞİÖŞÜ]/.test(password) && /[a-zçğıöşü]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(password)) score += 1;

  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ['çok zayıf', 'zayıf', 'orta', 'iyi', 'güçlü'] as const;
  return { score: clamped, label: labels[clamped] };
}
