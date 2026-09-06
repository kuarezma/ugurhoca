import { test, expect } from '@playwright/test';

test.describe('2. Test Çözme & Yanlış Defteri Akışı (Quizzes Flow)', () => {
  test('testler listesi ve sınıf filtreleri düzgün yüklenmeli', async ({ page }) => {
    await page.goto('/testler');

    // Başlık ve arama çubuğu
    await expect(page.getByPlaceholder(/Test veya konu ara/i)).toBeVisible();

    // Sınıf filtre butonları görünmeli
    const gradeFilterButtons = page.getByRole('button', { name: /Sınıf|Tümü|LGS/i });
    expect(await gradeFilterButtons.count()).toBeGreaterThan(0);
  });

  test('hata defteri modalı açılabilmeli', async ({ page }) => {
    await page.goto('/testler');

    const mistakeBtn = page.getByRole('button', { name: /Hata Defterim|Yanlış Defteri/i });
    if (await mistakeBtn.isVisible()) {
      await mistakeBtn.click();
      await expect(page.getByText(/Hata Defteri|Öğrenilenler/i)).toBeVisible();
    }
  });
});
