'use client';

import { useState } from 'react';
import { ArrowRight, Camera, Check, CheckCheck, CircleDot, Info, Layers3, Monitor, Move, Palette, ScanFace, Sparkles, WandSparkles } from 'lucide-react';
import { CUSTOM_DEV, SERVICE_ORDER, SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import type { KioskOptions, PhotoBoothOptions, QuoteInput, QuoteItem } from '@/lib/quote/engine';
import { getPhotoBoothTemplates } from '@/lib/quote/photo-booth-templates';
import { getKioskAssignments, getKioskExperience } from '@/lib/quote/kiosk-experiences';
import { resolveServicePreview } from '@/lib/quote-preview/service-model';
import { PhotoBoothTemplateArt } from '@/components/quote-studio/PhotoBoothTemplateArt';
import { cn } from '@/lib/utils';
import { QuotePreview } from './QuotePreview';
import { KioskScene } from './KioskScene';
import { PreviewCanvas } from './PreviewCanvas';
import { CustomContentTablet } from './CustomContentTablet';
import { ExperienceIllustration, PortraitIllustration, ServiceIllustration, ServiceThumbnail } from './illustrations/ServiceIllustration';

const panelClass = 'rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5';

/** Shared by the experimental flow and any future production integration. */
export function ServicePreview({ input, lang, activeKey }: { input: QuoteInput; lang: Lang; activeKey: ServiceKey | null }) {
  const [selection, setSelection] = useState<{ service: ServiceKey; view: string } | null>(null);
  const model = resolveServicePreview(input, activeKey, lang);
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;

  if (!model) return (
    <section data-testid="service-preview" data-service="empty" className={panelClass}>
      <h2 className="text-lg font-bold text-slate-900">{L('어떤 경험을 함께 만들까요?', 'What shall we create together?')}</h2>
      <p className="mt-2 text-sm text-slate-500">{L('체험을 고르면 우리 행사에서 만날 모습을 보여드려요.', 'Choose an experience to picture it at your event.')}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {SERVICE_ORDER.map((service) => <figure key={service} className="min-w-0 overflow-hidden rounded-2xl bg-slate-50">
          <ServiceThumbnail service={service} />
          <figcaption className="p-2 text-[10px] font-semibold leading-relaxed text-slate-600">{SERVICE_TEXT[service].name[lang]}</figcaption>
        </figure>)}
      </div>
    </section>
  );

  if (model.key === 'acscent' || model.key === 'spatialDesign') return (
    <div data-testid="service-preview" data-service={model.key}>
      <QuotePreview key={model.key} input={input} lang={lang} initialView={model.key === 'spatialDesign' ? 'space' : 'combined'} />
      {input.items.some((item) => item.key !== 'acscent' && item.key !== 'spatialDesign') && (
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-slate-500">{L('향수 체험과 공간을 자세히 보고 있어요. 전체 행사 공간으로 돌아가면 함께 고른 체험도 볼 수 있어요.', 'This detail shows perfume and space design. Return to the whole event to see your other experiences together.')}</p>
      )}
    </div>
  );

  const current = model.views.find((view) => selection?.service === model.key && selection.view === view.id) ?? model.views[0];
  return (
    <section data-testid="service-preview" data-service={model.key} aria-label={L(`${model.title} 미리보기`, `${model.title} preview`)} className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)]">
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />
            <h2 className="text-sm font-semibold text-slate-800">{L('우리 행사의 모습', 'Picture your event')}</h2>
          </div>
          {model.views.length > 1 && <div role="group" aria-label={L('미리보기 종류', 'Preview view')} className="flex flex-wrap gap-1 rounded-2xl bg-slate-100/80 p-1">
            {model.views.map((view) => <button key={view.id} type="button" aria-pressed={current.id === view.id}
              data-testid={`service-preview-view-${view.id}`} onClick={() => setSelection({ service: model.key, view: view.id })}
              className={cn('min-h-10 flex-1 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', current.id === view.id ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:bg-white/60')}>
              {view.label}
            </button>)}
          </div>}
        </div>
        {model.item.key === 'custom'
          ? <PreviewCanvas lang={lang} label={current.description} overlay={<div className="pointer-events-auto absolute inset-0 flex items-center justify-center"><CustomContentTablet options={model.item.options} eventType={input.eventType} lang={lang} expanded /></div>}><div /></PreviewCanvas>
          : model.item.key === 'rental' && current.id === 'scene'
          ? <KioskScene options={model.item.options} lang={lang} />
          : model.item.key === 'rental' && current.id === 'experience'
          ? <KioskExperienceStage options={model.item.options} lang={lang} />
          : model.item.key === 'photoBooth' && current.id === 'style' && getPhotoBoothTemplates(model.item.options.templateSlugs ?? []).length > 0
          ? <PhotoTemplateStage options={model.item.options} lang={lang} />
          : <PreviewCanvas lang={lang} label={current.description}><ServiceIllustration service={model.key} item={model.item} view={current.id} lang={lang} /></PreviewCanvas>}
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <p className="text-[10px] font-medium tracking-wide text-slate-500">{current.caption}</p>
          <p data-testid="preview-service-label" className="text-sm font-semibold leading-relaxed text-slate-800">{current.description}</p>
          <p className="text-xs leading-relaxed text-slate-500">{model.intro}</p>
          <ul aria-label={L('현재 선택한 구성', 'Selected configuration')} className="flex flex-wrap gap-1.5">
            {model.badges.map((badge) => <li key={badge} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-800"><Check size={11} aria-hidden="true" />{badge}</li>)}
          </ul>
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="text-xs font-semibold text-slate-800">{L('방문객은 이렇게 경험해요', 'Your guest’s journey')}</h3>
        <ol className="mt-4 grid grid-cols-3 gap-2" data-testid="service-preview-journey">
          {model.journey.map((step, index) => <li key={step} className="relative min-w-0 rounded-2xl bg-slate-50 p-3">
            <span className="mb-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-teal-700 shadow-sm">{index + 1}</span>
            <p className="text-[11px] font-medium leading-relaxed text-slate-700">{step}</p>
            {index < 2 && <ArrowRight size={11} aria-hidden="true" className="absolute -right-1.5 top-5 z-10 text-slate-300" />}
          </li>)}
        </ol>
      </div>

      <ServiceDetails item={model.item} lang={lang} />

      <div className="flex gap-2.5 px-1 text-[11px] leading-relaxed text-slate-500">
        <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
        <div className="space-y-1.5">{model.notes.map((note) => <p key={note}>{note}</p>)}</div>
      </div>
    </section>
  );
}

function ServiceDetails({ item, lang }: { item: QuoteItem; lang: Lang }) {
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  if (item.key === 'photoBooth') {
    const o = item.options;
    const templates = getPhotoBoothTemplates(o.templateSlugs ?? []);
    const firstTemplate = templates[0];
    return <>
      <div className={panelClass}>
        <h3 className="text-xs font-semibold text-slate-800">{L('사진 한 장으로, 이런 변화', 'One photo, a new look')}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <figure className="min-w-0">
            <PortraitIllustration style="source" lang={lang} testId="preview-style-source" />
            <figcaption className="mt-2 text-center text-[11px] text-slate-500">{L('촬영할 인물', 'Your portrait')}</figcaption>
          </figure>
          <figure className="min-w-0">
            {firstTemplate ? <div data-testid="preview-style-result" data-style={firstTemplate.appearance}>
              <PhotoBoothTemplateArt appearance={firstTemplate.appearance} label={L(`${firstTemplate.name.ko} 구성 일러스트`, `${firstTemplate.name.en} theme illustration`)} />
            </div> : <PortraitIllustration style="ready" lang={lang} testId="preview-style-result" />}
            <figcaption className="mt-2 text-center text-[11px] font-semibold text-teal-700">{firstTemplate?.name[lang] ?? L('기존 스타일 예시', 'Ready-made style example')}</figcaption>
          </figure>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{L('스타일의 분위기를 설명하는 일러스트예요. 실제 AI 결과물은 선택한 데모에서 확인할 수 있어요.', 'These illustrations explain each theme. Explore the selected demo to see actual AI results.')}</p>
      </div>
      {templates.length > 0 && <div className={panelClass} data-testid="preview-photo-templates">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold text-slate-800">{L('고른 기존 템플릿', 'Your existing templates')}</h3>
          <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800">{L(`${templates.length}종`, `${templates.length} selected`)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {templates.map((template) => <figure key={template.slug} data-testid={`preview-photo-template-${template.slug}`} data-template-slug={template.slug} className="min-w-0 rounded-2xl bg-slate-50 p-2.5">
            <PhotoBoothTemplateArt appearance={template.appearance} />
            <figcaption className="px-1 pb-1 pt-3">
              <p className="text-xs font-semibold leading-relaxed text-slate-800">{template.name[lang]}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{template.description[lang]}</p>
            </figcaption>
          </figure>)}
        </div>
      </div>}
      {(o.customStyles ?? 0) > 0 && <div className={cn(panelClass, 'border-amber-200/70 bg-amber-50/50')} data-testid="preview-photo-custom-styles" data-count={o.customStyles}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700"><WandSparkles size={18} aria-hidden="true" /></span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{L(`새로 제작 · ${o.customStyles}종`, `${o.customStyles} newly designed style(s)`)}</h3>
            <p className="mt-1 text-xs font-semibold text-amber-800">{L(`1종 ${(CUSTOM_DEV.boothStyle / 10_000).toLocaleString('ko-KR')}만원`, `₩${CUSTOM_DEV.boothStyle.toLocaleString('en-US')} per style`)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{L('고른 기존 템플릿과 별도로, 우리 행사만의 의상·배경·캐릭터를 새로 만들어요. 디자인은 상담에서 함께 정해요.', 'Create new outfits, backgrounds, or characters in addition to your existing templates. We agree the design together during consultation.')}</p>
        <p className="mt-3 border-t border-amber-200/60 pt-3 text-xs font-semibold text-slate-700">{L(`제작 기본 비용 +${((o.customStyles ?? 0) * CUSTOM_DEV.boothStyle).toLocaleString('ko-KR')}원`, `Base design fee +₩${((o.customStyles ?? 0) * CUSTOM_DEV.boothStyle).toLocaleString('en-US')}`)}<span className="ml-1.5 text-[10px] font-normal text-slate-500">{L('부가세 별도', 'Excl. VAT')}</span></p>
      </div>}
      {o.custom && o.custom !== 'none' && <ScreenFlow lang={lang} dedicated={o.custom === 'dedicated'} photo />}
    </>;
  }
  if (item.key === 'rental') {
    const o = item.options;
    return o.custom && o.custom !== 'none' ? <KioskScreens mode={o.custom} lang={lang} /> : null;
  }
  if (item.key === 'mediaArt') {
    const o = item.options;
    const premium = o.grade !== 'standard';
    return <div className={panelClass} data-testid="preview-media-production" data-grade={o.grade}>
      <h3 className="text-xs font-semibold text-slate-800">{L('선택한 제작 방향', 'Your production direction')}</h3>
      <div className="mt-3 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex items-center gap-2 text-[10px] font-medium text-teal-300"><CircleDot size={13} aria-hidden="true" />{L('콘텐츠 구성 예시', 'Illustrative content direction')}</div>
        <div className="my-6 flex items-center justify-center gap-3" aria-hidden="true">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-full border', premium ? 'border-teal-300/70 bg-teal-400/20' : 'border-slate-500 bg-slate-800')}><Move size={24} /></div>
          <div className="h-px w-6 bg-slate-500" />
          <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl border', premium ? 'border-teal-300/60 bg-gradient-to-br from-teal-300/30 to-indigo-400/30' : 'border-slate-500 bg-slate-800')}><Palette size={27} /></div>
          {o.grade === 'fullCustom' && <><div className="h-px w-4 bg-slate-500" /><div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-300/60 bg-violet-400/20"><WandSparkles size={24} /></div></>}
        </div>
        <p className="text-sm font-semibold">{o.grade === 'fullCustom' ? L('우리 이야기로 처음부터', 'Build from your own story') : premium ? L('행사의 분위기를 더 깊게', 'A richer event atmosphere') : L('움직임에 반응하는 순간', 'A moment that responds to you')}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{o.grade === 'fullCustom' ? L('브랜드의 이야기와 반응 방식을 함께 기획해요.', 'Plan a brand-specific story and interaction together.') : premium ? L('표현과 연출을 더하는 방향으로 제작 범위를 협의해요.', 'Explore a broader creative scope and richer visual treatment.') : L('기본 제작 범위에서 공간에 맞는 연출을 정해요.', 'Agree a scene for your venue within the standard production scope.')}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label={L('선택한 센서 수량', 'Selected sensor count')}>
        {Array.from({ length: 1 + o.extraSensors }, (_, i) => <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-[10px] font-medium text-slate-600"><ScanFace size={12} aria-hidden="true" />{L(`센서 ${i + 1}`, `Sensor ${i + 1}`)}</span>)}
      </div>
    </div>;
  }
  if (item.key === 'custom') {
    const o = item.options;
    return <div className={panelClass} data-testid="preview-custom-scope" data-scope={o.scope}>
      <h3 className="text-xs font-semibold text-slate-800">{L('우리 행사에 맞춘 AI 콘텐츠', 'AI content tailored to your event')}</h3>
      <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3">
        {o.consulting && <div className="flex items-center gap-3 rounded-xl border border-dashed border-teal-200 bg-teal-50 p-3"><Layers3 size={17} className="shrink-0 text-teal-600" aria-hidden="true" /><p className="text-xs font-medium text-teal-800">{L('기획부터 함께 정리하기', 'Plan the idea together')}</p></div>}
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"><Monitor size={18} className="shrink-0 text-slate-400" aria-hidden="true" /><div><p className="text-[10px] font-semibold text-slate-500">01 · {L('참여', 'JOIN')}</p><p className="mt-1 text-xs font-semibold text-slate-700">{L('취향이나 이야기를 알려주세요', 'Share a preference or a story')}</p></div></div>
        <div className={cn('grid gap-2', o.scope === 'large' ? 'grid-cols-2' : 'grid-cols-1')}>
          <div className="rounded-xl bg-teal-700 p-4 text-white"><Sparkles size={20} aria-hidden="true" /><p className="mt-3 text-xs font-semibold">{L('나만의 AI 결과', 'Your own AI result')}</p><p className="mt-1 text-[10px] leading-relaxed text-teal-50">{L('브랜드와 연결된 이야기', 'A story linked to your brand')}</p></div>
          {o.scope === 'large' && <div className="rounded-xl bg-slate-800 p-4 text-white"><Layers3 size={20} aria-hidden="true" /><p className="mt-3 text-xs font-semibold">{L('공간으로 이어지는 체험', 'An experience across spaces')}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-300">{L('여러 접점의 흐름 설계', 'Connect multiple touchpoints')}</p></div>}
        </div>
        {o.pgIntegration && <p className="rounded-xl bg-white p-3 text-xs font-medium text-teal-800">{L('콘텐츠에서 결제하고 참여하기 · PG 연결', 'Pay and participate within your content · payment gateway')}</p>}
        {o.maintenanceMonths > 0 && <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-[11px] font-medium text-slate-600"><CheckCheck size={16} aria-hidden="true" />{L(`오픈 후 ${o.maintenanceMonths}개월 운영 관리`, `${o.maintenanceMonths} months of post-launch maintenance`)}</div>}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{L('기획 방향을 설명하는 예시예요. 최종 기능과 화면 수는 협의해요.', 'An illustration of a possible direction. Final features and screen counts are agreed together.')}</p>
    </div>;
  }
  return null;
}

function KioskExperienceStage({ options, lang }: { options: KioskOptions; lang: Lang }) {
  const assignments = getKioskAssignments(options);
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  return <div data-testid="preview-service-scene" data-service="rental" data-view="experience" data-renderer="svg" data-kiosks={assignments.length} className="bg-[#f7f5f0]">
    <PreviewCanvas lang={lang} label={L('기기별 선택한 체험 미리보기', 'Selected experiences for each kiosk')}>
    <div className={cn('mx-auto grid h-full max-w-xl gap-2 p-2', assignments.length > 1 ? 'grid-cols-2' : 'max-w-xs grid-cols-1', assignments.length > 2 ? 'grid-rows-2' : 'grid-rows-1')}>
      {assignments.map((slug, index) => {
        const experience = getKioskExperience(slug);
        const name = experience?.name[lang] ?? L('체험 미정', 'Choose later');
        return <figure key={index} data-testid={`preview-kiosk-experience-${index + 1}`} data-instance={index + 1} data-experience-slug={slug} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white bg-white/80">
          <ExperienceIllustration slug={slug} label={L(`${index + 1}번 기기 · ${name}`, `Kiosk ${index + 1} · ${name}`)} branded={options.custom === 'brand'} className="min-h-0 flex-1 rounded-none [&>svg]:h-full" />
          <figcaption className="flex shrink-0 items-center gap-1.5 px-2 py-1 lg:py-2">
            <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[9px] font-bold text-white">{index + 1}</span>
            <p className="truncate text-[10px] font-semibold text-slate-800 lg:text-xs" title={name}>{name}</p>
          </figcaption>
        </figure>;
      })}
    </div>
    </PreviewCanvas>
    <p className="px-4 pb-3 text-[11px] leading-relaxed text-slate-500">{L('기기마다 한 가지 체험을 운영해요. 화면 그림은 체험 종류를 설명하는 예시예요.', 'Each kiosk runs one experience. Screen illustrations explain the selected experience types.')}</p>
  </div>;
}

function PhotoTemplateStage({ options, lang }: { options: PhotoBoothOptions; lang: Lang }) {
  const templates = getPhotoBoothTemplates(options.templateSlugs ?? []);
  const shown = templates.slice(0, 3);
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  return <div data-testid="preview-service-scene" data-service="photoBooth" data-view="style" data-renderer="svg" data-preview-selected-count={templates.length}
    className="bg-[#f7f5f0]">
    <PreviewCanvas lang={lang} label={L('선택한 사진 스타일 미리보기', 'Selected photo style preview')}>
    <div className={cn('mx-auto grid h-full w-full gap-2 p-3 sm:gap-3', shown.length === 1 ? 'max-w-60 grid-cols-1' : shown.length === 2 ? 'max-w-96 grid-cols-2' : 'grid-cols-3')}>
      {shown.map((template) => <figure key={template.slug} className="flex min-h-0 min-w-0 flex-col justify-center">
        <div className="min-h-0 [&>svg]:h-full [&>svg]:max-h-full"><PhotoBoothTemplateArt appearance={template.appearance} /></div>
        <figcaption className="mt-2 shrink-0 px-1 text-center text-[10px] font-semibold leading-relaxed text-slate-700 lg:text-[11px]">{template.name[lang]}</figcaption>
      </figure>)}
    </div>
    </PreviewCanvas>
    {templates.length > shown.length && <p className="mt-4 text-center text-[11px] text-slate-500">{L(`외 ${templates.length - shown.length}종 · 고른 템플릿은 아래에서 모두 볼 수 있어요`, `Plus ${templates.length - shown.length} more · See all your templates below`)}</p>}
    {(options.customStyles ?? 0) > 0 && <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-amber-800"><WandSparkles size={13} aria-hidden="true" />{L(`새로 제작 ${options.customStyles}종도 함께`, `Plus ${options.customStyles} newly designed style(s)`)}</p>}
  </div>;
}

function ScreenFlow({ lang, dedicated, photo = false }: { lang: Lang; dedicated: boolean; photo?: boolean }) {
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  return <div className={panelClass} data-testid="preview-screen-flow">
    <h3 className="text-xs font-semibold text-slate-800">{dedicated ? L('우리 행사 전용 경험으로', 'An experience built for your event') : L('우리 행사에 맞는 화면 흐름', 'A flow that fits your event')}</h3>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[
        { Icon: Monitor, title: L('시작 화면', 'Welcome'), detail: L('우리 행사 소개', 'Your event') },
        { Icon: photo ? Camera : ScanFace, title: dedicated ? L('새 체험 로직', 'New logic') : L('참여 화면', 'Participate'), detail: photo ? L('촬영 · 스타일', 'Capture · style') : L('질문 · 분석', 'Answer · analyse') },
        { Icon: Sparkles, title: L('결과 화면', 'Results'), detail: L('나만의 결과', 'A personal result') },
      ].map(({ Icon, title, detail }, index) => <div key={title} className="min-w-0 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
        <span className="text-[9px] font-bold tracking-widest text-teal-500">0{index + 1}</span><Icon size={20} aria-hidden="true" className="my-4 text-teal-700" /><p className="text-[11px] font-semibold text-slate-800">{title}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{detail}</p>
      </div>)}
    </div>
    <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{L('화면 흐름의 예시예요. 실제 UI와 기능은 선택한 개발 범위 안에서 함께 정해요.', 'An illustrative screen flow. Final UI and features are agreed within the selected development scope.')}</p>
  </div>;
}

function KioskScreens({ mode, lang }: { mode: 'brand' | 'content' | 'dedicated'; lang: Lang }) {
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  if (mode === 'dedicated') return <ScreenFlow lang={lang} dedicated />;
  return <div className={panelClass} data-testid="preview-kiosk-screens" data-mode={mode}>
    <h3 className="text-xs font-semibold text-slate-800">{mode === 'brand' ? L('화면에 우리 브랜드를 담아요', 'Bring your brand to the screen') : L('질문과 결과도 우리 이야기로', 'Make the questions and results your own')}</h3>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="min-w-0 rounded-2xl bg-teal-700 p-4 text-white">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-teal-100">YOUR BRAND</p>
        <div className="my-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Sparkles size={21} aria-hidden="true" /></div>
        <p className="text-xs font-semibold leading-relaxed">{mode === 'brand' ? L('나를 알아보는 시간', 'A moment to discover you') : L('어떤 순간을 좋아하나요?', 'What moments do you enjoy?')}</p>
        <span className="mt-4 block rounded-lg bg-white px-2 py-2 text-center text-[10px] font-semibold text-teal-800">{mode === 'brand' ? L('체험 시작', 'Get started') : L('여유로운 휴식', 'A quiet break')}</span>
      </div>
      <div className="min-w-0 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-teal-600">{L('나의 결과', 'YOUR RESULT')}</p>
        <div className="my-5 flex gap-1.5" aria-hidden="true"><span className="h-8 w-8 rounded-full bg-[#8fbfba]" /><span className="h-8 w-8 rounded-full bg-[#c2dcd4]" /><span className="h-8 w-8 rounded-full bg-[#f0d7ae]" /></div>
        <p className="text-xs font-semibold text-slate-800">{L('잔잔한 숲을 닮은 당신', 'A little like a quiet forest')}</p>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">{mode === 'brand' ? L('브랜드 컬러와 짧은 안내 문구', 'Brand colors and brief copy') : L('결과에 맞는 브랜드 상품 연결', 'Connect a matching brand product')}</p>
      </div>
    </div>
    <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{mode === 'brand' ? L('시작·결과 화면의 로고, 색상, 짧은 문구 3곳 적용 예시예요. 기기 외관 래핑과는 별개예요.', 'Illustrates a logo, colors and three short copy changes on start/result screens. This does not wrap the device exterior.') : L('기존 체험 안에서 질문·결과·상품 연결을 바꾸는 예시예요.', 'Illustrates changing questions, results and product links within an existing experience.')}</p>
  </div>;
}
