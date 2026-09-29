import assert from 'node:assert/strict';
import test from 'node:test';
import { PERFUME, REGIONS, type RegionKey } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, getPerfumeStaffing, normalizePerfumeStaffing, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { loadPreviewFlow, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';
import { PREVIEW_STORAGE_KEY, resolvePreview } from '../../src/lib/quote-preview/model';
import { resolvePerfumeScene } from '../../src/lib/quote-preview/perfume-scene';
import { resolveEventScene } from '../../src/lib/quote-preview/event-scene';
import { MAX_ILLUSTRATED_PERFUME_TEAMS } from '../../src/lib/quote-preview/perfume-furniture';
import { optionSummary } from '../../src/components/quote-studio/option-summary';

function inputWith(extraTeams: unknown, region: RegionKey = 'seoul', days = 1): QuoteInput {
  return sanitizeInput({ region, days, hoursPerDay: 8, items: [{ key: 'acscent', options: { guests: 100, extraTeams } }] });
}

test('a perfume experience includes one team and preserves larger team selections', () => {
  const initial = defaultOptions('acscent');
  assert.equal(initial.key, 'acscent');
  if (initial.key !== 'acscent') return;
  assert.equal(initial.options.extraTeams, 0);
  assert.equal(PERFUME.includedTeams, 1);
  assert.equal(PERFUME.standardTeams, 3);
  const cases: [unknown, number][] = [[undefined, 0], [null, 0], ['bad', 0], [NaN, 0], [Infinity, 0], [-100, 0], [0, 0], [1, 1], [2, 2], [3, 3], [10, 10], [100, 100], [1.6, 2], ['2', 2]];
  for (const [raw, expected] of cases) {
    const input = inputWith(raw);
    const item = input.items[0];
    assert.equal(item.key, 'acscent');
    if (item.key !== 'acscent') continue;
    assert.equal(item.options.extraTeams, expected, `extraTeams=${String(raw)}`);
    const scene = resolvePerfumeScene(input)!;
    assert.equal(scene.totalTeams, expected + 1);
    assert.equal(scene.staff, (expected + 1) * 2);
  }
});

test('direct calculations bill every selected team and request consultation without changing input', () => {
  const input = inputWith(2);
  const perfume = input.items.find((item) => item.key === 'acscent')!;
  const expected = calculateQuote(input);
  perfume.options.extraTeams = 10;
  const before = structuredClone(input);
  assert.equal(calculateQuote(input).total - expected.total, Math.round(8 * PERFUME.teamTravel.seoul * 1.1));
  assert.deepEqual(input, before);
  perfume.options.guests = 1000;
  for (const lang of ['ko', 'en'] as const) {
    const quote = calculateQuote(input, lang);
    const text = quote.warnings.join(' ');
    assert.match(text, lang === 'ko' ? /11팀/ : /11 perfumer teams/);
    assert.match(text, lang === 'ko' ? /상담.*확정/ : /consultation/i);
  }
});

test('small and large team selections keep matching travel fees, summaries and preview headcount', () => {
  for (const region of REGIONS.map((r) => r.key)) {
    for (const days of [1, 3]) {
      const baseline = calculateQuote(inputWith(0, region, days));
      for (const teams of [1, 2, 3, 4, 6, 20]) {
        const input = inputWith(teams - 1, region, days);
        for (const lang of ['ko', 'en'] as const) {
          const quote = calculateQuote(input, lang);
          const travel = quote.lines.find((line) => /조향 팀 출장비|Perfumer team travel/.test(line.label))!;
          assert.equal(travel.amount, PERFUME.teamTravel[region] * teams * days);
          assert.ok(travel.detail.includes(lang === 'ko' ? `${teams}팀` : `${teams} team`));
          assert.equal(quote.supply - baseline.supply, PERFUME.teamTravel[region] * (teams - 1) * days);
          assert.equal(quote.total - baseline.total, Math.round(PERFUME.teamTravel[region] * (teams - 1) * days * 1.1));
          const summary = optionSummary(input.items[0], lang).join(' · ');
          assert.match(summary, lang === 'ko' ? new RegExp(`조향(?: 팀)? ${teams}팀`) : new RegExp(`${teams} (?:perfumer )?team`, 'i'));
          assert.doesNotMatch(summary, /조향 팀 \+|\+\d+ team/);
          const preview = resolvePreview(input, 'combined', lang);
          assert.ok(preview.badges.some((badge) => badge.includes(lang === 'ko' ? `${teams}팀 · ${teams * 2}명` : `${teams} team`)));
        }
      }
    }
  }
});

test('older preview drafts preserve larger selections through save and restore', () => {
  for (const extraTeams of [0, 1, 2, 10]) {
    const raw = { ...inputWith(0), items: [{ key: 'acscent', options: { guests: 100, volume: '10ml', extraTeams } }] };
    for (const key of [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]) {
      const value = JSON.stringify(key === PREVIEW_STORAGE_KEY ? { version: 1, input: raw } : raw);
      const restored = loadPreviewFlow({ getItem: (requested) => requested === key ? value : null })!;
      const before = structuredClone(restored);
      const item = restored.items[0];
      assert.equal(item.key, 'acscent');
      if (item.key !== 'acscent') continue;
      assert.equal(item.options.extraTeams, extraTeams);
      const scene = resolvePerfumeScene(restored)!;
      assert.equal(scene.totalTeams, 1 + extraTeams);
      assert.equal(scene.teams.length + scene.overflowTeams.length, scene.totalTeams);
      assert.deepEqual(sanitizeInput(JSON.parse(JSON.stringify(restored))), restored);
      assert.deepEqual(restored, before);
    }
  }
});

test('40 guests per team per hour determines automatic staffing, fees and both previews at each boundary', () => {
  for (const days of [1, 2]) {
    for (const hoursPerDay of [1, 6, 14]) {
      const oneTeamCapacity = 40 * hoursPerDay * days;
      for (const [guests, teams, exceeds] of [
        [oneTeamCapacity, 1, false], [oneTeamCapacity + 1, 2, false],
        [oneTeamCapacity * 2, 2, false], [oneTeamCapacity * 2 + 1, 3, false],
        [oneTeamCapacity * 3, 3, false], [oneTeamCapacity * 3 + 1, 4, true],
      ] as const) {
        const raw = { ...inputWith(0), days, hoursPerDay, attendees: 9000, extraStaff: 10 };
        raw.items.find(item => item.key === 'acscent')!.options.guests = guests;
        const before = structuredClone(raw);
        const normalized = sanitizeInput(raw);
        const options = normalized.items.find(item => item.key === 'acscent')!.options;
        assert.equal(options.extraTeams, teams - 1);
        assert.equal(getPerfumeStaffing(options, normalized).minimumTeams, teams);
        assert.equal(resolvePerfumeScene(normalized)!.staff, teams * 2);
        assert.match(optionSummary(normalized.items[0], 'ko').join(' '), new RegExp(`조향 ${teams}팀`));
        const quote = calculateQuote(raw);
        assert.deepEqual(quote, calculateQuote(normalized));
        assert.equal(quote.lines.find(line => line.label === '조향 팀 출장비')!.amount, 350_000 * teams * days);
        assert.equal(quote.warnings.some(warning => warning.startsWith('AI 향수 체험:')), exceeds);
        assert.deepEqual(sanitizeInput(JSON.parse(JSON.stringify(normalized))), normalized);
        assert.deepEqual(raw, before);
      }
    }
  }
});

test('automatic teams can decrease after a guest or schedule change without discarding manual teams', () => {
  let input = sanitizeInput({ days: 1, hoursPerDay: 6, items: [{ key: 'acscent', options: { guests: 500, extraTeams: 0 } }] });
  const options = () => input.items.find(item => item.key === 'acscent')!.options;
  assert.equal(options().extraTeams, 2);
  assert.equal(options().requestedExtraTeams, 0);
  // Restoration must retain the distinction between manual and automatic teams.
  input = loadPreviewFlow({ getItem: key => key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? JSON.stringify(input) : null })!;
  input = normalizePerfumeStaffing({ ...input, days: 3 });
  assert.equal(options().extraTeams, 0);
  assert.equal(options().requestedExtraTeams, undefined);
  input = normalizePerfumeStaffing({ ...input, days: 1, hoursPerDay: 7 });
  assert.equal(options().extraTeams, 1);
  options().guests = 100;
  input = normalizePerfumeStaffing(input);
  assert.equal(options().extraTeams, 0);

  // A customer who explicitly chose two teams should keep two when demand falls.
  options().extraTeams = 1;
  options().guests = 900;
  input = normalizePerfumeStaffing(input);
  assert.equal(options().extraTeams, 3);
  assert.equal(options().requestedExtraTeams, 1);
  options().guests = 100;
  input = normalizePerfumeStaffing(input);
  assert.equal(options().extraTeams, 1);
  assert.equal(options().requestedExtraTeams, undefined);
});

test('large events automatically receive enough teams and consultation replaces the old ceiling', () => {
  for (const [guests, teams] of [[721, 4], [5000, 21]] as const) {
    const input = sanitizeInput({ days: 1, hoursPerDay: 6, items: [{ key: 'acscent', options: { guests } }] });
    assert.equal(input.items.find(item => item.key === 'acscent')!.options.extraTeams, teams - 1);
    assert.match(calculateQuote(input).warnings.join(' '), /상담이 필요/);
    assert.match(calculateQuote(input, 'en').warnings.join(' '), /requires consultation/);
    assert.equal(calculateQuote(input).lines.find(line => line.label === '조향 팀 출장비')!.amount, teams * PERFUME.teamTravel.seoul);
  }
});

test('representative illustrations bound rendering only, never the chosen or priced team count', () => {
  for (const teams of [4, 12, 1000]) {
    const input = inputWith(teams - 1);
    const detail = resolvePerfumeScene(input)!;
    const scene = resolveEventScene(input)!;
    assert.equal(detail.totalTeams, teams);
    assert.equal(scene.counts.teams, teams);
    assert.equal(detail.teams.length + detail.overflowTeams.length, Math.min(teams, MAX_ILLUSTRATED_PERFUME_TEAMS));
    assert.equal(scene.objects.filter(object => object.type === 'team').length, Math.min(teams, MAX_ILLUSTRATED_PERFUME_TEAMS));
    assert.ok(scene.objects.every(object => [object.x, object.y, object.scale].every(Number.isFinite)));
    assert.equal(calculateQuote(input).lines.find(line => line.label === '조향 팀 출장비')!.amount, teams * PERFUME.teamTravel.seoul);
  }
});
