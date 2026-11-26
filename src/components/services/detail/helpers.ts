/* 서비스 상세에서 함께 쓰는 작은 도우미 */

/** 영어 이름을 큰 제목용 줄로 나눈다 — Syne ExtraBold 는 글자 폭이 넓어 한 줄에 11자 안팎이 한계 */
export function displayLines(en: string, max = 11): string[] {
  const words = en.toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if ((line + ' ' + word).length <= max) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 줄 수 · 가장 긴 줄에 맞춘 제목 크기 */
export function displaySize(lines: string[]): 'h1' | 'h2' {
  const longest = Math.max(...lines.map((l) => l.length));
  return lines.length >= 3 || longest > 10 ? 'h2' : 'h1';
}
