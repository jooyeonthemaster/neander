import { expect, test } from '@playwright/test';
import { defaultOptions, sanitizeInput } from '../../src/lib/quote/engine';
import type { ServiceKey } from '../../src/lib/quote/catalog';
import { isOnEventFloor, resolveEventScene } from '../../src/lib/quote-preview/event-scene';
import { eventObjectGroundPoints } from '../../src/lib/quote-preview/booth-layout';
import { closePreviewOptions, showOptionPage } from './helpers/quote-preview-options';

test('all equipment stays inside the chosen booth as its size and quantities change', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const key = 'neander-quote-preview-flow-v1';
  const services: ServiceKey[] = ['acscent', 'photoBooth', 'rental', 'spatialDesign'];
  const input = sanitizeInput({ items: services.map(defaultOptions) });
  await page.addInitScript(({ key, input }) => localStorage.setItem(key, JSON.stringify(input)), { key, input });
  await page.goto('/quote-preview');
  await page.getByRole('button', { name: /담아 둔 체험 4개/ }).click();
  const canvas = page.getByTestId('preview-canvas');
  const originalCanvas = await canvas.boundingBox();
  for (const [index, size] of ['booth3x3', 'booth6x3', 'large'].entries()) {
    const panel = await showOptionPage(page, 'spatialDesign', 'basic');
    await panel.getByRole('radiogroup', { name: '규모', exact: true }).getByRole('radio').nth(index).check();
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', size);
    await closePreviewOptions(page);
    await canvas.evaluate(element => window.scrollBy(0, element.getBoundingClientRect().top - 140));
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-needs-placement', 'false');
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
    const scene = resolveEventScene(saved)!;
    for (const object of scene.objects) {
      expect(eventObjectGroundPoints(object).every(point => isOnEventFloor(point, scene.footprint!.points)), object.id).toBe(true);
      await expect(page.locator(`[data-object-id="${object.id}"]`)).toHaveAttribute('transform', `translate(${object.x} ${object.y}) scale(${object.scale})`);
    }
    const before = await page.getByTestId('event-object').evaluateAll(nodes => nodes.map(node => node.getAttribute('transform')));
    await page.getByTestId('preview-zoom-in').click();
    await page.getByTestId('preview-zoom-reset').click();
    expect(await page.getByTestId('event-object').evaluateAll(nodes => nodes.map(node => node.getAttribute('transform')))).toEqual(before);
    expect((await canvas.boundingBox())!.height).toBe(originalCanvas!.height);
    await page.getByTestId('event-scene').screenshot({ path: testInfo.outputPath(`${size}.png`) });
  }
  await showOptionPage(page, 'photoBooth', 'basic');
  await page.locator('#b-booths').fill('3');
  await page.locator('#b-booths').press('Enter');
  await showOptionPage(page, 'rental', 'basic');
  await page.locator('#k-count').fill('4');
  await page.locator('#k-count').press('Enter');
  for (const size of [0, 1]) {
    const panel = await showOptionPage(page, 'spatialDesign', 'basic');
    await panel.getByRole('radiogroup', { name: '규모', exact: true }).getByRole('radio').nth(size).check();
    await closePreviewOptions(page);
    await expect(page.locator('[data-kind="photo-booth"]')).toHaveCount(3);
    await expect(page.locator('[data-kind="kiosk"]')).toHaveCount(4);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-needs-placement', 'false');
    await page.getByTestId('event-scene').screenshot({ path: testInfo.outputPath(`devices-${size}.png`) });
  }
  expect(errors).toEqual([]);
});
