import { expect, test, type Page } from '@playwright/test';
import { enterExperienceStep, closePreviewOptions, toggleKioskExperience, nextPreviewStep, openPreviewOptions, removePreviewService, showOptionPage } from './helpers/quote-preview-options';
import { SERVICE_ORDER, type Lang, type ServiceKey } from '../../src/lib/quote/catalog';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, defaultOptions, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';

const FLOW_KEY = 'neander-quote-preview-flow-v1';
const LIVE_KEY = 'neander-quote-v2';
const physicalServices = SERVICE_ORDER.filter(key => ['acscent', 'photoBooth', 'rental'].includes(key));
const saved = (page: Page): Promise<QuoteInput> => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), FLOW_KEY);
const objects = (page: Page, service?: ServiceKey, kind?: string) => page.locator(`[data-testid="event-object"]${service ? `[data-service="${service}"]` : ''}${kind ? `[data-kind="${kind}"]` : ''}`);

async function beginBlank(page: Page, lang: Lang) {
  await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
  await nextPreviewStep(page);
  await nextPreviewStep(page);
  await expect(page.locator('[data-quote-step="2"]')).toBeVisible();
}

async function expectOverview(page: Page, active: ServiceKey, selected: readonly ServiceKey[] = physicalServices) {
  await expect(page.getByTestId('event-preview')).toHaveAttribute('data-view', 'overview');
  await expect(page.getByTestId('event-preview')).toHaveAttribute('data-active-service', active);
  await expect(page.getByTestId('event-scene')).toBeVisible();
  await expect(page.getByTestId('event-scene-svg')).toHaveCount(1);
  await expect(page.getByTestId('event-scene-floor')).toHaveCount(1);
  await expect(page.getByTestId('service-preview')).toHaveCount(0);
  for (const key of physicalServices) {
    const layer = page.getByTestId(`event-service-${key}`);
    await expect(layer).toHaveCount(selected.includes(key) ? 1 : 0);
    if (selected.includes(key)) await expect(layer).toHaveAttribute('data-active', String(key === active));
  }
  await expect(page.getByTestId('event-service-custom')).toHaveCount(0);
  await expect(objects(page, 'custom')).toHaveCount(0);
  await expect(page.getByTestId('quote-preview-lab').locator('img, canvas, svg image')).toHaveCount(0);
}

async function transforms(page: Page) {
  return page.getByTestId('event-object').evaluateAll((nodes) => nodes.map((node) => ({
    kind: node.getAttribute('data-kind'), service: node.getAttribute('data-service'),
    instance: node.getAttribute('data-instance'), transform: node.getAttribute('transform'),
  })));
}

async function expectSceneGeometry(page: Page) {
  // Check settled geometry when normal-motion camera transitions are enabled.
  // Use actual glyph and wall extents instead of the model's declared bounds.
  await expect.poll(() => page.locator('[data-testid="event-object"], [data-testid="event-booth-footprint"]').evaluateAll((nodes) => nodes.flatMap((node) => {
    const svg = node.closest('svg');
    if (!svg) return ['no parent svg'];
    const bounds = node.getBoundingClientRect(), canvas = svg.getBoundingClientRect();
    return bounds.left < canvas.left - 1 || bounds.right > canvas.right + 1 || bounds.top < canvas.top - 1 || bounds.bottom > canvas.bottom + 1
      ? [node.getAttribute('data-object-id') ?? node.getAttribute('data-testid')] : [];
  }))).toEqual([]);
  await expect.poll(() => page.locator('[data-testid="event-object"], [data-testid="event-booth-footprint"]').evaluateAll((nodes) => nodes.flatMap((node) => {
    const object = node as SVGGraphicsElement;
    const svg = object.ownerSVGElement;
    const rootMatrix = svg?.getCTM(), objectMatrix = object.getCTM();
    if (!svg || !rootMatrix || !objectMatrix) return ['Missing SVG geometry'];
    const box = object.getBBox(), view = svg.viewBox.baseVal;
    const transform = rootMatrix.inverse().multiply(objectMatrix);
    const corners = [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]];
    const outside = corners.some(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(transform);
      return point.x < view.x - 1 || point.x > view.x + view.width + 1 || point.y < view.y - 1 || point.y > view.y + view.height + 1;
    });
    return outside ? [object.getAttribute('data-object-id') ?? object.getAttribute('data-testid')] : [];
  }))).toEqual([]);
}

