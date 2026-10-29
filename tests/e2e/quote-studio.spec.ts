import { test, expect, type Locator, type Page } from '@playwright/test';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { type Lang } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { closePreviewOptions, enterExperienceStep, nextPreviewStep, openPreviewOptions, showOptionPage, toggleKioskExperience } from './helpers/quote-preview-options';

const STORAGE_KEY = 'neander-quote-v2';
const stage = (page: Page, step: number) => page.locator(`[data-quote-step="${step}"]`);

async function savedQuote(page: Page): Promise<QuoteInput> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
}

async function expectTotal(page: Page, input: QuoteInput, lang: Lang = 'ko') {
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(input, lang).total));
}

async function expectFitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function expectNamedControls(scope: Locator) {
  for (const control of await scope.locator('input:not([type="hidden"]), [role="combobox"], textarea').all()) {
    if (await control.isVisible()) await expect(control).not.toHaveAccessibleName('');
  }
}

test('event details open immediately with a name and direct numeric entry', async ({ page }) => {
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await expect(stage(page, 1)).toBeVisible();
  await expect(stage(page, 0)).toHaveCount(0);
  await expect(page.getByTestId('quote-start-templates')).toHaveCount(0);
  await expect(page.getByTestId('quote-start-blank')).toHaveCount(0);
  await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(0);
  await expect(page.locator('#q-type')).toHaveCount(0);
  await page.getByLabel('행사명', { exact: true }).fill('네안데르 고객 초청 행사');
  for (const [id, value] of [['q-days', '3'], ['q-attendees', '360']]) {
    const control = page.locator(`#${id}`);
    await expect(control).toHaveAttribute('inputmode', 'numeric');
    await expect(control.locator('..').getByRole('button')).toHaveCount(0);
    await control.fill(value);
    await control.press('Tab');
  }
  await expect.poll(() => savedQuote(page)).toMatchObject({ eventName: '네안데르 고객 초청 행사', days: 3, attendees: 360, items: [] });
  const progress = page.getByRole('navigation', { name: '견적 만들기 단계' });
  await expect(progress.getByRole('button')).toHaveCount(3);
  await expectNamedControls(stage(page, 1));
  await expectFitsViewport(page);
  await enterExperienceStep(page);
  await expect(page.getByTestId('quote-next')).toBeDisabled();
});

