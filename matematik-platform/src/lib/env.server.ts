import 'server-only';

const readEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
};

const readOptionalEnv = (name: string) => process.env[name] || '';

export const hasSupabasePublicEnv = () =>
  readOptionalEnv('NEXT_PUBLIC_SUPABASE_URL').length > 0 &&
  readOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY').length > 0;

export const getSupabasePublicEnv = () => ({
  url: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
});

export const getSupabaseServiceEnv = () => ({
  ...getSupabasePublicEnv(),
  serviceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
});

export const getResendApiKey = () => process.env.RESEND_API_KEY;
