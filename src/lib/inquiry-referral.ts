import { CHANNEL_LABELS, sourceLabel, type Channel } from '@/lib/analytics/sources'
import type { InquiryAttribution } from '@/types/inquiry'

/**
 * 문의·견적 폼의 「어떻게 알게 되셨나요?」 선택지.
 * 주소를 직접 쳤거나 메신저·PDF 링크로 들어와 유입 경로가 남지 않는 문의도 출처를 알 수 있게 한다.
 * 값은 inquiries.referral 에 저장된다 (firestore.rules 에서 길이만 검사).
 */
export const REFERRAL_OPTIONS = [
  { value: 'naver', ko: '네이버 검색', en: 'Naver search' },
  { value: 'google', ko: '구글 검색', en: 'Google search' },
  { value: 'ai', ko: 'ChatGPT 등 AI 추천', en: 'ChatGPT or another AI assistant' },
  { value: 'sns', ko: '인스타그램·블로그 등 SNS', en: 'Instagram, blogs or social media' },
  { value: 'event', ko: '행사장에서 직접 봤어요', en: 'Saw it at an event' },
  { value: 'word', ko: '지인·업체 소개', en: 'Referral from a colleague or partner' },
  { value: 'press', ko: '기사·언론 보도', en: 'News article' },
  { value: 'repeat', ko: '예전에 함께 일했어요', en: 'We worked together before' },
  { value: 'other', ko: '기타', en: 'Other' },
] as const

export type ReferralValue = (typeof REFERRAL_OPTIONS)[number]['value']

export function referralLabel(value: string | null | undefined, locale: 'ko' | 'en' = 'ko'): string | null {
  if (!value) return null
  const option = REFERRAL_OPTIONS.find((o) => o.value === value)
  return option ? option[locale] : value
}

/* ── 방문 기록에서 읽은 유입 경로를 사람이 읽는 문장으로 ───────── */


function originText(channel: string | null, source: string | null): string {
  if (!channel) return '-'
  const label = CHANNEL_LABELS[channel as Channel] ?? channel
  if (!source || source === 'direct' || channel === 'direct') return label
  return `${sourceLabel(source)} (${label})`
}

function kstDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000)
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

/** 예: "ChatGPT (AI 서비스) → /services · 첫 방문 11/9 직접 유입 → / · 4번째 방문" */
export function describeAttribution(a: InquiryAttribution | null | undefined): string | null {
  if (!a) return null
  const parts = [`${originText(a.channel, a.source)} → ${a.landing || '/'}`]
  const sameAsFirst = a.first_channel === a.channel && a.first_source === a.source && a.first_landing === a.landing
  if (a.first_at && a.first_channel && !(sameAsFirst && (a.visits ?? 1) <= 1)) {
    parts.push(`첫 방문 ${kstDate(a.first_at)} ${originText(a.first_channel, a.first_source)} → ${a.first_landing || '/'}`)
  }
  if (a.visits && a.visits > 1) parts.push(`${a.visits}번째 방문`)
  if (a.campaign) parts.push(`캠페인 ${a.campaign}`)
  return parts.join(' · ')
}
