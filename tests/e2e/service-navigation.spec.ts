import { test, expect } from '@playwright/test';

test('service filter URLs survive back, forward and reload', async ({ page }) => {
  await page.goto('/services?source=e2e', { waitUntil: 'domcontentloaded' });
  const filters = page.locator('#experiences');
  const diagnosis = filters.getByRole('button', { name: 'AI 진단 체험', exact: true });
  const photo = filters.getByRole('button', { name: 'AI 포토 체험', exact: true });
  await diagnosis.click();
  await expect(page).toHaveURL(/pillar=ai-diagnosis/);
  await expect(diagnosis).toHaveAttribute('aria-pressed', 'true');
  await photo.click();
  await expect(page).toHaveURL(/pillar=ai-photo/);
  await page.goBack();
  await expect(page).toHaveURL(/pillar=ai-diagnosis/);
  await expect(diagnosis).toHaveAttribute('aria-pressed', 'true');
  expect(new URL(page.url()).searchParams.get('source')).toBe('e2e');
  await page.goBack();
  await expect(filters.getByRole('button', { name: '전체', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(diagnosis).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(diagnosis).toHaveAttribute('aria-pressed', 'true');
});

const serviceNames: Record<string, string> = {
  'ai-science-kiosk': 'AI 과학 체험 키오스크',
  'ai-fortune-robot': 'AI 원소 운세',
};

for (const slug of ['ai-science-kiosk', 'ai-fortune-robot']) {
  test(`${slug} contact context remains selected across navigation and reload`, async ({ page }) => {
    await page.goto(`/services/${slug}`, { waitUntil: 'domcontentloaded' });
    const links = page.getByRole('link', { name: '견적 요청하기', exact: true });
    await expect(links.first()).toBeAttached();
    for (let index = 0; index < await links.count(); index++) await expect(links.nth(index)).toHaveAttribute('href', new RegExp(`service=${slug}`));
    await page.goto(`/contact?service=${slug}`, { waitUntil: 'domcontentloaded' });
    const service = page.locator('#contact-service');
    await expect(service).toHaveRole('combobox');
    await expect(service).toContainText(serviceNames[slug]);
    await expect(page.locator('#contact-tab-inquiry')).toHaveAttribute('aria-selected', 'true');
    expect(new URL(page.url()).searchParams.get('service')).toBe(slug);
    await expect(page.locator('#contact-panel-inquiry form')).toHaveCSS('opacity', '1');
    const name = page.locator('#contact-panel-inquiry input[name="name"]');
    await name.fill('E2E local test');
    const other = slug === 'ai-science-kiosk' ? 'ai-fortune-robot' : 'ai-science-kiosk';
    await service.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('option', { name: serviceNames[other], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`service=${other}`));
    await expect(name).toHaveValue('E2E local test');
    await page.reload();
    await expect(service).toContainText(serviceNames[other]);
    await page.locator('#contact-tab-quote').click();
    await expect(page).toHaveURL(new RegExp(`/quote\\?service=${other}`));
    await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
    // Keep the test read-only: neither contact nor quote forms are submitted.
  });
}

test('contact subject dropdown preserves required validation and selected values', async ({ page, isMobile }) => {
  const writes: string[] = [];
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    writes.push(route.request().url());
    await route.abort();
  });
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  const panel = page.locator('#contact-panel-inquiry');
  const subject = panel.getByRole('combobox', { name: '문의 유형', exact: true });
  await expect(subject).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);
  await subject.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('listbox')).toHaveCSS('opacity', '1');
  await expect(panel.locator('form')).toHaveCSS('opacity', '1');
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.screenshot({ path: `output/site-controls/2026-09-27/${isMobile ? 'mobile' : 'desktop'}-contact-dropdown.png` });
  await page.keyboard.press('Escape');
  // Required fields remain empty, and the network guard prevents any external inquiry write.
  await panel.locator('button[type="submit"]').click();
  await expect(subject).toHaveAttribute('aria-invalid', 'true');
  await expect(subject).toHaveAccessibleDescription('필수 입력 항목입니다');
  await subject.click();
  await page.getByRole('option', { name: '제휴 / 협업 문의', exact: true }).click();
  await expect(subject).toContainText('제휴 / 협업 문의');
  await expect(subject).not.toHaveAttribute('aria-invalid', 'true');
  await expect(panel.locator('input[name="name"]')).toHaveAttribute('aria-invalid', 'true');
  await subject.click();
  await page.getByRole('option', { name: '견적 문의', exact: true }).click();
  await expect(panel.getByRole('button', { name: '견적 계산하기', exact: true })).toBeVisible();
  await subject.click();
  await page.keyboard.press('Escape');
  await expect(subject).toBeFocused();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expect(writes).toEqual([]);
});
