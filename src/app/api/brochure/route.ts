import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, escapeHtml, mailerConfigured, sendStaffMail } from '@/lib/mailer';
import { COMPANY_PROFILE, PORTFOLIO_FULL } from '@/data/portfolio-downloads';

// 회사소개서 · 체험서비스 포트폴리오 요청 (/brochure). 요청자 정보를 담당자 메일로 보내고 PDF 주소를 돌려준다.
// 알림 메일이 실패해도 방문객의 다운로드는 막지 않는다.

export const BROCHURE_URL = COMPANY_PROFILE.url;
// 체험서비스 포트폴리오 전체본(79쪽) — src/data/portfolio-downloads.ts 와 같은 파일
const DOCS = {
  profile: { url: BROCHURE_URL, name: '회사소개서' },
  portfolio: { url: PORTFOLIO_FULL.url, name: '체험서비스 포트폴리오' },
} as const;

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(200).optional().default(''),
  purpose: z.string().trim().max(500).optional().default(''),
  consent: z.literal(true),
  locale: z.string().max(10),
  doc: z.enum(['profile', 'portfolio']).optional().default('profile'),
});

const rateLimited = createRateLimiter(10, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { name, email, company, purpose, locale, doc } = parsed.data;
  const file = DOCS[doc];
  if (mailerConfigured()) {
    const rows: [string, string][] = [
      ['자료', file.name],
      ['이름', name],
      ['이메일', email],
      ['회사', company || '-'],
      ['용도', purpose || '-'],
      ['언어', locale],
    ];
    try {
      await sendStaffMail({
        subject: `[네안데르 ${file.name} 요청] ${company ? `${name} (${company})` : name}`.slice(0, 180),
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
        html: `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
          )
          .join('')}</table>`,
        replyTo: email,
      });
    } catch (error) {
      console.error('brochure notify failed:', error instanceof Error ? error.message : error);
    }
  } else {
    console.error('brochure: SMTP_USER/SMTP_PASS가 설정되지 않아 요청 알림을 보내지 못했습니다');
  }

  return NextResponse.json({ ok: true, url: file.url });
}
