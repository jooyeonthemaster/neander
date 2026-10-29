import { expect, test, type Page } from '@playwright/test';

test.use({ actionTimeout: 20_000 });

const PROJECT_URLS: Record<string, string> = {
  'ansan-science': 'https://asv-2026-delta.vercel.app/',
  'jimff-run': 'https://jimffrun.vercel.app/',
  'jimff-ai-perfumer': 'https://jimff-ai-perfumer.vercel.app/',
  'stamp-tour': 'https://neander-stamp.vercel.app/dju',
  ikseonjae: 'https://ikseonjae.com/',
  morak: 'https://morak-kiosk.vercel.app/',
  'booth-3d': 'https://jjin-booth-lite.vercel.app/',
  smoat: 'https://www.smoat.co.kr/',
  'kwave-dance': 'https://k-wavedance.co.kr/',
  okto: 'https://okto-moon-rabbit.vercel.app/',
  surisuri: 'https://surisuri.vercel.app/',
  tea: 'https://tea-gamma-ashen.vercel.app/',
  daleum: 'https://daleum.shop/',
  'middle-grammar': 'https://middle-grammar-green.vercel.app/',
  darumdaum: 'https://darumdaum.com/',
  pinlight: 'https://pinlight.vercel.app/',
  aible: 'https://frontend-ten-mu-42.vercel.app/',
  'tomato-club': 'https://tomato-club.vercel.app/',
  suhn: 'https://suhn-lac.vercel.app/',
  goseorak: 'https://goseorak.vercel.app/gallery',
  linkbridge: 'https://linkbridgeworld.com/',
};

test.beforeEach(async ({ page, baseURL }) => {
  // Exercise only local UI: no third-party page, analytics, or inquiry writes.
  const origin = new URL(baseURL!).origin;
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html lang="en"><title>Local iframe fixture</title><body>Preview test</body></html>',
      });
    } else if (url.pathname === '/api/track') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    } else {
      await route.continue();
    }
  });
});

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
}

async function openDevelopment(page: Page, english = false) {
  await page.goto(english ? '/en/development' : '/development', { waitUntil: 'domcontentloaded' });
}

test('all supplied projects remain visitable and category filters update the collection', async ({ page }, testInfo) => {
  await openDevelopment(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('아이디어를 서비스로,');
  const projects = page.locator('article[data-development-project]');
  await expect(projects).toHaveCount(21);
  await expect(page.locator('iframe')).toHaveCount(0);

  for (const [id, url] of Object.entries(PROJECT_URLS)) {
    const project = page.locator(`article[data-development-project="${id}"]`);
    await expect(project).toBeVisible();
    const visit = project.getByRole('link');
    await expect(visit).toHaveAttribute('href', url);
    await expect(visit).toHaveAttribute('target', '_blank');
    await expect(visit).toHaveAttribute('rel', /noopener/);
  }

  const categories = page.getByRole('group', { name: '프로젝트 분야', exact: true });
  for (const [label, count] of [['자사몰', 4], ['AI 솔루션', 6], ['인터랙티브', 4], ['전체', 21]] as const) {
    const filter = categories.getByRole('button', { name: label, exact: true });
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(projects).toHaveCount(count);
  }

  await expectNoHorizontalOverflow(page);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `output/development-review/${testInfo.project.name}-development.png` });
});

