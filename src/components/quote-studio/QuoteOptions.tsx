'use client';

import { Children, isValidElement, useId, useState, type ComponentProps, type ReactNode } from 'react';
import { Select } from '@/components/ui/Select';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { getExperienceImage } from '@/data/experience-images';
import {
  CUSTOM_DEV, CUSTOM_DEV_TEXT, KIOSK, PERFUME, PHOTO_BOOTH, type Lang,
} from '@/lib/quote/catalog';
import { eventDeviceCost, getPerfumeStaffing, kioskRoom, monthlyDeviceCost, perfumeGuestCost, perfumeHoursSuggestion, type QuoteInput, type QuoteItem } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';
import { Bubble, Check, Field, formatPriceAmount, inputClass, Segmented, Stepper, type Price } from './QuoteControls';
import { QUOTE_COPY } from './copy';
import { optionInfo } from './option-info';
import { perfumeBaseBreakdown } from './perfume-breakdown';
import { PhotoBoothTemplates } from './PhotoBoothTemplates';
import { KioskExperienceAssignments } from './KioskExperienceAssignments';
import { QuoteOptionPages, type QuoteOptionPage } from './QuoteOptionPages';
import { ConsultationNotice } from './ConsultationNotice';

export type QuoteOptionsSetter = <K extends QuoteItem['key']>(key: K, patch: Partial<Extract<QuoteItem, { key: K }>['options']>) => void;

interface MoreOptionsProps {
  title: string; hint: string; count?: number; lang: Lang; children: ReactNode;
  pageId: string; pageLabel: string;
}

function MoreOptions({ title, count = 0, lang, children }: MoreOptionsProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 sm:col-span-2">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600 sm:px-5">
        <SlidersHorizontal size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-700">
            {title}
            {count > 0 && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">{lang === 'ko' ? `${count}개 선택` : `${count} selected`}</span>}
          </span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className={cn('shrink-0 text-slate-400 transition-transform duration-300 motion-reduce:transition-none', open && 'rotate-180')} />
      </button>
      <div inert={!open} aria-hidden={!open}>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="grid gap-5 border-t border-slate-200/70 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type LeadingOptionPage = Pick<QuoteOptionPage, 'id' | 'label' | 'content'>;
const optionGridClass = 'grid gap-x-5 gap-y-6 sm:grid-cols-2';

interface OptionTopicProps { id: string; label: string; children: ReactNode; inline?: boolean }
function OptionTopic({ children, inline = false }: OptionTopicProps) {
  return inline ? <>{children}</> : <div className="sm:col-span-2">{children}</div>;
}

/** Explicit group metadata lets both layouts share the exact same controls
 * and handlers. Only these known top-level option groups become topic pages. */
function OptionsLayout({ children, lang, paged, leadingPage, flowActive }: {
  children: ReactNode; lang: Lang; paged: boolean; leadingPage?: LeadingOptionPage | LeadingOptionPage[]; flowActive: boolean;
}) {
  if (!paged) return <div className={optionGridClass}>{children}</div>;
  const basic: ReactNode[] = [];
  const topics: QuoteOptionPage[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement<OptionTopicProps>(child) && child.type === OptionTopic) {
      topics.push({ id: child.props.id, label: child.props.label, content: <div>{child.props.children}</div> });
    } else if (isValidElement<MoreOptionsProps>(child) && child.type === MoreOptions) {
      const { pageId, pageLabel, title, hint, count, children: fields } = child.props;
      const fieldGroups = Children.toArray(fields);
      if (fieldGroups.length && fieldGroups.every((field) => isValidElement<OptionTopicProps>(field) && field.type === OptionTopic)) {
        // Planning comes before upkeep in the guided flow; the inline layout
        // retains its existing order and exact control elements.
        (pageId === 'support' ? [...fieldGroups].reverse() : fieldGroups).forEach((field) => {
          if (isValidElement<OptionTopicProps>(field)) topics.push({ id: field.props.id, label: field.props.label, content: <div>{field.props.children}</div> });
        });
      } else topics.push({ id: pageId, label: pageLabel, ariaLabel: title, hint, count, content: <div className={optionGridClass}>{fields}</div> });
    } else if (isValidElement<ComponentProps<typeof PhotoBoothTemplates>>(child) && child.type === PhotoBoothTemplates) {
      topics.push({ id: 'photo-styles', label: lang === 'ko' ? '사진 스타일' : 'Photo styles', content: <PhotoBoothTemplates {...child.props} compact section="templates" /> });
    } else if (isValidElement<ComponentProps<typeof KioskExperienceAssignments>>(child) && child.type === KioskExperienceAssignments) {
      // 체험은 한 페이지에서 여러 개 골라 기기에 나눠 담는다 (기기마다 페이지를 두지 않는다)
      topics.push({ id: 'kiosk-1', label: child.props.includeCustomization ? (lang === 'ko' ? '체험·맞춤' : 'Experience & custom') : (lang === 'ko' ? '체험' : 'Experiences'), content: <KioskExperienceAssignments {...child.props} compact /> });
    } else {
      basic.push(child);
    }
  }
  return <QuoteOptionPages lang={lang} active={flowActive} pages={[
    ...(leadingPage ? Array.isArray(leadingPage) ? leadingPage : [leadingPage] : []),
    { id: 'basic', label: lang === 'ko' ? '기본 구성' : 'Essentials', content: <div className={optionGridClass}>{basic}</div> },
    ...topics,
  ]} />;
}

type ExperienceIllustration = (slug: string, label: string) => ReactNode;

function ExperiencePreview({ slug, label, lang, renderIllustration }: { slug: string; label: string; lang: Lang; renderIllustration?: ExperienceIllustration }) {
  const image = getExperienceImage(slug);
  const reducedMotion = useReducedMotion();
  if (!image) return null;

  const imageLabel = renderIllustration ? (lang === 'ko' ? '체험 일러스트' : 'Experience illustration') : image.kind === 'case'
    ? (lang === 'ko' ? `운영 사례 · ${image.eventKo}` : `In action · ${image.eventEn}`)
    : (lang === 'ko' ? '연출 예시' : 'Illustrative example');

  return (
    <motion.figure key={slug} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }} className="flex overflow-hidden rounded-2xl bg-slate-50">
      <div className="relative min-h-28 w-32 shrink-0 sm:w-40">
        {renderIllustration ? renderIllustration(slug, label) : <Image src={image.src} alt={image.kind === 'concept' ? (lang === 'ko' ? image.altKo : image.altEn) : label} fill sizes="160px" className="object-cover" />}
      </div>
      <figcaption className="flex flex-col justify-center px-4 py-4">
        <span className="text-[10px] font-medium leading-relaxed text-slate-500">{imageLabel}</span>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">{label}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{lang === 'ko' ? '고른 체험을 키오스크로 만나요.' : 'Bring this experience to your kiosk.'}</p>
      </figcaption>
    </motion.figure>
  );
}

