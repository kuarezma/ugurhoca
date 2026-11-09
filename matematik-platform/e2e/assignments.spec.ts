import { test, expect, type Page } from '@playwright/test';

const TEST_STUDENT_USER = {
  id: '00000000-0000-4000-8000-000000000102',
  email: 'ogrenci.odev@ugurhoca.test',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'E2E Öğrenci', grade: 8 },
  created_at: '2026-11-01T10:00:00.000Z',
};

async function seedStudentAuthAndAssignmentRoutes(page: Page) {
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

  await page.route('**/rest/v1/assignments**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'assign-e2e-1',
          title: 'Kareköklü İfadeler Çalışma Kağıdı',
          description: 'Çözümlerinizi fotoğraf veya PDF olarak yükleyin.',
          grade: 8,
          due_date: '2027-01-15T20:00:00.000Z',
          file_url: null,
          target_student_ids: null,
          created_at: '2026-11-01T10:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/assignment_submissions**', async (route) => {
    if (route.request().method() === 'POST') {
      const submittedRow = {
        id: 'sub-e2e-1',
        assignment_id: 'assign-e2e-1',
        student_id: TEST_STUDENT_USER.id,
        status: 'submitted',
        comment: 'Tüm soruları çözdüm hocam.',
        file_url: `${TEST_STUDENT_USER.id}/cozum.png`,
        score: null,
        feedback: null,
        submitted_at: new Date().toISOString(),
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(submittedRow),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/storage/v1/object/submissions/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        Key: `submissions/${TEST_STUDENT_USER.id}/cozum.png`,
      }),
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

test.describe('3. Ödev Teslim Akışı', () => {
  test('giriş yapmamış kullanıcı /odevler sayfasından /giris sayfasına yönlendirilir', async ({
    page,
  }) => {
    await page.goto('/odevler');

    await expect(page).toHaveURL(/\/giris\?redirect=%2Fodevler/);
    await expect(
      page.getByRole('button', { name: /Giriş Yap/i }),
    ).toBeVisible();
  });

  test('öğrenci ödev detayından dosya ve açıklama ile ödev teslim eder', async ({
    page,
  }) => {
    await seedStudentAuthAndAssignmentRoutes(page);

    await page.goto('/odevler');

    await expect(
      page.getByText('Kareköklü İfadeler Çalışma Kağıdı'),
    ).toBeVisible();

    await page.getByRole('button', { name: /Ödev teslim et/i }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal
      .getByPlaceholder(
        /Çözüm adımlarını, zorlandığın soruyu veya öğretmene iletmek istediğin notu yaz/i,
      )
      .fill('Tüm soruları çözdüm hocam.');

    const fileInput = modal.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'cozum.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });

    await expect(modal.getByText('cozum.png')).toBeVisible();

    await modal.getByRole('button', { name: 'Gönder', exact: true }).click();

    await expect(page.getByText('Teslim edildi')).toBeVisible();
  });
});
