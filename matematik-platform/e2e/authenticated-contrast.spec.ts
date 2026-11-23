import os from 'node:os';
import path from 'node:path';
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import {
  createBrowserContrastCollectorScript,
  formatContrastValidation,
  summarizeContrastReport,
  validateContrastReport,
  writeContrastReport,
} from '../scripts/contrast-report.mjs';

type Theme = 'light' | 'dark';

type ContrastMeasurement = {
  text: {
    checked: number;
    violations: unknown[];
    indeterminate: unknown[];
  };
  borders: {
    checked: number;
    violations: unknown[];
    indeterminate: unknown[];
  };
};

type ContrastEntry = {
  route: string;
  theme: Theme;
  status: 'measured' | 'skipped' | 'failed';
  reason?: string;
  skipAllowed?: boolean;
  requestedUrl: string;
  finalUrl?: string;
  navigationStatus?: number;
  measurement?: ContrastMeasurement;
};

const THEMES: Theme[] = ['light', 'dark'];
const THEME_STORAGE_KEY = 'ugurhoca-theme';
const THEME_LIGHT_MIGRATION_KEY = 'ugurhoca-theme-migrated-light-v1';

const STUDENT_USER = {
  id: '00000000-0000-4000-8000-000000000105',
  email: 'ogrenci.e2e@ugurhoca.test',
  name: 'E2E Öğrenci',
  grade: 8,
  isAdmin: false,
};

const STUDENT_ROUTES = [
  '/profil',
  '/testler',
  '/odevler',
  '/ilerleme',
  '/oyunlar',
] as const;

