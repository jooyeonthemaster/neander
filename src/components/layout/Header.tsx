'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useUIStore } from '@/stores/uiStore';
import Navigation from './Navigation';
import LanguageToggle from './LanguageToggle';
import MobileMenu from './MobileMenu';

/* ─────────────────────────────────────────────────────────
   Header
   Fixed glassmorphism header with scroll-aware transparency
   ───────────────────────────────────────────────────────── */

export default function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  // Home hero sits on dark photos — stay transparent with light text over it
  const onDarkHero = pathname === '/' && overHero;
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setCursorVariant = useUIStore((s) => s.setCursorVariant);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
      // The home hero fills the first viewport and the next section slides
      // over it, reaching the header at innerHeight - header height
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      setOverHero(window.scrollY < window.innerHeight - headerHeight);
    }

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
          delay: 0.1,
        }}
        className={cn(
          'fixed top-0 right-0 left-0 transition-all duration-300',
          scrolled && !onDarkHero
            ? 'glass border-b border-neutral-200/50 shadow-sm'
            : 'bg-transparent',
        )}
        style={{ zIndex: 'var(--z-header)' }}
      >
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-white"
        >
          {t('home')}
        </a>

        <div className="container-wide">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* ── Left: Logo ────────────────────────────────── */}
            <Link
              href="/"
              onMouseEnter={() => setCursorVariant('pointer')}
              onMouseLeave={() => setCursorVariant('default')}
              className={cn(
                'group relative flex items-baseline gap-0 font-display text-xl font-extrabold tracking-tight lg:text-2xl',
                onDarkHero ? 'text-white' : 'text-neutral-900',
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  onDarkHero ? 'group-hover:text-white/80' : 'group-hover:text-neutral-700',
                )}
              >
                NEANDER
              </span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500 transition-transform group-hover:scale-125 lg:h-2 lg:w-2"
                aria-hidden="true"
              />
            </Link>

            {/* ── Center: Desktop Navigation ────────────────── */}
            <Navigation inverted={onDarkHero} />

            {/* ── Right: Actions ─────────────────────────────── */}
            <div className="flex items-center gap-3">
              {/* Language toggle - desktop only */}
              <div className="hidden lg:block">
                <LanguageToggle inverted={onDarkHero} />
              </div>

              {/* CTA button - desktop only (문의하기·견적 계산을 한 페이지로 합쳐 버튼도 하나) */}
              <Link
                href="/contact"
                onMouseEnter={() => setCursorVariant('pointer')}
                onMouseLeave={() => setCursorVariant('default')}
                className="hidden items-center rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.97] lg:inline-flex"
              >
                {t('contact')}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                onMouseEnter={() => setCursorVariant('pointer')}
                onMouseLeave={() => setCursorVariant('default')}
                aria-label={isMobileMenuOpen ? t('close') : t('menu')}
                aria-expanded={isMobileMenuOpen}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden',
                  onDarkHero ? 'text-white hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100',
                )}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <motion.line
                    x1="3"
                    x2="17"
                    y1="5"
                    y2="5"
                    initial={{ y1: 5, y2: 5, rotate: 0 }}
                    animate={{
                      y1: isMobileMenuOpen ? 10 : 5,
                      y2: isMobileMenuOpen ? 10 : 5,
                      rotate: isMobileMenuOpen ? 45 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: 'center' }}
                  />
                  <motion.line
                    x1="3"
                    y1="10"
                    x2="17"
                    y2="10"
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      scaleX: isMobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                  />
                  <motion.line
                    x1="3"
                    x2="17"
                    y1="15"
                    y2="15"
                    initial={{ y1: 15, y2: 15, rotate: 0 }}
                    animate={{
                      y1: isMobileMenuOpen ? 10 : 15,
                      y2: isMobileMenuOpen ? 10 : 15,
                      rotate: isMobileMenuOpen ? -45 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: 'center' }}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu (portal-like, rendered alongside header) */}
      <MobileMenu />
    </>
  );
}
