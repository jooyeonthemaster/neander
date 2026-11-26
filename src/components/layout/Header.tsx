'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { ScrollProgress } from '@/components/fx';
import { SITE_NAV } from '@/components/site/nav';
import LanguageToggle from './LanguageToggle';
import MobileMenu from './MobileMenu';

/* ─────────────────────────────────────────────────────────
   머리글 (2026-11 개편)
   · 맨 위에서는 투명, 내리면 어두운 유리판 + 진행 선
   · 아래로 내릴 때는 숨고, 위로 올리면 다시 나온다
   · 메뉴는 영어 큰 글자 + 작은 한국어 (영어판은 영어만)
   · 오른쪽 버튼은 「온라인 견적」 — 문의는 메뉴의 CONTACT
   ───────────────────────────────────────────────────────── */

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const ko = locale !== 'en';
  const [scrolled, setScrolled] = useState(false);
  // 어느 페이지에서 숨겼는지 기억해 두면, 페이지를 옮겼을 때 저절로 다시 보인다
  const [hiddenOn, setHiddenOn] = useState<string | null>(null);
  const hidden = hiddenOn === pathname;
  const last = useRef(0);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
    const delta = y - last.current;
    // 조금 흔들리는 스크롤에는 반응하지 않는다
    if (Math.abs(delta) > 6) {
      setHiddenOn(delta > 0 && y > 320 ? pathname : null);
      last.current = y;
    }
  });

  const onQuote = pathname === '/quote' || pathname.startsWith('/quote/');

  return (
    <>
      <motion.header
        animate={{ y: hidden && !isMobileMenuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0"
        style={{ zIndex: 'var(--z-header)' }}
      >
        {/* 유리판 — 맨 위에서는 투명 */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500',
            scrolled ? 'border-paper/10 bg-ink/75 backdrop-blur-xl' : 'border-transparent bg-transparent',
          )}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          {ko ? '본문으로 건너뛰기' : 'Skip to content'}
        </a>

        <div className="wrap relative">
          <div className="flex h-16 items-center justify-between gap-6 lg:h-20">
            {/* 로고 */}
            <Link href="/" className="group flex shrink-0 items-baseline" aria-label={ko ? '네안데르 홈' : 'NEANDER home'}>
              <span className="font-display text-[1.35rem] font-extrabold leading-none tracking-[0.01em] text-paper lg:text-[1.5rem]">NEANDER</span>
              {/* 영문 사명만으로는 읽는 법을 모르는 분이 많아 한글 이름을 작게 붙인다 */}
              <span className="font-logo-ko ml-2 text-[11px] font-medium tracking-[0.14em] text-paper/45 transition-colors group-hover:text-paper/80 lg:text-xs">네안데르</span>
            </Link>

            {/* 가운데 메뉴 */}
            <nav aria-label={ko ? '주 메뉴' : 'Main navigation'} className="hidden xl:block">
              <ul className="flex items-stretch gap-[clamp(1.25rem,2.2vw,2.5rem)]">
                {SITE_NAV.map((item) => {
                  const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        aria-current={active ? 'page' : undefined}
                        className="group relative flex h-20 flex-col items-center justify-center gap-1.5"
                      >
                        <span aria-hidden={ko ? true : undefined} className={cn('t-label !text-[0.74rem] !tracking-[0.2em] transition-colors', active ? 'text-paper' : 'text-paper/70 group-hover:text-paper')}>
                          {item.en}
                        </span>
                        {ko && (
                          <span className={cn('text-[11px] font-medium leading-none transition-colors', active ? 'text-paper/80' : 'text-paper/40 group-hover:text-paper/70')}>
                            {t(item.key)}
                          </span>
                        )}
                        {/* 밑줄: 현재 메뉴는 늘 보이고, 나머지는 올렸을 때 왼쪽에서 그려진다 */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-0 bottom-0 h-0.5 origin-left bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* 오른쪽 */}
            <div className="flex shrink-0 items-center gap-4 lg:gap-6">
              <div className="hidden xl:block">
                <LanguageToggle />
              </div>
              <Link
                href="/quote"
                aria-current={onQuote ? 'page' : undefined}
                className={cn(
                  'hidden h-10 items-center rounded-full border px-5 text-sm font-semibold transition-colors duration-300 sm:inline-flex',
                  onQuote ? 'border-paper bg-paper text-ink' : 'border-paper/70 text-paper hover:border-paper hover:bg-paper hover:text-ink',
                )}
              >
                {t('quote')}
              </Link>

              {/* 휴대폰 메뉴 버튼 */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t('close') : t('menu')}
                aria-expanded={isMobileMenuOpen}
                className="relative -mr-2 flex h-11 w-11 items-center justify-center xl:hidden"
              >
                <span className={cn('absolute h-px w-6 bg-paper transition-transform duration-300', isMobileMenuOpen ? 'rotate-45' : '-translate-y-[5px]')} />
                <span className={cn('absolute h-px w-6 bg-paper transition-transform duration-300', isMobileMenuOpen ? '-rotate-45' : 'translate-y-[5px]')} />
              </button>
            </div>
          </div>
        </div>

        <ScrollProgress className={cn('absolute inset-x-0 bottom-0 h-px bg-accent transition-opacity duration-500', scrolled ? 'opacity-100' : 'opacity-0')} />
      </motion.header>

      <MobileMenu />
    </>
  );
}
