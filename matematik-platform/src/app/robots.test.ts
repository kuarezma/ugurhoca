import robots from '@/app/robots';

describe('robots', () => {
  it('blocks admin, api and login-required routes', () => {
    const { rules } = robots();
    const disallow = Array.isArray(rules) ? [] : (rules.disallow ?? []);

    expect(disallow).toContain('/admin/');
    expect(disallow).toContain('/api/');
    expect(disallow).toContain('/profil');
    expect(disallow).toContain('/odevler');
    expect(disallow).toContain('/ilerleme');
    expect(disallow).toContain('/canli-ders');
  });

  it('keeps public routes crawlable', () => {
    const { rules } = robots();
    const disallow = Array.isArray(rules) ? [] : (rules.disallow ?? []);

    expect(disallow).not.toContain('/testler');
    expect(disallow).not.toContain('/icerikler');
    expect(disallow).not.toContain('/programlar');
  });
});
