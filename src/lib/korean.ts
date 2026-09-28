export type KoreanParticle = '을/를' | '이/가' | '은/는' | '으로/로';

/** Last pronounced syllable, ignoring closing punctuation and whitespace. */
function finalConsonant(text: string): number {
  const last = text.normalize('NFC').replace(/[\s\p{P}\p{S}]+$/gu, '').at(-1);
  if (!last) return 0;
  const code = last.codePointAt(0)! - 0xac00;
  if (code >= 0 && code <= 11171) return code % 28;
  if ('ㄹᆯ'.includes(last)) return 8;
  if (/[ㄱ-ㅎᆨ-ᇂ]/u.test(last)) return 1;
  // Korean readings: 영·일·이·삼·사·오·육·칠·팔·구.
  if (/\d/.test(last)) return [21, 8, 0, 16, 0, 0, 1, 8, 8, 0][Number(last)];
  if (/[lr]/i.test(last)) return 8;
  if (/[mn]/i.test(last)) return 1;
  return 0;
}

export function particleFor(text: string, pair: KoreanParticle): string {
  const final = finalConsonant(text);
  const [closed, open] = pair.split('/');
  return final === 0 || (pair === '으로/로' && final === 8) ? open : closed;
}

export function withParticle(text: string, pair: KoreanParticle): string {
  return text ? `${text}${particleFor(text, pair)}` : '';
}