function ExperienceSuggestions({ experiences, lang, onSelect, renderIllustration }: {
  experiences: { value: string; label: string }[]; lang: Lang; onSelect: (slug: string) => void;
  renderIllustration?: ExperienceIllustration;
}) {
  const suggestions = ['ai-personal-color', 'ai-future-career', 'ai-palm-reading']
    .flatMap((slug) => {
      const experience = experiences.find((candidate) => candidate.value === slug);
      const image = getExperienceImage(slug);
      return experience && image ? [{ ...experience, image }] : [];
    });
  if (!suggestions.length) return null;
  // 실제 운영 사진(EXPERIENCE_PHOTOS)과 연출 예시가 섞일 수 있어서, 실제 사진에는 표시를 달고 안내 문구도 그에 맞춘다
  const photoCases = renderIllustration ? 0 : suggestions.filter(({ image }) => image.kind === 'case').length;
  const note = photoCases === 0
    ? (lang === 'ko' ? '이해를 돕기 위한 연출 예시예요.' : 'Illustrative examples of each experience.')
    : photoCases === suggestions.length
      ? (lang === 'ko' ? '실제 행사에서 운영한 현장 사진이에요.' : 'Photos from events we have run.')
      : (lang === 'ko' ? '「운영 사례」 표시가 있는 사진은 실제 행사 현장이고, 나머지는 이해를 돕기 위한 연출 예시예요.' : 'Photos marked “On site” are from real events; the rest are illustrative examples.');

  return (
    <div>
      <p className="mb-2.5 text-xs text-slate-500">{lang === 'ko' ? (renderIllustration ? '어떤 체험이 어울릴까요?' : '사진으로 먼저 둘러보세요') : 'A few experiences to explore'}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {suggestions.map(({ value, label, image }) => (
          <button key={value} type="button" onClick={() => onSelect(value)}
            className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-colors hover:border-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            <span className="relative block aspect-[4/3] overflow-hidden">
              {renderIllustration ? renderIllustration(value, label) : <Image src={image.src} alt="" fill sizes="(max-width: 640px) 28vw, 190px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />}
              {!renderIllustration && image.kind === 'case' && <span className="absolute left-1.5 top-1.5 rounded bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">{lang === 'ko' ? '운영 사례' : 'On site'}</span>}
            </span>
            <span className="block px-2.5 pb-2.5 pt-2 text-xs font-semibold leading-relaxed text-slate-700">{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-500">{note}</p>
    </div>
  );
}

/** AI 조향사를 담은 직후 — 향수 체험 인원을 직접 적게 한다 (2026-11-23 사용자 요청).
 *  행사 인원을 그대로 쓰면 큰 행사에서 금액이 크게 뛰어 조향사를 빼고 나가는 경우가 많았다.
 *  빈 인원 칸 아래에 짧은 말풍선 하나만 띄운다. 적기 전에는 견적서 단계로 넘어가지 않는다 (QuoteStudio). */
function PerfumeGuestsPrompt({ ko, onPick }: { ko: boolean; onPick: (guests: number) => void }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const n = Math.round(Number(draft));
    if (draft.trim() !== '' && Number.isFinite(n) && n > 0) onPick(Math.min(5000, Math.max(PERFUME.minGuests, n)));
  };
  return (
    <div data-testid="perfume-guests-prompt" className="relative">
      <div className="flex h-[52px] items-center rounded-2xl border border-teal-500 bg-white px-4 ring-4 ring-teal-500/15 focus-within:border-teal-500">
        <input id="p-guests" type="number" inputMode="numeric" min={PERFUME.minGuests} max={5000} value={draft} placeholder={ko ? '인원' : 'Guests'}
          aria-label={ko ? '향수 체험 인원' : 'Perfume guests'} aria-describedby="p-guests-tip"
          onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold tabular-nums text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />
        <span className="text-sm text-slate-500">{ko ? '명' : 'guests'}</span>
      </div>
      {/* 말풍선 — 칸 바로 아래, 위쪽을 가리키는 꼬리 */}
      <p id="p-guests-tip" role="status" className="absolute left-3 top-full z-10 mt-2.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white shadow-lg">
        <span aria-hidden="true" className="absolute -top-1.5 left-5 size-3 rotate-45 bg-slate-900" />
        <span className="relative">{ko ? '체험 인원을 선택해주세요.' : 'Please enter the number of guests.'}</span>
      </p>
    </div>
  );
}

/** 운영일이 길어 상시 운영(월 단위) 요금으로 바뀌었다는 말풍선 (2026-11-27 사용자) */
function LongRunBubble({ service, units, months, schedule, lang }: { service: 'rental' | 'photoBooth'; units: number; months: number; schedule: QuoteInput; lang: Lang }) {
  const ko = lang === 'ko';
  const daily = formatPriceAmount(eventDeviceCost(service, units, schedule), lang);
  const monthly = formatPriceAmount(monthlyDeviceCost(service, units, months), lang);
  return (
    <div className="sm:col-span-2">
      <Bubble testId={`long-run-notice-${service}`} className="mt-0"
        title={ko ? `${schedule.days}일 운영이라 상시 운영 요금으로 바꿨어요` : `Switched to the long-term rate for ${schedule.days} days`}>
        {ko ? `하루 단위 ${daily} → 월 단위 ${monthly}${months > 1 ? ` (${months}개월)` : ''} · 부가세 별도` : `Daily rate ${daily} → monthly ${monthly}${months > 1 ? ` (${months} months)` : ''} · excl. VAT`}
      </Bubble>
    </div>
  );
}

export function QuoteOptions({ item, schedule, lang, c, kioskExperiences, setOptions, renderExperienceIllustration, enablePhotoBoothTemplates = false, enableKioskAssignments = false, allowKioskSubscription = true, paged = false, leadingPage, flowActive = true }: {
  item: QuoteItem;
  /** 행사 정보 전체 — 운영일·시간·지역과, 조향 팀 시간 제안(perfumeHoursSuggestion)에 쓴다 */
  schedule: QuoteInput;
  lang: Lang;
  c: (typeof QUOTE_COPY)[Lang];
  kioskExperiences: { value: string; label: string }[];
  setOptions: QuoteOptionsSetter;
  renderExperienceIllustration?: ExperienceIllustration;
  enablePhotoBoothTemplates?: boolean;
  enableKioskAssignments?: boolean;
  /** The preview only offers kiosk rentals for the event's duration. */
  allowKioskSubscription?: boolean;
  paged?: boolean;
  leadingPage?: LeadingOptionPage | LeadingOptionPage[];
  flowActive?: boolean;
}) {
  const ko = lang === 'ko';
  // 전용 디자인 단박스를 고르며 300명으로 올린 경우, 원래 인원 (고객 안내용)
  const [bumpedFrom, setBumpedFrom] = useState<number | null>(null);
  const info = (key: Parameters<typeof optionInfo>[0]) => optionInfo(key, lang);
  const layout = { lang, paged, leadingPage, flowActive };
  // 옵션 가격 표시 (부가세 별도) — add: 추가 요금(+), base: 고르면 정해지는 기본 금액, per/after: 단위
  const add = (amount: number, per?: string, after?: string): Price => ({ amount, per, after });
  const base = (amount: number, per?: string, after?: string): Price => ({ amount, add: false, per, after });
  const u = (koText: string, enText: string) => (ko ? koText : enText);
  // '~부터' 금액: 한국어는 금액 뒤에 '부터', 영어는 금액 앞에 'from'
  const from = (price: Price): Price => (ko ? { ...price, after: '부터' } : { ...price, per: 'from' });
  const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
  const included: Price = {};
  const noExtra: Price = { free: u('추가 비용 없음', 'No extra cost') };

  switch (item.key) {
    case 'acscent': {
      const o = item.options;
      const staffing = getPerfumeStaffing(o, schedule);
      const guestCost = perfumeGuestCost(o.guests, o.volume);
      const perGuest = (volume: '10ml' | '50ml') => base(perfumeGuestCost(o.guests, volume).unit, u('1인', 'per guest'));
      const guestsControl = <Field label={c.guests} price={perGuest(o.volume)} info={`${info('perfumeGuests')}${o.customBox ? ` ${c.customBoxGuestsLock}` : ''}`}
        hint={paged ? (o.customBox ? (ko ? '단박스는 300명부터' : 'Custom boxes: 300+ guests') : (ko ? `${PERFUME.minGuests}명부터` : `From ${PERFUME.minGuests} guests`)) : (ko ? `향수를 받아 갈 인원이에요. ${PERFUME.minGuests}명부터, 최소 99만원(서울)으로 시작해요.` : `Guests taking home a perfume. From ${PERFUME.minGuests} guests; minimum KRW 990,000 in Seoul.`)}>
        {o.guestsPending
          ? <PerfumeGuestsPrompt ko={ko} onPick={(value) => setOptions('acscent', { guests: value })} />
          : <Stepper id="p-guests" value={o.guests} min={o.customBox ? PERFUME.customBox.minGuests : PERFUME.minGuests} max={5000} step={10} suffix={ko ? '명' : paged ? undefined : 'guests'} onChange={(value) => setOptions('acscent', { guests: value })} />}
        {guestCost.billedGuests > o.guests && <p data-testid="perfume-tier-discount" className="text-[11px] leading-relaxed text-teal-700">{ko ? `${guestCost.billedGuests}명 구간으로 계산하는 편이 더 저렴해 해당 할인을 적용했어요.` : `The ${guestCost.billedGuests}-guest tier costs less, so that discount is applied.`}</p>}
        {!paged && o.customBox && <p className="text-xs font-medium leading-relaxed text-amber-700">{c.customBoxGuestsLock}</p>}
      </Field>;
      // 2026-11-21 옵션 창 글씨 줄이기: 「기본 1팀부터 적용」 · 「1팀당 시간당 N명」은 아래 소계 식과 팀 안내에 이미 나와 빼고,
      // 옵션 창(paged)에서는 금액 · 기준만 짧게 둔다
      const teamsControl = <Field label={c.extraTeams} info={info('extraTeams')} price={base(PERFUME.teamTravel[schedule.region], u('팀당', 'each team'), paged ? u('/일', '/day') : u('/일 (기본 1팀부터 적용)', '/day'))}
        // 상담 기준(4팀)은 입력 상한이 아니라서 넘겨도 입력된다 — 기준을 눈에 띄게 두고, 넘으면 입력칸 테두리와 색으로도 알린다
        hint={<>{!paged && <>{ko ? `1팀당 시간당 ${PERFUME.guestsPerTeamHour}명` : `${PERFUME.guestsPerTeamHour} guests/hour/team`}{' · '}</>}
          <span data-testid="perfume-consultation-threshold" className={cn('whitespace-nowrap font-semibold', staffing.requiresConsultation ? 'text-amber-800' : 'text-amber-700')}>
            {ko ? `${PERFUME.standardTeams + 1}팀부터 상담 필요` : `${PERFUME.standardTeams + 1}+ teams need consultation`}
          </span></>}>
        <div className={cn('max-w-64 rounded-2xl', staffing.requiresConsultation && 'ring-2 ring-amber-400 ring-offset-1')}><Stepper id="p-teams" value={staffing.teams} min={staffing.minimumTeams} suffix={ko ? '팀' : undefined} onChange={(value) => setOptions('acscent', { extraTeams: value - PERFUME.includedTeams })} /></div>
      </Field>;
      // 상담이 필요한 규모(4팀부터)면 그 기준을 맨 위 제목으로 올린다 — 본문 가운데 묻혀 있어 놓치기 쉬웠다.
      // 열려 있는 옵션 창은 높이를 바꾸지 않으므로, 제목이 생기는 만큼 본문을 줄여 상자 높이가 늘지 않게 한다
      // (기준 줄을 따로 두지 않고 '1팀당 N명 기준'을 본문에 넣는다).
      const capacityBasis = ko ? `${staffing.days}일 · 하루 ${staffing.hoursPerDay}시간 기준, 1팀당 ${staffing.capacityPerTeam}명` : `${plural(staffing.days, 'day')} × ${staffing.hoursPerDay} hours/day: ${staffing.capacityPerTeam} guests per team`;
      // 영문 옵션 창은 글이 길어 한 줄을 더하면 낮은 화면(1366×768)에서 안쪽 스크롤이 생긴다 — 영문은 펼친 화면에서만 보인다
      const hoursTip = staffing.requiresConsultation || (paged && !ko) ? null : perfumeHoursSuggestion(schedule);
      const teamsNotice = <div data-testid="perfume-capacity-notice" role="status" aria-atomic="true"
        className={cn('rounded-xl px-3 py-2 text-[11px] leading-relaxed', staffing.requiresConsultation ? 'border border-amber-300 bg-amber-50 text-amber-900' : 'bg-teal-50/80 text-teal-800')}>
        {staffing.requiresConsultation ? <>
          <p data-testid="perfume-consultation-title" className="flex items-start gap-1.5 text-[13px] font-bold leading-snug text-amber-900">
            <TriangleAlert size={15} aria-hidden="true" className="mt-px shrink-0 text-amber-600" />{ko ? `${PERFUME.standardTeams + 1}팀부터 상담이 필요해요` : `${PERFUME.standardTeams + 1}+ teams: consult us`}
          </p>
          <p className="mt-1">{paged
            ? ko ? `${staffing.automaticTeams > 0 ? `자동 ${staffing.teams}팀` : `${staffing.teams}팀 선택`} · 금액은 상담 후 확정` : `${staffing.teams} teams${staffing.automaticTeams > 0 ? ' (auto)' : ''} · price TBC`
            : ko
            ? `${staffing.automaticTeams > 0 ? `1팀당 ${staffing.capacityPerTeam}명 기준 ${staffing.teams}팀으로 자동 조정했어요` : `${staffing.teams}팀을 선택했어요`}. 팀 출장비는 반영되며, 운영 계획과 최종 금액은 상담 후 정해요.`
            : `${staffing.automaticTeams > 0 ? `Adjusted to ${staffing.teams} teams at ${staffing.capacityPerTeam} guests per team` : `Selected ${staffing.teams} teams`}. Travel fees are included; the plan and final price are confirmed together.`}</p>
        </> : <>
          <p className="font-semibold text-balance">{paged ? (ko ? `1팀이 ${staffing.capacityPerTeam}명까지` : `Up to ${staffing.capacityPerTeam} per team`) : capacityBasis}</p>
          {/* 자동 조정됐을 때만 덧붙인다 — 평소 안내(팀 구성)는 옵션 창에서 뺀다 */}
          {(staffing.automaticTeams > 0 || !paged) && <p className="mt-0.5">{staffing.automaticTeams > 0
            ? paged
              ? ko ? `${staffing.teams}팀으로 자동 조정 · 출장비 포함` : `Automatically adjusted to ${staffing.teams} teams, travel fees included`
              : ko ? `인원에 맞춰 ${staffing.teams}팀으로 자동 조정했어요. 팀 출장비도 반영돼요.` : `Automatically adjusted to ${staffing.teams} teams. Team travel fees are included.`
            : ko ? '팀당 조향사 1명과 보조 1명이에요. 필요한 팀 수보다 더 고를 수도 있어요.' : 'A perfumer and an assistant per team. You can choose more than the minimum.'}</p>}
          {/* 인원이 한 팀 몫을 조금 넘어 팀이 늘었으면, 운영 시간을 늘리는 쪽이 더 싼지 알려 준다 (2026-11-27) */}
          {hoursTip && <p data-testid="perfume-hours-tip" className="mt-1 font-semibold text-teal-900">{ko
            ? paged ? `하루 ${hoursTip.hours}시간이면 ${hoursTip.teams}팀 · ${formatPriceAmount(hoursTip.saving, lang)} 절약` : `하루 ${hoursTip.hours}시간으로 늘리면 ${hoursTip.teams}팀으로 충분해 ${formatPriceAmount(hoursTip.saving, lang)} 줄어요`
            : `At ${hoursTip.hours} hours a day, ${plural(hoursTip.teams, 'team')} would do — ${formatPriceAmount(hoursTip.saving, lang)} less`}</p>}
        </>}
      </div>;
      // 기본 1팀의 출장비도 합계에 들어간다 — 인원 비용만 보고 합계가 다르다고 느끼지 않게 식으로 풀어 보여 준다
      const breakdown = perfumeBaseBreakdown(o, schedule);
      const figure = (value: number, total = false) => <b className={cn('font-semibold tabular-nums', total ? 'text-teal-700' : 'text-slate-800')}>{formatPriceAmount(value, lang)}</b>;
      const baseBreakdown = <p data-testid="perfume-base-breakdown" data-guests={breakdown.guests} data-travel={breakdown.travel} data-subtotal={breakdown.subtotal}
        className="text-[11px] leading-relaxed text-slate-500">
        {u('인원', 'Guests')} {figure(breakdown.guests)} + {ko
          ? `출장비(${breakdown.teams}팀${breakdown.days > 1 ? ` × ${breakdown.days}일` : ''})`
          : `${plural(breakdown.teams, 'team')}${breakdown.days > 1 ? ` × ${breakdown.days} days` : ''}`} {figure(breakdown.travel)}
        {breakdown.adjustment > 0 && <> + {u('최소 금액 보정', 'minimum charge')} {figure(breakdown.adjustment)}</>}
        {' = '}{ko && '소계 '}{figure(breakdown.subtotal, true)} {u('(부가세 별도)', 'excl. VAT')}
      </p>;
      const volumeControl = <Field label={c.volume} info={info('volume')} hint={paged ? undefined : ko ? '가볍게 선물하는 10ml, 넉넉하게 즐기는 50ml' : '10ml for a small gift, 50ml for more to enjoy.'}>
        <Segmented name={c.volume} compact={paged} value={o.volume} onChange={(value) => setOptions('acscent', { volume: value })} options={[{ value: '10ml', label: '10ml', price: perGuest('10ml') }, { value: '50ml', label: '50ml', price: perGuest('50ml') }]} />
      </Field>;
      const analysisCount = (o.analysisKiosks ?? 0) > 0 ? <div className="mt-4 max-w-64">
        <Field label={ko ? '분석용 키오스크는 몇 대 필요할까요?' : 'How many analysis kiosks?'}>
          <Stepper id="p-akiosk" value={o.analysisKiosks ?? 1} min={1} max={Math.max(1, kioskRoom(schedule, 'acscent'))} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('acscent', { analysisKiosks: value })} />
          {kioskRoom(schedule, 'acscent') < KIOSK.maxKiosks && <p data-testid="p-akiosk-shared" className="mt-2 text-xs text-slate-500 [word-break:keep-all]">{ko ? `최대 ${kioskRoom(schedule, 'acscent')}대 · ${KIOSK.maxKiosks - kioskRoom(schedule, 'acscent')}대는 AI 키오스크 체험용` : `Up to ${kioskRoom(schedule, 'acscent')} · ${KIOSK.maxKiosks - kioskRoom(schedule, 'acscent')} used for AI kiosk experiences`}</p>}
        </Field>
      </div> : null;
      return (
        <OptionsLayout key={item.key} {...layout}>
          {paged ? <div data-testid="perfume-basic-configuration" className="grid grid-cols-2 items-start gap-x-3 gap-y-2.5 sm:col-span-2 sm:gap-x-5">
            <div className="min-w-0 space-y-4">{guestsControl}{teamsControl}</div>
            {/* 소계 식은 오른쪽 칸 팀 안내 아래에 — 두 칸 밑에 한 줄을 더 두면 글씨를 키운 뒤 낮은 화면(1366×768)에서 안쪽 스크롤이 생겼다 */}
            <div className="min-w-0 space-y-2.5">{volumeControl}{teamsNotice}{!o.guestsPending && baseBreakdown}</div>
          </div> : <>{guestsControl}{volumeControl}</>}
          <OptionTopic id="analysis" label={ko ? '분석 기기' : 'Analysis'}>
            <Field label={c.analysis} hint={(o.analysisKiosks ?? 0) > 0 ? c.analysisKioskHint : c.analysisQrHint}>
              <Segmented name={c.analysis} value={(o.analysisKiosks ?? 0) > 0 ? 'kiosk' : 'qr'}
                onChange={(value) => setOptions('acscent', { analysisKiosks: value === 'kiosk' ? Math.max(1, o.analysisKiosks ?? 0) : 0 })}
                options={[{ value: 'qr', label: c.analysisQr, info: info('analysisQr'), price: included },
                  // 보유 키오스크 4대를 AI 키오스크가 모두 쓰면 분석용 키오스크는 고를 수 없다 (2026-11-22)
                  ...(kioskRoom(schedule, 'acscent') > 0 || (o.analysisKiosks ?? 0) > 0 ? [{ value: 'kiosk' as const, label: c.analysisKiosk, info: info('analysisKiosk'), price: add(PERFUME.analysisKiosk, u('대당', 'each')) }] : [])]} />
            </Field>
            {analysisCount}
          </OptionTopic>
          <MoreOptions lang={lang} pageId="gift-staffing" pageLabel={ko ? '선물·운영' : 'Gifts & team'} title={ko ? '선물·운영 옵션 더하기' : 'Gift & staffing options'}
            hint={ko ? '브랜드 향, 선물 포장, 함께할 조향 팀 수를 고를 수 있어요.' : 'Choose a branded scent, gift packaging and your perfumer team size.'}
            count={Number(o.extraTeams > 0) + Number(o.customScent) + Number(o.premiumPackaging || !!o.customBox)}>
            {!paged && <OptionTopic id="teams" label={ko ? '조향팀' : 'Perfumer team'} inline><div className="space-y-3 sm:col-span-2">{teamsControl}{teamsNotice}</div></OptionTopic>}
            {!paged && <OptionTopic id="scent" label={ko ? '브랜드 향' : 'Signature scent'} inline>
            <Check id="p-custom" checked={o.customScent} onChange={(value) => setOptions('acscent', { customScent: value })} label={c.customScent} info={info('customScent')} price={add(PERFUME.customScent)} />
            </OptionTopic>}
            <OptionTopic id="packaging" label={paged ? (ko ? '향·선물 포장' : 'Scent & packaging') : (ko ? '선물 포장' : 'Packaging')} inline>
            <div className={cn('sm:col-span-2', paged && 'space-y-3')}>
              {paged && <div data-testid="perfume-scent-choice"><Field label={ko ? '향 구성' : 'Scent selection'} info={info('customScent')}>
                <Segmented name={ko ? '향 구성' : 'Scent selection'} compact value={o.customScent ? 'custom' : 'basic'}
                  onChange={(value) => setOptions('acscent', { customScent: value === 'custom' })}
                  options={[
                    { value: 'basic', label: ko ? '30가지 향으로 준비' : '30 ready-made scents', price: included },
                    { value: 'custom', label: ko ? '우리 행사만의 향 만들기' : 'A scent made for your event', price: add(PERFUME.customScent), info: ko ? '우리 행사 전용 향을 새로 개발해요. 1회 제작비이며 부가세는 별도예요.' : 'Develop a signature scent for your event. A one-time design fee, excluding VAT.' },
                  ]} />
              </Field></div>}
              <Field label={c.premiumPackaging}
              hint={paged && o.customBox && bumpedFrom !== null ? undefined : paged && o.customBox ? (ko ? '300명부터 · 디자인비 포함 100만원부터 · 수량·사양은 상담 후 확정해요.' : '300+ guests · from KRW 1M including design · quantity and specifications confirmed together.') : paged && o.premiumPackaging ? (ko ? `병당 ${PERFUME.premiumPackaging[o.volume].toLocaleString('ko-KR')}원 · 총 ${o.guests}병에 브랜드 포장을 해요.` : `KRW ${PERFUME.premiumPackaging[o.volume].toLocaleString('en-US')} per bottle · ${o.guests} branded packs.`) : paged ? undefined : o.customBox ? c.customBoxHint : o.premiumPackaging ? c.brandPackHint : c.plainPackHint}>
              <Segmented name={c.premiumPackaging} compact={paged} value={o.customBox ? 'custom' : o.premiumPackaging ? 'brand' : 'none'}
                onChange={(value) => {
                  // 전용 디자인 단박스는 300명부터 — 인원이 적으면 300명으로 올리고 아래에 알린다
                  // 다른 포장으로 바꾸면, 그 뒤로 인원을 손대지 않았을 때 원래 인원으로 되돌린다
                  const bump = value === 'custom' && o.guests < PERFUME.customBox.minGuests;
                  const restore = value !== 'custom' && o.customBox && bumpedFrom !== null && o.guests === PERFUME.customBox.minGuests;
                  setBumpedFrom(bump ? o.guests : value === 'custom' ? bumpedFrom : null);
                  setOptions('acscent', {
                    premiumPackaging: value === 'brand', customBox: value === 'custom',
                    ...(bump ? { guests: PERFUME.customBox.minGuests } : restore ? { guests: bumpedFrom } : {}),
                  });
                }}
                options={[
                  { value: 'none', label: ko ? '기본 무지 포장' : 'Plain package', price: included },
                  { value: 'brand', price: add(PERFUME.premiumPackaging[o.volume], u('병당', 'per bottle')), info: `${info('premiumPackaging')} ${ko ? `병당 ${PERFUME.premiumPackaging[o.volume].toLocaleString('ko-KR')}원` : `KRW ${PERFUME.premiumPackaging[o.volume].toLocaleString('en-US')}/bottle`}`,
                    label: paged ? (ko ? 'ACSCENT 브랜드 포장' : 'ACSCENT brand pack') : c.brandPack },
                  { value: 'custom', info: info('customBox'), price: from(add(PERFUME.customBox.minimum)),
                    label: paged ? (ko ? '전용 단박스' : 'Custom box') : `${c.customBox}${o.guests < PERFUME.customBox.minGuests ? (ko ? ` (${PERFUME.customBox.minGuests}명부터)` : ` (${PERFUME.customBox.minGuests}+ guests)`) : ''}` },
                ]} />
              <div aria-live="polite">
                {o.customBox && bumpedFrom !== null && (
                  <p role="status" className={cn('rounded-xl border border-amber-200 bg-amber-50 text-amber-900', paged ? 'mt-1 px-2.5 py-2 text-[11px] leading-snug' : 'mt-3 px-3.5 py-3 text-xs leading-relaxed')}>
                    <b className="font-semibold">{c.customBoxBumpedTitle(bumpedFrom, PERFUME.customBox.minGuests)}</b>{' '}{paged ? (ko ? '단박스 최소 수량에 맞춰 체험 금액도 올랐어요. 다른 포장을 고르면 원래 인원으로 돌아가요.' : 'The box minimum also increases the perfume cost. Choose another pack to restore the original guest count.') : c.customBoxBumpedBody}
                  </p>
                )}
              </div>
            </Field></div>
            </OptionTopic>
          </MoreOptions>
        </OptionsLayout>
      );
    }
    case 'photoBooth': {
      const o = item.options;
      const combinePrintsAndWrapping = paged && enablePhotoBoothTemplates;
      const wrappingControl = <div className="sm:col-span-2"><Check id="b-wrap" checked={o.wrapping} onChange={(value) => setOptions('photoBooth', { wrapping: value })} label={c.wrapping} info={info('wrapping')} price={add(PHOTO_BOOTH.wrapping, u('대당', 'each'))} /></div>;
      return (
        <OptionsLayout key={item.key} {...layout}>
          <Field label={c.booths} info={info('booths')} price={o.mode === 'monthly' ? base(PHOTO_BOOTH.monthlyPerBooth, u('대당', 'each'), u('/월', '/month')) : add(PHOTO_BOOTH.extraBooth, u('추가 대당', 'per extra booth'))} hint={ko ? '1대에 AI 스타일 2종, 인화 700장이 포함돼요.' : 'Each booth includes 2 AI styles and 700 prints.'}>
            <Stepper id="b-booths" value={o.booths} min={1} max={PHOTO_BOOTH.maxBooths} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('photoBooth', { booths: value })} />
          </Field>
          {o.mode === 'monthly'
            ? <LongRunBubble service="photoBooth" units={o.booths} months={o.months ?? 1} schedule={schedule} lang={lang} />
            : <div className="flex flex-col justify-center rounded-2xl bg-teal-50/70 px-4 py-3.5">
            <p className="text-xs font-semibold text-teal-800">{ko ? '사진은 이렇게 받아요' : 'A photo to take home'}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-700">{ko ? '현장에서 바로 인화하고, QR로 휴대폰에도 저장할 수 있어요.' : 'Guests get an instant print and can save a digital copy via QR.'}</p>
          </div>}
          {enablePhotoBoothTemplates && <PhotoBoothTemplates options={o} lang={lang} onChange={(patch) => setOptions('photoBooth', patch)} />}
          <MoreOptions lang={lang} pageId="prints" pageLabel={combinePrintsAndWrapping ? (ko ? '인화·부스 외관' : 'Prints & wrapping') : (ko ? '인화 수량' : 'Prints')} title={combinePrintsAndWrapping ? (ko ? '인화와 부스 외관 고르기' : 'Choose prints and booth wrapping') : enablePhotoBoothTemplates ? (ko ? '인화 수량 더하기' : 'Extra prints') : (ko ? '인화·스타일 옵션 더하기' : 'Print & style options')}
            hint={combinePrintsAndWrapping ? (ko ? '추가 인화 수량과 부스의 브랜드 디자인을 함께 골라요.' : 'Choose extra prints and a branded booth exterior.') : enablePhotoBoothTemplates ? (ko ? '인화지를 더 준비하고 싶을 때 골라주세요.' : 'Add more paper for extra prints.') : (ko ? '인화 수량과 준비된 사진 스타일' : 'Extra prints and ready-made styles')}
            count={Number(!enablePhotoBoothTemplates && o.extraStyles > 0) + Number(o.extraPrintRolls > 0) + Number(combinePrintsAndWrapping && o.wrapping)}>
            {!enablePhotoBoothTemplates && <Field label={c.extraStyles} info={info('extraStyles')} price={add(PHOTO_BOOTH.extraStyle, u('1종당', 'each'))} hint={ko ? '준비된 AI 스타일을 추가해 선택 폭을 넓혀요.' : 'Give guests more ready-made AI styles to choose from.'}>
              <Stepper id="b-styles" value={o.extraStyles} min={0} max={20} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('photoBooth', { extraStyles: value })} />
            </Field>}
            <Field label={c.extraPrintRolls} info={info('extraPrintRolls')} price={add(PHOTO_BOOTH.extraPrintRoll, u('1롤당', 'per roll'))} hint={ko ? '추가 1롤마다 700장을 더 인화할 수 있어요.' : 'Each extra roll adds another 700 prints.'}>
              <Stepper id="b-prints" value={o.extraPrintRolls} min={0} max={50} suffix={ko ? '롤' : undefined} onChange={(value) => setOptions('photoBooth', { extraPrintRolls: value })} />
            </Field>
            {combinePrintsAndWrapping && wrappingControl}
          </MoreOptions>
          <MoreOptions lang={lang} pageId="branding" pageLabel={ko ? '브랜드 적용' : 'Branding'} title={ko ? '우리 브랜드에 맞게 바꾸기' : 'Make it your own'}
            hint={enablePhotoBoothTemplates ? (ko ? '부스 외관과 촬영 화면을 브랜드에 맞춰요.' : 'Brand the booth exterior and capture screens.') : (ko ? '부스 외관, 전용 사진 스타일, 촬영 화면을 브랜드에 맞춰요.' : 'Brand the booth exterior, styles and capture screens.')}
            count={Number(!combinePrintsAndWrapping && o.wrapping) + Number(!enablePhotoBoothTemplates && (o.customStyles ?? 0) > 0) + Number(!!o.custom && o.custom !== 'none')}>
            {!combinePrintsAndWrapping && <OptionTopic id="wrapping" label={ko ? '부스 외관' : 'Booth wrapping'} inline>
              {wrappingControl}
            </OptionTopic>}
            {!enablePhotoBoothTemplates && <OptionTopic id="custom-style" label={ko ? '새 스타일' : 'Custom style'} inline>
            {!enablePhotoBoothTemplates && <div className="sm:col-span-2"><Field label={c.boothStyles} info={CUSTOM_DEV_TEXT.boothStyle.scope[lang]} price={add(CUSTOM_DEV.boothStyle, u('1종당', 'each'))} hint={CUSTOM_DEV_TEXT.boothStyle.scope[lang]}>
              <div className="max-w-64"><Stepper id="b-cstyles" value={o.customStyles ?? 0} min={0} max={10} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('photoBooth', { customStyles: value })} /></div>
            </Field></div>}
            </OptionTopic>}
            <OptionTopic id="branding" label={ko ? '촬영 화면' : 'Capture screens'} inline>
            <div className="sm:col-span-2"><Field label={c.boothCustom} hint={o.custom && o.custom !== 'none' ? CUSTOM_DEV_TEXT.booth[o.custom].scope[lang] : c.customNone}>
              <Segmented name={c.boothCustom} value={o.custom ?? 'none'} onChange={(value) => setOptions('photoBooth', { custom: value })}
                options={[
                  { value: 'none', label: c.none, price: noExtra },
                  { value: 'flow', label: CUSTOM_DEV_TEXT.booth.flow.name[lang], price: add(CUSTOM_DEV.booth.flow), info: CUSTOM_DEV_TEXT.booth.flow.scope[lang] },
                  { value: 'dedicated', label: CUSTOM_DEV_TEXT.booth.dedicated.name[lang], price: from(add(CUSTOM_DEV.booth.dedicated)), info: CUSTOM_DEV_TEXT.booth.dedicated.scope[lang] },
                ]} />
            </Field></div>
            </OptionTopic>
          </MoreOptions>
        </OptionsLayout>
      );
    }
    case 'rental': {
      const o = item.options;
      const selectedExperience = kioskExperiences.find((experience) => experience.value === o.experienceSlug);
      return (
        <OptionsLayout key={item.key} {...layout}>
          {allowKioskSubscription && <Field label={c.mode}>
            <Segmented name={c.mode} value={o.mode} onChange={(value) => setOptions('rental', { mode: value })}
              options={[{ value: 'event', label: c.modeEvent, info: info('modeEvent'), price: base(KIOSK.firstKiosk, u('1대', 'first kiosk'), u('/일', '/day')) }, { value: 'monthly', label: c.modeMonthly, info: info('modeMonthly'), price: base(KIOSK.monthlyPerKiosk, u('대당', 'each'), u('/월', '/month')) }]} />
          </Field>}
          <Field label={c.kiosks} info={info('kiosks')} price={o.mode === 'monthly' ? base(KIOSK.monthlyPerKiosk, u('대당', 'each'), u('/월', '/month')) : add(KIOSK.extraKiosk, u('추가 대당', 'per extra kiosk'))} hint={enableKioskAssignments ? (ko ? '대수를 줄이면 뒤 번호 기기의 선택이 빠져요.' : 'Reducing the count removes choices for the last kiosks.') : undefined}>
            <Stepper id="k-count" value={o.kiosks} min={1} max={Math.max(1, kioskRoom(schedule, 'rental'))} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('rental', { kiosks: value })} />
          {kioskRoom(schedule, 'rental') < KIOSK.maxKiosks && <p data-testid="k-count-shared" className="mt-2 text-xs text-slate-500 [word-break:keep-all]">{ko ? `최대 ${kioskRoom(schedule, 'rental')}대 · ${KIOSK.maxKiosks - kioskRoom(schedule, 'rental')}대는 향수 분석용` : `Up to ${kioskRoom(schedule, 'rental')} · ${KIOSK.maxKiosks - kioskRoom(schedule, 'rental')} used for perfume analysis`}</p>}
          </Field>
          {o.autoMonthly && <LongRunBubble service="rental" units={o.kiosks} months={o.months} schedule={schedule} lang={lang} />}
          {!allowKioskSubscription && !o.autoMonthly && <div data-testid="kiosk-event-rental-note" className="flex flex-col justify-center rounded-2xl bg-teal-50/70 px-4 py-3.5">
            <p className="text-xs font-semibold text-teal-800">{ko ? '행사 기간 동안 대여해요' : 'Rent for your event'}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-700">{ko ? '행사 정보에서 고른 운영 일수로 비용을 계산해요.' : 'Pricing uses the number of days in your event details.'}</p>
          </div>}
          {allowKioskSubscription && o.mode === 'monthly' && <OptionTopic id="months" label={ko ? '이용 기간' : 'Rental term'} inline><Field label={c.months} info={info('months')} price={base(KIOSK.monthlyPerKiosk, u('대당', 'each'), u('/월', '/month'))}>
            <Stepper id="k-months" value={o.months} min={1} max={24} suffix={ko ? '개월' : undefined} onChange={(value) => setOptions('rental', { months: value })} />
          </Field></OptionTopic>}
          {enableKioskAssignments ? <KioskExperienceAssignments options={o} lang={lang} experiences={kioskExperiences} onChange={(patch) => setOptions('rental', patch)} renderIllustration={renderExperienceIllustration} includeCustomization={paged} /> : <div className="space-y-4 sm:col-span-2">
            <Field label={c.experience} info={info('experience')} hint={ko ? '아직 고민 중이라면 상담 후 정해도 괜찮아요.' : 'You can also decide together with our team later.'}>
              <Select id="k-exp" aria-label={c.experience} value={o.experienceSlug ?? ''} onValueChange={(value) => setOptions('rental', { experienceSlug: value || undefined })} triggerClassName={inputClass}
                options={[{ value: '', label: ko ? '상담 후 결정' : 'Decide later' }, ...kioskExperiences]} />
            </Field>
            {selectedExperience
              ? <ExperiencePreview slug={selectedExperience.value} label={selectedExperience.label} lang={lang} renderIllustration={renderExperienceIllustration} />
              : <ExperienceSuggestions experiences={kioskExperiences} lang={lang} onSelect={(slug) => setOptions('rental', { experienceSlug: slug })} renderIllustration={renderExperienceIllustration} />}
          </div>}
          {/* 영수증형 즉석 프린터는 키오스크에 내장돼 있어 따로 고르지 않는다 */}
          {!enableKioskAssignments && o.mode === 'event' && <MoreOptions lang={lang} pageId="contents" pageLabel={ko ? '체험 추가' : 'Experiences'} title={ko ? '체험 옵션 더하기' : 'Experience options'}
            hint={ko ? '한 키오스크에서 운영할 체험 종류를 늘릴 수 있어요.' : 'Offer more experiences on one kiosk.'}
            count={Number(o.extraContents > 0)}>
            <Field label={c.extraContents} info={info('extraContents')} price={add(KIOSK.extraContent, u('1종당', 'each'))} hint={ko ? '기본 1종 외에 운영할 체험을 더해요.' : 'Add experiences beyond the one included.'}>
              <Stepper id="k-contents" value={o.extraContents} min={0} max={10} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('rental', { extraContents: value })} />
            </Field>
          </MoreOptions>}
          {!(paged && enableKioskAssignments) && <MoreOptions lang={lang} pageId="branding" pageLabel={ko ? '브랜드 적용' : 'Branding'} title={ko ? '우리 브랜드에 맞게 바꾸기' : 'Make it your own'}
            hint={ko ? '로고부터 질문과 결과 화면까지, 필요한 만큼만 골라요.' : 'From your logo to questions and results, choose only what you need.'}
            count={Number(!!o.custom && o.custom !== 'none')}>
            <div className="sm:col-span-2"><Field label={c.kioskCustom} hint={o.custom && o.custom !== 'none' ? CUSTOM_DEV_TEXT.kiosk[o.custom].scope[lang] : c.kioskCustomHint}>
              <Segmented name={c.kioskCustom} value={o.custom ?? 'none'} onChange={(value) => setOptions('rental', { custom: value })}
                options={[
                  { value: 'none', label: c.none, price: noExtra },
                  { value: 'brand', label: CUSTOM_DEV_TEXT.kiosk.brand.name[lang], price: add(CUSTOM_DEV.kiosk.brand), info: CUSTOM_DEV_TEXT.kiosk.brand.scope[lang] },
                  { value: 'content', label: CUSTOM_DEV_TEXT.kiosk.content.name[lang], price: add(CUSTOM_DEV.kiosk.content), info: CUSTOM_DEV_TEXT.kiosk.content.scope[lang] },
                  { value: 'dedicated', label: CUSTOM_DEV_TEXT.kiosk.dedicated.name[lang], price: from(add(CUSTOM_DEV.kiosk.dedicated)), info: CUSTOM_DEV_TEXT.kiosk.dedicated.scope[lang] },
                ]} />
            </Field></div>
          </MoreOptions>}
        </OptionsLayout>
      );
    }
    case 'mediaArt':
    case 'spatialDesign':
    case 'custom':
      return <ConsultationNotice service={item.key} lang={lang} />;
  }
}
