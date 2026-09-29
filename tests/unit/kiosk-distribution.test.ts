import assert from 'node:assert/strict';
import test from 'node:test';
import { distributeKioskExperiences, formatKioskNumbers, groupKioskAssignments, shiftKioskExperience } from '../../src/lib/quote/kiosk-experiences';

test('chosen experiences split the kiosks evenly, earlier picks taking the remainder', () => {
  assert.deepEqual(distributeKioskExperiences(['a', 'b'], 4), ['a', 'a', 'b', 'b']);
  assert.deepEqual(distributeKioskExperiences(['a', 'b', 'c'], 4), ['a', 'a', 'b', 'c']);
  assert.deepEqual(distributeKioskExperiences(['a'], 3), ['a', 'a', 'a']);
  assert.deepEqual(distributeKioskExperiences([], 2), ['', '']);
  // 키오스크보다 많이 고를 수 없고, 같은 체험은 한 번만 센다
  assert.deepEqual(distributeKioskExperiences(['a', 'b', 'c'], 2), ['a', 'b']);
  assert.deepEqual(distributeKioskExperiences(['a', 'a', 'b'], 4), ['a', 'a', 'b', 'b']);
});

test('assignments group by experience in first-seen order with undecided kiosks last', () => {
  assert.deepEqual(groupKioskAssignments(['a', '', 'b', 'a']), [
    { slug: 'a', kiosks: [1, 4] }, { slug: 'b', kiosks: [3] }, { slug: '', kiosks: [2] },
  ]);
});

test('shifting a kiosk keeps the total and at least one kiosk per chosen experience', () => {
  assert.deepEqual(shiftKioskExperience(['a', 'a', 'b', 'b'], 'b', 1), ['a', 'b', 'b', 'b']);
  assert.deepEqual(shiftKioskExperience(['a', 'b', 'b', 'b'], 'a', -1), ['a', 'b', 'b', 'b']); // a 는 이미 1대
  assert.deepEqual(shiftKioskExperience(['a', 'b', 'b', 'b'], 'b', -1), ['a', 'a', 'b', 'b']);
  assert.deepEqual(shiftKioskExperience(['a', 'a', 'a'], 'a', 1), ['a', 'a', 'a']); // 가져올 곳이 없다
  // 정하지 않은 기기가 있으면 거기서 먼저 가져온다
  assert.deepEqual(shiftKioskExperience(['a', '', 'b', 'b'], 'a', 1), ['a', 'a', 'b', 'b']);
  for (const result of [shiftKioskExperience(['a', 'a', 'b', 'c'], 'c', 1), shiftKioskExperience(['a', 'a', 'b', 'c'], 'a', -1)]) {
    assert.equal(result.length, 4);
    for (const slug of ['a', 'b', 'c']) assert.ok(result.includes(slug));
  }
});

test('kiosk numbers read as ranges', () => {
  assert.equal(formatKioskNumbers([1, 2], 'ko'), '1–2번');
  assert.equal(formatKioskNumbers([3], 'ko'), '3번');
  assert.equal(formatKioskNumbers([1, 3], 'ko'), '1·3번');
  assert.equal(formatKioskNumbers([1, 2, 3], 'en'), 'Kiosks 1–3');
});