async function seedStudentContext(
  context: BrowserContext,
  baseURL: string,
  theme: Theme,
) {
  const hostname = new URL(baseURL).hostname;
  const accessToken = 'e2e-student-token';

  await context.addCookies([
    {
      name: 'ugurhoca_access_token',
      value: accessToken,
      domain: hostname,
      path: '/',
    },
  ]);

  await context.addInitScript({
    content: createBrowserContrastCollectorScript(),
  });

  await context.addInitScript(
    ({
      fixtureUser,
      token,
      storageKey,
      migrationKey,
      nextTheme,
    }: {
      fixtureUser: typeof STUDENT_USER;
      token: string;
      storageKey: string;
      migrationKey: string;
      nextTheme: Theme;
    }) => {
      const now = Date.now();
      const authUser = {
        id: fixtureUser.id,
        email: fixtureUser.email,
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          full_name: fixtureUser.name,
          name: fixtureUser.name,
          grade: fixtureUser.grade,
        },
        created_at: '2026-11-01T10:00:00.000Z',
      };

      const session = {
        access_token: token,
        refresh_token: 'e2e-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(now / 1000) + 3600,
        token_type: 'bearer',
        user: authUser,
      };

      const cachedSessionEntry = {
        session,
        expiresAt: now + 3600_000,
      };

      const profileCacheEntry = {
        result: {
          profile: {
            avatar_id: 'owl',
            email: fixtureUser.email,
            grade: fixtureUser.grade,
            id: fixtureUser.id,
            isAdmin: false,
            name: fixtureUser.name,
          },
          session,
        },
        expiresAt: now + 3600_000,
        userId: fixtureUser.id,
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

      try {
        window.localStorage.setItem('ugur_welcome_tour_v1_seen', '1');
        window.localStorage.setItem('ugurhoca:cookie-consent', 'accepted');
        window.localStorage.setItem(migrationKey, '1');
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {}

      const applyTheme = () => {
        if (document.documentElement) {
          document.documentElement.dataset.theme = nextTheme;
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(nextTheme);
        }
      };

      if (document.documentElement) {
        applyTheme();
      } else {
        document.addEventListener('DOMContentLoaded', applyTheme, {
          once: true,
        });
      }
    },
    {
      fixtureUser: STUDENT_USER,
      token: accessToken,
      storageKey: THEME_STORAGE_KEY,
      migrationKey: THEME_LIGHT_MIGRATION_KEY,
      nextTheme: theme,
    },
  );
}

async function registerStudentApiMocks(page: Page) {
  const isSingleObjectRequest = (acceptHeader?: string) =>
    (acceptHeader ?? '').includes('application/vnd.pgrst.object+json');

  // 1) Genel fallback'ler (Playwright son eklenen route'u önce eşleştirir)
  await page.route('**/rest/v1/**', async (route) => {
    const single = isSingleObjectRequest(route.request().headers()['accept']);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(single ? {} : []),
    });
  });

  await page.route('**/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {}, ok: true }),
    });
  });

  // 2) Spesifik uç noktalar
  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: STUDENT_USER.id,
        email: STUDENT_USER.email,
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          full_name: STUDENT_USER.name,
          name: STUDENT_USER.name,
          grade: STUDENT_USER.grade,
        },
        created_at: '2026-11-01T10:00:00.000Z',
      }),
    });
  });

  const activeProfile = {
    id: STUDENT_USER.id,
    email: STUDENT_USER.email,
    name: STUDENT_USER.name,
    grade: STUDENT_USER.grade,
    isAdmin: false,
    avatar_id: 'owl',
    current_streak: 4,
    created_at: '2026-11-01T10:00:00.000Z',
  };

  await page.route('**/rest/v1/profiles**', async (route) => {
    const single = isSingleObjectRequest(route.request().headers()['accept']);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(single ? activeProfile : [activeProfile]),
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
          description: '8. sınıf üslü ifadeler değerlendirme testi.',
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

  await page.route('**/rest/v1/assignments**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'assign-e2e-1',
          title: 'Kareköklü İfadeler Çalışma Ödevi',
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

  await page.route('**/rest/v1/documents**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'doc-e2e-1',
          title: 'Üslü İfadeler Konu Özeti',
          description: '8. sınıf temel kurallar ve örnek sorular.',
          category: 'Çalışma Kağıdı',
          type: 'pdf',
          grade: 8,
          file_url: 'https://example.com/ornek-foy.pdf',
          created_at: '2026-11-01T10:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/student_weekly_plans**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'plan-e2e-1',
          student_id: STUDENT_USER.id,
          author_id: '00000000-0000-4000-8000-000000000001',
          week_start: '2026-11-23',
          title: 'Bu Haftaki Çalışma Planı',
          target_minutes: 600,
          status: 'active',
          created_at: '2026-11-23T08:00:00.000Z',
          student_weekly_plan_items: [
            {
              id: 'plan-item-1',
              plan_id: 'plan-e2e-1',
              kind: 'quiz',
              linked_id: 'quiz-e2e-1',
              href: '/testler?quizId=quiz-e2e-1',
              title: 'Üslü İfadeler Tarama Testi',
              sort_order: 0,
              completed_at: null,
            },
            {
              id: 'plan-item-2',
              plan_id: 'plan-e2e-1',
              kind: 'custom',
              linked_id: null,
              href: null,
              title: '20 yeni nesil soru çöz',
              sort_order: 1,
              completed_at: '2026-11-23T09:00:00.000Z',
            },
          ],
        },
      ]),
    });
  });

  await page.route('**/rest/v1/study_sessions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'ss-e2e-1',
          user_id: STUDENT_USER.id,
          date: '2026-11-23',
          duration: 45,
          topic: 'Üslü İfadeler',
          created_at: '2026-11-23T08:30:00.000Z',
        },
        {
          id: 'ss-e2e-2',
          user_id: STUDENT_USER.id,
          date: '2026-11-22',
          duration: 30,
          topic: 'Olasılık',
          created_at: '2026-11-22T14:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/user_progress**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'up-e2e-1',
          user_id: STUDENT_USER.id,
          topic: 'Üslü İfadeler',
          mastery_level: 72,
          practice_count: 15,
        },
        {
          id: 'up-e2e-2',
          user_id: STUDENT_USER.id,
          topic: 'Olasılık',
          mastery_level: 85,
          practice_count: 20,
        },
      ]),
    });
  });

  await page.route('**/rest/v1/study_goals**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'goal-e2e-1',
          user_id: STUDENT_USER.id,
          target_duration: 180,
          week_start: '2026-11-23',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/quiz_results**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'qr-e2e-1',
          user_id: STUDENT_USER.id,
          quiz_id: 'quiz-e2e-1',
          score: 16,
          total_questions: 20,
          completed_at: '2026-11-22T12:00:00.000Z',
          quizzes: {
            title: 'Üslü İfadeler Tarama Testi',
            difficulty: 'Orta',
            grade: 8,
          },
        },
      ]),
    });
  });

  await page.route('**/rest/v1/announcements**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'ann-e2e-1',
          title: 'Haftalık Çalışma Duyurusu',
          content: 'Yeni tarama testleri yayına alındı.',
          created_at: '2026-11-22T09:00:00.000Z',
          is_active: true,
        },
      ]),
    });
  });

  await page.route('**/rest/v1/notifications**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'notif-e2e-1',
          user_id: STUDENT_USER.id,
          title: 'Haftalık Plan Hazır',
          message: 'Bu haftaki çalışma hedeflerin güncellendi.',
          is_read: false,
          type: 'info',
          created_at: '2026-11-23T08:00:00.000Z',
        },
      ]),
    });
  });

  await page.route('**/rest/v1/game_aliases**', async (route) => {
    const single = isSingleObjectRequest(route.request().headers()['accept']);
    const aliasRow = {
      id: 'alias-e2e-1',
      user_id: STUDENT_USER.id,
      alias: 'SayıUstası',
      alias_normalized: 'sayiustasi',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(single ? aliasRow : [aliasRow]),
    });
  });

  await page.route('**/rest/v1/rpc/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          alias: 'SayıUstası',
          rank: 1,
          total_score: 420,
        },
      ]),
    });
  });
}

