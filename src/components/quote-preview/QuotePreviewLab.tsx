'use client';

import Image from 'next/image';
import { QuoteStudio, type QuoteExperienceEditorProps } from '@/components/quote-studio/QuoteStudio';
import { QuotePreviewExperienceEditor } from './QuotePreviewExperienceEditor';
import type { ServiceKey } from '@/lib/quote/catalog';

const renderExperienceEditor = (props: QuoteExperienceEditorProps) => <QuotePreviewExperienceEditor {...props} />;
// 고른 견적 목록 · 첫 단계 머리 그림 — 2단계 체험 카드와 같은 3D 그림(service-3d/*-v2)을 작은 칸에 맞게 물체 주변만 잘라 둔 것 (2026-11-21)
const renderArtwork = (service: ServiceKey) => <Image src={`/images/quote/service-3d/${service}-thumb.webp`} alt="" fill sizes="88px" className="object-cover" />;

/** 체험 편집 화면이 붙은 온라인 견적 (/quote). 실험 페이지(/quote-preview)는 2026-11-22 사용자 결정으로 없앴다 */
export function VisualQuoteStudio() {
  return <QuoteStudio renderExperienceEditor={renderExperienceEditor} renderArtwork={renderArtwork} />;
}
