import { test } from 'node:test';
import assert from 'node:assert/strict';
import { particleFor, withParticle } from '../../src/lib/korean';

test('Korean particles handle open, closed, and rieul endings', () => {
  for (const [text, object, subject, topic, direction] of [
    ['페탈 레터', '를', '가', '는', '로'],
    ['포레스트 애프터 레인', '을', '이', '은', '으로'],
    ['가을', '을', '이', '은', '로'],
    ['오버사이즈', '를', '가', '는', '로'],
  ]) {
    assert.equal(particleFor(text, '을/를'), object);
    assert.equal(particleFor(text, '이/가'), subject);
    assert.equal(particleFor(text, '은/는'), topic);
    assert.equal(particleFor(text, '으로/로'), direction);
  }
});
test('punctuation, decomposed Hangul and numeric labels have readable particles', () => {
  assert.equal(withParticle('레인”', '을/를'), '레인”을');
  assert.equal(particleFor('가을'.normalize('NFD'), '으로/로'), '로');
  assert.equal(withParticle('선택 1', '으로/로'), '선택 1로');
  assert.equal(withParticle('선택 6', '으로/로'), '선택 6으로');
  assert.equal(withParticle('', '은/는'), '');
});
