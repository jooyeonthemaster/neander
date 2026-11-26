'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { CONTACT, SOCIAL_LINKS, type SocialPlatform, QUOTE_HREF } from '@/lib/constants';
import { PRODUCTS } from '@/data/products';
import { isConsultationService, SERVICE_TEXT } from '@/lib/quote/catalog';
import { Reveal, Spotlight } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { Btn } from '@/components/site/ui';
import { PhoneLinks } from '@/components/site/PhoneLinks';

/* ─────────────────────────────────────────────────────────
   바닥글 (2026-11 개편)
   1) 모든 페이지 끝의 문의 구역 — 견적 · 문의처럼 이미 그 일을 하고 있는 화면에서는 뺀다
   2) 링크 3단 + 사업자 정보
   3) 화면 폭을 가득 채우는 NEANDER 글자 — 글자마다 마우스를 올리면 채워진다
   ───────────────────────────────────────────────────────── */

// 판매 상품 6가지 (홈 · 체험 서비스와 같은 목록 · 연결 주소)
// 상담 상품(공간 디자인 · 미디어 아트 · 커스텀 AI)은 소개 화면이 따로 없어 문의로 보낸다 — 홈 · 체험서비스의 같은 항목과 맞춘다
// (예전에는 포트폴리오 · 스탬프 투어 목록으로 가서 이름과 다른 화면이 열렸다, 2026-11-27 배포 전 검수)
const SERVICE_LINKS = PRODUCTS.map((p) => ({ key: p.key, href: isConsultationService(p.key) ? '/contact' : p.href }));

// 실제 페이지가 있는 항목만 둔다
const COMPANY_LINKS = [
  { labelKey: 'about' as const, href: '/about' },
  { labelKey: 'portfolio' as const, href: '/portfolio' },
  { labelKey: 'insights' as const, href: '/insights' },
  { labelKey: 'press' as const, href: '/press' },
];

const SUPPORT_LINKS = [
  { labelKey: 'contact' as const, href: '/contact' },
  { labelKey: 'quote' as const, href: QUOTE_HREF },
  { labelKey: 'faq' as const, href: '/faq' },
  { labelKey: 'brochure' as const, href: '/portfolio#download' },
];

/** 이 주소들에서는 문의 구역을 넣지 않는다 (자체 문의·견적 흐름이 있는 화면) */
const NO_CTA_PREFIXES = ['/quote', '/contact', '/demo', '/formula-lab', '/privacy', '/experience', '/development'];
/** 이 주소 하나에서만 뺀다 — 포트폴리오 목록은 자체 마무리 띠(YOUR EVENT, NEXT.)가 있다. 사례 상세(/portfolio/…)에는 그대로 둔다 */
const NO_CTA_EXACT = ['/portfolio'];

