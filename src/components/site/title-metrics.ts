/* Syne ExtraBold 대문자 한 글자의 폭 (em, 자간 -0.02em 포함) — 실제 렌더링으로 잰 값 (2026-11-21).
   서비스 이름처럼 데이터에서 오는 영어 제목이 칸 폭을 넘어 단어 중간에서 꺾이지 않게,
   가장 긴 줄의 폭을 미리 계산해 글자 크기 상한을 정하는 데 쓴다 (Title 의 fit). */
const CHAR_EM: Record<string, number> = {
  A: 1.14, B: 1.12, C: 1.296, D: 1.282, E: 1.12, F: 1.108, G: 1.32, H: 1.26, I: 0.4, J: 0.984, K: 1.195, L: 0.923, M: 1.56,
  N: 1.28, O: 1.31, P: 1.157, Q: 1.31, R: 1.212, S: 1.036, T: 1.08, U: 1.269, V: 1.14, W: 1.862, X: 1.12, Y: 1.05, Z: 1.18,
  '0': 1.046, '1': 0.509, '2': 0.983, '3': 1.035, '4': 1.074, '5': 0.995, '6': 1.113, '7': 1.133, '8': 1.061, '9': 1.138,
  ' ': 0.29, '.': 0.334, ',': 0.283, "'": 0.28, '’': 0.283, '&': 1.2, '-': 0.57, '—': 0.92, '?': 0.844, '!': 0.374,
  '·': 0.334, ':': 0.334, '/': 0.602, '+': 0.76, '×': 0.691,
};

/** 대문자로 썼을 때 한 줄의 폭 (em) */
export function lineEm(text: string): number {
  let width = 0;
  for (const ch of text.toUpperCase()) width += CHAR_EM[ch] ?? 1.2;
  return width;
}

/** 여러 줄 가운데 가장 긴 줄의 폭 (em). 글자가 아닌 줄(JSX)은 건너뛴다 */
export function longestLineEm(lines: unknown[]): number {
  return Math.max(0, ...lines.map((line) => (typeof line === 'string' ? lineEm(line) : 0)));
}
