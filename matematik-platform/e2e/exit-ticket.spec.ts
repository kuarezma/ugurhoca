import { test, expect } from '@playwright/test';

test.describe('3. Çıkış Bileti (Exit Ticket) Sınıf Değerlendirme Akışı', () => {
  test('öğrenci giriş ekranı 6 haneli PIN ve ad alanı sunmalı', async ({ page }) => {
    await page.goto('/cikis-bileti');

    await expect(page.getByText('Çıkış Bileti Öğrenci Girişi')).toBeVisible();
    await expect(page.locator('#ticket-pin-input')).toBeVisible();
    await expect(page.locator('#student-name-input')).toBeVisible();
    await expect(page.getByRole('button', { name: /Derse Bağlan/i })).toBeVisible();
  });

  test('öğretmen / akıllı tahta sekmesine geçilebilmeli ve hızlı demo oturumu açılabilmeli', async ({ page }) => {
    await page.goto('/cikis-bileti');

    // Öğretmen sekmesine tıkla
    const teacherTab = page.getByRole('button', { name: /Öğretmen \/ Akıllı Tahta/i });
    await teacherTab.click();

    // Hızlı Demo butonunu gör ve tıkla
    const quickDemoBtn = page.getByRole('button', { name: /Hızlı Demo/i });
    await expect(quickDemoBtn).toBeVisible();
    await quickDemoBtn.click();

    // Akıllı tahta sunum ekranında PIN ve soru dağılım paneli görünmeli
    await expect(page.getByText(/Öğrenci Katılım Kodu/i)).toBeVisible();
    await expect(page.getByText(/Dağılımı Göster|Dağılımı Gizle/i)).toBeVisible();
  });
});
