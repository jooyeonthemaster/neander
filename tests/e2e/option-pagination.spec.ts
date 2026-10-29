import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { PHOTO_BOOTH_TEMPLATES } from '../../src/lib/quote/photo-booth-templates';
import { closePreviewOptions, toggleKioskExperience, openPreviewOptions, showOptionPage, showPhotoGalleryPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';

const storageKey = 'neander-quote-preview-flow-v1';
const services = ['acscent', 'photoBooth', 'rental', 'spatialDesign', 'mediaArt', 'custom'] as const;
const assigned = ['ai-personal-color', 'ai-sommelier', 'ai-face-reading', 'ai-travel-style'];
const seed = { items: [
  { key: 'acscent', options: { guests: 100, volume: '10ml', extraTeams: 0, analysisKiosks: 0 } },
  { key: 'photoBooth', options: { booths: 1, templateSlugs: [], customStyles: 0 } },
  { key: 'rental', options: { mode: 'event', kiosks: 1, experienceSlugs: [''] } },
  { key: 'spatialDesign', options: { size: 'booth3x3', photoZone: false, lighting: false } },
  { key: 'mediaArt', options: { grade: 'standard', extraSensors: 0 } },
  { key: 'custom', options: { scope: 'standard', consulting: false, maintenanceMonths: 0 } },
] };
const visible = (page: Page, id: string) => page.locator(`[data-testid="${id}"]:visible`);
async function setNumber(page: Page, id: string, value: number) {
  await page.locator(`#${id}`).fill(String(value));
  await page.locator(`#${id}`).press('Enter');
}
async function maximizePage(page: Page, service: string, id: string, lang: 'ko' | 'en') {
  const panel = page.getByTestId(`quote-options-${service}`).getByTestId(`option-page-${id}`);
  if (id === 'basic') {
    if (service === 'acscent') { await setNumber(page, 'p-guests', 100); await setNumber(page, 'p-teams', 3); await panel.getByRole('radio').last().check(); }
    if (service === 'photoBooth') await setNumber(page, 'b-booths', 3);
    if (service === 'rental') await setNumber(page, 'k-count', 4);
    if (['spatialDesign', 'mediaArt', 'custom'].includes(service)) await panel.getByRole('radio').last().check();
  } else if (id === 'space') await panel.getByTestId('perfume-space-large').click();
  else if (id === 'space-area') await setNumber(page, 'perfume-space-pyeong', 500);
  else if (id === 'analysis') { await panel.getByRole('radio').last().check(); await setNumber(page, 'p-akiosk', 4); }
  else if (id === 'packaging') { await panel.getByRole('radiogroup', { name: lang === 'ko' ? '향 구성' : 'Scent selection', exact: true }).getByRole('radio').last().check(); await panel.getByRole('radio').last().check(); }
  else if (id === 'photo-styles') {
    for (let galleryPage = 1; galleryPage <= 3; galleryPage++) {
      await showPhotoGalleryPage(page, galleryPage);
      for (const button of await panel.locator('[data-testid^="booth-template-ai-"][aria-pressed]').all()) await button.click();
    }
    await panel.locator('#b-custom-style-enabled').click();
    await setNumber(page, 'b-cstyles', 10);
  }
  else if (id === 'prints') { await setNumber(page, 'b-prints', 50); await panel.locator('#b-wrap').check(); }
  else if (id === 'branding') await panel.getByRole('radio').last().check();
  else if (id === 'kiosk-1') {
    // 체험은 한 페이지에서 여러 개 고른다 — 4대·4종이면 한 대에 하나씩
    for (const slug of assigned) await toggleKioskExperience(page, slug, lang);
    await page.getByTestId('kiosk-custom-dedicated').click();
  }
  else if (id === 'area') await setNumber(page, 's-pyeong', 500);
  else if (id === 'styling') { await panel.locator('#s-zone').check(); await panel.locator('#s-light').check(); }
  else if (id === 'sensors') await setNumber(page, 'm-sensors', 10);
  else if (id === 'consulting') await panel.locator('#c-consult').check();
  else if (id === 'maintenance') await setNumber(page, 'c-maint', 36);
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: perfume analysis method and touchscreen quantity stay in one step`, async ({ page }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile';
    if (!mobile) await page.setViewportSize({ width: 1366, height: 768 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(key => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ items: [
        { key: 'acscent', options: { guests: 100, analysisKiosks: 0 } },
        { key: 'spatialDesign', options: { size: 'large', pyeong: 10 } },
      ] }));
    }, storageKey);
    const route = `${lang === 'en' ? '/en' : ''}/quote-preview`;
    const resume = () => page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 2개/ : /You have 2 saved experiences/ }).click();
    await page.goto(route);
    await resume();
    const options = await showOptionPage(page, 'acscent', 'analysis');
    const pages = options.getByTestId('option-pages');
    const radios = options.getByRole('radiogroup', { name: QUOTE_COPY[lang].analysis, exact: true }).getByRole('radio');
    const quantity = options.locator('#p-akiosk');
    await expect(pages).toHaveAttribute('data-total-steps', '5');
    await expect(pages).toHaveAttribute('data-current-step', '4');
    await expect(quantity).toHaveCount(0);
    const base = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    await radios.last().check();
    await expect(quantity).toBeVisible();
    await expect(quantity).toHaveValue('1');
    await expect(pages).toHaveAttribute('data-total-steps', '5');
    await expect(options.getByTestId('option-tab-analysis-count')).toHaveCount(0);
    await setNumber(page, 'p-akiosk', 4);
    await expect(page.locator('[data-kind="analysis-kiosk"]')).toHaveCount(4);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + 1_320_000));
    const dimensions = await options.getByTestId('option-page-scroll').evaluate(el => ({ available: el.clientHeight, content: el.scrollHeight }));
    if (!mobile) expect(dimensions.content - dimensions.available, 'Merged analysis controls fit a laptop popover').toBeLessThanOrEqual(1);
    await page.mouse.move(1, 100);
    await page.screenshot({ path: testInfo.outputPath(`analysis-merged-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    await visible(page, 'option-page-next').click();
    await expect(pages).toHaveAttribute('data-current-page', 'packaging');
    await visible(page, 'option-page-previous').click();
    await expect(pages).toHaveAttribute('data-current-page', 'analysis');
    await expect(quantity).toHaveValue('4');
    await radios.first().check();
    await expect(quantity).toHaveCount(0);
    await expect(page.locator('[data-kind="analysis-kiosk"]')).toHaveCount(0);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base));
    await expect(pages).toHaveAttribute('data-total-steps', '5');
    await radios.last().check();
    await setNumber(page, 'p-akiosk', 3);
    await page.reload();
    await resume();
    await showOptionPage(page, 'acscent', 'analysis');
    await expect(quantity).toHaveValue('3');
    await expect(pages).toHaveAttribute('data-current-step', '4');
    await expect(pages).toHaveAttribute('data-total-steps', '5');
    expect(errors).toEqual([]);
  });

  test(`${lang}: every option is reachable in order and desktop topics need no internal scrolling when opened`, async ({ page }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile';
    const viewports = mobile ? [{ width: 390, height: 844 }] : [{ width: 1440, height: 900 }, { width: 1366, height: 768 }];
    const measurements: unknown[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: seed });
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 6개/ : /You have 6 saved experiences/ }).click();
      for (const service of services) {
        const options = await openPreviewOptions(page, service);
        const pages = options.getByTestId('option-pages');
        if (service === 'acscent') {
          // Jumping to the last topic must lead back to missed options before
          // offering completion; options keep their values while revisiting.
          await options.getByRole('tab').last().click();
          await expect(pages).toHaveAttribute('data-all-visited', 'false');
          await expect(visible(page, 'quote-options-done')).toHaveCount(0);
          await expect(visible(page, 'option-page-next')).toContainText(lang === 'ko' ? '남은 옵션 확인' : 'Review remaining');
          await visible(page, 'option-page-next').click();
          await expect(pages).toHaveAttribute('data-current-page', 'basic');
          await options.getByTestId('option-tab-space').click();
        }
        const visited: string[] = [];
        let openingScroll: number | undefined;
        for (let index = 0; index < 20; index++) {
          const id = (await pages.getAttribute('data-current-page'))!;
          visited.push(id);
          await maximizePage(page, service, id, lang);
          await expect(pages).toHaveAttribute('data-current-step', String(index + 1));
          await page.waitForTimeout(80);
          const measured = await options.getByTestId('option-page-scroll').evaluate(element => ({
            height: element.clientHeight, content: element.scrollHeight, overflow: element.scrollHeight - element.clientHeight,
            top: element.scrollTop, pageScroll: window.scrollY,
          }));
          measurements.push({ ...viewport, lang, service, page: id, ...measured });
          // 열려 있는 동안 말풍선은 높이를 바꾸지 않는다 — 옵션을 늘려 길어진 내용은 안에서 스크롤하고(아래 다시 열어 확인),
          // 문서는 움직이지 않는다
          if (openingScroll === undefined) openingScroll = measured.pageScroll;
          else expect(measured.pageScroll, `${service}/${id} should not move the document`).toBe(openingScroll);
          if (id === 'space' || id === 'packaging' || id === 'photo-styles' || id === 'kiosk-1') {
            await page.mouse.move(8, 100);
            await page.waitForTimeout(250);
            await page.screenshot({ path: testInfo.outputPath(`${viewport.width}-${service}-${id}-${lang}.png`), style: 'nextjs-portal {display:none!important}' });
          }
          const step = Number(await pages.getAttribute('data-current-step'));
          const total = Number(await pages.getAttribute('data-total-steps'));
          if (step === total) {
            await expect(pages).toHaveAttribute('data-all-visited', 'true');
            await expect(visible(page, 'quote-options-done')).toBeVisible();
            await visible(page, 'option-page-previous').click();
            await expect(pages).toHaveAttribute('data-current-step', String(total - 1));
            await visible(page, 'option-page-next').click();
            await expect(pages).toHaveAttribute('data-current-page', id);
            await visible(page, 'quote-options-done').click();
            await expect(page.getByTestId('quote-options-popover')).toBeHidden();
            break;
          }
          await expect(visible(page, 'quote-options-done')).toHaveCount(0);
          await visible(page, 'option-page-next').click();
          await expect(pages).not.toHaveAttribute('data-current-page', id);
        }
        expect(visited.length).toBeLessThan(20);
        // 다시 열면 가장 긴 주제에 맞춰 높이를 잡는다 — 데스크톱에서는 모든 주제가 안쪽 스크롤 없이 보인다.
        // 키오스크 4대에 체험 4종을 나눠 담은 경우만 말풍선 최대 높이를 넘을 수 있고, 그때는 아래에 더 있다고 알려 준다.
        if (!mobile) {
          await openPreviewOptions(page, service);
          for (const id of visited) {
            await options.getByTestId(`option-tab-${id}`).click();
            await expect(pages).toHaveAttribute('data-current-page', id);
            const area = options.getByTestId('option-page-scroll');
            const overflow = await area.evaluate(element => element.scrollHeight - element.clientHeight);
            measurements.push({ ...viewport, lang, service, page: id, reopened: true, overflow });
            if (service === 'rental' && id === 'kiosk-1' && overflow > 1) await expect(area).toHaveAttribute('data-more-below', 'true');
            else expect(overflow, `${viewport.width}×${viewport.height} ${service}/${id} after reopening`).toBeLessThanOrEqual(1);
          }
          await closePreviewOptions(page);
        }
        if (service === 'acscent') expect(visited).toEqual(['space', 'space-area', 'basic', 'analysis', 'packaging']);
        if (service === 'photoBooth') expect(visited).toEqual(['basic', 'photo-styles', 'prints', 'branding']);
        if (service === 'rental') expect(visited).toEqual(['basic', 'kiosk-1']);
        if (service === 'spatialDesign') expect(visited).toEqual(['basic', 'area', 'styling']);
        if (service === 'mediaArt') expect(visited).toEqual(['basic', 'sensors']);
        if (service === 'custom') expect(visited).toEqual(['basic', 'consulting', 'maintenance']);
      }
      const saved: QuoteInput = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(saved, lang).total));
      const perfume = saved.items.find(item => item.key === 'acscent')!;
      expect(perfume.options).toMatchObject({ guests: 300, volume: '50ml', extraTeams: 2, analysisKiosks: 4, customScent: true, customBox: true });
      expect(saved.items.find(item => item.key === 'photoBooth')!.options).toMatchObject({ booths: 3, templateSlugs: PHOTO_BOOTH_TEMPLATES.map(template => template.slug), customStyles: 10, extraPrintRolls: 50, wrapping: true, custom: 'dedicated' });
      expect(saved.items.find(item => item.key === 'rental')!.options).toMatchObject({ kiosks: 4, mode: 'event', months: 1, printer: false, custom: 'dedicated', experienceSlugs: assigned });
      expect(saved.items.find(item => item.key === 'spatialDesign')!.options).toMatchObject({ size: 'large', pyeong: 500, photoZone: true, lighting: true });
      expect(saved.items.find(item => item.key === 'mediaArt')!.options).toMatchObject({ grade: 'fullCustom', extraSensors: 10 });
      expect(saved.items.find(item => item.key === 'custom')!.options).toMatchObject({ scope: 'large', consulting: true, maintenanceMonths: 36 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
    await testInfo.attach('option-dimensions', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
}
