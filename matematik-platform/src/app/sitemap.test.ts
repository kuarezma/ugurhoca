import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('includes only indexable public routes', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://ugurhoca.com/');
    expect(urls).toContain('https://ugurhoca.com/testler');
    expect(urls).not.toContain('https://ugurhoca.com/giris');
    expect(urls).not.toContain('https://ugurhoca.com/kayit');
    expect(urls).not.toContain('https://ugurhoca.com/odevler');
    expect(urls).not.toContain('https://ugurhoca.com/ilerleme');
  });
});