async function priceParity(page: Page, lang: Lang) {
  await expect.poll(async () => Number(await page.getByTestId('quote-total').getAttribute('data-amount')) - calculateQuote(await saved(page), lang).total).toBe(0);
}

async function stepper(page: Page, id: string, value: number) {
  await page.locator(id).fill(String(value));
  await page.locator(id).press('Enter');
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: three automatic services share one scene through selection, options and the three-stage flow`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await beginBlank(page, lang);
    const added: ServiceKey[] = [];
    for (const key of physicalServices) {
      await openPreviewOptions(page, key);
      added.push(key);
      await expectOverview(page, key, added);
    }
    const layout = await transforms(page);
    for (const key of physicalServices) {
      await openPreviewOptions(page, key);
      await expectOverview(page, key);
      expect(await transforms(page)).toEqual(layout);
    }
    await priceParity(page, lang);

    // Removing one experience leaves the other selected hardware and shared floor.
    await removePreviewService(page, 'photoBooth');
    await expect(page.getByTestId('event-service-photoBooth')).toHaveCount(0);
    await expect(page.getByTestId('event-scene-floor')).toHaveCount(1);
    for (const key of ['acscent', 'rental']) await expect(page.getByTestId(`event-service-${key}`)).toHaveCount(1);
    await openPreviewOptions(page, 'photoBooth');
    await expectOverview(page, 'photoBooth');
    expect(await transforms(page)).toEqual(layout);
    await stepper(page, '#b-booths', 3);
    await expectOverview(page, 'photoBooth');
    await expect(objects(page, 'photoBooth')).toHaveCount(3);

    await openPreviewOptions(page, 'rental');
    await stepper(page, '#k-count', 2);
    // 두 체험을 고르면 2대에 한 대씩 나눠 담는다
    for (const slug of ['ai-personal-color', 'ai-sommelier']) await toggleKioskExperience(page, slug, lang);
    for (const [index, slug] of [[1, 'ai-personal-color'], [2, 'ai-sommelier']] as const) {
      await expect(page.locator(`[data-testid="event-object"][data-service="rental"][data-kind="kiosk"][data-instance="${index}"]`)).toHaveAttribute('data-experience-slug', slug);
    }
    await expectOverview(page, 'rental');
    await expect(objects(page, 'rental', 'kiosk')).toHaveCount(2);
    await expect(page.locator('#k-printer')).toHaveCount(0);
    await expect(objects(page, 'rental', 'printer')).toHaveCount(0);

    await openPreviewOptions(page, 'acscent');
    const perfume = await showOptionPage(page, 'acscent', 'analysis');
    await perfume.getByRole('radiogroup', { name: QUOTE_COPY[lang].analysis, exact: true }).getByRole('radio').nth(1).check();
    await stepper(page, '#p-akiosk', 2);
    await showOptionPage(page, 'acscent', 'basic');
    await stepper(page, '#p-teams', 3);
    await expectOverview(page, 'acscent');
    await expect(objects(page, 'acscent', 'team')).toHaveCount(3);
    await expect(objects(page, 'acscent', 'counter')).toHaveCount(1);
    await expect(objects(page, 'acscent', 'analysis-kiosk')).toHaveCount(2);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', 'existing');
    await expect(page.getByTestId('event-booth-footprint')).toHaveCount(0);
    await closePreviewOptions(page);
    await priceParity(page, lang);
    await page.getByTestId('event-preview').screenshot({ path: testInfo.outputPath(`combined-event-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    const configured = await saved(page);
    await nextPreviewStep(page);
    await expect(page.locator('[data-quote-step="3"]')).toBeVisible();
    await expect(page.getByTestId('event-preview')).toHaveCount(0);
    await page.getByTestId('quote-prev').click();
    await expectOverview(page, 'acscent');
    expect(await saved(page)).toEqual(configured);
    await priceParity(page, lang);
    expect(errors).toEqual([]);
  });

  test(`${lang}: inquiry cards do not add equipment and the lab leaves the live draft unchanged`, async ({ page }) => {
    const liveDraft = JSON.stringify(sanitizeInput({ days: 5, items: [defaultOptions('photoBooth')] }));
    await page.addInitScript(({ key, value }) => {
      if (!sessionStorage.getItem('event-scene-live-seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('event-scene-live-seeded', '1');
      }
    }, { key: LIVE_KEY, value: liveDraft });
    await beginBlank(page, lang);
    for (const service of ['spatialDesign', 'mediaArt', 'custom']) {
      await page.getByTestId(`quote-add-${service}`).click();
      await expect(page.getByTestId('quote-consultation-notice')).toHaveAttribute('data-service', service);
      await expect(page.getByTestId('event-scene')).toHaveAttribute('data-empty', 'true');
      await expect(page.getByTestId('event-object')).toHaveCount(0);
      await expect(page.getByTestId('custom-content-tablet')).toHaveCount(0);
      expect((await saved(page)).items).toEqual([]);
    }
    await openPreviewOptions(page, 'acscent');
    await expectOverview(page, 'acscent', ['acscent']);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', 'existing');
    await removePreviewService(page, 'acscent');
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-empty', 'true');
    expect(await page.evaluate((key) => localStorage.getItem(key), LIVE_KEY)).toBe(liveDraft);
  });

}

