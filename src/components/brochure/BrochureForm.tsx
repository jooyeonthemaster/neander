'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { Input, Textarea } from '@/components/ui';
import { Checkbox } from '@/components/ui/Checkbox';
import { Link } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/tracker';

const COPY = {
  ko: {
    name: '이름',
    email: '이메일',
    company: '회사·기관 (선택)',
    purpose: '검토 중인 행사 (선택)',
    consent: '회사소개서 발송과 상담 연락을 위해 이름·이메일·회사명을 수집하며, 요청일로부터 1년간 보관합니다. 동의하지 않으면 요청할 수 없습니다.',
    privacy: '개인정보처리방침',
    submit: '회사소개서 받기',
    sending: '준비 중…',
    doneTitle: '다운로드가 시작됩니다',
    doneBody: '시작되지 않으면 아래 버튼을 눌러 주세요.',
    download: 'PDF 열기',
    error: '요청을 처리하지 못했습니다. 잠시 후 다시 시도하거나 ok@neander.co.kr로 요청해 주세요.',
    required: '이름, 이메일, 동의 항목을 확인해 주세요.',
  },
  en: {
    name: 'Name',
    email: 'Email',
    company: 'Company / organization (optional)',
    purpose: 'Event you are planning (optional)',
    consent: 'We collect your name, email and company to send the profile and follow up, and keep them for 1 year. You cannot request it without consenting.',
    privacy: 'Privacy Policy',
    submit: 'Get the company profile',
    sending: 'Preparing…',
    doneTitle: 'Your download is starting',
    doneBody: 'If it does not start, use the button below.',
    download: 'Open PDF',
    error: 'Something went wrong. Please try again later or email ok@neander.co.kr.',
    required: 'Please check your name, email and consent.',
  },
} as const;

export function BrochureForm() {
  const locale = useLocale();
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      company: String(form.get('company') ?? '').trim(),
      purpose: String(form.get('purpose') ?? '').trim(),
      consent: form.get('consent') === 'on',
      locale,
    };
    if (!body.name || !body.email || !body.consent) {
      setStatus('error');
      setMessage(c.required);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (!res.ok || !data?.url) throw new Error(String(res.status));
      setUrl(data.url);
      setStatus('done');
      trackEvent('brochure_request', body.company || undefined);
      // 새 탭으로 PDF를 연다 (팝업 차단 시 아래 버튼으로 연다)
      window.open(data.url, '_blank', 'noopener');
    } catch {
      setStatus('error');
      setMessage(c.error);
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center" role="status">
        <p className="text-lg font-bold text-slate-900">{c.doneTitle}</p>
        <p className="mt-2 text-sm text-slate-600">{c.doneBody}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-500"
        >
          {c.download}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input id="brochure-name" name="name" label={c.name} required autoComplete="name" maxLength={100} />
        <Input id="brochure-email" name="email" type="email" label={c.email} required autoComplete="email" maxLength={200} />
      </div>
      <Input id="brochure-company" name="company" label={c.company} autoComplete="organization" maxLength={200} />
      <Textarea id="brochure-purpose" name="purpose" label={c.purpose} rows={3} maxLength={500} />
      <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
        <Checkbox name="consent" required className="mt-1 size-4" />
        <span>
          {c.consent}{' '}
          <Link href="/privacy" className="font-medium text-teal-700 underline underline-offset-2">
            {c.privacy}
          </Link>
        </span>
      </label>
      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? c.sending : c.submit}
      </button>
    </form>
  );
}
