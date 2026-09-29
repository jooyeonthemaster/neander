import { expect, test, type Page } from '@playwright/test';
import { closePreviewOptions, nextPreviewStep, openPreviewDetails, openPreviewOptions, showOptionPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { QUOTE_STORAGE_KEY } from '../../src/components/quote-studio/history';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { COMMON, SPACE } from '../../src/lib/quote/catalog';
import { createPreviewInput, PREVIEW_STORAGE_KEY } from '../../src/lib/quote-preview/model';

const c = QUOTE_COPY.ko;
const FLOW_STORAGE_KEY = 'neander-quote-preview-flow-v1';
const section = (page: Page, step: number) => page.locator('[data-quote-step="' + step + '"]');

async function openPreview(page: Page, lang: 'ko' | 'en' = 'ko') {
  await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'preview');
  await expect(section(page, 0)).toBeVisible();
}

async function savedPreview(page: Page): Promise<QuoteInput> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), FLOW_STORAGE_KEY);
}

async function expectPriceParity(page: Page) {
  await expect.poll(async () => {
    const expected = calculateQuote(await savedPreview(page), 'ko').total;
    return Number(await page.getByTestId('quote-total').getAttribute('data-amount')) - expected;
  }).toBe(0);
}

async function expectOnlyVectors(page: Page) {
  const lab = page.getByTestId('quote-preview-lab');
  await expect(lab.locator('img, canvas, svg image')).toHaveCount(0);
  const rasterBackgrounds = await lab.evaluate((root) => [...root.querySelectorAll('*')].flatMap((element) => {
    const style = getComputedStyle(element);
    const values = [style.backgroundImage, style.maskImage];
    return values.filter((value) => /url\([^)]*\.(?:png|jpe?g|webp|gif|avif)/i.test(value));
  }));
  expect(rasterBackgrounds).toEqual([]);
}

async function openDetails(page: Page) {
  await openPreviewDetails(page);
}

async function expectScene(page: Page, space: string, options: { view?: string; photozone?: boolean; lighting?: boolean } = {}) {
  await openDetails(page);
  const scene = page.getByTestId('preview-scene');
  await expect(scene).toHaveAttribute('data-view', options.view ?? 'combined');
  await expect(scene).toHaveAttribute('data-space', space);
  await expect(scene).toHaveAttribute('data-photozone', String(options.photozone ?? false));
  await expect(scene).toHaveAttribute('data-lighting', String(options.lighting ?? false));
  await expect(scene.locator('svg').first()).toBeVisible();
  await expect(scene.locator('img, image, canvas')).toHaveCount(0);
}

async function expectProduct(page: Page, volume: string, packaging: string) {
  await openDetails(page);
  const product = page.getByTestId('preview-product');
  await expect(product).toHaveAttribute('data-volume', volume);
  await expect(product).toHaveAttribute('data-packaging', packaging);
  await expect(product.locator('svg').first()).toBeVisible();
  await expect(product.locator('img, image, canvas')).toHaveCount(0);
}

async function passConditions(page: Page) {
  await expect(section(page, 1)).toHaveAttribute('data-quote-page', '1');
  await nextPreviewStep(page);
  await expect(section(page, 1)).toHaveAttribute('data-quote-page', '2');
  await nextPreviewStep(page);
  await expect(section(page, 2)).toBeVisible();
}

async function beginBlank(page: Page, lang: 'ko' | 'en' = 'ko') {
  await openPreview(page, lang);
  const steps = page.getByRole('navigation', { name: lang === 'ko' ? '견적 만들기 단계' : 'Estimate steps' }).getByRole('button');
  await expect(steps).toHaveCount(4);
  for (const [index, label] of QUOTE_COPY[lang].stepLabels.entries()) {
    await expect(steps.nth(index)).toContainText(label);
  }
  await page.getByTestId('quote-start-blank').click();
  await passConditions(page);
}

async function editService(page: Page, key: string) {
  const panel = await showOptionPage(page, key, 'basic');
  await openDetails(page);
  return panel;
}

async function addPerfumeAndSpace(page: Page) {
  await openPreviewOptions(page, 'acscent');
  await openPreviewOptions(page, 'spatialDesign');
  await openDetails(page);
  await page.getByTestId('preview-view-combined').click();
  await expectScene(page, 'booth3x3');
  await expectPerfumeScene(page, 0, 1);
}

