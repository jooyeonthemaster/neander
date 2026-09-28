import nodemailer from 'nodemailer';

// 담당자 알림 메일 (문의 접수, 회사소개서 요청 등)
// 환경변수
//   SMTP_USER, SMTP_PASS   Gmail 주소와 앱 비밀번호 (Google 계정 → 보안 → 앱 비밀번호)
//   SMTP_HOST, SMTP_PORT   기본 smtp.gmail.com:465
//   INQUIRY_NOTIFY_TO      받는 사람 (쉼표로 여러 명). 기본 nadr110619@gmail.com

const DEFAULT_TO = 'nadr110619@gmail.com';

export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendStaffMail(mail: { subject: string; text: string; html: string; replyTo?: string }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error('SMTP_USER/SMTP_PASS가 설정되지 않았습니다');

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: `"네안데르 홈페이지" <${user}>`,
    to: process.env.INQUIRY_NOTIFY_TO || DEFAULT_TO,
    ...mail,
  });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** IP당 요청 수 제한 (서버 인스턴스 메모리 기준) */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function limited(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return false;
  };
}
