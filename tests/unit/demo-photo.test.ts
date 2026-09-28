import assert from 'node:assert/strict';
import test from 'node:test';
import { FF_FEATURE_IDS, familyMotifMix } from '../../src/data/demo-ai/future-family';
import { shortTripCandidate, TRAVEL_DESTINATIONS } from '../../src/data/demo-ai/travel';

test('short trip candidates stay domestic for every atmosphere and are alternatives', () => {
  for (const length of ['day', 'weekend'] as const) {
    for (const { id } of TRAVEL_DESTINATIONS) {
      const trip = shortTripCandidate(length, id);
      assert.ok(trip);
      assert.match(trip.destination, /또는/);
      assert.doesNotMatch(trip.destination, /도쿄|홍콩|뉴욕|파리|스위스|몰디브|네팔/);
      assert.match(trip.tip, length === 'day' ? /당일|가까운/ : /2~3일/);
    }
  }
  assert.equal(shortTripCandidate('long', 'city'), undefined);
  assert.equal(shortTripCandidate(undefined, 'city'), undefined);
  assert.deepEqual(shortTripCandidate('day', 'untrusted'), shortTripCandidate('day', 'city'));
});

test('uniform AI family percentages become varied fictional motifs with both A and B', () => {
  const uniform = Object.fromEntries(FF_FEATURE_IDS.map((id) => [id, 50]));
  for (let seed = 0; seed < 100; seed++) {
    const values = Object.values(familyMotifMix(seed, uniform));
    assert.equal(values.length, 6);
    assert.equal(new Set(values).size, 6);
    assert.equal(values.filter((value) => value > 50).length, 3);
    assert.equal(values.filter((value) => value < 50).length, 3);
    assert.ok(values.every((value) => Math.max(value, 100 - value) >= 55 && Math.max(value, 100 - value) <= 65));
    assert.deepEqual(familyMotifMix(seed, uniform), familyMotifMix(seed, uniform));
  }
});

test('valid creative family mix survives while out-of-range and nonfinite values are safe', () => {
  const proposed = { eyes: 62, brows: 44, nose: 55, mouth: 41, face: 58, smile: 39 };
  assert.deepEqual(familyMotifMix(123, proposed), proposed);
  const invalid = { ...proposed, eyes: Number.NaN, brows: Number.POSITIVE_INFINITY };
  assert.ok(Object.values(familyMotifMix(123, invalid)).every(Number.isFinite));
  assert.notDeepEqual(familyMotifMix(123), familyMotifMix(124));
});
