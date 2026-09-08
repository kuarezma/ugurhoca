import { test, expect } from '@playwright/test';

test.describe('5. Canlı Ders & Matematik Araçları Akışı', () => {
  test('anonim kullanıcıyı giriş sayfasına yönlendirir', async ({ page }) => {
    await page.goto('/canli-ders');

    await expect(page).toHaveURL(/\/giris$/);
    await expect(page.getByRole('heading', { name: /Giriş yap/i })).toBeVisible();
  });

  test('matematik araçları hub sayfasına erişim ve hesaplayıcılar', async ({ page }) => {
    await page.goto('/araclar');

    await expect(page.getByText(/Matematik Araçları|Hesaplayıcılar/i).first()).toBeVisible();
    // LGS ve YKS hesaplayıcı kartları
    const lgsCard = page.getByRole('link', {
      name: /MEB LGS Puan & Yüzdelik Dilim Robotu/i,
    });
    await expect(lgsCard).toBeVisible();
  });
});