test('the summary region dropdown keeps keyboard selection, dismissal and viewport bounds', async ({ page, isMobile }) => {
  await page.goto('/quote?item=rental', { waitUntil: 'domcontentloaded' });
  await enterExperienceStep(page);
  await page.getByTestId('event-info-edit').click();
  const summary = page.getByTestId('event-info-summary');
  const region = summary.getByRole('combobox', { name: QUOTE_COPY.ko.region, exact: true });
  await region.click();
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  const bounds = (await menu.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(region).toContainText('경상');
  await expect.poll(async () => (await savedQuote(page)).region).toBe('gyeongsang');
  await region.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(region).toContainText('경기·인천');
  await expect.poll(async () => (await savedQuote(page)).region).toBe('gyeongin');
  await region.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(region).toBeFocused();
  await expect(region).toContainText('경기·인천');
  await region.click();
  await page.keyboard.press('Tab');
  await expect(menu).toHaveCount(0);
  await region.click();
  if (isMobile) await page.touchscreen.tap(4, 100);
  else await page.mouse.click(4, 100);
  await expect(menu).toHaveCount(0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(async () => (await savedQuote(page)).region).toBe('gyeongin');
  await expectTotal(page, await savedQuote(page));
});

test('the calendar supports typed dates, keyboard selection and clearing', async ({ page }) => {
  await page.goto('/quote?item=rental', { waitUntil: 'domcontentloaded' });
  await nextPreviewStep(page);
  await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '2');
  const date = page.locator('#q-date');
  await date.fill('2027-06-18');
  await expect.poll(async () => (await savedQuote(page)).eventDate).toBe('2027-06-18');
  await date.press('ArrowDown');
  const calendar = page.getByRole('dialog', { name: '날짜 선택', exact: true });
  await expect(calendar).toBeVisible();
  await expect(calendar.getByRole('button', { name: '2027년 6월 18일 금요일', exact: true })).toBeFocused();
  const bounds = (await calendar.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(date).toHaveValue('2027-06-19');
  await expect(calendar).toHaveCount(0);
  await expect(date).toBeFocused();
  await date.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(calendar).toHaveCount(0);
  await page.getByRole('button', { name: '달력 열기', exact: true }).click();
  await calendar.getByRole('button', { name: '날짜 지우기', exact: true }).click();
  await expect(date).toHaveValue('');
  await expect.poll(async () => (await savedQuote(page)).eventDate).toBe('');
});

test('all automatically priced services retain options, totals and private form drafts through navigation', async ({ page }) => {
  const c = QUOTE_COPY.ko;
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await page.locator('#q-event-name').fill('신제품 체험 행사');
  await page.locator('#q-attendees').fill('360');
  await page.locator('#q-days').fill('3');
  await nextPreviewStep(page);
  await page.locator('#q-date').fill('2027-06-18');
  await page.locator('#q-hours').fill('8');
  await page.locator('#q-staff').fill('2');
  await page.locator('#q-setup').check();
  await enterExperienceStep(page);

  const perfume = await showOptionPage(page, 'acscent', 'basic');
  await perfume.locator('#p-guests').fill('140');
  await perfume.locator('#p-teams').fill('2');
  await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: /50ml/ }).check();
  await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: c.analysis, exact: true }).getByRole('radio').nth(1).check();
  await perfume.locator('#p-akiosk').fill('2');
  await showOptionPage(page, 'acscent', 'packaging');
  await perfume.getByRole('radiogroup', { name: c.premiumPackaging, exact: true }).getByRole('radio').nth(1).check();

  const photo = await showOptionPage(page, 'photoBooth', 'basic');
  await photo.locator('#b-booths').fill('2');
  await showOptionPage(page, 'photoBooth', 'prints');
  await photo.locator('#b-prints').fill('2');
  await photo.locator('#b-wrap').check();
  await showOptionPage(page, 'photoBooth', 'branding');
  await photo.getByRole('radiogroup', { name: c.boothCustom, exact: true }).getByRole('radio').nth(1).check();

  const rental = await showOptionPage(page, 'rental', 'basic');
  await rental.locator('#k-count').fill('2');
  await rental.locator('#k-count').press('Enter');
  await expect(rental.locator('#k-months, #k-printer')).toHaveCount(0);
  await toggleKioskExperience(page, 'ai-face-reading', 'ko');
  await expectNamedControls(rental);
  await closePreviewOptions(page);
  const configured = await savedQuote(page);
  expect(configured).toMatchObject({ eventName: '신제품 체험 행사', attendees: 360, days: 3, hoursPerDay: 8, extraStaff: 2, setupDayBefore: true });
  expect(configured.items.map(item => item.key)).toEqual(['acscent', 'photoBooth', 'rental']);
  expect(configured.items[0].options).toMatchObject({ guests: 140, volume: '50ml', extraTeams: 1, premiumPackaging: true, analysisKiosks: 2 });
  expect(configured.items[1].options).toMatchObject({ booths: 2, extraPrintRolls: 2, wrapping: true, custom: 'flow' });
  expect(configured.items[2].options).toMatchObject({ kiosks: 2, mode: 'event', printer: false, experienceSlugs: ['ai-face-reading', 'ai-face-reading'] });
  await expectTotal(page, configured);
  await nextPreviewStep(page);
  await expectNamedControls(stage(page, 3));
  await page.locator('#q-name').fill('Quote draft test');
  await page.locator('#q-email').fill('qa@example.test');
  await page.locator('#q-note').fill('Keep this private draft while I review the experiences.');
  await page.getByTestId('quote-prev').click();
  await openPreviewOptions(page, 'rental');
  await expect(page.locator('#k-count')).toHaveValue('2');
  await nextPreviewStep(page);
  await expect(page.locator('#q-name')).toHaveValue('Quote draft test');
  await expect(page.locator('#q-email')).toHaveValue('qa@example.test');
  expect(JSON.stringify(await savedQuote(page))).not.toMatch(/qa@example\.test|Quote draft test|Keep this private/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(() => savedQuote(page)).toEqual(configured);
  await expectTotal(page, configured);
  await enterExperienceStep(page);
  await nextPreviewStep(page);
  await expect(page.locator('#q-name')).toHaveValue('');
  await expect(page.locator('#q-email')).toHaveValue('');
  await expectFitsViewport(page);
  // Live PDF and inquiry actions intentionally remain unsubmitted.
});

