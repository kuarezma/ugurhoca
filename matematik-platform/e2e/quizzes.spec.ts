import { test, expect, type Page } from '@playwright/test';

const TEST_STUDENT_USER = {
  id: '00000000-0000-4000-8000-000000000101',
  email: 'ogrenci.e2e@ugurhoca.test',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'E2E Öğrenci', name: 'E2E Öğrenci', grade: 8 },
  created_at: '2026-11-01T10:00:00.000Z',
};

async function seedStudentAuthAndQuizRoutes(page: Page) {
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

    const cachedSessionEntry = {
      session,
      expiresAt: now + 3600_000,
    };

    const profileCacheEntry = {
      result: {
        profile: {
          avatar_id: 'owl',
          email: user.email,
          grade: 8,
          id: user.id,
          isAdmin: false,
          name: 'E2E Öğrenci',
        },
        session,
      },
      expiresAt: now + 3600_000,
      userId: user.id,
    };

    const g = globalThis as typeof globalThis & {
      __ugurhoca_auth_store__?: Record<string, unknown>;
    };

    g.__ugurhoca_auth_store__ = {
      get cachedSession() {
        return cachedSessionEntry;
      },
      set cachedSession(_v) {},
      inFlightProfilePromise: null,
      inFlightSessionPromise: null,
      get profileCache() {
        return profileCacheEntry;
      },
      set profileCache(_v) {},
    };

    window.localStorage.setItem('ugur_welcome_tour_v1_seen', '1');
    window.localStorage.setItem('ugurhoca:cookie-consent', 'accepted');
  }, TEST_STUDENT_USER);

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_STUDENT_USER),
    });
  });

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: TEST_STUDENT_USER.id,
        email: TEST_STUDENT_USER.email,
        name: 'E2E Öğrenci',
        grade: 8,
        isAdmin: false,
      }),
    });
  });

  await page.route('**/rest/v1/quizzes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'quiz-e2e-1',
          title: 'Üslü İfadeler Tarama Testi',
          description: '8. sınıf üslü ifadeler kazanım değerlendirme testi.',
          grade: 8,
          time_limit: 15,
          difficulty: 'Orta',
          is_active: true,
          created_at: '2026-11-01T10:00:00.000Z',
          updated_at: '2026-11-01T10:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/quiz_questions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'q-1',
          quiz_id: 'quiz-e2e-1',
          question: '2^3 ifadesinin değeri kaçtır?',
          options: ['6', '8', '9', '12'],
          correct_index: 1,
          question_order: 1,
          explanation: '2.2.2 = 8 olur.',
          created_at: '2026-11-01T10:00:00.000Z',
        },
        {
          id: 'q-2',
          quiz_id: 'quiz-e2e-1',
          question: '5^0 ifadesinin değeri kaçtır?',
          options: ['0', '1', '5', 'Tanımsız'],
          correct_index: 1,
          question_order: 2,
          explanation: 'Sıfırdan farklı her sayının 0. kuvveti 1 dir.',
          created_at: '2026-11-01T10:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/quiz_results**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'res-e2e-1',
            quiz_id: 'quiz-e2e-1',
            user_id: TEST_STUDENT_USER.id,
            score: 2,
            total_questions: 2,
            completed_at: new Date().toISOString(),
          },
        ]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/rest/v1/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('2. Test (Quiz) Çözme Akışı', () => {
  test('giriş yapmamış kullanıcı /testler sayfasından /giris sayfasına yönlendirilir', async ({
    page,
  }) => {
    await page.goto('/testler');

    await expect(page).toHaveURL(/\/giris\?redirect=%2Ftestler/);
    await expect(
      page.getByRole('button', { name: /Giriş Yap/i }),
    ).toBeVisible();
  });

  test('giriş yapmamış kullanıcı /ilerleme sayfasından /giris sayfasına yönlendirilir', async ({
    page,
  }) => {
    await page.goto('/ilerleme');

    await expect(page).toHaveURL(/\/giris\?redirect=%2Filerleme/);
  });

  test('öğrenci testi başlatır, soruları işaretler, bitirir ve sonuç ekranını görür', async ({
    page,
  }) => {
    await seedStudentAuthAndQuizRoutes(page);

    await page.goto('/testler');

    await expect(page.getByText('Üslü İfadeler Tarama Testi')).toBeVisible();

    await page.getByRole('button', { name: /Teste Başla/i }).click();

    await expect(page.getByText('2^3 ifadesinin değeri kaçtır?')).toBeVisible();

    const firstQuizOptions = page.getByRole('radio');
    await firstQuizOptions.nth(1).click();

    await page.getByRole('button', { name: 'Sonraki soru' }).click();

    await expect(page.getByText('5^0 ifadesinin değeri kaçtır?')).toBeVisible();

    const secondQuizOptions = page.getByRole('radio');
    await secondQuizOptions.nth(1).click();

    await page.getByRole('button', { name: 'Testi bitir' }).click();

    await expect(page.getByText('Test Tamamlandı!')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Sınav Analizi/i }),
    ).toBeVisible();
  });
});
