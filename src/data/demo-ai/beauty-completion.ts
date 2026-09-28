const chosen = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export function nailBlockedReason(answers: Record<string, unknown>): string | undefined {
  const pattern = chosen(answers.pattern);
  const shape = chosen(answers.shape);
  if (!pattern && !shape) return '패턴과 쉐입을 각각 골라주세요';
  if (!pattern) return '패턴을 골라주세요';
  if (!shape) return '쉐입을 골라주세요';
}

export function makeupBlockedReason(answers: Record<string, unknown>): string | undefined {
  const intensity = chosen(answers.intensity);
  const look = chosen(answers.look);
  if (!intensity && !look) return '메이크업 강도와 룩을 각각 골라주세요';
  if (!intensity) return '메이크업 강도를 골라주세요';
  if (!look) return '메이크업 룩을 골라주세요';
}
