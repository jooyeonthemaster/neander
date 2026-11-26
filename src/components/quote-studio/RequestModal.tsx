'use client';

import { useEffect, type ReactNode } from 'react';
import { Phone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PHONE_LINES } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics/tracker';
import type { FinalForm } from '@/components/report-kit/QuoteFinalTiles';

/* ─────────────────────────────────────────────────────────
   견적 마지막 단계 팝업 — 가견적서 · 보고서 · 상담 요청이 같은 팝업을 쓴다 (2026-11-23 사용자 요청)
     · 가견적서 · 보고서: 이름·이메일(필수) · 회사·전화(선택)를 받은 뒤 바로 내려받는다.
       보고서는 이 팝업에서 PDF · 한글 파일을 고른다.
     · 상담 요청: 위에 전화 한 줄(휴대폰은 누르면 바로 걸림), 아래 입력 칸 + 요청사항 · 알게 된 경로.
   입력 칸 자체는 QuoteStudio 가 children 으로 넘긴다 (제출·검사·접수 기록을 한곳에서 하려고).
   번호는 사이트 하단 「전화 상담」 버튼과 같은 담당자 번호를 쓴다.
   ───────────────────────────────────────────────────────── */

// 고객센터 · 직통 두 번호 (constants.ts 의 PHONE_LINES, 2026-11-26)

const TITLE: Record<FinalForm, { ko: string; en: string }> = {
  pdf: { ko: '가견적서 받기', en: 'Download the estimate' },
  report: { ko: '보고서 받기', en: 'Download the report' },
  request: { ko: '상담 요청', en: 'Request a quote' },
};

const INTRO: Record<FinalForm, { ko: string; en: string }> = {
  pdf: { ko: '이름과 이메일을 적으면 가견적서 PDF를 바로 내려받아요.', en: 'Enter your name and email to download the estimate PDF.' },
  report: { ko: '파일 형식을 고르고 이름과 이메일을 적으면 보고서를 바로 내려받아요.', en: 'Choose a format and enter your name and email to download the report.' },
  request: { ko: '연락처를 남기면 담당자가 이 구성으로 연락드려요.', en: 'Leave your details and we will get back to you with this setup.' },
};

export function RequestModal({ mode, onClose, lang, children }: { mode: FinalForm | null; onClose: () => void; lang: 'ko' | 'en'; children: ReactNode }) {
  const ko = lang === 'ko';
  const open = mode !== null;

  // 열리면 이름 칸에 바로 커서를 둔다
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => document.getElementById('q-name')?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [open, mode]);

  return (
    <Modal isOpen={open} onClose={onClose} title={mode ? TITLE[mode][lang] : ''} className="max-w-2xl">
      <div data-testid="quote-request-modal" data-mode={mode ?? undefined}>
        {mode === 'request' && (
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700"><Phone className="size-4" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1 text-sm text-slate-600">
              {ko ? '전화가 편하시면' : 'Prefer to call?'}
              {PHONE_LINES.map((p) => (
                <a key={p.key} href={`tel:${p.intl}`} data-testid={p.key === 'direct' ? 'quote-request-tel' : 'quote-request-tel-center'}
                  onClick={() => trackEvent('click_cta', `quote_final:tel_dial${p.key === 'center' ? ':center' : ''}`)}
                  className="ml-2 inline-block whitespace-nowrap hover:text-teal-700">
                  {ko ? p.ko : p.en} <b className="tabular-nums text-slate-900">{ko ? p.number : p.intl}</b>
                </a>
              ))}
            </span>
          </div>
        )}
        {mode && <p className="mb-4 text-sm text-slate-500">{INTRO[mode][lang]}</p>}
        {children}
      </div>
    </Modal>
  );
}
