import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidElement, type ReactElement } from 'react';
import { keepNumbersTogether } from '../../src/lib/keep-numbers';

// 금액만 줄바꿈 없는 조각으로 묶이고, 나머지 글은 그대로 남는다
const wrapped = (text: string) =>
  keepNumbersTogether(text)
    .filter((p): p is ReactElement<{ children: string }> => isValidElement(p))
    .map((p) => p.props.children);

test('원 · ₩ 금액을 통째로 묶는다', () => {
  assert.deepEqual(wrapped('20–49명 20,000원 · 100명 이상 15,000원'), ['20', '49', '20,000원', '100', '15,000원']);
  assert.deepEqual(wrapped('extra day ₩200,000 (default: QR)'), ['₩200,000']);
  assert.deepEqual(wrapped('1인당 약 2.03만원'), ['1', '2.03만원']);
});

test('글자는 바뀌지 않는다', () => {
  const text = '매장 기준 AI 향수 10ml 24,000원 · 50ml 48,000원.\n행사용 수량은 견적으로';
  const joined = keepNumbersTogether(text).map((p) => (isValidElement(p) ? (p as ReactElement<{ children: string }>).props.children : p)).join('');
  assert.equal(joined, text);
});
