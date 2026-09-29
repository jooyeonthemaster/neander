'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, Monitor, Check as CheckIcon, Minus, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Select } from '@/components/ui/Select';
import type { Lang } from '@/lib/quote/catalog';
import type { KioskOptions } from '@/lib/quote/engine';
import { distributeKioskExperiences, formatKioskNumbers, getKioskAssignments, groupKioskAssignments, shiftKioskExperience } from '@/lib/quote/kiosk-experiences';
import { cn } from '@/lib/utils';
import { Field, inputClass } from './QuoteControls';
import { KioskExperienceGallery } from './KioskExperienceGallery';
import { KioskCustomizationCards } from './KioskCustomizationCards';

export function KioskExperienceAssignments({ options, lang, experiences, onChange, renderIllustration, compact = false, onOpenDemo, includeCustomization = false }: {
  options: KioskOptions;
  lang: Lang;
  experiences: { value: string; label: string }[];
  onChange: (patch: Partial<KioskOptions>) => void;
  renderIllustration?: (slug: string, label: string) => ReactNode;
  compact?: boolean;
  onOpenDemo?: (slug: string) => void;
  includeCustomization?: boolean;
}) {
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const assignments = getKioskAssignments(options);
  const selectedCount = assignments.filter(Boolean).length;
  const select = (index: number, slug: string) => {
    const experienceSlugs = assignments.map((current, slot) => slot === index ? slug : current);
    onChange({ experienceSlugs, experienceSlug: experienceSlugs[0] || undefined, extraContents: 0 });
  };

  if (compact) {
    // 한 페이지에서 체험을 여러 개 고르면 키오스크를 나눠 담는다 (4대·2종 → 2대씩)
    const kiosks = assignments.length;
    const groups = groupKioskAssignments(assignments);
    const chosen = groups.filter((group) => group.slug).map((group) => group.slug);
    const apply = (experienceSlugs: string[]) => onChange({ experienceSlugs, experienceSlug: experienceSlugs.find(Boolean) || undefined, extraContents: 0 });
    const toggle = (slug: string) => apply(distributeKioskExperiences(chosen.includes(slug) ? chosen.filter((current) => current !== slug) : [...chosen, slug], kiosks));
    const nameOf = (slug: string) => experiences.find((experience) => experience.value === slug)?.label ?? L('상담 후 결정', 'Decide later');
    const multiple = kiosks > 1;
    // 정하지 않은 기기가 남아 있으면 체험이 하나여도 대수를 늘려 채울 수 있다
    const hasUndecided = groups.some((group) => !group.slug);
    const customize = includeCustomization;
    return <section data-testid="kiosk-experience-assignments" data-assignments={assignments.join(',')} aria-label={L('키오스크에 넣을 체험', 'Experiences for your kiosks')} className={customize ? 'space-y-1' : 'space-y-2'}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] leading-relaxed text-slate-500">{multiple
          ? L(`${kiosks}대에 넣을 체험 · 여러 개 고르면 나눠 담아요`, `Pick one or more for ${kiosks} kiosks`)
          : L('한 대에 체험 1종 포함', 'One experience included per kiosk')}</p>
        <p data-testid="kiosk-assignment-progress" aria-live="polite" aria-atomic="true" className="shrink-0 text-[10px] text-teal-700">{multiple
          ? L(`${chosen.length} / 최대 ${kiosks}종`, `${chosen.length} / up to ${kiosks}`)
          : L(`${chosen.length} / 1대 선택`, `${chosen.length} / 1 assigned`)}</p>
      </div>
      <KioskExperienceGallery number={1} value={chosen[0] ?? ''} experiences={experiences} lang={lang} onOpenDemo={onOpenDemo} dense={customize}
        {...(multiple ? { values: chosen, limit: kiosks, onChange: toggle, onClear: () => apply(distributeKioskExperiences([], kiosks)) } : { onChange: (slug: string) => apply([slug]) })} />
      {multiple && chosen.length > 0 && <ul data-testid="kiosk-distribution" aria-label={L('기기별 배정', 'Kiosk split')} className="space-y-0.5">
        {groups.map((group) => {
          const count = group.kiosks.length;
          const canTake = groups.some((other) => other !== group && (!other.slug || other.kiosks.length > 1));
          const canGive = count > 1 && groups.some((other) => other !== group && other.slug);
          return <li key={group.slug || 'undecided'} data-testid={`kiosk-distribution-${group.slug || 'undecided'}`} data-count={count}
            className="flex min-h-7 min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2 py-0.5 text-[11px]">
            <span className="shrink-0 rounded-md bg-white px-1 py-0.5 text-[10px] font-semibold tabular-nums text-teal-700 ring-1 ring-teal-100">{formatKioskNumbers(group.kiosks, lang)}</span>
            <span className={cn('min-w-0 flex-1 truncate', group.slug ? 'font-medium text-slate-800' : 'text-slate-500')}>{nameOf(group.slug)}</span>
            {group.slug && (chosen.length > 1 || hasUndecided) ? <span className="flex shrink-0 items-center gap-1">
              <button type="button" data-testid={`kiosk-distribution-less-${group.slug}`} disabled={!canGive} onClick={() => apply(shiftKioskExperience(assignments, group.slug, -1))}
                aria-label={L(`${nameOf(group.slug)} 한 대 줄이기`, `One fewer kiosk for ${nameOf(group.slug)}`)}
                className="flex size-6 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 hover:text-teal-700 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600"><Minus size={12} aria-hidden="true" /></button>
              <span className="w-6 text-center font-semibold tabular-nums text-slate-800">{L(`${count}대`, `${count}`)}</span>
              <button type="button" data-testid={`kiosk-distribution-more-${group.slug}`} disabled={!canTake} onClick={() => apply(shiftKioskExperience(assignments, group.slug, 1))}
                aria-label={L(`${nameOf(group.slug)} 한 대 늘리기`, `One more kiosk for ${nameOf(group.slug)}`)}
                className="flex size-6 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 hover:text-teal-700 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600"><Plus size={12} aria-hidden="true" /></button>
            </span> : <span className="shrink-0 font-semibold tabular-nums text-slate-600">{L(`${count}대`, `${count}`)}</span>}
          </li>;
        })}
      </ul>}
      {customize && <div className="border-t border-slate-100 pt-2">
        <KioskCustomizationCards value={options.custom ?? 'none'} lang={lang} onChange={(custom) => onChange({ custom })} compact />
      </div>}
    </section>;
  }
  return <section className="space-y-4 sm:col-span-2" data-testid="kiosk-experience-assignments" aria-label={L('키오스크별 체험 선택', 'Choose an experience for each kiosk')}>
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{L('키오스크마다 체험을 골라주세요', 'Choose an experience for each kiosk')}</h3>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">{L('한 대에 한 체험', 'One experience per kiosk')}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{L('기기마다 기존 체험 1종이 포함돼요. 서로 다른 체험도, 같은 체험도 넣을 수 있어요.', 'Each kiosk includes one existing experience. Choose different experiences, or use the same one on several kiosks.')}</p>
    </div>
    <div className="space-y-3">
      {assignments.map((slug, index) => {
        const selected = experiences.find((experience) => experience.value === slug);
        const number = index + 1;
        return <div key={index} data-testid={`kiosk-assignment-${number}`} data-experience-slug={slug} className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold tabular-nums text-teal-700">{String(number).padStart(2, '0')}</span>
            <p className="text-xs font-semibold text-slate-700">{L(`${number}번 키오스크`, `Kiosk ${number}`)}</p>
            {selected && <CheckIcon size={14} aria-hidden="true" className="ml-auto text-teal-600" />}
          </div>
          <Field label={L(`${number}번 키오스크의 체험`, `Experience for kiosk ${number}`)}>
            <Select id={`k-exp-${number}`} data-testid={`kiosk-experience-${number}`} aria-label={L(`${number}번 키오스크의 체험`, `Experience for kiosk ${number}`)} value={slug}
              onValueChange={(value) => select(index, value)} triggerClassName={inputClass}
              options={[{ value: '', label: L('상담 후 결정', 'Decide later') }, ...experiences]} />
          </Field>
          {selected ? <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50/70 p-2.5">
            <div aria-hidden="true" className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7f5f0]">
              {renderIllustration ? renderIllustration(slug, selected.label) : <Monitor size={28} className="text-teal-600" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-relaxed text-slate-700">{selected.label}</p>
              <Link href={`/services?demo=${slug}`} target="_blank" rel="noopener noreferrer" aria-label={L(`${selected.label} 데모 보기 · 새 탭`, `Try ${selected.label} demo in a new tab`)}
                className="mt-1 inline-flex min-h-8 items-center gap-1 rounded text-[11px] font-medium text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">{L('데모 보기', 'Try demo')}<ArrowUpRight size={12} aria-hidden="true" /></Link>
            </div>
          </div> : <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{L('아직 정하지 않았다면 비워두어도 괜찮아요.', 'You can leave this undecided for now.')}</p>}
        </div>;
      })}
    </div>
    <p data-testid="kiosk-assignment-progress" aria-live="polite" aria-atomic="true" className="rounded-xl bg-teal-50/70 px-3.5 py-3 text-xs leading-relaxed text-teal-800">
      {L(`${assignments.length}대 중 ${selectedCount}대의 체험을 골랐어요.`, `Experiences selected for ${selectedCount} of ${assignments.length} kiosks.`)}
      {selectedCount < assignments.length && <span className="mt-1 block text-[11px] text-teal-700">{L('나머지 체험은 상담할 때 함께 정해요.', 'We can help you choose the rest during consultation.')}</span>}
    </p>
  </section>;
}
