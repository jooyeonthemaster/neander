import type { Lang } from './catalog';
import type { QuoteInput } from './engine';

/**
 * 대표 시나리오 — 처음 온 사람이 "이런 행사면 대략 얼마"를 바로 보도록 채워 둔 견적.
 * 고른 뒤 인원·기간·옵션을 자유롭게 바꿀 수 있다.
 */
export interface QuotePreset {
  id: string;
  title: Record<Lang, string>;
  caption: Record<Lang, string>;
  input: QuoteInput;
}

export const QUOTE_PRESETS: QuotePreset[] = [
  {
    id: 'campus-festival',
    title: { ko: '대학 축제 부스', en: 'Campus festival booth' },
    caption: { ko: '1일 · 300명 · AI 포토부스 + AI 키오스크', en: '1 day · 300 guests · photo booth + kiosk' },
    input: {
      eventType: 'campus', eventDate: '', days: 1, hoursPerDay: 6, attendees: 300, region: 'seoul', extraStaff: 0,
      items: [
        { key: 'photoBooth', options: { booths: 1, extraStyles: 0, extraPrintRolls: 0, photocard: false, wrapping: false } },
        { key: 'rental', options: { mode: 'event', kiosks: 1, months: 1, printer: true, extraContents: 0, custom: 'none', experienceSlug: 'ai-face-reading' } },
      ],
    },
  },
  {
    id: 'brand-popup',
    title: { ko: '브랜드 팝업 3일', en: '3-day brand pop-up' },
    caption: { ko: '3일 · 하루 약 100명 · AI 향수 체험 + 포토부스', en: '3 days · ~100 guests/day · perfume + photo booth' },
    input: {
      eventType: 'popup', eventDate: '', days: 3, hoursPerDay: 6, attendees: 300, region: 'seoul', extraStaff: 0,
      items: [
        { key: 'acscent', options: { guests: 300, volume: '10ml', extraTeams: 0, customScent: false, premiumPackaging: false } },
        { key: 'photoBooth', options: { booths: 1, extraStyles: 0, extraPrintRolls: 0, photocard: false, wrapping: true } },
      ],
    },
  },
  {
    id: 'corporate-workshop',
    title: { ko: '기업 행사·워크숍', en: 'Corporate event / workshop' },
    caption: { ko: '1일 · 50명 · AI 향수 체험 50ml', en: '1 day · 50 guests · perfume 50ml' },
    input: {
      eventType: 'corporate', eventDate: '', days: 1, hoursPerDay: 4, attendees: 50, region: 'seoul', extraStaff: 0,
      items: [
        { key: 'acscent', options: { guests: 50, volume: '50ml', extraTeams: 0, customScent: false, premiumPackaging: false } },
      ],
    },
  },
  {
    id: 'public-tourism',
    title: { ko: '공공·관광 행사', en: 'Public / tourism event' },
    caption: { ko: '2일 · 500명 · AI 키오스크 2대 + 운영 인력', en: '2 days · 500 guests · 2 kiosks + staff' },
    input: {
      eventType: 'public', eventDate: '', days: 2, hoursPerDay: 6, attendees: 500, region: 'central', extraStaff: 1,
      items: [
        { key: 'rental', options: { mode: 'event', kiosks: 2, months: 1, printer: true, extraContents: 1, custom: 'brand', experienceSlug: 'ai-future-career' } },
      ],
    },
  },
];
