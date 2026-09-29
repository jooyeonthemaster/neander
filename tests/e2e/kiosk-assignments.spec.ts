import { expect, test, type Page } from '@playwright/test';
import { closePreviewOptions, shiftKioskExperience, toggleKioskExperience, nextPreviewStep, openPreviewDetails, openPreviewOptions, showKioskGalleryPage, showOptionPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { getKioskExperience, KIOSK_EXPERIENCES } from '../../src/lib/quote/kiosk-experiences';
import { normalizePreviewInput } from '../../src/lib/quote-preview/flow-storage';
import { QUOTE_PRESETS } from '../../src/lib/quote/presets';

const FLOW_KEY = 'neander-quote-preview-flow-v1';
const LIVE_KEY = 'neander-quote-v2';
const a = 'ai-personal-color', b = 'ai-face-reading', c = 'ai-travel-style', d = 'ai-sommelier';
const step = (page: Page, index: number) => page.locator(`[data-quote-step="${index}"]`);
const name = (slug: string, lang: 'ko' | 'en') => getKioskExperience(slug)!.name[lang];

async function saved(page: Page, key = FLOW_KEY): Promise<QuoteInput> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key);
}
async function passConditions(page: Page) {
  await expect(step(page, 1)).toHaveAttribute('data-quote-page', '1');
  await nextPreviewStep(page);
  await expect(step(page, 1)).toHaveAttribute('data-quote-page', '2');
  await nextPreviewStep(page);
  await expect(step(page, 2)).toBeVisible();
}
async function expectTotal(page: Page, expected?: number) {
  await expect.poll(async () => Number(await page.getByTestId('quote-total').getAttribute('data-amount')) - calculateQuote(await saved(page), 'ko').total).toBe(0);
  if (expected !== undefined) await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(expected));
}
async function changeCount(page: Page, count: number) {
  await showOptionPage(page, 'rental', 'basic');
  await page.locator('#k-count').fill(String(count));
  await page.locator('#k-count').press('Enter');
}
async function expectAssignments(page: Page, assignments: string[], lang: 'ko' | 'en') {
  // 체험은 한 페이지에서 여러 개 골라 기기에 나눠 담는다 — 페이지는 하나, 배정은 기기마다 남는다
  await showOptionPage(page, 'rental', 'kiosk-1');
  // Device-specific views are intentionally behind the explicit detail toggle.
  await openPreviewDetails(page);
  await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', assignments.join(','));
  await expect(page.getByTestId('rental-scene-kiosk')).toHaveCount(assignments.length);
  const chosen = [...new Set(assignments.filter(Boolean))];
  const gallery = page.getByTestId('kiosk-experience-gallery-1');
  await expect(gallery).toBeVisible();
  const role = assignments.length > 1 ? 'checkbox' : 'radio';
  if (!chosen.length) await expect(gallery.getByRole(role, { checked: true })).toHaveCount(0);
  for (const slug of chosen) {
    const index = KIOSK_EXPERIENCES.findIndex(experience => experience.slug === slug);
    await showKioskGalleryPage(page, 1, Math.floor(index / 4) + 1, lang);
    const card = page.getByTestId(`kiosk-experience-1-${slug}`);
    await expect(card).toHaveAccessibleName(name(slug, lang));
    await expect(card).toHaveAttribute('aria-checked', 'true');
  }
  if (assignments.length > 1 && chosen.length) {
    for (const slug of chosen) await expect(page.getByTestId(`kiosk-distribution-${slug}`)).toHaveAttribute('data-count', String(assignments.filter((current) => current === slug).length));
  }
  for (const [index, slug] of assignments.entries()) {
    const number = index + 1;
    await expect(page.getByTestId('rental-scene-kiosk').nth(index)).toHaveAttribute('data-instance', String(number));
    await expect(page.getByTestId('rental-scene-kiosk').nth(index)).toHaveAttribute('data-experience-slug', slug);
    await expect(page.getByTestId(`preview-kiosk-assignment-${number}`)).toHaveAttribute('data-experience-slug', slug);
    if (slug) await expect(page.getByTestId(`preview-kiosk-assignment-${number}`)).toContainText(name(slug, lang));
  }
  await expect.poll(async () => (await saved(page)).items.find((item) => item.key === 'rental')!.options.experienceSlugs).toEqual(assignments);
  expect((await saved(page)).items.find((item) => item.key === 'rental')!.options.extraContents).toBe(0);
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: each kiosk keeps its own included experience through resizing, event rental and all four steps`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const generationRequests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/demo-ai/**', route => { generationRequests.push(route.request().url()); return route.abort(); });
    await page.goto(lang === 'ko' ? '/quote-preview' : '/en/quote-preview', { waitUntil: 'domcontentloaded' });
    await expect(step(page, 0)).toBeVisible();
    await page.getByTestId('quote-start-blank').click();
    await passConditions(page);
    await openPreviewOptions(page, 'rental');
    await expectAssignments(page, [''], lang);
    await expect(page.locator('#k-contents')).toHaveCount(0);
    await expect(page.locator('[data-testid="kiosk-experience-assignments"] select')).toHaveCount(0);
    await changeCount(page, 4);
    await expectAssignments(page, ['', '', '', ''], lang);
    const baseline = calculateQuote(await saved(page), lang).total;

    const gallery = await showKioskGalleryPage(page, 1, 1, lang);
    const flow = page.getByTestId('quote-options-rental').getByTestId('option-pages');
    const slot = page.getByTestId('kiosk-assignment-1');
    const previous = slot.getByRole('button', { name: lang === 'ko' ? '이전 체험 보기' : 'Previous experiences', exact: true });
    const next = slot.getByRole('button', { name: lang === 'ko' ? '다음 체험 보기' : 'Next experiences', exact: true });
    await expect(previous).toBeDisabled();
    await gallery.focus();
    await page.keyboard.press('End');
    await expect(gallery).toHaveAttribute('data-gallery-page', '6');
    await expect(next).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(gallery).toHaveAttribute('data-gallery-page', '5');
    await page.keyboard.press('ArrowRight');
    await expect(gallery).toHaveAttribute('data-gallery-page', '6');
    await page.keyboard.press('Home');
    await expect(gallery).toHaveAttribute('data-gallery-page', '1');
    if (testInfo.project.name === 'mobile') {
      const touch = await page.context().newCDPSession(page);
      for (const direction of [-1, 1]) {
        const box = (await gallery.boundingBox())!;
        const start = { x: box.x + box.width * (direction < 0 ? .8 : .2), y: box.y + box.height / 2 };
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
        for (let step = 1; step <= 5; step++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + direction * box.width * .6 * step / 5, y: start.y, id: 1 }] });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect(gallery).toHaveAttribute('data-gallery-page', direction < 0 ? '2' : '1');
      }
      await touch.detach();
      await page.waitForTimeout(400);
    }
    await expect(page.getByTestId('kiosk-assignment-1')).toHaveAttribute('data-experience-slug', '');
    const measurements: unknown[] = [];
    const viewports = testInfo.project.name === 'mobile' ? [{ width: 390, height: 844 }] : [{ width: 1440, height: 900 }, { width: 1366, height: 768 }];
    for (const [viewportIndex, viewport] of viewports.entries()) {
      await closePreviewOptions(page);
      await page.setViewportSize(viewport);
      if (testInfo.project.name === 'mobile') {
        // Measure the compact card layout with enough anchor space above it.
        // A balloon opened midway down a small screen intentionally scrolls.
        await page.getByTestId('quote-edit-rental').evaluate(element => {
          const anchor = element.querySelector('[data-options-anchor]') ?? element;
          window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - 680, behavior: 'instant' });
        });
      }
      for (let view = 1; view <= 6; view++) {
        await showKioskGalleryPage(page, 1, view, lang);
        await expect(gallery.getByRole('checkbox')).toHaveCount(4);
        for (const experience of KIOSK_EXPERIENCES.slice((view - 1) * 4, view * 4)) {
          const card = page.getByTestId(`kiosk-experience-1-${experience.slug}`);
          await expect(card).toHaveRole('checkbox');
          await expect(card).toHaveAccessibleName(experience.name[lang]);
          await expect(card.locator('svg').first()).toBeVisible();
          const titleFits = await card.getByText(experience.name[lang], { exact: true }).evaluate(element => {
            const title = element.getBoundingClientRect();
            const card = element.closest('[role="checkbox"]')!.getBoundingClientRect();
            const demo = element.closest('article')!.querySelector('[data-testid^="kiosk-demo-"]')!.getBoundingClientRect();
            return title.top >= card.top - 1 && title.bottom <= card.bottom + 1
              && !(title.right > demo.left && title.bottom > demo.top);
          });
          expect.soft(titleFits, `${lang}: ${experience.slug} title fits above its demo link`).toBe(true);
          if (viewportIndex === 0) {
            // 하나만 고르면 4대 모두 그 체험, 다시 누르면 빠진다
            await card.click();
            await expect(card).toHaveAttribute('aria-checked', 'true');
            await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', Array(4).fill(experience.slug).join(','));
            await card.click();
            await expect(card).toHaveAttribute('aria-checked', 'false');
          }
        }
        await expect(flow).toHaveAttribute('data-current-page', 'kiosk-1');
        await expect(flow).toHaveAttribute('data-total-steps', '2');
        await expectTotal(page, baseline);
        const size = await page.getByTestId('quote-options-rental').getByTestId('option-page-scroll').evaluate(el => ({
          height: el.clientHeight, content: el.scrollHeight, overflow: el.scrollHeight - el.clientHeight,
        }));
        measurements.push({ ...viewport, lang, galleryPage: view, ...size });
        expect.soft(size.overflow, `${lang} ${viewport.width} kiosk gallery ${view}`).toBeLessThanOrEqual(1);
        if (view === 1 || view === 6) {
          await page.mouse.move(5, 100);
          await page.waitForTimeout(250);
          await page.screenshot({ path: testInfo.outputPath(`${viewport.width}-gallery-${view}-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
        }
      }
    }
    if (testInfo.project.name === 'desktop') {
      await closePreviewOptions(page);
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    // The actual demo's welcome screen opens above the editor. No upload,
    // camera, generation, or external-page action is performed.
    const url = page.url(), pageCount = page.context().pages().length;
    const demoSelection = await saved(page);
    for (const [index, slug] of [d, c].entries()) {
      const templateIndex = KIOSK_EXPERIENCES.findIndex(experience => experience.slug === slug);
      const galleryPage = Math.floor(templateIndex / 4) + 1;
      await showKioskGalleryPage(page, 1, galleryPage, lang);
      const demo = page.getByTestId(`kiosk-demo-1-${slug}`);
      await expect(demo).toHaveText(lang === 'ko' ? '데모 체험' : 'Try demo');
      await demo.click();
      const modal = page.locator('.demo-modal-panel[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal.locator(`[data-program="${slug}"] .venue-shell`)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId('quote-options-popover')).toHaveAttribute('inert', '');
      expect(page.url()).toBe(url);
      expect(page.context().pages()).toHaveLength(pageCount);
      if (index === 0) {
        await page.waitForTimeout(250);
        await page.screenshot({ path: testInfo.outputPath(`kiosk-demo-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
        await page.keyboard.press('Escape');
      } else await modal.locator('[data-demo-return]:visible').first().click();
      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('quote-options-popover')).toBeVisible();
      await expect(page.getByTestId('quote-options-popover')).not.toHaveAttribute('inert', '');
      await expect(demo).toBeFocused();
      await expect(gallery).toHaveAttribute('data-gallery-page', String(galleryPage));
      await expect(flow).toHaveAttribute('data-current-page', 'kiosk-1');
      expect(await saved(page)).toEqual(demoSelection);
      await expectTotal(page, baseline);
    }
    await expectAssignments(page, ['', '', '', ''], lang);

    // 여러 대: 체험을 고를 때마다 고르게 나눠 담는다. 방향키는 초점만 옮기고 고르지 않는다
    await showKioskGalleryPage(page, 1, 1, lang);
    const first = page.getByTestId(`kiosk-experience-1-${a}`);
    await expect(first).toHaveAccessibleName(name(a, lang));
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('kiosk-experience-1-ai-skincare-analysis')).toHaveAttribute('aria-checked', 'false');
    await expectAssignments(page, [a, a, a, a], lang);
    await toggleKioskExperience(page, b, lang);
    await expectAssignments(page, [a, a, b, b], lang);
    await toggleKioskExperience(page, c, lang);
    await expectAssignments(page, [a, a, b, c], lang);
    await shiftKioskExperience(page, c, 1);
    await expectAssignments(page, [a, b, c, c], lang);
    await expect(page.getByTestId(`kiosk-distribution-less-${a}`)).toBeDisabled();
    await toggleKioskExperience(page, d, lang);
    await expectAssignments(page, [a, b, c, d], lang);
    // 4대에 4종을 고르면 더는 고를 수 없다 (하나를 빼면 다시 고를 수 있다)
    await showKioskGalleryPage(page, 1, 1, lang);
    await expect(page.getByTestId('kiosk-experience-1-ai-skincare-analysis')).toHaveAttribute('aria-disabled', 'true');
    await toggleKioskExperience(page, d, lang);
    await expectAssignments(page, [a, a, b, c], lang);
    await toggleKioskExperience(page, b, lang);
    await expectAssignments(page, [a, a, c, c], lang);
    await expectTotal(page, baseline);

    await page.getByTestId('service-preview-view-experience').click();
    for (const [index, slug] of [a, a, c, c].entries()) {
      const card = page.getByTestId(`preview-kiosk-experience-${index + 1}`);
      await expect(card).toHaveAttribute('data-experience-slug', slug);
      await expect(card).toContainText(name(slug, lang));
    }
    await page.getByTestId('service-preview').screenshot({ path: testInfo.outputPath(`assigned-experiences-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
    await page.getByTestId('service-preview-view-scene').click();

    await changeCount(page, 2);
    await expectAssignments(page, [a, a], lang);
    await changeCount(page, 4);
    await expectAssignments(page, [a, a, '', ''], lang);
    await expectTotal(page, baseline);
    // 정하지 않은 기기는 + 로 채운다
    await shiftKioskExperience(page, a, 1);
    await expectAssignments(page, [a, a, a, ''], lang);
    await expectTotal(page, baseline);

    const options = page.getByTestId('quote-options-rental');
    await showOptionPage(page, 'rental', 'basic');
    await expect(options.getByRole('radiogroup', { name: QUOTE_COPY[lang].mode, exact: true })).toHaveCount(0);
    await expect(options.getByTestId('option-tab-months')).toHaveCount(0);
    await expect(options.locator('#k-months')).toHaveCount(0);
    await expect(options.getByTestId('kiosk-event-rental-note')).toBeVisible();
    await expect(options.getByTestId('option-pages')).toHaveAttribute('data-total-steps', '2');
    await expect(page.getByTestId('kiosk-scene')).toHaveAttribute('data-mode', 'event');
    await expect(options.getByTestId('option-tab-printing')).toHaveCount(0);
    await expect(options.locator('#k-printer')).toHaveCount(0);
    await expect(page.getByTestId('rental-scene-printer')).toHaveCount(0);
    await expectAssignments(page, [a, a, a, ''], lang);
    await expectTotal(page);
    const selected = await saved(page);
    await page.getByTestId('service-preview').screenshot({ path: testInfo.outputPath(`assigned-kiosks-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
    await nextPreviewStep(page);
    await expect(step(page, 3)).toBeVisible();
    const summary = page.getByRole('complementary', { name: QUOTE_COPY[lang].sheetTitle });
    // 요약은 체험별 대수로 묶는다
    await expect(summary).toContainText(lang === 'ko' ? `${name(a, lang)} 3대` : `${name(a, lang)} ×3`);
    await expect(summary).toContainText(lang === 'ko' ? '상담 후 결정 1대' : 'Decide later ×1');
    await page.getByTestId('quote-prev').click();
    await expectAssignments(page, [a, a, a, ''], lang);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(step(page, 0)).toBeVisible();
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 1개/ : /You have 1 saved experiences/ }).click();
    await openPreviewOptions(page, 'rental');
    await expectAssignments(page, [a, a, a, ''], lang);
    await expect.poll(() => saved(page)).toEqual(selected);
    await expectTotal(page);
    await expect(page.getByTestId('quote-preview-lab').locator('img, canvas, svg image')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(generationRequests).toEqual([]);
    expect(errors).toEqual([]);
    await testInfo.attach('kiosk-gallery-dimensions', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
  });
}


for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: a saved monthly preview becomes event rental while assignments and live subscriptions survive`, async ({ page }, testInfo) => {
    const legacy = sanitizeInput({ days: 1, items: [{ key: 'rental', options: {
      mode: 'monthly', months: 2, kiosks: 2, experienceSlugs: [a, b], printer: true, custom: 'brand',
    } }] });
    const serialized = JSON.stringify(legacy);
    await page.addInitScript(({ flowKey, liveKey, value }) => {
      if (!sessionStorage.getItem('kiosk-event-migration-seeded')) {
        localStorage.setItem(flowKey, value);
        localStorage.setItem(liveKey, value);
        sessionStorage.setItem('kiosk-event-migration-seeded', 'yes');
      }
    }, { flowKey: FLOW_KEY, liveKey: LIVE_KEY, value: serialized });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 1개/ : /You have 1 saved experiences/ }).click();
    await expectAssignments(page, [a, b], lang);
    const normalized = normalizePreviewInput(legacy);
    await expect.poll(() => saved(page)).toEqual(normalized);
    expect(normalized.items[0].options).toMatchObject({ mode: 'event', months: 1, kiosks: 2, experienceSlugs: [a, b], printer: false, custom: 'brand' });
    const oneDay = calculateQuote(normalized, lang).total;
    expect(oneDay).not.toBe(calculateQuote(legacy, lang).total);
    await expectTotal(page, oneDay);
    const options = await showOptionPage(page, 'rental', 'basic');
    await expect(options.getByTestId('kiosk-event-rental-note')).toBeVisible();
    await expect(options.getByRole('radiogroup', { name: QUOTE_COPY[lang].mode, exact: true })).toHaveCount(0);
    await expect(options.getByTestId('option-tab-months')).toHaveCount(0);
    await expect(options.locator('#k-months')).toHaveCount(0);
    await expect(options.getByTestId('option-pages')).toHaveAttribute('data-total-steps', '2');
    await expect(page.getByTestId('kiosk-scene')).toHaveAttribute('data-mode', 'event');
    await expect(page.getByTestId('rental-scene-printer')).toHaveCount(0);

    // Event duration changes the rental fee; a stored subscription month count
    // must never continue driving the preview price after migration.
    await closePreviewOptions(page);
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 1)).toHaveAttribute('data-quote-page', '2');
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 1)).toHaveAttribute('data-quote-page', '1');
    await page.locator('#q-days').fill('3');
    await page.locator('#q-days').press('Enter');
    await expectTotal(page, oneDay + 880_000);
    await passConditions(page);
    await expectAssignments(page, [a, b], lang);
    await showOptionPage(page, 'rental', 'basic');
    const threeDays = await saved(page);
    expect(threeDays).toEqual({ ...normalized, days: 3 });
    await expectTotal(page, calculateQuote(threeDays, lang).total);
    await page.mouse.move(5, 100);
    await page.waitForTimeout(250);
    await page.screenshot({ path: testInfo.outputPath(`event-rental-migration-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 1개/ : /You have 1 saved experiences/ }).click();
    await expectAssignments(page, [a, b], lang);
    await expect.poll(() => saved(page)).toEqual(threeDays);
    await expectTotal(page, oneDay + 880_000);
    expect(await page.evaluate(key => localStorage.getItem(key), LIVE_KEY)).toBe(serialized);

    // /quote 도 같은 체험 편집 화면을 쓴다 — 저장된 월 이용은 행사 기간 대여로 바뀌고 배정은 그대로
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 1개/ : /You have 1 saved experiences/ }).click();
    await openPreviewOptions(page, 'rental');
    await showOptionPage(page, 'rental', 'kiosk-1');
    await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', `${a},${b}`);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(normalized, lang).total));
  });
}

test('preview drafts, presets and incoming experiences assign device slots while the live legacy quote keeps its old controls and fee', async ({ page }) => {
  const legacy = sanitizeInput({ items: [{ key: 'rental', options: { kiosks: 3, experienceSlug: a, extraContents: 2, printer: true } }] });
  await page.addInitScript(({ flowKey, liveKey, value }) => {
    if (!sessionStorage.getItem('kiosk-assignment-seeded')) {
      localStorage.setItem(flowKey, value);
      localStorage.setItem(liveKey, value);
      sessionStorage.setItem('kiosk-assignment-seeded', 'yes');
    }
  }, { flowKey: FLOW_KEY, liveKey: LIVE_KEY, value: JSON.stringify(legacy) });
  await page.goto('/quote-preview', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /담아 둔 체험 1개/ }).click();
  await openPreviewOptions(page, 'rental');
  await expectAssignments(page, [a, '', ''], 'ko');
  await toggleKioskExperience(page, b, 'ko');
  await toggleKioskExperience(page, c, 'ko');
  await expectAssignments(page, [a, b, c], 'ko');
  await page.goto(`/quote-preview?service=${d}`, { waitUntil: 'domcontentloaded' });
  await passConditions(page);
  await expectAssignments(page, [d, b, c], 'ko');
  await expectTotal(page);

  await page.goto('/quote-preview?preset=public-tourism', { waitUntil: 'domcontentloaded' });
  await passConditions(page);
  await expectAssignments(page, [c, ''], 'ko');
  const preset = QUOTE_PRESETS.find((entry) => entry.id === 'public-tourism')!;
  await expectTotal(page, calculateQuote(normalizePreviewInput(preset.input), 'ko').total);
  await page.evaluate((key) => localStorage.removeItem(key), FLOW_KEY);
  await page.goto('/quote-preview?item=rental', { waitUntil: 'domcontentloaded' });
  await passConditions(page);
  await expectAssignments(page, [''], 'ko');
  await page.evaluate((key) => localStorage.removeItem(key), FLOW_KEY);
  await page.goto(`/quote-preview?service=${b}`, { waitUntil: 'domcontentloaded' });
  await passConditions(page);
  await expectAssignments(page, [b], 'ko');
  expect(await page.evaluate((key) => localStorage.getItem(key), LIVE_KEY)).toBe(JSON.stringify(legacy));

  // /quote 도 같은 체험 편집 화면 — 예전 저장(체험 1종 + 추가 콘텐츠)은 기기별 배정으로 옮겨진다
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'live');
  await page.getByRole('button', { name: /담아 둔 체험 1개/ }).click();
  await openPreviewOptions(page, 'rental');
  await showOptionPage(page, 'rental', 'kiosk-1');
  await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', `${a},,`);
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(normalizePreviewInput(legacy), 'ko').total));
});