test('preview isolates scrolling, loads a single live iframe on demand, and restores focus', async ({ page }) => {
  await openDevelopment(page);
  const open = page.locator('article[data-development-project="ansan-science"]').getByRole('button', { name: '2026 안산 과학축제 미리보기', exact: true });
  await open.click();
  const dialog = page.getByRole('dialog', { name: '2026 안산 과학축제', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2, name: '2026 안산 과학축제', exact: true })).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  const originalScroll = await page.evaluate(() => window.scrollY);
  await dialog.getByRole('heading', { level: 2 }).hover();
  await page.mouse.wheel(0, 750);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(Math.abs(await page.evaluate(() => window.scrollY) - originalScroll)).toBeLessThan(1);

  await dialog.getByRole('button', { name: '라이브 체험', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(dialog.locator('iframe')).toHaveAttribute('src', PROJECT_URLS['ansan-science']);
  const loading = dialog.getByText('사이트를 불러오고 있어요', { exact: true });
  await expect(loading).toBeHidden();
  await dialog.getByRole('button', { name: '라이브 체험', exact: true }).click();
  await expect(loading).toBeHidden();
  await expect(page.locator('iframe')).toHaveCount(1);
  await dialog.getByRole('button', { name: '모바일', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(dialog.getByRole('button', { name: '모바일', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(open).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('a project that disallows embedding offers its direct URL without mounting an iframe', async ({ page }) => {
  await openDevelopment(page);
  await page.locator('article[data-development-project="stamp-tour"]').getByRole('button', { name: /미리보기$/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '라이브 체험', exact: true }).click();
  await expect(dialog.getByText('이 프로젝트는 새 탭에서 직접 만나보세요.', { exact: true })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  const visits = dialog.getByRole('link', { name: '사이트 방문', exact: true });
  await expect(visits).toHaveCount(2);
  for (const visit of await visits.all()) await expect(visit).toHaveAttribute('href', PROJECT_URLS['stamp-tour']);
  await page.keyboard.press('Escape');
});

test('development consultation carries an editable subject and resets when changing contact context', async ({ page }) => {
  await openDevelopment(page);
  await page.getByRole('link', { name: '프로젝트 상담하기', exact: true }).first().click();
  await expect(page).toHaveURL(/\/contact\?type=development$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('어떤 서비스를 만들고 싶으신가요?');
  await expect(page.locator('#contact-service')).toHaveCount(0);
  await expect(page.getByRole('tablist')).toHaveCount(0);
  const subjectValue = page.locator('input[name="subject"]');
  const subject = page.getByRole('combobox', { name: '문의 유형', exact: true });
  await expect(subjectValue).toHaveValue('development');
  await expect(subject).toContainText('프로그램 개발 / AX 상담');
  await subject.click();
  await page.getByRole('option', { name: '일반 문의', exact: true }).click();
  await expect(subjectValue).toHaveValue('general');

  await page.getByRole('contentinfo').getByRole('link', { name: '문의하기', exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#contact-service')).toBeVisible();
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(subjectValue).toHaveValue('');
  await page.goBack();
  await expect(page).toHaveURL(/\/contact\?type=development$/);
  await expect(subjectValue).toHaveValue('development');
  await expect(page.locator('#contact-service')).toHaveCount(0);
  // Deliberately never submit either form.
});

test('English copy and responsive navigation keep development reachable without overlap', async ({ page, isMobile }) => {
  await openDevelopment(page, true);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ideas into products.AI into business.');
  await expect(page.locator('article[data-development-project]')).toHaveCount(21);

  if (isMobile) {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 640 : 844 });
      await expectNoHorizontalOverflow(page);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
      const development = menu.getByRole('link', { name: 'Development', exact: true });
      await expect(development).toBeVisible();
      await expect(development).toHaveAttribute('aria-current', 'page');
      const contact = menu.getByRole('link', { name: 'Contact', exact: true });
      await contact.scrollIntoViewIfNeeded();
      await expect(contact).toBeInViewport();
      await development.click();
      await expect(menu).toHaveCount(0);
    }
  } else {
    for (const width of [1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const header = page.locator('header');
      const navigation = header.getByRole('navigation', { name: 'Main navigation', exact: true });
      await expect(navigation).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Development', exact: true })).toHaveAttribute('aria-current', 'page');
      const logo = await header.getByRole('link', { name: /NEANDER/ }).boundingBox();
      const nav = await navigation.boundingBox();
      const languages = await header.getByRole('radiogroup', { name: 'Language selection', exact: true }).boundingBox();
      expect(logo && nav && languages).toBeTruthy();
      expect(logo!.x + logo!.width).toBeLessThanOrEqual(nav!.x);
      expect(nav!.x + nav!.width).toBeLessThanOrEqual(languages!.x);
      await expectNoHorizontalOverflow(page);
    }
  }
});
