'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Link, usePathname } from '@/i18n/navigation';
import { CONTACT } from '@/lib/constants';
import { PhoneLinks } from '@/components/site/PhoneLinks';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { SITE_NAV } from '@/components/site/nav';
import LanguageToggle from './LanguageToggle';

/* 휴대폰 · 좁은 화면 메뉴 — 화면 전체를 덮고 큰 영어 메뉴가 차례로 올라온다 */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MobileMenu() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const ko = locale !== 'en';
  const pathname = usePathname();
  const open = useUIStore((s) => s.isMobileMenuOpen);
  const setOpen = useUIStore((s) => s.setMobileMenuOpen);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // 페이지를 옮기면 닫는다
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const items = [...SITE_NAV, { path: '/quote' as const, en: 'Quote', key: 'quote' as const }];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('menu')}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 flex flex-col overflow-y-auto bg-ink xl:hidden"
          style={{ zIndex: 'calc(var(--z-header) - 1)' }}
          data-lenis-prevent
        >
          <nav className="wrap flex flex-1 flex-col justify-center pb-6 pt-20" aria-label={ko ? '주 메뉴' : 'Main navigation'}>
            <ul className="border-t border-paper/15">
              {items.map((item, i) => {
                const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <li key={item.path} className="overflow-hidden border-b border-paper/15">
                    <motion.div
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.05 }}
                    >
                      <Link
                        href={item.path}
                        aria-current={active ? 'page' : undefined}
                        // 지금 보고 있는 페이지의 메뉴를 눌러도 닫힌다 (주소가 안 바뀌어 아래 effect 가 돌지 않는다)
                        onClick={() => setOpen(false)}
                        // 가장 긴 EXPERIENCES 가 한 줄에 들어가는 크기. 한글 이름이 옆에 안 들어가면 다음 줄 오른쪽으로 내려간다
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-[clamp(0.55rem,1.6vh,1.1rem)]"
                      >
                        <span aria-hidden={ko ? true : undefined} className={cn('font-display text-[clamp(1.25rem,7vw,3rem)] font-extrabold uppercase leading-none tracking-[-0.01em]', active ? 'text-accent' : 'text-paper')}>
                          {item.en}
                        </span>
                        {ko && <span className="ml-auto shrink-0 text-sm font-medium text-paper/55">{t(item.key)}</span>}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-4 flex flex-wrap items-end justify-between gap-6"
            >
              {/* 전화 · 메일은 누르기 쉽게 40px 높이 — 대신 위 메뉴 줄 간격을 조금 줄여 아이폰 13 높이(약 660px)에 메뉴가 다 들어가게 했다 */}
              <div>
                <PhoneLinks lang={ko ? 'ko' : 'en'} separator={false} className="flex flex-col" labelClassName="inline-block w-16 text-sm text-paper/50" linkClassName="inline-flex min-h-10 items-center font-display text-xl font-bold tracking-[0.02em] text-paper" />
                <a href={`mailto:${CONTACT.email}`} className="flex min-h-10 items-center text-sm text-paper/60">{CONTACT.email}</a>
              </div>
              <LanguageToggle />
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
