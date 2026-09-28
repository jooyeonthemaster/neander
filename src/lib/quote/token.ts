import { createHmac, timingSafeEqual } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import type { Lang } from './catalog';
import type { QuoteInput, QuoteResult } from './engine';

/* ─────────────────────────────────────────────────────────
   가견적서 링크 토큰
   발급 순간의 견적(입력·품목·금액·수신자)을 압축해 서버 비밀키로 서명한다.
   - 링크만 있으면 발급 당시 내용 그대로 다시 보고 PDF를 다시 만들 수 있다 (가격표가 바뀌어도 그대로)
   - 서명이 맞지 않으면 열리지 않으므로 금액을 고친 가짜 견적서를 만들 수 없다
   - DB에 따로 저장하지 않는다 (링크 자체가 저장본)
   비밀키: QUOTE_SIGNING_SECRET (없으면 OPENROUTER_API_KEY 에서 파생 — 키를 바꾸면 기존 링크가 열리지 않는다)
   ───────────────────────────────────────────────────────── */

export interface EstimateSnapshot {
  v: 1;
  no: string;
  /** ISO 시각 */
  issuedAt: string;
  lang: Lang;
  recipient: { name: string; email: string; company?: string; phone?: string };
  input: QuoteInput;
  result: QuoteResult;
}

function secret(): Buffer | null {
  const own = process.env.QUOTE_SIGNING_SECRET;
  if (own) return Buffer.from(own);
  const fallback = process.env.OPENROUTER_API_KEY;
  if (fallback) return createHmac('sha256', fallback).update('neander-quote-token').digest();
  return null;
}

const b64 = (buf: Buffer) => buf.toString('base64url');

function sign(payload: string, key: Buffer): string {
  return b64(createHmac('sha256', key).update(payload).digest().subarray(0, 18));
}

/** 서명 비밀키가 없으면 null (링크 기능만 꺼지고 PDF 발급은 그대로 된다) */
export function createEstimateToken(snapshot: EstimateSnapshot): string | null {
  const key = secret();
  if (!key) {
    console.error('quote token: QUOTE_SIGNING_SECRET이 없어 가견적서 링크를 만들지 못했습니다');
    return null;
  }
  const payload = b64(deflateRawSync(Buffer.from(JSON.stringify(snapshot)), { level: 9 }));
  return `${payload}.${sign(payload, key)}`;
}

export function readEstimateToken(token: string | null | undefined): EstimateSnapshot | null {
  if (!token || token.length > 12_000) return null;
  const key = secret();
  if (!key) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(inflateRawSync(Buffer.from(payload, 'base64url')).toString()) as EstimateSnapshot;
    return data?.v === 1 && data.result && data.input ? data : null;
  } catch {
    return null;
  }
}
