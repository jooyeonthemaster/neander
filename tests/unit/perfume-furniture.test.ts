import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateQuote, sanitizeInput } from '../../src/lib/quote/engine';
import { eventObjectGroundPoints } from '../../src/lib/quote-preview/booth-layout';
import { isOnEventFloor, resolveEventScene } from '../../src/lib/quote-preview/event-scene';
import { perfumeCounterWidth, perfumeFurniture, perfumeRackCount } from '../../src/lib/quote-preview/perfume-furniture';
import { resolvePerfumeScene } from '../../src/lib/quote-preview/perfume-scene';

test('every started group of 50 participants has a complete rack and enough table space', () => {
  for (const [guests, expected] of [[20, 1], [49, 1], [50, 1], [51, 2], [100, 2], [101, 3], [150, 3], [200, 4], [300, 6], [301, 7], [5000, 100]]) {
    const plan = perfumeFurniture(guests);
    assert.equal(perfumeRackCount(guests), expected);
    assert.equal(plan.counters.reduce((sum, counter) => sum + counter.racks, 0), expected);
    assert.ok(plan.counters.every(counter => counter.racks > 0 && counter.racks <= 6));
    assert.ok(plan.counters.every(counter => counter.width > counter.racks * 102));
  }
  assert.ok(perfumeCounterWidth(4) > perfumeCounterWidth(2));
  assert.ok(perfumeCounterWidth(2) > perfumeCounterWidth(1));
});

test('overview and perfume details show the same racks through every size and high participant counts', () => {
  for (const size of ['existing', 'booth3x3', 'booth6x3', 'large']) {
    for (const guests of [20, 50, 51, 100, 101, 200, 300, 301, 1000, 5000]) {
      const input = sanitizeInput({ items: [
        { key: 'acscent', options: { guests, extraTeams: 2, analysisKiosks: 4 } },
        { key: 'photoBooth', options: { booths: 3 } }, { key: 'rental', options: { kiosks: 4 } },
        ...(size === 'existing' ? [] : [{ key: 'spatialDesign', options: { size } }]),
      ] });
      const before = structuredClone(input);
      const quote = calculateQuote(input);
      const scene = resolveEventScene(input)!;
      const detail = resolvePerfumeScene(input)!;
      const expected = Math.ceil(guests / 50);
      assert.equal(scene.objects.reduce((sum, object) => sum + (object.racks ?? 0), 0), expected);
      assert.equal(detail.rackCount, expected);
      assert.equal(detail.counters.reduce((sum, counter) => sum + counter.racks, 0), expected);
      const expectedTeams = Math.max(3, Math.ceil(guests / (40 * input.days * input.hoursPerDay)));
      assert.equal(scene.counts.teams, expectedTeams);
      assert.equal(detail.totalTeams, expectedTeams);
      assert.equal(scene.counts.kiosks, 4);
      const floor = scene.footprint?.points ?? scene.floor.points;
      for (const object of scene.objects) assert.ok(eventObjectGroundPoints(object).every(point => isOnEventFloor(point, floor)), `${size}, ${guests}: ${object.id}`);
      assert.deepEqual(input, before);
      assert.deepEqual(calculateQuote(input), quote, 'furniture rendering must not introduce an extra fee');
    }
  }
});
