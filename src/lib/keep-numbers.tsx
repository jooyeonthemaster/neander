import type { ReactNode } from 'react';

/**
 * 「15,000원」「₩200,000」「2.5만원」 같은 금액 · 숫자를 줄바꿈 없는 조각으로 감싼다.
 * 아이폰(WebKit)은 좁은 폭에서 숫자의 쉼표 뒤에서 줄을 바꿔 「15,」/「000원」으로 가른다 (2026-11 모바일 검수).
 * 문장 전체를 묶지 않고 숫자만 묶어, 나머지 글은 평소처럼 줄이 바뀐다.
 */
export function keepNumbersTogether(text: string): ReactNode[] {
  // split 에 괄호(캡처)를 쓰면 홀수 칸이 일치한 숫자 부분이다
  return text.split(/(₩?\d[\d,]*(?:\.\d+)?(?:만원|원)?)/).map((part, i) =>
    i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part,
  );
}