async function expectPerfumeScene(page: Page, kiosks: number, teams: number) {
  await openDetails(page);
  const scene = page.getByTestId('perfumery-scene');
  await expect(scene).toHaveAttribute('data-kiosks', String(kiosks));
  await expect(scene).toHaveAttribute('data-teams', String(teams));
  await expect(scene).toHaveAttribute('data-staff', String(teams * 2));
  await expect(scene.getByTestId('scene-kiosk')).toHaveCount(kiosks);
  await expect(scene.getByTestId('scene-team')).toHaveCount(teams);
  await expect(scene.getByTestId('scene-counter')).toHaveCount(1);
  for (const kiosk of await scene.getByTestId('scene-kiosk').all()) {
    await expect(kiosk).toHaveAttribute('data-placement', 'scene');
  }
  const clippedObjects = await scene.locator('[data-placement="scene"]').evaluateAll((objects) => objects.flatMap((object) => {
    const svg = object.closest('svg');
    if (!svg) return ['Missing SVG parent: ' + object.getAttribute('data-instance')];
    const canvas = svg.getBoundingClientRect();
    const bounds = object.getBoundingClientRect();
    return bounds.left < canvas.left - 1 || bounds.right > canvas.right + 1 || bounds.top < canvas.top - 1 || bounds.bottom > canvas.bottom + 1
      ? [object.getAttribute('data-instance') ?? 'unknown'] : [];
  }));
  expect(clippedObjects).toEqual([]);
}

