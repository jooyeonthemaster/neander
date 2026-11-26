import { expect, test, type Page } from '@playwright/test';
import { enterExperienceStep, nextPreviewStep, showOptionPage, sidebarOptionSummaries } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { QUOTE_STORAGE_KEY } from '../../src/components/quote-studio/history';

const stored = (page: Page, key: string): Promise<QuoteInput> => page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key);

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: perfume teams start at one, allow larger selections with consultation and restore the total correctly`, async ({ page }, testInfo) => {
    const route = `${lang === 'en' ? '/en' : ''}/quote`;
    const key = QUOTE_STORAGE_KEY;
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
    }

    await plus.click();
    await expectTeams(2);
    await plus.click();
    await expectTeams(3);
    await expect(plus).toBeEnabled();
    await plus.click();
    await expectTeams(4);
    await expect(panel.getByTestId('perfume-capacity-notice')).toContainText(lang === 'ko' ? '상담이 필요' : 'consult us');
    await input.fill('10');
    await input.press('Enter');
    await expectTeams(10);
    await input.fill('0');
    await input.press('Enter');
    await expectTeams(1);
    await expect(minus).toBeDisabled();
    await expect(panel.getByTestId('perfume-capacity-notice')).not.toContainText(lang === 'ko' ? '상담이 필요' : 'consult us');
    await input.fill('5');
    await input.press('Enter');
    await expectTeams(5);
    await input.locator('..').screenshot({ path: testInfo.outputPath(`teams-consultation-${lang}.png`) });

    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await enterExperienceStep(page);
    await showOptionPage(page, 'acscent', 'basic');
    await expectTeams(5);
    await expect(plus).toBeEnabled();
    await expect(page.getByRole('complementary', { name: QUOTE_COPY[lang].sheetTitle })).toBeVisible();
    // 요약 칸은 옵션 앞 두 개만 보이고 나머지는 title 에 — 전체 요약에서 찾는다
    await expect.poll(async () => (await sidebarOptionSummaries(page)).join('\n')).toContain(lang === 'ko' ? '조향 5팀' : '5 perfumer teams');

    // Saved quantities above the standard setup are retained.
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

// 기본 1팀의 출장비도 합계에 들어간다 — 팀 금액 문구와 소계 안내가 실제 과금과 같아야 한다
for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: perfume options show that every team is charged and how the subtotal adds up`, async ({ page }) => {
    const key = QUOTE_STORAGE_KEY;
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote?item=acscent`, { waitUntil: 'domcontentloaded' });
    for (let i = 0; i < 2; i++) await nextPreviewStep(page);
    const panel = await showOptionPage(page, 'acscent', 'basic');
    const basic = panel.getByTestId('perfume-basic-configuration');
    const breakdown = panel.getByTestId('perfume-base-breakdown');
    const perfumeLines = async () => calculateQuote(await stored(page, key), lang).lines.filter((line) => line.service === 'acscent');

    // 100명 · 10ml · 1팀 · 서울 · 1일: 150만원 + 35만원 = 185만원
    await expect(panel.locator('#p-guests')).toHaveValue('100');
    await expect(panel.locator('#p-teams')).toHaveValue('1');
    // 옵션 창에서는 「기본 1팀부터 적용」을 빼고 「팀당 35만원/일」만 둔다 — 1팀부터 과금되는 것은 아래 소계 식이 보여 준다
    await expect(basic).toContainText(lang === 'ko' ? '팀당' : 'each team');
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
