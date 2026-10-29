import { expect, test, type Page } from '@playwright/test';
import { enterExperienceStep, nextPreviewStep, openPreviewDetails, showOptionPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';

const stored = (page: Page, key: string): Promise<QuoteInput> => page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key);

for (const preview of [true, false]) {
  for (const lang of ['ko', 'en'] as const) {
    test(`${preview ? 'preview' : 'live'} ${lang}: perfume teams start at one, allow larger selections with consultation and restore the total correctly`, async ({ page }, testInfo) => {
      const route = `${lang === 'en' ? '/en' : ''}/${preview ? 'quote-preview' : 'quote'}`;
      const key = preview ? 'neander-quote-preview-flow-v1' : 'neander-quote-v2';
      await page.goto(`${route}?item=acscent`, { waitUntil: 'domcontentloaded' });
      for (let i = 0; i < 2; i++) await nextPreviewStep(page);
      const panel = page.getByTestId('quote-options-acscent');
      await showOptionPage(page, 'acscent', 'basic');
      const input = panel.locator('#p-teams');
      const minus = panel.getByRole('button', { name: `${QUOTE_COPY[lang].extraTeams} −`, exact: true });
      const plus = panel.getByRole('button', { name: `${QUOTE_COPY[lang].extraTeams} +`, exact: true });
      await expect(input).toHaveValue('1');
      await expect(input).toHaveAttribute('min', '1');
      await expect(input).not.toHaveAttribute('max');
      await expect(minus).toBeDisabled();
      await expect(plus).toBeEnabled();
      const base = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));

      async function expectTeams(teams: number) {
        await expect(input).toHaveValue(String(teams));
        await expect.poll(async () => (await stored(page, key)).items.find((item) => item.key === 'acscent')!.options.extraTeams).toBe(teams - 1);
        const data = await stored(page, key);
        await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(data, lang).total));
        await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + (teams - 1) * 385_000));
        if (preview) {
          await openPreviewDetails(page);
          await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-teams', String(teams));
          await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-staff', String(teams * 2));
          await expect(page.getByTestId('scene-team')).toHaveCount(teams);
        }
      }

      await plus.click();
      await expectTeams(2);
      await plus.click();
      await expectTeams(3);
      await expect(plus).toBeEnabled();
      await plus.click();
      await expectTeams(4);
      await expect(panel.getByTestId('perfume-capacity-notice')).toContainText(lang === 'ko' ? '상담이 필요' : 'need consultation');
      await input.fill('10');
      await input.press('Enter');
      await expectTeams(10);
      await input.fill('0');
      await input.press('Enter');
      await expectTeams(1);
      await expect(minus).toBeDisabled();
      await expect(panel.getByTestId('perfume-capacity-notice')).not.toContainText(lang === 'ko' ? '상담이 필요' : 'need consultation');
      await input.fill('5');
      await input.press('Enter');
      await expectTeams(5);
      await input.locator('..').screenshot({ path: testInfo.outputPath(`teams-consultation-${lang}.png`) });

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      await showOptionPage(page, 'acscent', 'basic');
      await expectTeams(5);
      await expect(plus).toBeEnabled();
      const summary = page.getByRole('complementary', { name: QUOTE_COPY[lang].sheetTitle });
      // The compact summary is hidden in preview step three, but still provides
      // the same total-team wording when the final step becomes visible.
      if (preview) await nextPreviewStep(page);
      await expect(summary).toContainText(lang === 'ko' ? '조향 5팀' : '5 perfumer teams');

      // Saved quantities above the standard setup are retained in both flows.
      const legacy = sanitizeInput({ items: [{ key: 'acscent', options: { guests: 100 } }] });
      legacy.items.find((item) => item.key === 'acscent')!.options.extraTeams = 10;
      await page.evaluate(({ storageKey, value }) => localStorage.setItem(storageKey, value), { storageKey: key, value: JSON.stringify(legacy) });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      await showOptionPage(page, 'acscent', 'basic');
      await expectTeams(11);
      await expect(plus).toBeEnabled();
    });
  }
}

// 기본 1팀의 출장비도 합계에 들어간다 — 팀 금액 문구와 소계 안내가 실제 과금과 같아야 한다
for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: perfume options show that every team is charged and how the subtotal adds up`, async ({ page }) => {
    const key = 'neander-quote-preview-flow-v1';
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview?item=acscent`, { waitUntil: 'domcontentloaded' });
    for (let i = 0; i < 2; i++) await nextPreviewStep(page);
    const panel = await showOptionPage(page, 'acscent', 'basic');
    const basic = panel.getByTestId('perfume-basic-configuration');
    const breakdown = panel.getByTestId('perfume-base-breakdown');
    const perfumeLines = async () => calculateQuote(await stored(page, key), lang).lines.filter((line) => line.service === 'acscent');

    // 100명 · 10ml · 1팀 · 서울 · 1일: 150만원 + 35만원 = 185만원
    await expect(panel.locator('#p-guests')).toHaveValue('100');
    await expect(panel.locator('#p-teams')).toHaveValue('1');
    await expect(basic).toContainText(lang === 'ko' ? '기본 1팀부터 적용' : 'each team');
    await expect(basic).not.toContainText(lang === 'ko' ? '추가 팀당' : 'per extra team');
    await expect(breakdown).toHaveAttribute('data-guests', '1500000');
    await expect(breakdown).toHaveAttribute('data-travel', '350000');
    await expect(breakdown).toHaveAttribute('data-subtotal', '1850000');
    for (const amount of lang === 'ko' ? ['150만원', '35만원', '185만원'] : ['KRW 1,500,000', 'KRW 350,000', 'KRW 1,850,000']) await expect(breakdown).toContainText(amount);
    expect((await perfumeLines()).reduce((sum, line) => sum + line.amount, 0)).toBe(1_850_000);

    // 팀을 늘리면 소계도 같은 금액만큼 늘고, 견적 계산과 계속 같다
    await panel.getByRole('button', { name: `${QUOTE_COPY[lang].extraTeams} +`, exact: true }).click();
    await expect(panel.locator('#p-teams')).toHaveValue('2');
    await expect(breakdown).toHaveAttribute('data-travel', '700000');
    await expect(breakdown).toHaveAttribute('data-subtotal', '2200000');
    await expect.poll(async () => (await perfumeLines()).reduce((sum, line) => sum + line.amount, 0)).toBe(2_200_000);
  });
}
