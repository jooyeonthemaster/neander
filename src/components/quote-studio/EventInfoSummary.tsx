'use client';

import { useId, useState } from 'react';
import { ChevronRight, Pencil } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { EVENT_TYPES, REGIONS, type Lang, type RegionKey } from '@/lib/quote/catalog';
import type { QuoteInput } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';
import type { QUOTE_COPY } from './copy';
import { Field, Stepper, inputClass } from './QuoteControls';

/**
 * 「지금까지 고른 견적」 맨 위의 행사 정보 — 3단계부터 보인다.
 *
 * 행사 정보 단계를 지나면 무엇을 입력했는지 다시 볼 곳이 없었다. 여기서 두 줄로 보여 주고,
 * 「수정」을 누르면 그 자리에서 금액에 영향을 주는 값(유형·지역·기간·운영 시간·인원)을 고친다.
 * 날짜·추가 인력·전날 설치는 드물게 바꾸므로 행사 정보 단계로 보내는 길만 둔다 —
 * 요약 칸이 화면보다 길어지면 따라다니는(sticky) 칸의 아래가 잘린다.
 */
export function EventInfoSummary({ input, lang, c, update, onOpenDetails }: {
  input: QuoteInput;
  lang: Lang;
  c: (typeof QUOTE_COPY)[Lang];
  update: (patch: Partial<QuoteInput>) => void;
  /** 행사 정보 단계(날짜·운영 방식 쪽)로 이동 */
  onOpenDetails: () => void;
}) {
  const ko = lang === 'ko';
  const id = useId();
  const [open, setOpen] = useState(false);
  const eventType = EVENT_TYPES.find((event) => event.key === input.eventType)?.label[lang] ?? '';
  const region = REGIONS.find((r) => r.key === input.region)?.label[lang] ?? '';
  const extras = [
    input.eventDate,
    input.extraStaff > 0 ? (ko ? `인력 +${input.extraStaff}명` : `+${input.extraStaff} staff`) : '',
    input.setupDayBefore ? (ko ? '전날 설치' : 'Setup the day before') : '',
  ].filter(Boolean);

  return (
    <section aria-labelledby={`${id}-title`} className="mt-5 rounded-2xl border border-slate-200/80 px-4 py-3" data-testid="event-info-summary">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 id={`${id}-title`} className="text-xs font-semibold text-slate-700">{ko ? '행사 정보' : 'Event details'}</h3>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={`${id}-editor`} data-testid="event-info-edit"
          className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          {open ? (ko ? '완료' : 'Done') : <><Pencil className="size-3" aria-hidden="true" />{ko ? '수정' : 'Edit'}</>}
        </button>
      </div>

      {!open ? (
        <div className="mt-1 space-y-0.5 text-xs leading-relaxed">
          <p className="text-slate-700">{eventType} · {region}</p>
          <p className="tabular-nums text-slate-500">
            {ko ? `${input.days}일 × ${input.hoursPerDay}시간 · ${input.attendees.toLocaleString('ko-KR')}명` : `${input.days} day(s) × ${input.hoursPerDay} h · ${input.attendees.toLocaleString('en-US')} guests`}
          </p>
          {extras.length > 0 && <p className="text-slate-500">{extras.join(' · ')}</p>}
        </div>
      ) : (
        <div id={`${id}-editor`} className={cn('mt-3 grid gap-4 [&_label]:text-xs')}>
          <Field label={c.eventType}><Select id={`${id}-type`} aria-label={c.eventType} value={input.eventType} onValueChange={(value) => update({ eventType: value })} triggerClassName={inputClass} options={EVENT_TYPES.map((event) => ({ value: event.key, label: event.label[lang] }))} /></Field>
          <Field label={c.region}><Select id={`${id}-region`} aria-label={c.region} value={input.region} onValueChange={(value) => update({ region: value as RegionKey })} triggerClassName={inputClass} options={REGIONS.map((r) => ({ value: r.key, label: r.label[lang] }))} /></Field>
          <Field label={ko ? '기간' : 'Days'}><Stepper id={`${id}-days`} value={input.days} min={1} max={60} suffix={ko ? '일' : 'days'} onChange={(value) => update({ days: value })} /></Field>
          <Field label={c.hours}><Stepper id={`${id}-hours`} value={input.hoursPerDay} min={1} max={14} suffix={ko ? '시간' : 'h'} onChange={(value) => update({ hoursPerDay: value })} /></Field>
          <Field label={c.attendees}><Stepper id={`${id}-attendees`} value={input.attendees} min={1} max={100000} step={50} suffix={ko ? '명' : 'guests'} onChange={(value) => update({ attendees: value })} /></Field>
          <button type="button" onClick={onOpenDetails}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg text-left text-[11px] font-medium text-slate-500 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            {ko ? '날짜·추가 인력·전날 설치 바꾸기' : 'Change date, staff or setup'}<ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
