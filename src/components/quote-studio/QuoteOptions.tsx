'use client';

import { useId, useState, type ReactNode } from 'react';
import { Select } from '@/components/ui/Select';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { getExperienceImage } from '@/data/experience-images';
import {
  CUSTOM_DEV, CUSTOM_DEV_TEXT, KIOSK, OPTION_TEXT, PERFUME, PHOTO_BOOTH, type Lang,
} from '@/lib/quote/catalog';
import type { QuoteItem } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';
import { Check, Field, inputClass, Segmented, Stepper } from './QuoteControls';
import { QUOTE_COPY } from './copy';
import { optionInfo } from './option-info';

export type QuoteOptionsSetter = <K extends QuoteItem['key']>(key: K, patch: Partial<Extract<QuoteItem, { key: K }>['options']>) => void;

const manwon = (amount: number, lang: Lang) => lang === 'ko'
  ? `${(amount / 10000).toLocaleString('ko-KR')}만원`
  : `KRW ${amount.toLocaleString('en-US')}`;

function MoreOptions({ title, hint, count = 0, lang, children }: {
  title: string; hint: string; count?: number; lang: Lang; children: ReactNode;
}) {
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
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{hint}</span>
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

function ExperiencePreview({ slug, label, lang }: { slug: string; label: string; lang: Lang }) {
  const image = getExperienceImage(slug);
  const reducedMotion = useReducedMotion();
  if (!image) return null;

  const imageLabel = image.kind === 'case'
    ? (lang === 'ko' ? `운영 사례 · ${image.eventKo}` : `In action · ${image.eventEn}`)
    : (lang === 'ko' ? '연출 예시' : 'Illustrative example');

  return (
    <motion.figure key={slug} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }} className="flex overflow-hidden rounded-2xl bg-slate-50">
      <div className="relative min-h-28 w-32 shrink-0 sm:w-40">
        <Image src={image.src} alt={image.kind === 'concept' ? (lang === 'ko' ? image.altKo : image.altEn) : label} fill sizes="160px" className="object-cover" />
      </div>
      <figcaption className="flex flex-col justify-center px-4 py-4">
        <span className="text-[10px] font-medium leading-relaxed text-slate-500">{imageLabel}</span>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">{label}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{lang === 'ko' ? '고른 체험을 키오스크로 만나요.' : 'Bring this experience to your kiosk.'}</p>
      </figcaption>
    </motion.figure>
  );
}