for (const lang of ['ko', 'en'] as const) {
test(`${lang}: four-step direct flow combines perfume guests and teams, retains scent and packaging choices`, async ({ page }, testInfo) => {
  const c = QUOTE_COPY[lang];
  await beginBlank(page, lang);
  await expect(page.getByTestId('quote-next')).toBeDisabled();
  await expect(page.locator('[data-testid^="quote-add-"]')).toHaveCount(6);
  await addPerfumeAndSpace(page);

  const perfume = await editService(page, 'acscent');
  const basic = perfume.getByTestId('option-page-basic');
  await expect(basic.locator('#p-guests')).toBeVisible();
  const teams = basic.locator('#p-teams');
  await expect(teams).toBeVisible();
  await expect(teams).toHaveValue('1');
  await expect(teams).toHaveAttribute('min', '1');
  await expect(teams).toHaveAttribute('max', '3');
  await expect(perfume.getByTestId('option-tab-teams')).toHaveCount(0);
  expect(await basic.evaluate(element => {
    const guests = element.querySelector('#p-guests')!, teams = element.querySelector('#p-teams')!;
    return !!(guests.compareDocumentPosition(teams) & Node.DOCUMENT_POSITION_FOLLOWING)
      && teams.getBoundingClientRect().top > guests.getBoundingClientRect().top;
  })).toBe(true);
  const oneTeamPrice = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
  for (const teamCount of [2, 3, 1]) {
    await teams.fill(String(teamCount));
    await teams.press('Enter');
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(oneTeamPrice + (teamCount - 1) * 385_000));
    await expect.poll(async () => (await savedPreview(page)).items.find(item => item.key === 'acscent')!.options.extraTeams).toBe(teamCount - 1);
    await expectPerfumeScene(page, 0, teamCount);
  }
  await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: '50ml', exact: true }).check();
  await expectProduct(page, '50ml', 'none');
  await showOptionPage(page, 'acscent', 'packaging');
  const flow = perfume.getByTestId('option-pages');
  const combined = perfume.getByTestId('option-page-packaging');
  await expect(flow).toHaveAttribute('data-total-steps', '4');
  await expect(perfume.getByTestId('option-tab-scent')).toHaveCount(0);
  const scents = combined.getByRole('radiogroup', { name: lang === 'ko' ? '향 구성' : 'Scent selection', exact: true });
  const defaultScent = scents.getByRole('radio').nth(0);
  const scent = scents.getByRole('radio').nth(1);
  const packaging = combined.getByRole('radiogroup', { name: c.premiumPackaging, exact: true });
  await expect(scents.getByRole('radio')).toHaveCount(2);
  await expect(defaultScent).toBeChecked();
  await expect(defaultScent).toHaveAccessibleName(/30/);
  await expect(scent).not.toBeChecked();
  await expect(scent).toBeVisible();
  await expect(packaging.getByRole('radio')).toHaveCount(3);
  const beforeScent = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
  await scent.focus();
  await page.keyboard.press('Space');
  await expect(scent).toBeChecked();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(beforeScent + 979_000));
  await expect(perfume.locator('#p-guests')).toHaveValue('100');
  // All three packaging radios keep normal keyboard selection behavior.
  await packaging.getByRole('radio').nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(packaging.getByRole('radio').nth(1)).toBeChecked();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(beforeScent + 979_000 + 550_000));
  await expectProduct(page, '50ml', 'brand');
  await packaging.getByRole('radio').nth(1).focus();
  await page.keyboard.press('ArrowRight');
  await expect(packaging.getByRole('radio').nth(2)).toBeChecked();
  await expect(perfume.locator('#p-guests')).toHaveValue('300');
  await expect(perfume.locator('#p-guests')).toHaveAttribute('min', '300');
  await expectProduct(page, '50ml', 'custom');
  const warning = combined.getByRole('status');
  await expect(warning).toContainText('100');
  await expect(warning).toContainText('300');
  const withBoxAndScent = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
  await defaultScent.check();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(withBoxAndScent - 979_000));
  await expect(perfume.locator('#p-guests')).toHaveValue('300');
  await scent.check();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(withBoxAndScent));
  const measurements: unknown[] = [];
  const viewports = testInfo.project.name === 'mobile' ? [{ width: 390, height: 844 }] : [{ width: 1440, height: 900 }, { width: 1366, height: 768 }];
  for (const viewport of viewports) {
    await closePreviewOptions(page);
    await page.setViewportSize(viewport);
    for (const topic of ['basic', 'packaging']) {
      await showOptionPage(page, 'acscent', topic);
      if (topic === 'packaging') {
        await expect(warning).toContainText('100');
        await expect(scent).toBeChecked();
        await expect(packaging.getByRole('radio').nth(2)).toBeChecked();
      } else {
        await expect(teams).toBeVisible();
        await expect(basic.locator('#p-guests')).toHaveValue('300');
      }
      await page.mouse.move(5, 100);
      await page.waitForTimeout(250);
      const measured = await perfume.getByTestId('option-page-scroll').evaluate(el => ({
        viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
        available: el.clientHeight, required: el.scrollHeight, overflow: el.scrollHeight - el.clientHeight,
      }));
      measurements.push({ topic, ...measured });
      await page.screenshot({ path: testInfo.outputPath(`${viewport.width}-${topic}-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
      expect.soft(measured.overflow, `${lang} ${viewport.width} perfume ${topic}`).toBeLessThanOrEqual(1);
    }
  }
  if (testInfo.project.name === 'desktop') {
    await closePreviewOptions(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await showOptionPage(page, 'acscent', 'packaging');
  }

  const space = await editService(page, 'spatialDesign');
  await space.getByRole('radiogroup', { name: c.size, exact: true }).getByRole('radio').nth(1).check();
  await showOptionPage(page, 'spatialDesign', 'styling');
  await space.locator('#s-zone').check();
  await showOptionPage(page, 'spatialDesign', 'styling');
  await space.locator('#s-light').check();
  await page.getByTestId('preview-view-combined').click();
  await expectScene(page, 'booth6x3', { photozone: true, lighting: true });

  await editService(page, 'acscent');
  await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: c.analysis, exact: true }).getByRole('radio').nth(1).check();
  await perfume.locator('#p-akiosk').fill('3');
  await perfume.locator('#p-akiosk').press('Enter');
  await expectScene(page, 'booth6x3', { photozone: true, lighting: true });
  await expectPerfumeScene(page, 3, 1);
  await expectPriceParity(page);

  // The shared option component remains mounted across service tabs so it can
  // restore the original guest count after undoing the custom-box minimum.
  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-large').click();
  await expect(flow).toHaveAttribute('data-total-steps', '6');
  await page.getByTestId('perfume-space-booth6x3').click();
  await showOptionPage(page, 'acscent', 'packaging');
  await expect(warning).toContainText('100');
  await expect(scent).toBeChecked();
  await packaging.getByRole('radio').nth(1).check();
  await expect(perfume.locator('#p-guests')).toHaveValue('100');
  await expect(warning).toHaveCount(0);
  const restoredBrand = (await savedPreview(page)).items.find(item => item.key === 'acscent')!;
  expect(restoredBrand.options).toMatchObject({ guests: 100, volume: '50ml', customScent: true, premiumPackaging: true, customBox: false });
  expect(calculateQuote(await savedPreview(page), lang).lines.find(line => line.service === 'acscent' && line.label === (lang === 'ko' ? '고급 선물 포장' : 'Premium gift packaging'))?.amount).toBe(500_000);
  await packaging.getByRole('radio').nth(2).check();
  await expect(perfume.locator('#p-guests')).toHaveValue('300');
  await closePreviewOptions(page);
  await showOptionPage(page, 'acscent', 'packaging');
  await packaging.getByRole('radio').nth(0).check();
  await expect(perfume.locator('#p-guests')).toHaveValue('100');
  await expect(scent).toBeChecked();
  await expectProduct(page, '50ml', 'none');
  const selected = await savedPreview(page);
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();
  await expect(page.getByTestId('preview-scene')).toHaveCount(0);
  await expect(page.getByTestId('perfumery-scene')).toHaveCount(0);
  await page.locator('#q-name').fill('체험 담당자');
  await page.locator('#q-email').fill('preview@example.com');
  await page.getByTestId('quote-prev').click();
  await expect(section(page, 2)).toBeVisible();
  await expect.poll(async () => sanitizeInput(await savedPreview(page))).toEqual(sanitizeInput(selected));
  await expectScene(page, 'booth6x3', { photozone: true, lighting: true });
  await expectPerfumeScene(page, 3, 1);
  await page.getByTestId('preview-view-top').click();
  await expectScene(page, 'booth6x3', { view: 'top', photozone: true, lighting: true });
  await expectPriceParity(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 2개/ : /You have 2 saved experiences/ }).click();
  await showOptionPage(page, 'acscent', 'packaging');
  await expect(scent).toBeChecked();
  await expect(defaultScent).not.toBeChecked();
  await expect(packaging.getByRole('radio').nth(0)).toBeChecked();
  await expect.poll(async () => sanitizeInput(await savedPreview(page))).toEqual(sanitizeInput(selected));
  const restoredPrice = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
  await defaultScent.check();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(restoredPrice - 979_000));
  await closePreviewOptions(page);
  await showOptionPage(page, 'acscent', 'packaging');
  await expect(defaultScent).toBeChecked();
  await scent.check();
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(restoredPrice));
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await testInfo.attach('perfume-options-dimensions', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
});
}

test('perfume booth choices share one space item, preserve options and use the existing quote price', async ({ page }) => {
  await beginBlank(page);
  await openPreviewOptions(page, 'acscent');
  const perfume = await editService(page, 'acscent');
  await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: '50ml', exact: true }).check();
  const originalPerfume = (await savedPreview(page)).items.find((item) => item.key === 'acscent');
  const base = calculateQuote(await savedPreview(page), 'ko').total;
  const total = async () => Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
  const withVat = (amount: number) => Math.round(amount * (1 + COMMON.vatRate));

  await showOptionPage(page, 'acscent', 'space');
  await expect(page.getByTestId('perfume-space-none')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-space', 'existing');
  await expectScene(page, 'existing');
  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-booth3x3').click();
  await expect.poll(total).toBe(base + withVat(SPACE.booth3x3));
  await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', 'acscent');
  await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-space', 'booth3x3');
  await expectScene(page, 'booth3x3');
  // Clicking the selected size is idempotent; it never toggles away or adds a duplicate.
  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-booth3x3').click();
  await expect.poll(async () => (await savedPreview(page)).items.filter((item) => item.key === 'spatialDesign').length).toBe(1);

  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-booth6x3').click();
  await expect.poll(total).toBe(base + withVat(SPACE.booth6x3));
  await expectScene(page, 'booth6x3');
  const space = await editService(page, 'spatialDesign');
  await showOptionPage(page, 'spatialDesign', 'styling');
  await space.locator('#s-zone').check();
  await showOptionPage(page, 'spatialDesign', 'styling');
  await space.locator('#s-light').check();
  await showOptionPage(page, 'spatialDesign', 'basic');
  await space.getByRole('radiogroup', { name: c.size, exact: true }).getByRole('radio').nth(0).check();
  await editService(page, 'acscent');
  await showOptionPage(page, 'acscent', 'space');
  await expect(page.getByTestId('perfume-space-booth3x3')).toHaveAttribute('aria-pressed', 'true');
  await expectScene(page, 'booth3x3', { photozone: true, lighting: true });
  await expect.poll(total).toBe(base + withVat(SPACE.booth3x3 + SPACE.photoZone + SPACE.lighting));

  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-large').click();
  await showOptionPage(page, 'acscent', 'space-area');
  await perfume.locator('#perfume-space-pyeong').fill('27');
  await perfume.locator('#perfume-space-pyeong').press('Enter');
  await expect.poll(async () => (await savedPreview(page)).items.find((item) => item.key === 'spatialDesign')?.options).toEqual({ size: 'large', pyeong: 27, photoZone: true, lighting: true });
  await expect.poll(total).toBe(base + withVat(27 * SPACE.perPyeong + SPACE.photoZone + SPACE.lighting));
  await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-space', 'large');
  await expectScene(page, 'large', { photozone: true, lighting: true });
  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-booth6x3').click();
  await expect.poll(async () => (await savedPreview(page)).items.find((item) => item.key === 'spatialDesign')?.options).toEqual({ size: 'booth6x3', pyeong: 27, photoZone: true, lighting: true });
  await expect.poll(total).toBe(base + withVat(SPACE.booth6x3 + SPACE.photoZone + SPACE.lighting));

  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-none').click();
  await expect.poll(total).toBe(base);
  await expect.poll(async () => (await savedPreview(page)).items.filter((item) => item.key === 'spatialDesign').length).toBe(0);
  await expect.poll(async () => (await savedPreview(page)).items.find((item) => item.key === 'acscent')).toEqual(originalPerfume);
  await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', 'acscent');
  await expectPerfumeScene(page, 0, 1);
  await expectPriceParity(page);
});

test('the main perfume scene shows every selected kiosk and team without adding tables or floor area', async ({ page }) => {
  await beginBlank(page);
  await openPreviewOptions(page, 'acscent');
  const perfume = await editService(page, 'acscent');
  await showOptionPage(page, 'acscent', 'space');
  await page.getByTestId('perfume-space-booth3x3').click();
  await expectPerfumeScene(page, 0, 1);
  await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: c.analysis, exact: true }).getByRole('radio').nth(1).check();
  for (const kiosks of [1, 2, 3, 4]) {
    await perfume.locator('#p-akiosk').fill(String(kiosks));
    await perfume.locator('#p-akiosk').press('Enter');
    await expectPerfumeScene(page, kiosks, 1);
    const tags = await page.getByTestId('scene-kiosk').evaluateAll((nodes) => nodes.map((node) => node.tagName.toLowerCase()));
    expect(new Set(tags)).toEqual(new Set(['g']));
  }
  await expectScene(page, 'booth3x3');

  await showOptionPage(page, 'acscent', 'basic');
  await expect(perfume.locator('#p-teams')).toHaveValue('1');
  for (let teams = 1; teams <= 3; teams++) {
    await perfume.locator('#p-teams').fill(String(teams));
    await perfume.locator('#p-teams').press('Enter');
    await expectPerfumeScene(page, 4, teams);
    await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-space', 'booth3x3');
    await expectOnlyVectors(page);
  }
  await expect(page.getByTestId('scene-overflow')).toBeVisible();
  await expect(page.getByTestId('scene-placement-note')).toBeVisible();
  await expect.poll(async () => (await savedPreview(page)).items.find((item) => item.key === 'spatialDesign')?.options.size).toBe('booth3x3');
  await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: c.analysis, exact: true }).getByRole('radio').nth(0).check();
  await expectPerfumeScene(page, 0, 3);
  await expect(page.getByTestId('perfumery-scene')).toContainText('6명');
  await expectPriceParity(page);
});

test('templates, all six services, migration, reload and clear isolate production drafts and history', async ({ page }) => {
  const production = { ...createPreviewInput(), attendees: 77 };
  const productionDraft = JSON.stringify(production);
  const productionHistory = JSON.stringify([{ no: 'TEST-EXISTING', issuedAt: '2026-09-28T00:00:00.000Z', token: 'test-only-existing-token', total: 123, summary: '기존 견적' }]);
  const legacyInput = createPreviewInput();
  const legacyPerfume = legacyInput.items.find((item) => item.key === 'acscent')!;
  legacyPerfume.options.volume = '50ml';
  const legacyDraft = JSON.stringify({ version: 1, input: legacyInput, parkedSpace: legacyInput.items.find((item) => item.key === 'spatialDesign') });
  await page.addInitScript(({ draftKey, oldKey, draft, history, legacy }) => {
    // Seed once: reseeding on reload would hide accidental writes.
    if (!sessionStorage.getItem('quote-preview-isolation-seeded')) {
      localStorage.setItem(draftKey, draft);
      localStorage.setItem('neander-estimates', history);
      localStorage.setItem(oldKey, legacy);
      sessionStorage.setItem('quote-preview-isolation-seeded', '1');
    }
  }, { draftKey: QUOTE_STORAGE_KEY, oldKey: PREVIEW_STORAGE_KEY, draft: productionDraft, history: productionHistory, legacy: legacyDraft });
  await openPreview(page);
  await expect.poll(async () => (await savedPreview(page)).items.find((item) => item.key === 'acscent')?.options.volume).toBe('50ml');
  await expect(page.getByText('TEST-EXISTING')).toHaveCount(0);
  await page.getByTestId('quote-start-templates').click();
  await page.getByTestId('quote-preset-campus-festival').click();
  await passConditions(page);
  await expect(page.getByTestId('quote-edit-photoBooth')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('quote-edit-rental')).toHaveAttribute('aria-pressed', 'true');
  await openDetails(page);
  await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', 'photoBooth');
  await expect(page.getByTestId('preview-service-scene')).toHaveAttribute('data-wrapping', 'false');
  const photo = await editService(page, 'photoBooth');
  await showOptionPage(page, 'photoBooth', 'prints');
  await photo.locator('#b-wrap').check();
  await expect(page.getByTestId('preview-service-scene')).toHaveAttribute('data-wrapping', 'true');
  const rental = await editService(page, 'rental');
  await expect(page.getByTestId('kiosk-scene')).toHaveAttribute('data-mode', 'event');
  await expect(page.getByTestId('kiosk-scene')).toHaveAttribute('data-kiosks', '1');
  await expect(page.getByTestId('rental-scene-printer')).toHaveCount(0);
  await expect(rental.locator('#k-printer')).toHaveCount(0);
  await expect(page.getByTestId('rental-scene-printer')).toHaveCount(0);
  await showOptionPage(page, 'rental', 'basic');
  await expect(rental.getByRole('radiogroup', { name: c.mode, exact: true })).toHaveCount(0);
  await expect(rental.getByTestId('option-tab-months')).toHaveCount(0);
  await expect(rental.getByTestId('kiosk-event-rental-note')).toBeVisible();
  await expect(page.getByTestId('kiosk-scene')).toHaveAttribute('data-mode', 'event');
  await expect(page.getByTestId('rental-scene-kiosk')).toHaveCount(1);
  await expectPriceParity(page);

  for (const key of ['acscent', 'spatialDesign', 'mediaArt', 'custom']) {
    await openPreviewOptions(page, key);
    await expect(page.getByTestId('quote-options-' + key)).toBeVisible();
    await openDetails(page);
    await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', key);
    if (key === 'acscent') {
      await expectPerfumeScene(page, 0, 1);
      await expectScene(page, 'existing');
    } else if (key === 'spatialDesign') await expectScene(page, 'booth3x3', { view: 'space' });
    else await expect(page.getByTestId('preview-service-scene')).toHaveAttribute('data-renderer', 'svg');
  }
  await expect.poll(async () => (await savedPreview(page)).items.length).toBe(6);
  await expectPriceParity(page);
  const selected = await savedPreview(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 0)).toBeVisible();
  await expect.poll(async () => sanitizeInput(await savedPreview(page))).toEqual(sanitizeInput(selected));

  const clear = page.getByTestId('quote-clear');
  await clear.focus();
  await page.keyboard.press('Space');
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 0)).toBeVisible();
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  const untouched = await page.evaluate(({ draftKey, oldKey }) => ({
    draft: localStorage.getItem(draftKey), history: localStorage.getItem('neander-estimates'), legacy: localStorage.getItem(oldKey),
  }), { draftKey: QUOTE_STORAGE_KEY, oldKey: PREVIEW_STORAGE_KEY });
  expect(untouched).toEqual({ draft: productionDraft, history: productionHistory, legacy: legacyDraft });

  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'live');
  await expect(page.getByText('TEST-EXISTING', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /담아 둔 체험 2개가 있어요/ }).click();
  await expect(section(page, 2)).toBeVisible();
  await expect(page.getByTestId('preview-scene')).toHaveCount(0);
  await expect(page.locator('img[src*="/images/quote-preview/"]')).toHaveCount(0);
  await expect.poll(async () => JSON.parse((await page.evaluate((key) => localStorage.getItem(key), FLOW_STORAGE_KEY))!).items).toEqual([]);
});

test('all four steps and six services use vector illustrations without raster image requests', async ({ page }, testInfo) => {
  const rasterRequests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image' && /\.(?:png|jpe?g|webp|avif|gif)(?:$|[?&#])/i.test(decodeURIComponent(request.url()))) {
      rasterRequests.push(request.url());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await openPreview(page);
  await expectOnlyVectors(page);
  await page.getByTestId('quote-start-templates').click();
  await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(4);
  await expectOnlyVectors(page);
  await page.getByTestId('quote-preset-brand-popup').click();
  await expectOnlyVectors(page);
  await passConditions(page);
  await expectOnlyVectors(page);

  for (const key of ['acscent', 'photoBooth', 'rental', 'spatialDesign', 'mediaArt', 'custom']) {
    await editService(page, key);
    await openDetails(page);
    await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', key);
    await expectOnlyVectors(page);
    await expectPriceParity(page);
    await page.getByTestId('service-preview').screenshot({
      path: testInfo.outputPath('vector-' + key + '.png'),
      style: 'nextjs-portal { display: none !important; }',
    });
  }
  await editService(page, 'acscent');
  for (const view of ['top', 'space', 'combined', 'top', 'combined']) {
    await page.getByTestId('preview-view-' + view).click();
    await expect(page.getByTestId('preview-view-' + view)).toHaveAttribute('aria-pressed', 'true');
    await expectOnlyVectors(page);
  }
  await expectPerfumeScene(page, 0, 1);
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();
  await expectOnlyVectors(page);
  expect(rasterRequests).toEqual([]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('step four validates locally without issuing PDFs, saving inquiries or creating history', async ({ page }) => {
  const blockedWrites: string[] = [];
  const downloads: string[] = [];
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const apiWrite = url.pathname.startsWith('/api/quote-pdf') || url.pathname.startsWith('/api/inquiry-notify');
    const firebaseWrite = url.hostname === 'firestore.googleapis.com'
      && (/\/Write\//.test(url.pathname) || /:commit$/.test(url.pathname) || /:batchWrite$/.test(url.pathname));
    if (apiWrite || firebaseWrite) {
      blockedWrites.push(request.method() + ' ' + url.href);
      await route.abort();
    } else await route.continue();
  });
  page.on('download', (download) => downloads.push(download.suggestedFilename()));
  await beginBlank(page);
  await openPreviewOptions(page, 'acscent');
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();
  await page.locator('button[type="submit"][value="pdf"]').click();
  await expect(section(page, 3).getByRole('alert')).toHaveText(c.required);
  await page.locator('#q-name').fill('실험 담당자');
  await page.locator('#q-email').fill('preview@example.com');
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"][value="pdf"]').click();
  await expect(page.getByTestId('quote-preview-complete')).toBeVisible();
  await expect(page.getByTestId('quote-preview-complete')).toContainText(/실험|미리보기/);
  // A later edit reopens the local form; the request action must be isolated too.
  await page.getByTestId('quote-prev').click();
  const perfume = await editService(page, 'acscent');
  await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: '50ml', exact: true }).check();
  await nextPreviewStep(page);
  await page.locator('button[type="submit"][value="request"]').click();
  await expect(page.getByTestId('quote-preview-complete')).toBeVisible();
  expect(blockedWrites).toEqual([]);
  expect(downloads).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('neander-estimates'))).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), QUOTE_STORAGE_KEY)).toBeNull();
  const draft = await page.evaluate((key) => localStorage.getItem(key), FLOW_STORAGE_KEY);
  expect(draft).not.toContain('preview@example.com');
  expect(draft).not.toContain('실험 담당자');
});