test('the English journey supports keyboard entry and keeps each stage within narrow viewports', async ({ page, isMobile }) => {
  await page.goto('/en/quote', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Event name', { exact: true }).fill('Community launch');
  await page.locator('#q-attendees').fill('300');
  await expectNamedControls(stage(page, 1));
  await enterExperienceStep(page);
  const add = page.getByTestId('quote-add-rental');
  await add.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('quote-options-rental')).toBeVisible();
  await expect(page.getByTestId('quote-preview-experience-editor').locator('svg').first()).toBeVisible();
  await nextPreviewStep(page);
  await expect(stage(page, 3)).toBeVisible();
  await expectNamedControls(stage(page, 3));
  await expect(page.getByTestId('event-info-summary')).toContainText('Community launch');
  await expect(page.getByTestId('quote-total')).toContainText('KRW');
  await page.locator('#q-name').fill('English review');
  await page.locator('#q-email').fill('review@example.test');
  for (const width of (isMobile ? [390, 320] : [1440, 1280])) {
    await page.setViewportSize({ width, height: isMobile ? 844 : 800 });
    await expectFitsViewport(page);
    await page.getByTestId('quote-prev').click();
    await expect(stage(page, 2)).toBeVisible();
    await expectFitsViewport(page);
    await nextPreviewStep(page);
    await expect(page.locator('#q-name')).toHaveValue('English review');
    await expect(page.locator('#q-email')).toHaveValue('review@example.test');
  }
});

for (const entry of [
  { name: 'preset', query: 'preset=campus-festival', expected: ['photoBooth', 'rental'] },
  { name: 'product', query: 'item=photoBooth', expected: ['photoBooth'] },
  { name: 'experience', query: 'service=ai-face-reading', expected: ['rental'] },
]) {
  test(`incoming ${entry.name} context remains editable and clear stays empty after reload`, async ({ page }) => {
    await page.goto(`/quote?${entry.query}`, { waitUntil: 'domcontentloaded' });
    await expect(stage(page, 1)).toBeVisible();
    await expect.poll(async () => (await savedQuote(page)).items.map(item => item.key)).toEqual(entry.expected);
    await expectTotal(page, await savedQuote(page));
    if (entry.name === 'experience') expect((await savedQuote(page)).items[0].options).toMatchObject({ experienceSlug: 'ai-face-reading' });
    await page.locator('#q-event-name').fill('취소할 행사');
    await enterExperienceStep(page);
    await nextPreviewStep(page);
    await expect(stage(page, 3)).toBeVisible();
    await page.getByTestId('quote-clear').click();
    await expect(stage(page, 1)).toBeVisible();
    await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '1');
    await expect(page.locator('#q-event-name')).toHaveValue('');
    await expect.poll(async () => (await savedQuote(page)).items).toEqual([]);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
    expect(new URL(page.url()).search).toBe('');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(async () => (await savedQuote(page)).items).toEqual([]);
    expect(sanitizeInput(await savedQuote(page)).eventName).toBe('');
    await expect(page.getByTestId('quote-clear')).toBeDisabled();
    await enterExperienceStep(page);
    await expect(page.getByTestId('quote-next')).toBeDisabled();
    await expectFitsViewport(page);
  });
}
