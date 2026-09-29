'use client';

import { Suspense } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { QuoteStudio, type QuoteExperienceEditorProps } from '@/components/quote-studio/QuoteStudio';
import { QuotePreviewExperienceEditor } from './QuotePreviewExperienceEditor';
import { ServiceThumbnail } from './illustrations/ServiceIllustration';
import type { ServiceKey } from '@/lib/quote/catalog';

const renderExperienceEditor = (props: QuoteExperienceEditorProps) => <QuotePreviewExperienceEditor {...props} />;
const renderArtwork = (service: ServiceKey, presetId?: string) => <ServiceThumbnail service={service} presetId={presetId} className="h-full w-full" />;

/** The four-step journey with the illustrated experience editor — /quote uses it live, the lab as a sandbox. */
export function VisualQuoteStudio({ mode = 'live' }: { mode?: 'live' | 'preview' }) {
  return <QuoteStudio mode={mode} renderExperienceEditor={renderExperienceEditor} renderArtwork={renderArtwork} />;
}

/** Use the production four-step journey with an isolated draft and local-only completion. */
export function QuotePreviewLab() {
  const ko = useLocale() !== 'en';
  return (
    <div className="min-h-screen bg-[#f6f8fa] pb-12 text-pretty sm:pb-16 [&_button]:scroll-mb-28 [&_input]:scroll-mb-28 [&_textarea]:scroll-mb-28 [&_img]:scroll-mb-28" data-testid="quote-preview-lab">
      <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-teal-700">
            <span className="size-1.5 rounded-full bg-teal-500" aria-hidden="true" /> PREVIEW LAB
          </span>
          <Link href="/quote" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-xs font-medium text-slate-500 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
            {ko ? '실제 견적 페이지' : 'Online quote'} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <header className="mt-4 pb-7 sm:pb-9">
          <h1 className="text-[1.8rem] font-bold leading-tight tracking-[-0.045em] text-slate-900 sm:text-4xl">{ko ? '온라인 견적 미리보기' : 'Preview your event estimate'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base [word-break:keep-all]">{ko ? '행사 정보를 알려주고, 체험을 고르며 완성될 모습을 만나보세요.' : 'Tell us about your event, then explore how each experience could look.'}</p>
        </header>
        <Suspense fallback={<div role="status" className="flex min-h-80 items-center justify-center rounded-[28px] bg-white text-sm text-slate-500">{ko ? '미리보기 화면을 준비하고 있어요.' : 'Preparing your preview.'}</div>}>
          <VisualQuoteStudio mode="preview" />
        </Suspense>
      </div>
    </div>
  );
}
