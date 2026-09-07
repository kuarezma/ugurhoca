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
    expect(disallow).toContain('/testler');
    expect(disallow).toContain('/oyunlar');
    expect(disallow).toContain('/meydan-okuma');
    expect(disallow).toContain('/odak-pomodoro');
    expect(disallow).toContain('/sifremi-unuttum');
    expect(disallow).toContain('/sifre-sifirla');
  });

  it('keeps public routes crawlable', () => {
    const { rules } = robots();
    const disallow = Array.isArray(rules) ? [] : (rules.disallow ?? []);

    expect(disallow).not.toContain('/icerikler');
    expect(disallow).not.toContain('/programlar');
    expect(disallow).not.toContain('/araclar');
    expect(disallow).not.toContain('/cikis-bileti');
  });
});
