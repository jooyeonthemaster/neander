'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setCursorVariant = useUIStore((s) => s.setCursorVariant);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
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
          scrolled
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
              className="group relative flex items-baseline gap-0 font-display text-xl font-extrabold tracking-tight text-neutral-900 lg:text-2xl"
            >
              <span className="transition-colors group-hover:text-neutral-700">
                NEANDER
              </span>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500 transition-transform group-hover:scale-125 lg:h-2 lg:w-2"
                aria-hidden="true"
              />
            </Link>

            {/* ── Center: Desktop Navigation ────────────────── */}
            <Navigation />

            {/* ── Right: Actions ─────────────────────────────── */}
            <div className="flex items-center gap-3">
              {/* Language toggle - desktop only */}
              <div className="hidden lg:block">
                <LanguageToggle />
              </div>

              {/* CTA button - desktop only */}
              <Link
                href="/quote"
                onMouseEnter={() => setCursorVariant('pointer')}
                onMouseLeave={() => setCursorVariant('default')}
                className="hidden items-center rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.97] lg:inline-flex"
              >
                {t('quote')}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                onMouseEnter={() => setCursorVariant('pointer')}
                onMouseLeave={() => setCursorVariant('default')}
                aria-label={isMobileMenuOpen ? t('close') : t('menu')}
                aria-expanded={isMobileMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
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
