import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  fullNameSchema,
  loginSchema,
  passwordStrength,
  registerSchema,
  strongPasswordSchema,
  supportMessageSchema,
} from './auth';

describe('fullNameSchema', () => {
  it('accepts a valid Turkish full name', () => {
    const result = fullNameSchema.safeParse('Ayşe Yılmaz');
    expect(result.success).toBe(true);
  });

  it('rejects single word names', () => {
    const result = fullNameSchema.safeParse('Ayşe');
    expect(result.success).toBe(false);
  });

  it('rejects numbers/symbols', () => {
    const result = fullNameSchema.safeParse('Ayşe 123');
    expect(result.success).toBe(false);
  });
});

describe('strongPasswordSchema', () => {
  it('requires at least one letter and one digit', () => {
    expect(strongPasswordSchema.safeParse('123456').success).toBe(false);
    expect(strongPasswordSchema.safeParse('abcdef').success).toBe(false);
    expect(strongPasswordSchema.safeParse('abc123').success).toBe(true);
  });

  it('enforces minimum length of 6', () => {
    expect(strongPasswordSchema.safeParse('a1b').success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('validates ad-soyad + password together', () => {
    const res = loginSchema.safeParse({
      fullName: 'Ali Veli',
      password: '123456',
    });
    expect(res.success).toBe(true);
  });
});

describe('registerSchema', () => {
  const valid = {
    fullName: 'Ali Veli',
    email: 'ali@example.com',
    password: 'abc123',
    confirmPassword: 'abc123',
    grade: 8,
  };

  it('accepts a valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const res = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'nope1234',
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const res = registerSchema.safeParse({
      ...valid,
      email: 'not-an-email',
    });
    expect(res.success).toBe(false);
  });

  it('coerces grade from string', () => {
    const res = registerSchema.safeParse({ ...valid, grade: '9' });
    expect(res.success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  it('rejects when new equals current', () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: 'abc123',
      newPassword: 'abc123',
      confirmNewPassword: 'abc123',
    });
    expect(res.success).toBe(false);
  });

  it('accepts distinct, matching new passwords', () => {
    const res = changePasswordSchema.safeParse({
      currentPassword: 'abc123',
      newPassword: 'xyz789',
      confirmNewPassword: 'xyz789',
    });
    expect(res.success).toBe(true);
  });
});

describe('supportMessageSchema', () => {
  it('requires at least a message or an attachment', () => {
    expect(
      supportMessageSchema.safeParse({ message: '', attachmentCount: 0 })
        .success,
    ).toBe(false);
    expect(
      supportMessageSchema.safeParse({ message: 'hi', attachmentCount: 0 })
        .success,
    ).toBe(true);
    expect(
      supportMessageSchema.safeParse({ message: '', attachmentCount: 1 })
        .success,
    ).toBe(true);
  });
});

describe('passwordStrength', () => {
  it('returns 0 for empty', () => {
    expect(passwordStrength('').score).toBe(0);
  });

  it('increments with length and complexity', () => {
    expect(passwordStrength('aa').score).toBe(0);
    expect(passwordStrength('abcdef').score).toBeGreaterThanOrEqual(1);
    expect(passwordStrength('Abcdefgh1').score).toBeGreaterThanOrEqual(2);
    expect(passwordStrength('Abcdefgh1!').score).toBe(4);
  });

  it('clamps to max 4', () => {
    const { score, label } = passwordStrength('Abcdefghij1!@#');
    expect(score).toBe(4);
    expect(label).toBe('güçlü');
  });
});
