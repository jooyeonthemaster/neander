import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, escapeHtml, mailerConfigured, sendStaffMail } from '@/lib/mailer';

// 문의·견적 폼이 Firestore 저장에 성공한 뒤 호출한다 → 담당자 메일로 알림을 보낸다 (설정은 src/lib/mailer.ts).
// 받는 사람이 고정이라 외부에서 호출해도 우리 메일함으로만 가지만, 도배를 막으려고 IP당 횟수를 제한한다.

const SITE_URL = 'https://neander.co.kr';

const quoteSchema = z
  .object({
    eventType: z.string().max(100).optional(),
    eventDate: z.string().max(100).optional(),
    duration: z.number().optional(),
    expectedAttendees: z.number().optional(),
    location: z.string().max(200).optional(),
    venueSize: z.string().max(100).optional(),
    services: z.array(z.string().max(100)).max(30),
    addOns: z.array(z.string().max(100)).max(30),
    estimatedTotal: z.number(),
    estimateNo: z.string().max(40).optional(),
    estimateToken: z.string().max(12_000).optional(),
    hoursPerDay: z.number().optional(),
    items: z.array(z.object({ name: z.string().max(100), options: z.array(z.string().max(200)).max(20) })).max(10).optional(),
    lines: z.array(z.object({ label: z.string().max(200), detail: z.string().max(400), amount: z.number(), tbd: z.boolean().optional() })).max(40).optional(),
  })
  .nullish();

const bodySchema = z.object({
  id: z.string().max(100),
  kind: z.enum(['contact', 'quote']),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(50).nullish(),
  company: z.string().max(200).nullish(),
  subject: z.string().max(200),
  message: z.string().max(5000),
  locale: z.string().max(10),
  quote: quoteSchema,
});

type Body = z.infer<typeof bodySchema>;

const rateLimited = createRateLimiter(5, 10 * 60 * 1000);

function rows(body: Body): [string, string][] {
  const list: [string, string][] = [
    ['구분', body.kind === 'quote' ? '견적 요청' : '일반 문의'],
    ['이름', body.name],
    ['이메일', body.email],
    ['연락처', body.phone || '-'],
    ['회사', body.company || '-'],
    ['유형', body.subject],
  ];
  const q = body.quote;
  if (q) {
    list.push(
      ['행사 유형', q.eventType || '-'],
      ['행사 일자', q.eventDate || '-'],
      ['기간', q.duration ? `${q.duration}일${q.hoursPerDay ? ` · 1일 ${q.hoursPerDay}시간` : ''}` : '-'],
      ['예상 인원', q.expectedAttendees ? `${q.expectedAttendees}명` : '-'],
      ['장소', q.location || '-'],
      ['규모', q.venueSize || '-'],
      ['서비스', q.services.join(', ') || '-'],
      ['추가 옵션', q.addOns.join(', ') || '-'],
      ['예상 금액', `${q.estimatedTotal.toLocaleString('ko-KR')}원`],
    );
    for (const it of q.items ?? []) list.push([it.name, it.options.join(' · ')]);
    for (const l of q.lines ?? []) list.push([`  ${l.label}`, `${l.detail ? `${l.detail} = ` : ''}${l.tbd ? '상담 후 산정' : `${l.amount.toLocaleString('ko-KR')}원`}`]);
    if (q.estimateNo) list.push(['견적번호', q.estimateNo]);
  }
  list.push(['언어', body.locale]);
  return list;
}

function render(body: Body): { subject: string; text: string; html: string } {
  const label = body.kind === 'quote' ? '견적 요청' : '문의';
  const who = body.company ? `${body.name} (${body.company})` : body.name;
  const subject = `[네안데르 ${label}] ${who} — ${body.subject}`.slice(0, 180);
  const table = rows(body);
  const adminUrl = `${SITE_URL}/admin/inquiries`;
  const estimateUrl = body.quote?.estimateToken ? `${SITE_URL}/quote/estimate?t=${encodeURIComponent(body.quote.estimateToken)}` : null;

  const text = [
    ...table.map(([k, v]) => `${k}: ${v}`),
    '',
    body.message,
    '',
    ...(estimateUrl ? [`가견적서 보기: ${estimateUrl}`] : []),
    `관리자 수신함: ${adminUrl}`,
  ].join('\n');

  const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#111">
<table style="border-collapse:collapse">${table
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>
<p style="white-space:pre-wrap;border-top:1px solid #eee;padding-top:12px;margin-top:12px">${escapeHtml(body.message)}</p>
${estimateUrl ? `<p><a href="${escapeHtml(estimateUrl)}">가견적서 다시 보기</a></p>` : ''}
<p><a href="${adminUrl}">관리자 수신함에서 보기</a></p>
</div>`;

  return { subject, text, html };
}

export async function POST(request: NextRequest) {
  if (!mailerConfigured()) {
    console.error('inquiry-notify: SMTP_USER/SMTP_PASS가 설정되지 않아 알림을 보내지 못했습니다');
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  try {
    await sendStaffMail({ ...render(parsed.data), replyTo: parsed.data.email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('inquiry-notify failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
}
