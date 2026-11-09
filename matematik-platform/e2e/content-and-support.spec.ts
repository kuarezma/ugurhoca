import { test, expect, type Page } from '@playwright/test';

const TEST_STUDENT_USER = {
  id: '00000000-0000-4000-8000-000000000103',
  email: 'ogrenci.destek@ugurhoca.test',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'E2E Öğrenci', grade: 8 },
  created_at: '2026-11-01T10:00:00.000Z',
};

async function seedStudentAuthForSupport(page: Page) {
  await page.context().addCookies([
    {
      name: 'ugurhoca_access_token',
      value: 'e2e-student-token',
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.addInitScript((user) => {
    const now = Date.now();
    const session = {
      access_token: 'e2e-student-token',
      refresh_token: 'e2e-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(now / 1000) + 3600,
      token_type: 'bearer',
      user,
    };

    const g = globalThis as typeof globalThis & {
      __ugurhoca_auth_store__?: Record<string, unknown>;
    };

    g.__ugurhoca_auth_store__ = {
      authSubscriptionInitialized: true,
      cachedSession: session,
      cachedSessionExpiresAt: now + 3600_000,
      inflightProfileLookup: null,
      inflightSessionLookup: null,
      profileCache: {
        data: {
          avatar_id: 'owl',
          email: user.email,
          full_name: 'E2E Öğrenci',
          grade: 8,
          id: user.id,
          role: 'student',
          status: 'approved',
        },
        expiresAt: now + 3600_000,
        userId: user.id,
      },
    };

    window.localStorage.setItem('ugur_welcome_tour_v1_seen', '1');
  }, TEST_STUDENT_USER);

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_STUDENT_USER),
    });
  });

  await page.route('**/rest/v1/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/support-message', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg-e2e-1',
        title: "Uğur Hoca'ya Mesajınız",
        message: 'Hocam 3. soruyu anlatır mısınız?',
        is_read: true,
        type: 'sent-message',
        user_id: TEST_STUDENT_USER.id,
        created_at: new Date().toISOString(),
      }),
    });
  });
}

test.describe('4. İçerik Arama/Filtreleme, Destek Sohbeti ve Yasal Sayfalar', () => {
  test('/icerikler sayfasında arama ve filtre kontrolleri çalışır', async ({
    page,
  }) => {
    await page.route('**/rest/v1/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify([
          {
            id: 'doc-e2e-1',
            title: '8. Sınıf Çarpanlar ve Katlar Ders Notu',
            description: 'EBOB ve EKOK konu özeti.',
            grade: 8,
            type: 'ders_notu',
            file_url: 'https://example.com/ebob-ekok.pdf',
            downloads: 12,
            likes: 4,
            created_at: '2026-11-01T10:00:00.000Z',
          },
        ]),
      });
    });

    await page.goto('/icerikler');

    const mobileFilterToggle = page.getByRole('button', {
      name: /Filtre ve Arama Seçenekleri/i,
    });
    if (await mobileFilterToggle.isVisible()) {
      await mobileFilterToggle.click();
    }

    const searchInput = page.getByPlaceholder(/İçerik ara/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Çarpanlar');
    await expect(searchInput).toHaveValue('Çarpanlar');
  });

  test('destek sohbetinde PDF eki reddedilir ve metin mesajı gönderilir', async ({
    page,
  }) => {
    await seedStudentAuthForSupport(page);

    await page.goto('/iletisim');

    const acceptCookiesButton = page.getByRole('button', {
      name: /Tümünü kabul et/i,
    });
    if (await acceptCookiesButton.isVisible()) {
      await acceptCookiesButton.click();
    }

    const chatButton = page.getByRole('button', {
      name: /Uğur Hoca'ya mesaj yaz/i,
    });
    await expect(chatButton).toBeVisible();
    await chatButton.click();

    const chatDialog = page.getByRole('dialog', {
      name: /Uğur Hoca ile Sohbet/i,
    });
    await expect(chatDialog).toBeVisible();

    const fileInput = chatDialog.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'odev.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 dummy pdf content'),
    });

    await expect(
      chatDialog.getByText(/Sadece JPG, PNG veya WebP görsel eklenebilir/i),
    ).toBeVisible();

    const messageInput = chatDialog.getByPlaceholder(
      /Uğur Hoca'ya mesaj yaz veya soru sor/i,
    );
    await messageInput.fill('Hocam 3. soruyu anlatır mısınız?');
    await chatDialog
      .getByRole('button', { name: 'Gönder', exact: true })
      .click();

    await expect(
      chatDialog.getByText('Hocam 3. soruyu anlatır mısınız?'),
    ).toBeVisible();
  });

  test('ana sayfa Nasıl Çalışır bölümü ile /cerez ve /iletisim sayfaları erişilebilirdir', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /Platform Nasıl Çalışır\?/i }),
    ).toBeVisible();

    await page.goto('/cerez');
    await expect(
      page.getByRole('heading', { name: /Çerez Politikası/i }),
    ).toBeVisible();

    await page.goto('/iletisim');
    await expect(
      page.getByRole('heading', { name: /İletişim/i }),
    ).toBeVisible();
  });
});
