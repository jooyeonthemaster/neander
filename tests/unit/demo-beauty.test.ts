import assert from 'node:assert/strict';
import test from 'node:test';
import { baristaServing, resolveBaristaBrew } from '../../src/data/demo-ai/barista';
import { cocktailCopy, normalizeCocktailGarnish } from '../../src/data/demo-ai/cocktail';
import { makeupBlockedReason, nailBlockedReason } from '../../src/data/demo-ai/beauty-completion';
import { formatTasteTypeName, tasteSpiceScore } from '../../src/data/demo-ai/taste-dna';

test('spice score preserves zero and uses one scale for every selected level', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(tasteSpiceScore), [0, 25, 50, 75, 100]);
  assert.equal(tasteSpiceScore(-4), 0);
  assert.equal(tasteSpiceScore(9), 100);
  assert.equal(tasteSpiceScore(Number.NaN), 0);
});

test('taste type names separate attached adjective and role without changing spaced names', () => {
  assert.equal(formatTasteTypeName('화끈한크림모험가'), '화끈한 크림 모험가');
  assert.equal(formatTasteTypeName('달콤 탐험가'), '달콤 탐험가');
  assert.equal(formatTasteTypeName('감칠맛수호자'), '감칠맛 수호자');
});

test('garnish absence has a single label value, and cocktail copy uses bartender terms', () => {
  for (const value of ['가니시 없이', '가니쉬 없음', '없음', '생략', 'none']) assert.equal(normalizeCocktailGarnish(value), '없음');
  assert.equal(normalizeCocktailGarnish('레몬 필'), '레몬 필');
  assert.equal(cocktailCopy('취향대로 조향했습니다. 가니쉬는 민트예요.'), '취향대로 블렌딩했습니다. 가니시는 민트예요.');
});

test('brew tool wins conflicting espresso habit, and latte remains possible on a machine', () => {
  assert.equal(resolveBaristaBrew('dripper', 'espresso', 'espresso'), 'pourover');
  assert.equal(resolveBaristaBrew('immersion', 'latte', 'latte'), 'frenchpress');
  assert.equal(resolveBaristaBrew('espresso', 'latte', 'pourover'), 'latte');
  assert.equal(resolveBaristaBrew('cafe', 'espresso', 'espresso'), 'espresso');
  assert.equal(resolveBaristaBrew(undefined, 'drip', 'pourover'), 'pourover');
});

test('serving cup follows the actual extraction, never an unrelated AI sentence', () => {
  assert.match(baristaServing('espresso').cup, /데미타세/);
  for (const brew of ['pourover', 'frenchpress', 'latte', 'coldbrew'] as const) {
    assert.doesNotMatch(baristaServing(brew).tip, /데미타세/);
  }
  assert.match(baristaServing('pourover', 'iced').cup, /유리잔/);
  assert.match(baristaServing('pourover').cup, /250–300ml/);
});

test('nail completion identifies each missing group and clears when both are chosen', () => {
  assert.match(nailBlockedReason({})!, /패턴과 쉐입/);
  assert.equal(nailBlockedReason({ pattern: 'solid' }), '쉐입을 골라주세요');
  assert.equal(nailBlockedReason({ shape: 'round' }), '패턴을 골라주세요');
  assert.equal(nailBlockedReason({ pattern: 'solid', shape: 'round' }), undefined);
});

test('makeup preview default is not a completed intensity choice', () => {
  assert.match(makeupBlockedReason({})!, /강도와 룩/);
  assert.equal(makeupBlockedReason({ look: 'coral' }), '메이크업 강도를 골라주세요');
  assert.equal(makeupBlockedReason({ intensity: 'soft' }), '메이크업 룩을 골라주세요');
  assert.equal(makeupBlockedReason({ intensity: 'soft', look: 'coral' }), undefined);
});
