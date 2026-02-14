'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useUIStore } from '@/stores/uiStore';
import LanguageToggle from './LanguageToggle';
import { useEffect } from 'react';
import { CONTACT } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────
   Mobile Menu
   Full-screen overlay with staggered link animations
   ───────────────────────────────────────────────────────── */

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const panelVariants: Variants = {
  closed: { x: '100%' },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

const linkVariants: Variants = {
  closed: { opacity: 0, x: 40 },
  open: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function MobileMenu() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  function handleClose() {
    setMobileMenuOpen(false);
  }

  return (
    <AnimatePresence mode="wait">
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="mobile-menu-backdrop"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
            style={{ zIndex: 'var(--z-overlay)' }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.div
            key="mobile-menu-panel"
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 flex w-full max-w-sm flex-col bg-white"
            style={{ zIndex: 'var(--z-modal)' }}
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
          >
            {/* Close button */}
            <div className="flex items-center justify-end p-6">
              <button
                onClick={handleClose}
                aria-label={t('close')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
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
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-6 py-4" aria-label="Mobile navigation">
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.path);

                  return (
                    <motion.li key={item.path} variants={linkVariants}>
                      <Link
                        href={item.path}
                        onClick={handleClose}
                        className={cn(
                          'block rounded-xl px-4 py-3.5 font-display text-2xl font-semibold tracking-tight transition-colors',
                          isActive
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-neutral-800 hover:bg-neutral-50 hover:text-neutral-950',
                        )}
                      >
                        {t(item.labelKey.replace('nav.', ''))}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom section: Language + contact */}
            <motion.div
              variants={linkVariants}
              className="border-t border-neutral-100 px-6 py-6"
            >
              <div className="flex items-center justify-between">
                <LanguageToggle />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-sm font-medium text-neutral-500 transition-colors hover:text-teal-600"
                >
                  {CONTACT.email}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
