import { test, expect, type Locator, type Page } from '@playwright/test';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { SERVICE_ORDER, type Lang, type ServiceKey } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { QUOTE_PRESETS } from '../../src/lib/quote/presets';

const STORAGE_KEY = 'neander-quote-v2';

async function savedQuote(page: Page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  return sanitizeInput(raw ? JSON.parse(raw) : null);
}

async function expectTotal(page: Page, input: QuoteInput, lang: Lang = 'ko') {
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(input, lang).total));
}

async function expectFitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function expectStartChoice(page: Page) {
  await expect(page.locator('[data-quote-step="0"]')).toBeVisible();
  await expect(page.getByTestId('quote-start-blank')).toBeVisible();
  await expect(page.getByTestId('quote-start-templates')).toBeVisible();
  await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(0);
}

async function expandDetails(scope: Locator) {
  const closed = scope.locator('button[aria-expanded="false"]:not([role="combobox"]):not([aria-haspopup])');
  while (await closed.count()) {
    const button = closed.first();
    const controls = await button.getAttribute('aria-controls');
    await button.click();
    if (controls) await expect(scope.locator(`[id="${controls}"]`)).toBeVisible();
  }
}

/** 행사 정보는 두 쪽이다: 첫째 쪽(유형·인원·기간·지역) → 둘째 쪽(날짜·시간·인력·전날 설치) */
async function toConditionsDetail(page: Page) {
  await page.getByTestId('quote-next').click();
  await expect(page.locator('[data-quote-page="2"]')).toBeVisible();
}

/** 행사 정보 첫째 쪽에서 체험 선택 단계로 */
async function toExperiences(page: Page) {
  await toConditionsDetail(page);
  await page.getByTestId('quote-next').click();
  await expect(page.locator('[data-quote-step="2"]')).toBeVisible();
}

async function openOptions(page: Page, key: ServiceKey) {
  const options = page.getByTestId(`quote-options-${key}`);
  // 팝오버는 한 번에 하나만 열린다. 열림 상태는 '옵션 정하기' 버튼의 aria-expanded 로 판단한다
  // (다른 체험의 팝오버가 이 카드를 덮고 있을 수 있어 먼저 Esc 로 닫는다)
  const edit = page.getByTestId(`quote-edit-${key}`);
  if ((await edit.getAttribute('aria-expanded')) !== 'true') { await page.keyboard.press('Escape'); await edit.click(); }
  await expect(options).toBeVisible();
  await expandDetails(options);
  return options;
}

async function choose(scope: Locator, group: string, index: number) {
  const radio = scope.getByRole('radiogroup', { name: group, exact: true }).getByRole('radio').nth(index);
  await radio.check();
  await expect(radio).toBeChecked();
}

async function expectNamedControls(scope: Locator) {
  for (const control of await scope.locator('input:not([type="hidden"]), [role="combobox"], textarea').all()) {
    if (await control.isVisible()) await expect(control).not.toHaveAccessibleName('');
  }
}

test('choose a starting method before browsing templates or setting event conditions', async ({ page }) => {
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await expectStartChoice(page);
  await expectFitsViewport(page);

  await page.getByTestId('quote-start-templates').click();
  await expect(page.locator('[data-quote-step="0"]')).toBeVisible();
  await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(QUOTE_PRESETS.length);
  await expect(page.getByTestId('quote-preset-brand-popup')).toBeVisible();
  await expect(page.locator('[data-quote-step="1"]')).toHaveCount(0);
  await expectFitsViewport(page);

  await page.getByTestId('quote-back-to-start').click();
  await expectStartChoice(page);
  await page.getByTestId('quote-start-blank').click();
  await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
  expect((await savedQuote(page)).items).toEqual([]);
  await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(0);
  await expectFitsViewport(page);
});