async function waitForAuthenticatedPageReady(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page
    .waitForFunction(
      () =>
        Boolean(
          document.body &&
          document.body.querySelector('h1, h2') &&
          document.body.innerText.trim().length > 20,
        ),
      { timeout: 15_000 },
    )
    .catch(() => {});
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    const transitions = document
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition);
    await Promise.race([
      Promise.allSettled(transitions.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, 1_500)),
    ]);
  });
}

async function measureStudentContrastTheme(
  browser: Browser,
  theme: Theme,
  baseURL: string,
): Promise<ContrastEntry[]> {
  const entries: ContrastEntry[] = [];
  const context = await browser.newContext();
  await seedStudentContext(context, baseURL, theme);
  const page = await context.newPage();
  await registerStudentApiMocks(page);

  try {
    for (const routePath of STUDENT_ROUTES) {
      const requestedUrl = new URL(routePath, baseURL).toString();
      const pageErrors: string[] = [];
      const onPageError = (error: Error) => {
        pageErrors.push(error.message || 'Bilinmeyen tarayıcı hatası');
      };
      page.on('pageerror', onPageError);

      try {
        const response = await page.goto(requestedUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        await waitForAuthenticatedPageReady(page);
        const finalUrl = page.url();
        const navigationStatus = response?.status();

        if (!response || (navigationStatus && navigationStatus >= 400)) {
          entries.push({
            route: routePath,
            theme,
            status: 'failed',
            reason: `HTTP ${navigationStatus ?? 'yok'} yanıtı alındı.`,
            requestedUrl,
            finalUrl,
            navigationStatus,
          });
          continue;
        }

        if (pageErrors.length > 0) {
          entries.push({
            route: routePath,
            theme,
            status: 'failed',
            reason: `Tarayıcı hatası: ${pageErrors.join(' | ')}`,
            requestedUrl,
            finalUrl,
            navigationStatus,
          });
          continue;
        }

        if (new URL(finalUrl).pathname !== routePath) {
          entries.push({
            route: routePath,
            theme,
            status: 'failed',
            reason: `Beklenmeyen yönlendirme: ${new URL(finalUrl).pathname}`,
            requestedUrl,
            finalUrl,
            navigationStatus,
          });
          continue;
        }

        const appliedTheme = await page.evaluate(
          () => document.documentElement.dataset.theme,
        );
        if (appliedTheme !== theme) {
          entries.push({
            route: routePath,
            theme,
            status: 'failed',
            reason: `Tema uygulanmadı: ${appliedTheme ?? 'tanımsız'}.`,
            requestedUrl,
            finalUrl,
            navigationStatus,
          });
          continue;
        }

        const measurement = (await page.evaluate(() => {
          const collector = (
            globalThis as typeof globalThis & {
              __ugurhocaCollectComputedContrast?: () => ContrastMeasurement;
            }
          ).__ugurhocaCollectComputedContrast;
          if (!collector) {
            throw new Error('Kontrast toplayıcısı tarayıcıya yüklenemedi.');
          }
          return collector();
        })) as ContrastMeasurement;

        entries.push({
          route: routePath,
          theme,
          status: 'measured',
          requestedUrl,
          finalUrl,
          navigationStatus,
          measurement,
        });
      } finally {
        page.off('pageerror', onPageError);
      }
    }
  } finally {
    await context.close();
  }

  return entries;
}

test.describe('Oturumlu öğrenci sayfaları WCAG kontrast ve mobil taşma kapısı', () => {
  test('5 oturumlu öğrenci rotası × iki tema için sıfır atlama ve tam WCAG kontrast doğrular', async ({
    browser,
    baseURL,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Masaüstü projede tam matris olarak ölçülür.',
    );
    test.setTimeout(5 * 60 * 1000);

    const resolvedBaseURL = baseURL ?? 'http://localhost:3000';
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseURL: resolvedBaseURL,
      expectedMeasurements: STUDENT_ROUTES.length * THEMES.length,
      routes: [...STUDENT_ROUTES],
      themes: THEMES,
      entries: [] as ContrastEntry[],
    };

    for (const theme of THEMES) {
      report.entries.push(
        ...(await measureStudentContrastTheme(browser, theme, resolvedBaseURL)),
      );
    }

    const summary = summarizeContrastReport(report);
    const validation = validateContrastReport(report);
    const details = formatContrastValidation(validation);

    await writeContrastReport(
      { ...report, summary },
      path.join(os.tmpdir(), 'ugurhoca-auth-contrast-report.json'),
    );

    expect(validation.ok, details).toBe(true);
    expect(summary.skipped, details).toBe(0);
    expect(summary.failed, details).toBe(0);
  });

  test('5 oturumlu öğrenci rotası 390×844 mobil görünümde yatay taşma ve sayfa hatası üretmez', async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(3 * 60 * 1000);
    const resolvedBaseURL = baseURL ?? 'http://localhost:3000';
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    await seedStudentContext(context, resolvedBaseURL, 'light');
    const page = await context.newPage();
    await registerStudentApiMocks(page);

    try {
      for (const routePath of STUDENT_ROUTES) {
        const pageErrors: string[] = [];
        const onPageError = (error: Error) => {
          pageErrors.push(error.message || 'Bilinmeyen tarayıcı hatası');
        };
        page.on('pageerror', onPageError);

        try {
          const response = await page.goto(
            new URL(routePath, resolvedBaseURL).toString(),
            { waitUntil: 'domcontentloaded', timeout: 30_000 },
          );
          expect(response?.status()).toBeLessThan(400);
          await waitForAuthenticatedPageReady(page);

          expect(new URL(page.url()).pathname).toBe(routePath);
          expect(pageErrors, `${routePath} pageerror`).toEqual([]);

          const dimensions = await page.evaluate(() => ({
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
          }));
          expect(
            dimensions.scrollWidth,
            `${routePath} yatay taşma (${dimensions.scrollWidth} > ${dimensions.innerWidth})`,
          ).toBeLessThanOrEqual(dimensions.innerWidth + 1);
        } finally {
          page.off('pageerror', onPageError);
        }
      }
    } finally {
      await context.close();
    }
  });

  test('sahte çerez ve snapshot ile /admin ziyaret edildiğinde sunucu koruması /giris sayfasına yönlendirir', async ({
    context,
    page,
    baseURL,
  }) => {
    const resolvedBaseURL = baseURL ?? 'http://localhost:3000';
    const hostname = new URL(resolvedBaseURL).hostname;

    await context.addCookies([
      {
        name: 'ugurhoca_access_token',
        value: 'forged-admin-token',
        domain: hostname,
        path: '/',
      },
      {
        name: 'ugurhoca_auth_snapshot',
        value: encodeURIComponent(
          JSON.stringify({
            email: 'admin@ugurhoca.com',
            grade: 5,
            id: '00000000-0000-4000-8000-000000000001',
            isAdmin: true,
            name: 'Sahte Yönetici',
          }),
        ),
        domain: hostname,
        path: '/',
      },
    ]);

    await page.goto('/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\/giris/);
  });
});