test('maximum equipment quantities remain inside one shared illustration with every assigned experience intact', async ({ page }, testInfo) => {
  const input = sanitizeInput({ items: [
    { key: 'acscent', options: { extraTeams: 2, analysisKiosks: 4 } },
    { key: 'photoBooth', options: { booths: 3, wrapping: true } },
    { key: 'rental', options: { kiosks: 4, printer: true, experienceSlugs: ['ai-personal-color', 'ai-sommelier', 'ai-face-reading', 'ai-travel-style'] } },
  ] });
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem('max-event-scene-seeded')) {
      localStorage.setItem(key, value);
      sessionStorage.setItem('max-event-scene-seeded', '1');
    }
  }, { key: FLOW_KEY, value: JSON.stringify(input) });
  await page.goto('/quote-preview', { waitUntil: 'domcontentloaded' });
  await enterExperienceStep(page);
  await expect(page.getByTestId('event-scene-svg')).toHaveCount(1);
  for (const [service, kind, count] of [
    ['acscent', 'team', 3], ['acscent', 'counter', 1], ['acscent', 'analysis-kiosk', 4],
    ['photoBooth', 'photo-booth', 3], ['rental', 'kiosk', 4], ['rental', 'printer', 0],
  ] as const) await expect(objects(page, service, kind)).toHaveCount(count);
  await expect(page.getByTestId('event-scene-floor')).toHaveCount(1);
  await expect(page.getByTestId('event-scene')).toHaveAttribute('data-needs-placement', 'false');
  await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', 'existing');
  await expectSceneGeometry(page);
  const selectedExperiences = await objects(page, 'rental', 'kiosk').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-experience-slug')));
  expect(selectedExperiences).toEqual(['ai-personal-color', 'ai-sommelier', 'ai-face-reading', 'ai-travel-style']);
  await priceParity(page, 'ko');
  await page.getByTestId('event-preview').screenshot({ path: testInfo.outputPath('maximum-combined-event.png'), style: 'nextjs-portal { display: none !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});


test('a close camera keeps each automatic experience inside the actual SVG viewBox', async ({ page }, testInfo) => {
  await beginBlank(page, 'ko');
  for (const service of physicalServices) {
    await openPreviewOptions(page, service);
    await expectOverview(page, service, [service]);
    await expectSceneGeometry(page);
    if (service === 'acscent') {
      await expect(objects(page, 'acscent', 'team')).toHaveCount(1);
      await expect(objects(page, 'acscent', 'counter')).toHaveCount(1);
    }
    if (service === 'photoBooth') await expect(objects(page, 'photoBooth', 'photo-booth')).toHaveCount(1);
    if (service === 'rental') await expect(objects(page, 'rental', 'kiosk')).toHaveCount(1);
    const svg = page.getByTestId('event-scene-svg');
    const framing = await svg.getAttribute('viewBox');
    expect(framing).not.toBe('0 190 1100 560');
    const focus = page.getByTestId(`event-focus-${service}`);
    if (await focus.isVisible()) await focus.click();
    else await page.getByTestId('event-preview-overview').click(); // Compact mobile hides the duplicate legend.
    await expect(svg).toHaveAttribute('viewBox', framing!);
    await svg.screenshot({ path: testInfo.outputPath(`single-${service}.png`), style: 'nextjs-portal { display: none !important; }' });
    await removePreviewService(page, service);
    await expect(page.getByTestId('event-scene')).toHaveCount(1);
    await expect(page.getByTestId('event-scene-floor')).toHaveCount(1);
    await expect(page.getByTestId('event-object')).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
