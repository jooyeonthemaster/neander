'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CONTACT, PHONE_LINES, SOCIAL_LINKS, type SocialPlatform } from '@/lib/constants';
import { Reveal } from '@/components/fx';

/* 문의 페이지 오른쪽 연락처 (2026-11 개편) — 전화 · 메일은 크게, 나머지는 한 줄씩.
   전화는 고객센터 · 직통 두 번호를 함께 적는다 (constants.ts 의 PHONE_LINES, 2026-11-26). */

const SOCIAL_LABEL: Record<SocialPlatform, string> = { instagram: 'INSTAGRAM', youtube: 'YOUTUBE', linkedin: 'LINKEDIN', blog: 'BLOG' };

export function ContactInfo() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const ko = locale !== 'en';
  // 실제 운영 중인 계정만 노출한다. (constants.ts의 SOCIAL_LINKS 참고)
  const socials = (Object.entries(SOCIAL_LINKS) as [SocialPlatform, string][]).filter(([, url]) => Boolean(url));

  const row = 'grid grid-cols-1 gap-2 border-b border-paper/15 py-5 sm:grid-cols-[5.5rem_1fr] sm:gap-4';
  const label = 't-label !text-[0.64rem] text-paper/45 sm:pt-1.5';

  return (
    <Reveal as="section" aria-label={t('info.title')}>
      <h2 className="t-label text-paper/55">{t('info.title')}</h2>
      <dl className="mt-5 border-t border-paper/15">
        {PHONE_LINES.map((p) => (
          <div key={p.key} className={row}>
            <dt className={label}>{ko ? p.ko : p.en.toUpperCase()}</dt>
            <dd>
              <a href={`tel:${p.intl}`} className="whitespace-nowrap font-display text-[clamp(1.25rem,6.2vw,1.5rem)] font-extrabold sm:text-[clamp(1.5rem,2.4vw,2rem)] leading-none tracking-[0.01em] text-paper transition-colors hover:text-accent">
                {ko ? p.number : p.intl}
              </a>
            </dd>
          </div>
        ))}
        <div className={row}>
          <dt className={label}>{t('info.emailLabel')}</dt>
          <dd>
            <a href={`mailto:${CONTACT.email}`} className="font-display text-[clamp(1.1rem,1.7vw,1.4rem)] font-bold leading-none tracking-[0.01em] text-paper transition-colors hover:text-accent">{CONTACT.email}</a>
          </dd>
        </div>
        <div className={row}>
          <dt className={label}>{t('businessHours.title')}</dt>
          <dd>
            <p className="text-[1.02rem] font-semibold text-paper">{t('businessHours.weekday')}</p>
            <p className="mt-1 text-sm text-paper/50">{t('businessHours.weekend')} · {t('businessHours.note')}</p>
          </dd>
        </div>
        <div className={row}>
          <dt className={label}>{t('info.addressLabel')}</dt>
          <dd>
            {/* 회사(사무실) 주소 — 와우산로는 AC'SCENT ID 매장 주소라 여기 쓰지 않는다 (2026-11-21 사용자 정정) */}
            <p className="text-[1.02rem] font-semibold leading-snug text-paper">{t('info.address')}</p>
          </dd>
        </div>
        {socials.length > 0 && (
          <div className={row}>
            <dt className={label}>{t('social.title')}</dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={t(`social.${platform}`)} className="t-label pt-1 text-paper/70 transition-colors hover:text-accent">
                  {SOCIAL_LABEL[platform]} ↗
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </Reveal>
  );
}