function ExperienceSuggestions({ experiences, lang, onSelect }: {
  experiences: { value: string; label: string }[]; lang: Lang; onSelect: (slug: string) => void;
}) {
  const suggestions = ['ai-personal-color', 'ai-face-reading', 'ai-fortune-robot']
    .flatMap((slug) => {
      const experience = experiences.find((candidate) => candidate.value === slug);
      const image = getExperienceImage(slug);
      return experience && image ? [{ ...experience, image }] : [];
    });
  if (!suggestions.length) return null;

  return (
    <div>
      <p className="mb-2.5 text-xs text-slate-500">{lang === 'ko' ? '사진으로 먼저 둘러보세요' : 'A few experiences to explore'}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {suggestions.map(({ value, label, image }) => (
          <button key={value} type="button" onClick={() => onSelect(value)}
            className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-colors hover:border-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            <span className="relative block aspect-[4/3] overflow-hidden">
              <Image src={image.src} alt="" fill sizes="(max-width: 640px) 28vw, 190px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
            </span>
            <span className="block px-2.5 pb-2.5 pt-2 text-xs font-semibold leading-relaxed text-slate-700">{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{lang === 'ko' ? '이해를 돕기 위한 연출 예시예요.' : 'Illustrative examples of each experience.'}</p>
    </div>
  );
}

export function QuoteOptions({ item, lang, c, kioskExperiences, setOptions }: {
  item: QuoteItem;
  lang: Lang;
  c: (typeof QUOTE_COPY)[Lang];
  kioskExperiences: { value: string; label: string }[];
  setOptions: QuoteOptionsSetter;
}) {
  const ko = lang === 'ko';
  // 전용 디자인 단박스를 고르며 300명으로 올린 경우, 원래 인원 (고객 안내용)
  const [bumpedFrom, setBumpedFrom] = useState<number | null>(null);
  const info = (key: Parameters<typeof optionInfo>[0]) => optionInfo(key, lang);
  const gridClass = 'grid gap-x-5 gap-y-6 sm:grid-cols-2';

  switch (item.key) {
    case 'acscent': {
      const o = item.options;
      return (
        <div className={gridClass}>
          <Field label={c.guests} info={info('perfumeGuests')} hint={ko ? `향수를 받아 갈 인원이에요. ${PERFUME.minGuests}명부터, 최소 99만원(수도권)으로 시작해요.` : `Guests taking home a perfume. From ${PERFUME.minGuests} guests; minimum KRW 990,000 in Seoul metro.`}>
            <Stepper id="p-guests" value={o.guests} min={o.customBox ? PERFUME.customBox.minGuests : PERFUME.minGuests} max={5000} step={10} suffix={ko ? '명' : 'guests'} onChange={(value) => setOptions('acscent', { guests: value })} />
            {o.customBox && <p className="text-xs font-medium leading-relaxed text-amber-700">{c.customBoxGuestsLock}</p>}
          </Field>
          <Field label={c.volume} info={info('volume')} hint={ko ? '가볍게 선물하는 10ml, 넉넉하게 즐기는 50ml' : '10ml for a small gift, 50ml for more to enjoy.'}>
            <Segmented name={c.volume} value={o.volume} onChange={(value) => setOptions('acscent', { volume: value })} options={[{ value: '10ml', label: '10ml' }, { value: '50ml', label: '50ml' }]} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={c.analysis} hint={(o.analysisKiosks ?? 0) > 0 ? c.analysisKioskHint : c.analysisQrHint}>
              <Segmented name={c.analysis} value={(o.analysisKiosks ?? 0) > 0 ? 'kiosk' : 'qr'}
                onChange={(value) => setOptions('acscent', { analysisKiosks: value === 'kiosk' ? Math.max(1, o.analysisKiosks ?? 0) : 0 })}
                options={[{ value: 'qr', label: c.analysisQr, info: info('analysisQr') }, { value: 'kiosk', label: c.analysisKiosk, info: info('analysisKiosk') }]} />
            </Field>
            {(o.analysisKiosks ?? 0) > 0 && (
              <div className="mt-4 max-w-64">
                <Field label={ko ? '분석용 키오스크는 몇 대 필요할까요?' : 'How many analysis kiosks?'}>
                  <Stepper id="p-akiosk" value={o.analysisKiosks ?? 1} min={1} max={KIOSK.maxKiosks} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('acscent', { analysisKiosks: value })} />
                </Field>
              </div>
            )}
          </div>
          <MoreOptions lang={lang} title={ko ? '선물·운영 옵션 더하기' : 'Gift & staffing options'}
            hint={ko ? '브랜드 향, 선물 포장, 추가 조향 팀을 고를 수 있어요.' : 'Add a branded scent, gift packaging or extra perfumers.'}
            count={Number(o.extraTeams > 0) + Number(o.customScent) + Number(o.premiumPackaging || !!o.customBox)}>
            <div className="sm:col-span-2"><Field label={c.extraTeams} info={info('extraTeams')} hint={c.extraTeamsHint}>
              <div className="max-w-64"><Stepper id="p-teams" value={o.extraTeams} min={0} max={10} suffix={ko ? '팀' : undefined} onChange={(value) => setOptions('acscent', { extraTeams: value })} /></div>
            </Field></div>
            <Check id="p-custom" checked={o.customScent} onChange={(value) => setOptions('acscent', { customScent: value })} label={c.customScent} info={info('customScent')} />
            <div className="sm:col-span-2"><Field label={c.premiumPackaging}
              hint={o.customBox ? c.customBoxHint : c.brandPackHint}>
              <Segmented name={c.premiumPackaging} value={o.customBox ? 'custom' : o.premiumPackaging ? 'brand' : 'none'}
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
                  { value: 'none', label: c.none },
                  { value: 'brand', info: info('premiumPackaging'),
                    label: `${c.brandPack} +${manwon(PERFUME.premiumPackaging[o.volume] * o.guests, lang)} (${ko ? `병당 ${(PERFUME.premiumPackaging[o.volume]).toLocaleString('ko-KR')}원` : `KRW ${PERFUME.premiumPackaging[o.volume].toLocaleString('en-US')}/bottle`})` },
                  { value: 'custom', info: info('customBox'),
                    label: `${c.customBox} +${manwon(PERFUME.customBox.minimum, lang)}~${o.guests < PERFUME.customBox.minGuests ? (ko ? ` (${PERFUME.customBox.minGuests}명부터)` : ` (${PERFUME.customBox.minGuests}+ guests)`) : ''}` },
                ]} />
              <div aria-live="polite">
                {o.customBox && bumpedFrom !== null && (
                  <p role="status" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900">
                    <b className="font-semibold">{c.customBoxBumpedTitle(bumpedFrom, PERFUME.customBox.minGuests)}</b>{' '}{c.customBoxBumpedBody}
                  </p>
                )}
              </div>
            </Field></div>
          </MoreOptions>
        </div>
      );
    }
    case 'photoBooth': {
      const o = item.options;
      return (
        <div className={gridClass}>
          <Field label={c.booths} info={info('booths')} hint={ko ? '1대에 AI 스타일 2종, 인화 700장이 포함돼요.' : 'Each booth includes 2 AI styles and 700 prints.'}>
            <Stepper id="b-booths" value={o.booths} min={1} max={PHOTO_BOOTH.maxBooths} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('photoBooth', { booths: value })} />
          </Field>
          <div className="flex flex-col justify-center rounded-2xl bg-teal-50/70 px-4 py-3.5">
            <p className="text-xs font-semibold text-teal-800">{ko ? '사진은 이렇게 받아요' : 'A photo to take home'}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-700">{ko ? '현장에서 바로 인화하고, QR로 휴대폰에도 저장할 수 있어요.' : 'Guests get an instant print and can save a digital copy via QR.'}</p>
          </div>
          <MoreOptions lang={lang} title={ko ? '인화·스타일 옵션 더하기' : 'Print & style options'}
            hint={ko ? '사진 수량, 스타일과 부스 디자인' : 'Extra prints, ready-made styles and booth branding'}
            count={Number(o.extraStyles > 0) + Number(o.extraPrintRolls > 0) + Number(o.wrapping)}>
            <Field label={c.extraStyles} info={info('extraStyles')} hint={ko ? '준비된 AI 스타일을 추가해 선택 폭을 넓혀요.' : 'Give guests more ready-made AI styles to choose from.'}>
              <Stepper id="b-styles" value={o.extraStyles} min={0} max={20} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('photoBooth', { extraStyles: value })} />
            </Field>
            <Field label={c.extraPrintRolls} info={info('extraPrintRolls')} hint={ko ? '추가 1롤마다 700장을 더 인화할 수 있어요.' : 'Each extra roll adds another 700 prints.'}>
              <Stepper id="b-prints" value={o.extraPrintRolls} min={0} max={50} suffix={ko ? '롤' : undefined} onChange={(value) => setOptions('photoBooth', { extraPrintRolls: value })} />
            </Field>
            <Check id="b-wrap" checked={o.wrapping} onChange={(value) => setOptions('photoBooth', { wrapping: value })} label={c.wrapping} info={info('wrapping')} />
          </MoreOptions>
          <MoreOptions lang={lang} title={ko ? '우리 브랜드에 맞게 바꾸기' : 'Make it your own'}
            hint={ko ? '전용 스타일이나 촬영 화면이 필요할 때 골라 주세요.' : 'Choose this if you need a new style or custom capture screens.'}
            count={Number((o.customStyles ?? 0) > 0) + Number(!!o.custom && o.custom !== 'none')}>
            <div className="sm:col-span-2"><Field label={c.boothStyles} info={CUSTOM_DEV_TEXT.boothStyle.scope[lang]} hint={CUSTOM_DEV_TEXT.boothStyle.scope[lang]}>
              <div className="max-w-64"><Stepper id="b-cstyles" value={o.customStyles ?? 0} min={0} max={10} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('photoBooth', { customStyles: value })} /></div>
            </Field></div>
            <div className="sm:col-span-2"><Field label={c.boothCustom} hint={o.custom && o.custom !== 'none' ? CUSTOM_DEV_TEXT.booth[o.custom].scope[lang] : c.customNone}>
              <Segmented name={c.boothCustom} value={o.custom ?? 'none'} onChange={(value) => setOptions('photoBooth', { custom: value })}
                options={[
                  { value: 'none', label: c.none },
                  { value: 'flow', label: `${CUSTOM_DEV_TEXT.booth.flow.name[lang]} +${manwon(CUSTOM_DEV.booth.flow, lang)}`, info: CUSTOM_DEV_TEXT.booth.flow.scope[lang] },
                  { value: 'dedicated', label: `${CUSTOM_DEV_TEXT.booth.dedicated.name[lang]} +${manwon(CUSTOM_DEV.booth.dedicated, lang)}~`, info: CUSTOM_DEV_TEXT.booth.dedicated.scope[lang] },
                ]} />
            </Field></div>
          </MoreOptions>
        </div>
      );
    }
    case 'rental': {
      const o = item.options;
      const selectedExperience = kioskExperiences.find((experience) => experience.value === o.experienceSlug);
      return (
        <div className={gridClass}>
          <Field label={c.mode}>
            <Segmented name={c.mode} value={o.mode} onChange={(value) => setOptions('rental', { mode: value })}
              options={[{ value: 'event', label: c.modeEvent, info: info('modeEvent') }, { value: 'monthly', label: c.modeMonthly, info: info('modeMonthly') }]} />
          </Field>
          <Field label={c.kiosks} info={info('kiosks')}>
            <Stepper id="k-count" value={o.kiosks} min={1} max={KIOSK.maxKiosks} suffix={ko ? '대' : undefined} onChange={(value) => setOptions('rental', { kiosks: value })} />
          </Field>
          {o.mode === 'monthly' && <Field label={c.months} info={info('months')}>
            <Stepper id="k-months" value={o.months} min={1} max={24} suffix={ko ? '개월' : undefined} onChange={(value) => setOptions('rental', { months: value })} />
          </Field>}
          <div className="space-y-4 sm:col-span-2">
            <Field label={c.experience} info={info('experience')} hint={ko ? '아직 고민 중이라면 상담 후 정해도 괜찮아요.' : 'You can also decide together with our team later.'}>
              <Select id="k-exp" aria-label={c.experience} value={o.experienceSlug ?? ''} onValueChange={(value) => setOptions('rental', { experienceSlug: value || undefined })} triggerClassName={inputClass}
                options={[{ value: '', label: ko ? '상담 후 결정' : 'Decide later' }, ...kioskExperiences]} />
            </Field>
            {selectedExperience
              ? <ExperiencePreview slug={selectedExperience.value} label={selectedExperience.label} lang={lang} />
              : <ExperienceSuggestions experiences={kioskExperiences} lang={lang} onSelect={(slug) => setOptions('rental', { experienceSlug: slug })} />}
          </div>
          <MoreOptions lang={lang} title={ko ? '체험·출력 옵션 더하기' : 'Experience & print options'}
            hint={ko ? '체험 종류를 늘리거나 결과를 종이로 전할 수 있어요.' : 'Offer more experiences or hand guests a printed result.'}
            count={Number(o.printer) + Number(o.mode === 'event' && o.extraContents > 0)}>
            {o.mode === 'event' && <Field label={c.extraContents} info={info('extraContents')} hint={ko ? '기본 1종 외에 운영할 체험을 더해요.' : 'Add experiences beyond the one included.'}>
              <Stepper id="k-contents" value={o.extraContents} min={0} max={10} suffix={ko ? '종' : undefined} onChange={(value) => setOptions('rental', { extraContents: value })} />
            </Field>}
            <div className="flex flex-col justify-end"><Check id="k-printer" checked={o.printer} onChange={(value) => setOptions('rental', { printer: value })} label={c.printer} info={info('printer')} /></div>
          </MoreOptions>
          <MoreOptions lang={lang} title={ko ? '우리 브랜드에 맞게 바꾸기' : 'Make it your own'}
            hint={ko ? '로고부터 질문과 결과 화면까지, 필요한 만큼만 골라요.' : 'From your logo to questions and results, choose only what you need.'}
            count={Number(!!o.custom && o.custom !== 'none')}>
            <div className="sm:col-span-2"><Field label={c.kioskCustom} hint={o.custom && o.custom !== 'none' ? CUSTOM_DEV_TEXT.kiosk[o.custom].scope[lang] : c.kioskCustomHint}>
              <Segmented name={c.kioskCustom} value={o.custom ?? 'none'} onChange={(value) => setOptions('rental', { custom: value })}
                options={[
                  { value: 'none', label: c.none },
                  { value: 'brand', label: `${CUSTOM_DEV_TEXT.kiosk.brand.name[lang]} +${manwon(CUSTOM_DEV.kiosk.brand, lang)}`, info: CUSTOM_DEV_TEXT.kiosk.brand.scope[lang] },
                  { value: 'content', label: `${CUSTOM_DEV_TEXT.kiosk.content.name[lang]} +${manwon(CUSTOM_DEV.kiosk.content, lang)}`, info: CUSTOM_DEV_TEXT.kiosk.content.scope[lang] },
                  { value: 'dedicated', label: `${CUSTOM_DEV_TEXT.kiosk.dedicated.name[lang]} +${manwon(CUSTOM_DEV.kiosk.dedicated, lang)}~`, info: CUSTOM_DEV_TEXT.kiosk.dedicated.scope[lang] },
                ]} />
            </Field></div>
          </MoreOptions>
        </div>
      );
    }
    case 'mediaArt': {
      const o = item.options;
      return (
        <div className={gridClass}>
          <div className="sm:col-span-2"><Field label={c.grade} hint={ko ? '제작 규모를 먼저 고르고, 세부 연출은 상담에서 함께 정해요.' : 'Start with a production level. We’ll work out the visual details together.'}>
            <Segmented name={c.grade} value={o.grade} onChange={(value) => setOptions('mediaArt', { grade: value })}
              options={(['standard', 'premium', 'fullCustom'] as const).map((grade) => ({ value: grade, label: OPTION_TEXT.production[grade][lang], info: info(grade === 'standard' ? 'gradeStandard' : grade === 'premium' ? 'gradePremium' : 'gradeFullCustom') }))} />
          </Field></div>
          <MoreOptions lang={lang} title={ko ? '움직임을 감지할 공간 넓히기' : 'Cover more of your space'}
            hint={ko ? '센서 1세트가 기본으로 포함돼요. 추가가 필요할 때 선택하세요.' : 'One sensor set is included. Add more if your space needs it.'} count={Number(o.extraSensors > 0)}>
            <Field label={c.extraSensors} info={info('extraSensors')}><Stepper id="m-sensors" value={o.extraSensors} min={0} max={10} suffix={ko ? '세트' : undefined} onChange={(value) => setOptions('mediaArt', { extraSensors: value })} /></Field>
          </MoreOptions>
        </div>
      );
    }
    case 'spatialDesign': {
      const o = item.options;
      return (
        <div className={gridClass}>
          <div className="sm:col-span-2"><Field label={c.size} hint={ko ? '부스부터 팝업 공간까지, 준비 중인 크기와 가까운 것을 골라 주세요.' : 'Choose the closest size, from a single booth to a pop-up space.'}>
            <Segmented name={c.size} value={o.size} onChange={(value) => setOptions('spatialDesign', { size: value })}
              options={(['booth3x3', 'booth6x3', 'large'] as const).map((size) => ({ value: size, label: OPTION_TEXT.space[size][lang], info: info(size) }))} />
          </Field></div>
          {o.size === 'large' && <div className="sm:col-span-2"><Field label={c.pyeong} info={info('pyeong')} hint={ko ? '평당 120만원부터예요. 실제 공간 확인 후 정하며, 지금 합계에는 포함되지 않아요.' : 'From KRW 1.2M per pyeong, confirmed after a site survey. Not included in this total.'}>
            <div className="max-w-64"><Stepper id="s-pyeong" value={o.pyeong} min={10} max={500} suffix={ko ? '평' : undefined} onChange={(value) => setOptions('spatialDesign', { pyeong: value })} /></div>
          </Field></div>}
          <MoreOptions lang={lang} title={ko ? '공간에 특별함 더하기' : 'Add a finishing touch'} hint={ko ? '사진을 남길 포토존과 공간에 맞는 조명' : 'A photo spot and lighting designed for your space'} count={Number(o.photoZone) + Number(o.lighting)}>
            <Check id="s-zone" checked={o.photoZone} onChange={(value) => setOptions('spatialDesign', { photoZone: value })} label={c.photoZone} info={info('photoZone')} />
            <Check id="s-light" checked={o.lighting} onChange={(value) => setOptions('spatialDesign', { lighting: value })} label={c.lighting} info={info('lighting')} />
          </MoreOptions>
        </div>
      );
    }
    case 'custom': {
      const o = item.options;
      return (
        <div className={gridClass}>
          <div className="sm:col-span-2"><Field label={c.scope} hint={ko ? '새로운 체험을 만드는 1회 제작비예요. 구체적인 내용은 함께 정해요.' : 'A one-time fee to build your experience. We’ll define the details with you.'}>
            <Segmented name={c.scope} value={o.scope} onChange={(value) => setOptions('custom', { scope: value })}
              options={(['standard', 'large'] as const).map((scope) => ({ value: scope, label: OPTION_TEXT.scope[scope][lang], info: info(scope === 'standard' ? 'scopeStandard' : 'scopeLarge') }))} />
          </Field></div>
          <MoreOptions lang={lang} title={ko ? '기획부터 운영까지 도움받기' : 'Get help with planning & upkeep'} hint={ko ? '아이디어 구체화나 제작 후 관리가 필요할 때' : 'For help shaping an idea or maintaining it after launch'} count={Number(o.consulting) + Number(o.maintenanceMonths > 0)}>
            <Field label={c.maintenance} info={info('maintenance')} hint={ko ? '필요한 기간만 선택해요. 0개월이면 추가하지 않아요.' : 'Choose only the months you need. Leave at 0 to skip.'}>
              <Stepper id="c-maint" value={o.maintenanceMonths} min={0} max={36} suffix={ko ? '개월' : undefined} onChange={(value) => setOptions('custom', { maintenanceMonths: value })} />
            </Field>
            <div className="flex flex-col justify-center"><Check id="c-consult" checked={o.consulting} onChange={(value) => setOptions('custom', { consulting: value })} label={c.consulting} info={info('consulting')} /></div>
          </MoreOptions>
        </div>
      );
    }
  }
}
