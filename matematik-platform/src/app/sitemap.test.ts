import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('includes only public, indexable routes', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://ugurhoca.com/');
    expect(urls).toContain('https://ugurhoca.com/cikis-bileti');
    expect(urls).not.toContain('https://ugurhoca.com/giris');
    expect(urls).not.toContain('https://ugurhoca.com/kayit');
    expect(urls).not.toContain('https://ugurhoca.com/odevler');
    expect(urls).not.toContain('https://ugurhoca.com/ilerleme');
  });

  it('excludes routes that require a session — a sitemap entry must not point at a redirecting URL', () => {
    // /testler, /oyunlar, /meydan-okuma, /odak-pomodoro middleware'de anonim
    // ziyaretçiyi /giris'e yönlendiriyor (bkz. src/middleware.ts). Google bu
    // URL'leri indekslemeye çalışırsa her seferinde bir yönlendirmeyle
    // karşılaşır; sitemap'te hiç görünmemeliler.
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain('https://ugurhoca.com/testler');
    expect(urls).not.toContain('https://ugurhoca.com/oyunlar');
    expect(urls).not.toContain('https://ugurhoca.com/meydan-okuma');
    expect(urls).not.toContain('https://ugurhoca.com/odak-pomodoro');
  });
});