test('site dropdowns support keyboard navigation, dismissal and viewport-sized menus', async ({ page, isMobile }) => {
  await page.goto('/quote?item=rental', { waitUntil: 'domcontentloaded' });
  const eventType = page.locator('#q-type');
  await expect(eventType).toHaveRole('combobox');
  await expect(page.locator('select')).toHaveCount(0);
  await eventType.click();
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('option', { name: '브랜드 팝업', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expectFitsViewport(page);
  const menuBounds = await menu.boundingBox();
  const viewport = page.viewportSize()!;
  expect(menuBounds).not.toBeNull();
  expect(menuBounds!.x).toBeGreaterThanOrEqual(0);
  expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(menuBounds!.y).toBeGreaterThanOrEqual(0);
  expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(viewport.height);
  await expect(menu).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-quote-step="1"]')).toHaveCSS('opacity', '1');
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.screenshot({ path: `output/site-controls/2026-09-27/${isMobile ? 'mobile' : 'desktop'}-quote-dropdown.png` });
  if (isMobile) {
    await page.getByRole('option', { name: '공공·관광 행사', exact: true }).tap();
    await expect(eventType).toContainText('공공·관광 행사');
    await expect(menu).toHaveCount(0);
    await eventType.tap();
  }

  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(eventType).toContainText('기타');
  await expect(menu).toHaveCount(0);
  await expect(eventType).toBeFocused();
  await eventType.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(eventType).toContainText('축제');
  await expect.poll(async () => (await savedQuote(page)).eventType).toBe('festival');

  await eventType.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(eventType).toContainText('축제');
  await expect(eventType).toBeFocused();
  await eventType.click();
  await page.keyboard.press('Tab');
  await expect(menu).toHaveCount(0);
  await expect(eventType).not.toBeFocused();
  await eventType.click();
  if (isMobile) await page.touchscreen.tap(4, viewport.height / 2);
  else await page.mouse.click(4, viewport.height / 2);
  await expect(menu).toHaveCount(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(eventType).toContainText('축제');
  await expectTotal(page, await savedQuote(page));
  await toExperiences(page);
  const rental = await openOptions(page, 'rental');
  const experience = rental.locator('#k-exp');
  await experience.click();
  await page.keyboard.press('End');
  const lastOption = (await page.getByRole('option').last().textContent())!.trim();
  await page.keyboard.press('Enter');
  await expect(experience).toContainText(lastOption);
  await expect(menu).toHaveCount(0);
  await experience.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(experience).toContainText('상담 후 결정');
  await expect.poll(async () => (await savedQuote(page)).items.find((item) => item.key === 'rental')?.options.experienceSlug).toBeUndefined();
  await expectTotal(page, await savedQuote(page));
  await expectFitsViewport(page);

  await page.goto('/en/quote?item=rental', { waitUntil: 'domcontentloaded' });
  const englishEvent = page.locator('#q-type');
  await englishEvent.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.type('pub');
  await page.keyboard.press('Enter');
  await expect(englishEvent).toContainText('Public / tourism event');
  await expect.poll(async () => (await savedQuote(page)).eventType).toBe('public');
});

test('site calendar supports typed dates, keyboard selection and clearing', async ({ page, isMobile }) => {
  await page.goto('/quote?item=rental', { waitUntil: 'domcontentloaded' });
  const conditions = page.locator('[data-quote-step="1"]');
  await expect(conditions).toBeVisible();
  await toConditionsDetail(page);
  const date = page.locator('#q-date');
  await expect(date).toHaveAttribute('type', 'text');
  await date.fill('2027-06-18');
  await expect.poll(async () => (await savedQuote(page)).eventDate).toBe('2027-06-18');
  await date.press('ArrowDown');
  const calendar = page.getByRole('dialog', { name: '날짜 선택', exact: true });
  await expect(calendar).toBeVisible();
  await expect(calendar.getByRole('button', { name: '2027년 6월 18일 금요일', exact: true })).toBeFocused();
  await expectFitsViewport(page);
  const bounds = await calendar.boundingBox();
  const viewport = page.viewportSize()!;
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  await page.screenshot({ path: `output/site-controls/2026-09-27/${isMobile ? 'mobile' : 'desktop'}-quote-calendar.png` });
  await page.keyboard.press('ArrowRight');
  await expect(calendar.getByRole('button', { name: '2027년 6월 19일 토요일', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(date).toHaveValue('2027-06-19');
  await expect(calendar).toHaveCount(0);
  await expect(date).toBeFocused();
  await expect.poll(async () => (await savedQuote(page)).eventDate).toBe('2027-06-19');
  await date.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(calendar).toHaveCount(0);
  await expect(date).toBeFocused();
  await page.getByRole('button', { name: '달력 열기', exact: true }).click();
  await calendar.getByRole('button', { name: '날짜 지우기', exact: true }).click();
  await expect(date).toHaveValue('');
  await expect.poll(async () => (await savedQuote(page)).eventDate).toBe('');
});

test('all product options stay editable and retain their price through navigation and reload', async ({ page }) => {
  const c = QUOTE_COPY.ko;
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('quote-start-blank').click();
  const conditions = page.locator('[data-quote-step="1"]');
  await expect(conditions).toBeVisible();
  await page.locator('#q-type').click();
  await page.getByRole('option', { name: '기업 행사', exact: true }).click();
  await page.locator('#q-attendees').fill('360');
  await page.locator('#q-days').fill('3');
  await choose(conditions, c.region, 2);
  await toConditionsDetail(page);
  await page.locator('#q-date').fill('2027-06-18');
  await page.locator('#q-hours').fill('8');
  await page.locator('#q-staff').fill('2');
  await page.locator('#q-setup').check();
  await expectNamedControls(conditions);
  await expectFitsViewport(page);
  await page.getByTestId('quote-next').click();
  await expect(page.getByTestId('quote-next')).toBeDisabled();

  for (const key of SERVICE_ORDER) {
    await page.keyboard.press('Escape');
    await page.getByTestId(`quote-add-${key}`).click();
    await expect(page.getByTestId(`quote-add-${key}`)).toHaveAttribute('aria-pressed', 'true');
    if (key === 'custom') {
      await page.getByTestId('quote-add-custom').click();
      await expect(page.getByTestId('quote-add-custom')).toHaveAttribute('aria-pressed', 'false');
      await expect.poll(async () => (await savedQuote(page)).items.some((item) => item.key === 'custom')).toBe(false);
      const withoutCustom = await savedQuote(page);
      await expectTotal(page, withoutCustom);
      await page.getByTestId('quote-add-custom').click();
      await expect(page.getByTestId('quote-add-custom')).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => (await savedQuote(page)).items.some((item) => item.key === 'custom')).toBe(true);
      const withCustom = await savedQuote(page);
      expect(calculateQuote(withCustom).total).toBeGreaterThan(calculateQuote(withoutCustom).total);
      await expectTotal(page, withCustom);
    }
    const options = await openOptions(page, key);
    switch (key) {
      case 'acscent':
        await options.locator('#p-guests').fill('140');
        await choose(options, c.volume, 1);
        await options.locator('#p-teams').fill('1');
        await options.locator('#p-custom').check();
        await choose(options, c.premiumPackaging, 1); // AC'SCENT 브랜드 패키지
        await choose(options, c.analysis, 1);
        await options.locator('#p-akiosk').fill('2');
        break;
      case 'photoBooth':
        await options.locator('#b-booths').fill('2');
        await options.locator('#b-styles').fill('1');
        await options.locator('#b-prints').fill('2');
        await options.locator('#b-wrap').check();
        await options.locator('#b-cstyles').fill('1');
        await choose(options, c.boothCustom, 2);
        break;
      case 'rental':
        await options.locator('#k-exp').click();
        await page.getByRole('option', { name: 'AI 관상 분석', exact: true }).click();
        await options.locator('#k-count').fill('2');
        await options.locator('#k-contents').fill('2');
        await options.locator('#k-printer').check();
        await choose(options, c.kioskCustom, 2);
        await choose(options, c.mode, 1);
        await options.locator('#k-months').fill('3');
        break;
      case 'spatialDesign':
        await choose(options, c.size, 2);
        await options.locator('#s-pyeong').fill('35');
        await options.locator('#s-zone').check();
        await options.locator('#s-light').check();
        break;
      case 'mediaArt':
        await choose(options, c.grade, 2);
        await options.locator('#m-sensors').fill('2');
        break;
      case 'custom':
        await choose(options, c.scope, 1);
        await options.locator('#c-maint').fill('6');
        await options.locator('#c-consult').check();
        break;
    }
    await expectNamedControls(options);
    await expectFitsViewport(page);
  }

  const configured = sanitizeInput({
    eventType: 'corporate', eventDate: '2027-06-18', attendees: 360, days: 3, region: 'south',
    hoursPerDay: 8, extraStaff: 2, setupDayBefore: true,
    items: [
      { key: 'acscent', options: { guests: 140, volume: '50ml', extraTeams: 1, customScent: true, premiumPackaging: true, analysisKiosks: 2 } },
      { key: 'photoBooth', options: { booths: 2, extraStyles: 1, extraPrintRolls: 2, photocard: false, wrapping: true, customStyles: 1, custom: 'dedicated' } },
      { key: 'rental', options: { mode: 'monthly', kiosks: 2, months: 3, printer: true, extraContents: 2, custom: 'content', experienceSlug: 'ai-face-reading' } },
      { key: 'spatialDesign', options: { size: 'large', pyeong: 35, photoZone: true, lighting: true } },
      { key: 'mediaArt', options: { grade: 'fullCustom', extraSensors: 2 } },
      { key: 'custom', options: { scope: 'large', consulting: true, maintenanceMonths: 6 } },
    ],
  });
  await expect.poll(() => savedQuote(page)).toEqual(configured);
  await expectTotal(page, configured);
  await page.getByTestId('quote-next').click();
  await expect(page.locator('[data-quote-step="3"]')).toBeVisible();
  await expectNamedControls(page.locator('[data-quote-step="3"]'));
  await expectFitsViewport(page);
  await page.locator('#q-name').fill('Quote draft test');
  await page.locator('#q-email').fill('qa@example.test');
  await page.locator('#q-note').fill('Keep this draft while I review the selected experiences.');
  // Do not submit: both PDF issuance and inquiry submission notify the business.
  await page.getByTestId('quote-prev').click();
  const rental = await openOptions(page, 'rental');
  await expect(rental.locator('#k-months')).toHaveValue('3');
  await expectTotal(page, configured);
  await page.getByTestId('quote-next').click();
  await expect(page.locator('#q-name')).toHaveValue('Quote draft test');
  await expect(page.locator('#q-email')).toHaveValue('qa@example.test');
  await expect(page.locator('#q-note')).toHaveValue('Keep this draft while I review the selected experiences.');
  await page.getByTestId('quote-prev').click();
  await page.getByTestId('quote-prev').click();
  await expect(page.locator('[data-quote-page="2"]')).toBeVisible();
  await page.getByTestId('quote-prev').click();
  await expect(page.locator('#q-attendees')).toHaveValue('360');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toBeVisible();
  await expect.poll(() => savedQuote(page)).toEqual(configured);
  await expectTotal(page, configured);
});

test('English journey supports the keyboard, real thumbnails and each screen size', async ({ page, isMobile }, testInfo) => {
  await page.goto('/en/quote', { waitUntil: 'domcontentloaded' });
  const studio = page.getByTestId('quote-studio');
  await expect(studio).toBeVisible();
  await expectStartChoice(page);
  await expectFitsViewport(page);
  await page.getByTestId('quote-start-templates').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('quote-preset-campus-festival')).toBeVisible();
  await expect(page.getByTestId('quote-preset-campus-festival').locator('img')).toHaveAttribute('src', /campus-festival-generated/);
  await expect(page.getByTestId('quote-preset-brand-popup').locator('img')).toHaveAttribute('src', /hurease-launch-2025-01/);
  await expect(page.getByTestId('quote-preset-public-tourism').locator('img')).toHaveAttribute('src', /ai-celeb-lookalike/);
  const thumbnails = page.locator('[data-quote-step="0"] img');
  expect(await thumbnails.count()).toBeGreaterThanOrEqual(4);
  for (const thumbnail of await thumbnails.all()) {
    await thumbnail.scrollIntoViewIfNeeded();
    await expect(thumbnail).not.toHaveAttribute('alt', '');
    await expect.poll(() => thumbnail.evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  const preset = page.getByTestId('quote-preset-campus-festival');
  await preset.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
  await expect(page.locator('#q-attendees')).toHaveValue('300');
  await expectNamedControls(page.locator('[data-quote-step="1"]'));
  await expectFitsViewport(page);
  await toExperiences(page);
  const rental = await openOptions(page, 'rental');
  const mode = rental.getByRole('radiogroup', { name: QUOTE_COPY.en.mode, exact: true });
  await mode.getByRole('radio').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(mode.getByRole('radio').nth(1)).toBeChecked();
  await expect(rental.locator('#k-months')).toBeVisible();
  await expectNamedControls(rental);
  await expectFitsViewport(page);
  await page.getByTestId('quote-next').click();
  const form = page.locator('[data-quote-step="3"]');
  await expect(form).toBeVisible();
  await expect(form.getByRole('button', { name: QUOTE_COPY.en.pdf, exact: true })).toBeVisible();
  await expect(form.getByRole('button', { name: QUOTE_COPY.en.request, exact: true })).toBeVisible();
  await expectNamedControls(form);
  await expectTotal(page, await savedQuote(page), 'en');
  await expectFitsViewport(page);
  if (isMobile) {
    await page.setViewportSize({ width: 320, height: 844 });
    await expectFitsViewport(page);
    // 행사 정보(1)는 두 쪽이라 두 번 돌아간다
    for (const step of [2, 1, 1, 0]) {
      await page.getByTestId('quote-prev').click();
      await expect(page.locator(`[data-quote-step="${step}"]`)).toBeVisible();
      await expectFitsViewport(page);
      if (step === 2) await page.screenshot({ path: testInfo.outputPath('quote-en-320.png'), fullPage: true });
    }
  }
});

test('preset, product and experience links preserve incoming quote context', async ({ page }) => {
  const preset = QUOTE_PRESETS.find((entry) => entry.id === 'public-tourism')!;
  await page.goto('/quote?preset=public-tourism', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
  await expect.poll(() => savedQuote(page)).toEqual(sanitizeInput(preset.input));
  await expectTotal(page, preset.input);

  await page.goto('/quote?item=photoBooth', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
  await expect.poll(async () => (await savedQuote(page)).items.map((item) => item.key)).toEqual(['rental', 'photoBooth']);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect.poll(async () => (await savedQuote(page)).items.map((item) => item.key)).toEqual(['rental', 'photoBooth']);

  await page.goto('/quote?service=ai-personal-color', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
  await expect.poll(async () => (await savedQuote(page)).items.find((item) => item.key === 'rental')?.options.experienceSlug).toBe('ai-personal-color');
  await toExperiences(page);
  const rental = await openOptions(page, 'rental');
  await expect(rental.locator('#k-exp')).toContainText('AI 퍼스널 컬러 진단');
  await expect(page.getByTestId('quote-add-photoBooth')).toHaveAttribute('aria-pressed', 'true');
  await expectTotal(page, await savedQuote(page));
  await expectFitsViewport(page);
});

const clearedQuote = sanitizeInput({
  eventType: 'popup', eventDate: '', days: 1, hoursPerDay: 6,
  attendees: 100, region: 'capital', extraStaff: 0, items: [],
});

for (const entry of [
  { name: 'Korean preset', lang: 'ko' as const, path: '/quote', query: 'preset=public-tourism&item=photoBooth&service=ai-personal-color' },
  { name: 'English product', lang: 'en' as const, path: '/en/quote', query: 'item=photoBooth' },
  { name: 'English experience', lang: 'en' as const, path: '/en/quote', query: 'service=ai-personal-color' },
]) {
  test(`clear quote resets a ${entry.name} link and stays empty after reload`, async ({ page }) => {
    await page.goto(`${entry.path}?${entry.query}&utm_source=reset-check#quote-summary`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
    await expect.poll(async () => (await savedQuote(page)).items.length).toBeGreaterThan(0);
    await page.locator('#q-days').fill('3');

    if (entry.lang === 'ko') {
      await toExperiences(page);
      await page.getByTestId('quote-next').click();
      await page.locator('#q-name').fill('Saved contact draft');
      await page.locator('#q-email').fill('draft@example.test');
      await page.locator('#q-note').fill('Keep these contact details while I choose again.');
    }

    const clear = page.getByTestId('quote-clear');
    await expect(clear).toHaveText(QUOTE_COPY[entry.lang].clearQuote);
    await expect(clear).toBeEnabled();
    await clear.click();
    await expectStartChoice(page);
    await expectTotal(page, clearedQuote, entry.lang);
    await expect.poll(() => savedQuote(page)).toEqual(clearedQuote);
    await expect(clear).toBeDisabled();
    await expect(page.locator('[data-testid^="quote-preset-"][aria-pressed="true"]')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${entry.path}\\?utm_source=reset-check#quote-summary$`));
    await expectFitsViewport(page);

    if (entry.lang === 'ko') {
      await page.getByTestId('quote-start-blank').click();
      await expect(page.locator('#q-days')).toHaveValue('1');
      await toExperiences(page);
      await page.getByTestId('quote-add-photoBooth').click();
      await expect(page.getByTestId('quote-add-photoBooth')).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => calculateQuote(await savedQuote(page)).total).toBeGreaterThan(0);
      await page.getByTestId('quote-next').click();
      await expect(page.locator('#q-name')).toHaveValue('Saved contact draft');
      await expect(page.locator('#q-email')).toHaveValue('draft@example.test');
      await expect(page.locator('#q-note')).toHaveValue('Keep these contact details while I choose again.');
      // Keep this test read-only: PDF and request submission can notify the business.
      await clear.click();
      await expect.poll(() => savedQuote(page)).toEqual(clearedQuote);
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectStartChoice(page);
    await expectTotal(page, clearedQuote, entry.lang);
    await expect.poll(() => savedQuote(page)).toEqual(clearedQuote);
    await expect(clear).toBeDisabled();
  });
}

test('clear quote resets event conditions even before experiences are selected', async ({ page }) => {
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  const clear = page.getByTestId('quote-clear');
  await expect(clear).toBeDisabled();
  await page.getByTestId('quote-start-blank').click();
  const conditions = page.locator('[data-quote-step="1"]');
  await page.locator('#q-days').fill('4');
  await toConditionsDetail(page);
  await page.locator('#q-staff').fill('2');
  await page.locator('#q-setup').check();
  await expect.poll(async () => (await savedQuote(page)).setupDayBefore).toBe(true);
  expect((await savedQuote(page)).items).toEqual([]);
  await expect(clear).toBeEnabled();
  await clear.click();
  await expectStartChoice(page);
  await expect.poll(() => savedQuote(page)).toEqual(clearedQuote);
  await expectTotal(page, clearedQuote);
  await expect(clear).toBeDisabled();
  await page.getByTestId('quote-start-blank').click();
  await expect(page.locator('#q-days')).toHaveValue('1');
  await toConditionsDetail(page);
  await expect(page.locator('#q-staff')).toHaveValue('0');
  await expect(page.locator('#q-setup')).not.toBeChecked();
});
