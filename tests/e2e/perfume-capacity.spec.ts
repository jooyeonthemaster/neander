import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { enterExperienceStep, closePreviewOptions, nextPreviewStep, openPreviewDetails, showOptionPage } from './helpers/quote-preview-options';

for (const preview of [true, false]) {
  for (const lang of ['ko', 'en'] as const) {
    test(`${preview ? 'preview' : 'live'} ${lang}: automatically staff perfume guests at 40 per team per hour`, async ({ page }, testInfo) => {
      if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1366, height: 768 });
      const route = `${lang === 'en' ? '/en' : ''}/${preview ? 'quote-preview' : 'quote'}`;
      const key = preview ? 'neander-quote-preview-flow-v1' : 'neander-quote-v2';
      const saved = (): Promise<QuoteInput> => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key);
      const options = async () => (await saved()).items.find(item => item.key === 'acscent')!.options;
      const panel = page.getByTestId('quote-options-acscent');
      const guests = panel.locator('#p-guests');
      const teams = panel.locator('#p-teams');
      const notice = panel.getByTestId('perfume-capacity-notice');
      const change = async (target: ReturnType<Page['locator']>, value: number) => {
        await target.fill(String(value));
        await target.press('Enter');
      };
      async function openOptions() {
        await showOptionPage(page, 'acscent', 'basic');
      }
      async function expectTeams(count: number, minimum: number) {
        await expect(teams).toHaveValue(String(count));
        await expect(teams).toHaveAttribute('min', String(minimum));
        await expect.poll(async () => (await options()).extraTeams).toBe(count - 1);
        const data = await saved();
        await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(data, lang).total));
        expect(calculateQuote(data).lines.find(line => line.label === '조향 팀 출장비')!.amount).toBe(350_000 * count * data.days);
        if (preview) {
          await openPreviewDetails(page);
          await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-teams', String(count));
          await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-staff', String(count * 2));
        }
      }

      await page.goto(`${route}?item=acscent`, { waitUntil: 'domcontentloaded' });
      for (let i = 0; i < 2; i++) await nextPreviewStep(page);
      await openOptions();
      await change(guests, 240);
      await expectTeams(1, 1);
      await change(guests, 241);
      await expectTeams(2, 2);
      await expect(panel.getByRole('button', { name: `${QUOTE_COPY[lang].extraTeams} −`, exact: true })).toBeDisabled();
      await expect(notice).toContainText(lang === 'ko' ? '2팀으로 자동 조정' : 'Automatically adjusted to 2 teams');
      await expect(notice).toContainText(lang === 'ko' ? '출장비' : 'travel fees');
      if (preview && testInfo.project.name === 'desktop') {
        const overflow = await panel.getByTestId('option-page-scroll').evaluate(element => element.scrollHeight - element.clientHeight);
        expect(overflow).toBeLessThanOrEqual(2);
      }
      await page.mouse.move(0, 0);
      await page.screenshot({ path: testInfo.outputPath(`automatic-teams-${lang}.png`) });

      await change(guests, 481);
      await expectTeams(3, 3);
      await change(guests, 721);
      await expectTeams(4, 4);
      await expect(notice).toContainText(lang === 'ko' ? '상담이 필요' : 'need consultation');
      await expect(panel.getByRole('button', { name: `${QUOTE_COPY[lang].extraTeams} +`, exact: true })).toBeEnabled();
      if (preview && testInfo.project.name === 'desktop') {
        expect(await panel.getByTestId('option-page-scroll').evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(2);
      }
      await page.screenshot({ path: testInfo.outputPath(`consultation-teams-${lang}.png`) });
      await change(guests, 240);
      await expectTeams(1, 1);

      // Save/reload preserves auto staffing, then changing hours releases teams.
      await change(guests, 300);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      await openOptions();
      await expectTeams(2, 2);
      await closePreviewOptions(page);
      await page.getByTestId('quote-prev').click();
      await change(page.locator('#q-hours'), 8);
      await nextPreviewStep(page);
      await openOptions();
      await expectTeams(1, 1);

      // A deliberate extra team remains when participant numbers drop again.
      await change(teams, 2);
      await change(guests, 800);
      await expectTeams(3, 3);
      await change(guests, 100);
      await expectTeams(2, 1);
    });
  }
}
