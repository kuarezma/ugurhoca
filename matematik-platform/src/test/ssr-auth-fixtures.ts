import { vi } from 'vitest';
import type { AuthSnapshot } from '@/lib/auth-snapshot';

/**
 * SSR yükleyici testleri için ortak sahte Supabase istemcisi: her sorgu
 * zincirindeki çağrıları kaydeder ve await edildiğinde boş sonuç döner.
 * Testler, sorgu filtrelerine hangi kullanıcı kimliğinin girdiğini buradan
 * doğrular.
 */
export type RecordedCall = { table: string; method: string; args: unknown[] };

export const createRecordingSupabase = () => {
  const calls: RecordedCall[] = [];

  const from = vi.fn((table: string) => {
    calls.push({ table, method: 'from', args: [table] });
    const builder: object = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'then') {
            return (resolve: (value: unknown) => void) =>
              resolve({ data: null, error: null });
          }
          return (...args: unknown[]) => {
            calls.push({ table, method: String(prop), args });
            return builder;
          };
        },
      },
    );
    return builder;
  });

  return { calls, client: { from } };
};

export const VICTIM_SNAPSHOT: AuthSnapshot = {
  email: 'kurban@example.com',
  grade: 12,
  id: '11111111-1111-4111-8111-111111111111',
  isAdmin: true,
  name: 'Kurban',
};

export const VERIFIED_ATTACKER: AuthSnapshot = {
  email: 'saldirgan@example.com',
  grade: 7,
  id: '22222222-2222-4222-8222-222222222222',
  isAdmin: false,
  name: 'Saldırgan',
};

export const serializedCalls = (calls: RecordedCall[]) => JSON.stringify(calls);
