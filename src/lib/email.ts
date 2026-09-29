import { z } from 'zod';

const emailSchema = z.string().trim().email().max(200);

/** 서버(/api/quote-pdf, /api/inquiry-notify)와 같은 규칙으로 이메일 형식을 확인한다. */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}
