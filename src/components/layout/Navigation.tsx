'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useUIStore } from '@/stores/uiStore';

/* ─────────────────────────────────────────────────────────
   Desktop Navigation
   Horizontal nav links with animated teal underline indicator
   ───────────────────────────────────────────────────────── */

interface NavigationProps {
  /** Light text for use over a dark background */
  inverted?: boolean;
}

export default function Navigation({ inverted = false }: NavigationProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const setCursorVariant = useUIStore((s) => s.setCursorVariant);

  // 문의하기는 헤더 오른쪽 버튼으로 보여주므로 가운데 메뉴에서는 뺀다
  const navItems = NAV_ITEMS.filter(
    (item) => item.path !== '/contact',
  );

  return (
    <nav aria-label="Main navigation" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path);

          return (
            <li key={item.path} className="relative">
              <Link
                href={item.path}
                onMouseEnter={() => setCursorVariant('pointer')}
                onMouseLeave={() => setCursorVariant('default')}
                className={cn(
                  'relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? inverted ? 'text-teal-300' : 'text-teal-600'
                    : inverted
                      ? 'text-white/75 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900',
                )}
              >
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {t(item.labelKey.replace('nav.', ''))}
                </motion.span>

                {/* Active underline indicator */}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-teal-500"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
