import { enterExperienceStep } from './helpers/quote-preview-options';
import { expect, test, type Page } from '@playwright/test';
import { sanitizeInput } from '../../src/lib/quote/engine';

const storageKey = 'neander-quote-preview-flow-v1';

/** Find painted floor points geometrically, rather than assuming the SVG's
 * layout rectangle describes the scene. The venue floor extends beyond the
 * inventory-focused viewBox, and must remain visible after the camera moves. */
async function sampleFloor(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector<SVGSVGElement>('[data-testid="event-scene-svg"]')!;
    const floor = document.querySelector<SVGPolygonElement>('[data-testid="event-scene-floor"] polygon')!;
    const viewport = document.querySelector<HTMLElement>('[data-testid="preview-canvas-viewport"]')!;
    const scene = svg.getBoundingClientRect(), clip = viewport.getBoundingClientRect();
    const inverse = floor.getScreenCTM()!.inverse();
    const interior: { x: number; y: number; hit: boolean }[] = [];
    const exterior: { x: number; y: number; hit: boolean }[] = [];
    for (let y = Math.max(8, clip.top - 60); y < Math.min(innerHeight - 8, clip.bottom + 60); y += 5) {
      for (let x = Math.max(8, clip.left - 60); x < Math.min(innerWidth - 8, clip.right + 60); x += 5) {
        const point = new DOMPoint(x, y).matrixTransform(inverse);
        if (!floor.isPointInFill(point)) continue;
        const insideClip = x > clip.left + 10 && x < clip.right - 10 && y > clip.top + 10 && y < clip.bottom - 10;
        const outsideSvg = x < scene.left - 8 || x > scene.right + 8 || y < scene.top - 8 || y > scene.bottom + 8;
        const outsideClip = x < clip.left - 8 || x > clip.right + 8 || y < clip.top - 8 || y > clip.bottom + 8;
        const hit = !!document.elementFromPoint(x, y)?.closest('[data-testid="event-scene-floor"]');
        if (insideClip && outsideSvg) interior.push({ x, y, hit });
        if (outsideClip) exterior.push({ x, y, hit });
      }
    }
    return {
      zoom: document.querySelector('[data-testid="preview-canvas"]')!.getAttribute('data-zoom'),
      overflow: getComputedStyle(svg).overflow,
      svg: scene.toJSON(), viewport: clip.toJSON(),
      interiorPoints: interior.length, paintedInterior: interior.filter(point => point.hit).length,
      exteriorPoints: exterior.length, leakedExterior: exterior.filter(point => point.hit).length,
      firstInterior: interior[0], firstExterior: exterior[0],
    };
  });
}

async function dragScene(page: Page, mobile: boolean, vertical: number) {
  const viewport = page.getByTestId('preview-canvas-viewport');
  await viewport.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  let box = (await viewport.boundingBox())!;
  await expect.poll(async () => {
    await page.waitForTimeout(150);
    const next = (await viewport.boundingBox())!;
    const stable = Math.abs(next.x - box.x) < .5 && Math.abs(next.y - box.y) < .5;
    box = next;
    return stable;
  }).toBe(true);
  const start = { x: box.x + box.width * .85, y: box.y + box.height * .5 };
  const delta = { x: -box.width * .4, y: box.height * vertical };
  expect(await page.evaluate(point => !!document.elementFromPoint(point.x, point.y)?.closest('[data-testid="preview-canvas-viewport"]'), start)).toBe(true);
  if (mobile) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
    for (let step = 1; step <= 6; step++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + delta.x * step / 6, y: start.y + delta.y * step / 6, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 6 });
    await page.mouse.up();
  }
  await expect.poll(async () => Number(await page.getByTestId('preview-canvas').getAttribute('data-pan-x'))).toBeLessThan(-box.width * .35);
  // Normal-motion transforms settle before screenCTM and hit-testing are read.
  await page.waitForTimeout(250);
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test.describe(`motion=${reducedMotion}`, () => {
    test.use({ reducedMotion });
    test('dragging reveals the whole floor beyond the original SVG box and clips only at the canvas edge', async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const input = sanitizeInput({ items: [{ key: 'acscent', options: {} }] });
      await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(input) });
      await page.goto('/quote-preview', { waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', 'existing');
      const selection = await page.evaluate(key => localStorage.getItem(key), storageKey);
      const price = await page.getByTestId('quote-total').getAttribute('data-amount');
      const measurements: unknown[] = [];
      for (const zoom of [1, .5, 1.5]) {
        for (const [direction, vertical] of [['left', 0], ['up-left', -.18], ['down-left', .18]] as const) {
          await page.getByTestId('preview-zoom-reset').click();
          if (zoom !== 1) {
            const control = page.getByTestId(zoom < 1 ? 'preview-zoom-out' : 'preview-zoom-in');
            await control.click();
            await control.click();
          }
          await expect(page.getByTestId('preview-canvas')).toHaveAttribute('data-zoom', String(zoom));
          await dragScene(page, testInfo.project.name === 'mobile', vertical);
          const sample = await sampleFloor(page);
          measurements.push({ direction, ...sample });
          expect(sample.interiorPoints, `${zoom}× ${direction}: test must reach actual floor beyond the original SVG rectangle`).toBeGreaterThan(4);
          expect(sample.paintedInterior, `${zoom}× ${direction}: venue floor must not be cut off at the SVG rectangle`).toBe(sample.interiorPoints);
          expect(sample.exteriorPoints, `${zoom}× ${direction}: verify actual floor extends beyond the canvas clip`).toBeGreaterThan(0);
          expect(sample.leakedExterior, `${zoom}× ${direction}: floor must remain inside the fixed canvas`).toBe(0);
          if (direction === 'left' && zoom === 1) await page.screenshot({ path: testInfo.outputPath('dragged-floor-100.png'), style: 'nextjs-portal{display:none!important}' });
        }
      }
      expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(selection);
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', price!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
      await testInfo.attach('floor-clipping-measurements', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
    });
  });
}
