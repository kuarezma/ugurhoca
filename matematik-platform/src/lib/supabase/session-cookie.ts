/** Supabase SSR'nin varsayılan oturum çerezi (parçalara bölünebilir). */
export const getSupabaseSessionCookieName = (url: string) => {
  try {
    return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
  } catch {
    return null;
  }
};

export const hasSupabaseSessionCookie = (
  cookies: { name: string }[],
  url: string,
) => {
  const name = getSupabaseSessionCookieName(url);
  return Boolean(name && cookies.some((cookie) => cookie.name === name || cookie.name.startsWith(`${name}.`)));
};