function FooterLink({ href, children }: { href: ComponentProps<typeof Link>['href']; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center text-[0.95rem] text-paper/60 transition-colors duration-300 hover:text-paper">
      <span aria-hidden="true" className="h-px w-0 bg-accent transition-all duration-500 group-hover:mr-2 group-hover:w-4" />
      {children}
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIAL_LABEL: Record<SocialPlatform, string> = { instagram: 'INSTAGRAM', youtube: 'YOUTUBE', linkedin: 'LINKEDIN', blog: 'BLOG' };

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const currentYear = new Date().getFullYear();
  const showCta = !NO_CTA_EXACT.includes(pathname) && !NO_CTA_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <footer className="relative bg-ink text-paper" role="contentinfo">
      {/* ── 1) 문의 구역 ───────────────────────────────── */}
      {showCta && (
        <Spotlight as="section" className="overflow-hidden border-t border-paper/10">
          <div className="wrap section-y relative text-center" data-cta-area="footer">
            <Reveal>
              <p className="t-label text-paper/55">CONTACT</p>
            </Reveal>
            <Title
              en={["LET'S MAKE", 'IT REAL.']}
              ko={ko ? '다음 현장을 함께 만들어요' : undefined}
              size="h1"
              className="mt-7"
            />
            <Reveal delay={150} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Btn href={QUOTE_HREF} variant="fill" arrow>{ko ? '온라인 견적 받기' : 'Get an online estimate'}</Btn>
              <Btn href="/contact">{ko ? '프로젝트 문의하기' : 'Start a project'}</Btn>
            </Reveal>
            <Reveal delay={220} className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-sm font-semibold tracking-[0.12em] text-paper/55">
              <PhoneLinks lang={lang} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" separator={false} labelClassName="font-sans text-[0.8rem] font-medium tracking-normal text-paper/40" linkClassName="transition-colors hover:text-paper" />
              <span aria-hidden="true" className="h-3 w-px bg-paper/25" />
              <a href={`mailto:${CONTACT.email}`} className="uppercase transition-colors hover:text-paper">{CONTACT.email}</a>
            </Reveal>
          </div>
        </Spotlight>
      )}

      {/* ── 2) 링크 + 사업자 정보 ──────────────────────── */}
      <div className="border-t border-paper/10">
        <div className="wrap grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="lg:col-span-4">
            <Link href="/" className="font-display text-2xl font-extrabold tracking-[0.01em] text-paper">NEANDER</Link>
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-paper/60">
              {ko ? '체험형 AI 콘텐츠 기획사' : 'Experiential AI content agency'}
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {(Object.entries(SOCIAL_LINKS) as [SocialPlatform, string][])
                .filter(([, url]) => Boolean(url))
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-label inline-flex items-center gap-2.5 text-paper/55 transition-colors hover:text-paper"
                  >
                    {platform === 'instagram' && <InstagramIcon />}
                    {SOCIAL_LABEL[platform]}
                  </a>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h3 className="t-label mb-5 text-paper">SERVICES{ko && <span className="ml-2 font-body text-[11px] font-medium normal-case tracking-normal text-paper/40">{t('columns.services.title')}</span>}</h3>
              <ul className="flex flex-col gap-3">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.key}><FooterLink href={link.href}>{SERVICE_TEXT[link.key].name[lang]}</FooterLink></li>
                ))}
                <li><FooterLink href="/development">{tNav('development')}</FooterLink></li>
              </ul>
            </div>
            <div>
              <h3 className="t-label mb-5 text-paper">COMPANY{ko && <span className="ml-2 font-body text-[11px] font-medium normal-case tracking-normal text-paper/40">{t('columns.company.title')}</span>}</h3>
              <ul className="flex flex-col gap-3">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.labelKey}><FooterLink href={link.href}>{t(`columns.company.${link.labelKey}`)}</FooterLink></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="t-label mb-5 text-paper">SUPPORT{ko && <span className="ml-2 font-body text-[11px] font-medium normal-case tracking-normal text-paper/40">{t('columns.support.title')}</span>}</h3>
              <ul className="flex flex-col gap-3">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.labelKey}><FooterLink href={link.href}>{t(`columns.support.${link.labelKey}`)}</FooterLink></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="wrap border-t border-paper/10 py-7">
          <div className="flex flex-col gap-1.5 text-xs leading-relaxed text-paper/40">
            <p>{t('companyInfo')}</p>
            <p>
              {t('businessInfo.address')}: {CONTACT.officeAddress[lang]}
              {' | '}
              {t('businessInfo.phone')}:{' '}
              <PhoneLinks lang={lang} linkClassName="hover:text-paper" />
              {' | '}
              {t('businessInfo.email')}:{' '}
              <a href={`mailto:${CONTACT.email}`} className="hover:text-paper">{CONTACT.email}</a>
            </p>
            <p>
              {t('businessInfo.privacyOfficer')}: {t('businessInfo.privacyOfficerName')} ({CONTACT.email})
              {' | '}
              <Link href="/privacy" className="font-semibold text-paper/70 hover:text-paper">{t('privacyLink')}</Link>
            </p>
            <p className="mt-2 text-paper/30">{t('copyright', { year: currentYear })}</p>
          </div>
        </div>
      </div>

      {/* ── 3) 큰 글자 ─────────────────────────────────── */}
      <div aria-hidden="true" className="overflow-hidden border-t border-paper/10">
        <div className="wrap">
          <p className="flex select-none justify-between font-display text-[10.5vw] font-extrabold uppercase leading-[0.82] tracking-[-0.02em] min-[1760px]:text-[11.6rem]">
            {'NEANDER'.split('').map((ch, i) => (
              <span
                key={i}
                className="text-outline translate-y-[0.12em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-y-[0.04em] hover:text-paper"
              >
                {ch}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
