import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateQuote, sanitizeInput } from '@/lib/quote/engine';
import { newEstimateNo, renderEstimatePdf } from '@/lib/quote/pdf';
import { createEstimateToken, readEstimateToken, type EstimateSnapshot } from '@/lib/quote/token';
import { createRateLimiter } from '@/lib/mailer';

// 온라인 견적(/quote)의 가견적서 PDF
// - POST: 새로 발급. 금액은 서버에서 다시 계산한다.
//         응답 헤더 X-Estimate-No(견적번호), X-Estimate-Token(다시 보기 링크 토큰)
// - GET ?t=토큰: 발급 당시 내용 그대로 다시 만든다 (관리자 수신함·고객 다시 보기)

export const runtime = 'nodejs';

const bodySchema = z.object({
  input: z.unknown(),
  recipient: z.object({
    name: z.string().trim().min(1).max(60),
    email: z.string().trim().email().max(200),
    company: z.string().trim().max(80).optional().default(''),
    phone: z.string().trim().max(40).optional().default(''),
  }),
  lang: z.enum(['ko', 'en']).default('ko'),
});

const rateLimited = createRateLimiter(20, 10 * 60 * 1000);
const reissueLimited = createRateLimiter(60, 10 * 60 * 1000);

function pdfResponse(pdf: Uint8Array, no: string, disposition: 'attachment' | 'inline', token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${disposition}; filename="neander-estimate-${no}.pdf"`,
    'X-Estimate-No': no,
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex',
  };
  if (token) headers['X-Estimate-Token'] = token;
  return new NextResponse(Buffer.from(pdf), { headers });
}

function render(snapshot: EstimateSnapshot) {
  return renderEstimatePdf(snapshot.input, {
    estimateNo: snapshot.no,
    issuedAt: new Date(snapshot.issuedAt),
    recipient: snapshot.recipient,
    lang: snapshot.lang,
    quote: snapshot.result,
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const input = sanitizeInput(parsed.data.input);
  if (input.items.length === 0) return NextResponse.json({ error: 'empty' }, { status: 400 });

  const { name, email, company, phone } = parsed.data.recipient;
  const snapshot: EstimateSnapshot = {
    v: 1,
    no: newEstimateNo(),
    issuedAt: new Date().toISOString(),
    lang: parsed.data.lang,
    recipient: { name, email, company: company || undefined, phone: phone || undefined },
    input,
    result: calculateQuote(input, parsed.data.lang),
  };
  // ?mode=token: PDF 없이 견적번호와 다시 보기 토큰만 (확정 견적 요청을 수신함에 남길 때)
  if (request.nextUrl.searchParams.get('mode') === 'token') {
    return NextResponse.json({ no: snapshot.no, token: createEstimateToken(snapshot) }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    return pdfResponse(await render(snapshot), snapshot.no, 'attachment', createEstimateToken(snapshot));
  } catch (error) {
    console.error('quote-pdf failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'render_failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (reissueLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const snapshot = readEstimateToken(request.nextUrl.searchParams.get('t'));
  if (!snapshot) return NextResponse.json({ error: 'invalid_link' }, { status: 404 });
  try {
    return pdfResponse(await render(snapshot), snapshot.no, request.nextUrl.searchParams.get('download') ? 'attachment' : 'inline');
  } catch (error) {
    console.error('quote-pdf reissue failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'render_failed' }, { status: 500 });
  }
}
