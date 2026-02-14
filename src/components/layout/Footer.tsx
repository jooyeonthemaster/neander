'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SOCIAL_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

/* ─────────────────────────────────────────────────────────
   Footer
   Dark background with 3-column links, social, and legal
   ───────────────────────────────────────────────────────── */

/* ── Social icon SVGs ────────────────────────────────── */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function BlogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855Z" />
    </svg>
  );
}

const socialIcons = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  blog: BlogIcon,
} as const;

/* ── Footer link columns definition ──────────────────── */

const SERVICE_LINKS = [
  { labelKey: 'acscent' as const, href: '/services' },
  { labelKey: 'photobooth' as const, href: '/services' },
  { labelKey: 'mediaArt' as const, href: '/services' },
  { labelKey: 'spatialDesign' as const, href: '/services' },
  { labelKey: 'rental' as const, href: '/services' },
  { labelKey: 'custom' as const, href: '/services' },
];

const COMPANY_LINKS = [
  { labelKey: 'about' as const, href: '/about' },
  { labelKey: 'portfolio' as const, href: '/portfolio' },
  { labelKey: 'careers' as const, href: '#' },
  { labelKey: 'press' as const, href: '#' },
  { labelKey: 'blog' as const, href: '#' },
];

const SUPPORT_LINKS = [
  { labelKey: 'contact' as const, href: '/contact' },
  { labelKey: 'quote' as const, href: '/quote' },
  { labelKey: 'faq' as const, href: '#' },
  { labelKey: 'terms' as const, href: '#' },
  { labelKey: 'privacy' as const, href: '#' },
];

export default function Footer() {
  const t = useTranslations('footer');
  const setCursorVariant = useUIStore((s) => s.setCursorVariant);
  const currentYear = new Date().getFullYear();

  function FooterLink({
    href,
    children,
    external = false,
  }: {
    href: string;
    children: React.ReactNode;
    external?: boolean;
  }) {
    const classes = cn(
      'text-sm text-neutral-400 transition-colors duration-200 hover:text-teal-400',
    );

    if (external || href.startsWith('http')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          onMouseEnter={() => setCursorVariant('pointer')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={classes}
        onMouseEnter={() => setCursorVariant('pointer')}
        onMouseLeave={() => setCursorVariant('default')}
      >
        {children}
      </Link>
    );
  }

  return (
    <footer className="bg-neutral-950 text-neutral-300" role="contentinfo">
      {/* ── Top section ──────────────────────────────────── */}
      <div className="container-wide border-b border-neutral-800 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Logo + description */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-baseline font-display text-2xl font-extrabold tracking-tight text-white"
            >
              <span>NEANDER</span>
              <span
                className="inline-block h-2 w-2 rounded-full bg-teal-500"
                aria-hidden="true"
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {t('description')}
            </p>

            <p className="mt-2 text-sm font-medium text-teal-400">
              {t('tagline')}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {/* Services */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-200">
                {t('columns.services.title')}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.labelKey}>
                    <FooterLink href={link.href}>
                      {t(`columns.services.${link.labelKey}`)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-200">
                {t('columns.company.title')}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.labelKey}>
                    <FooterLink href={link.href}>
                      {t(`columns.company.${link.labelKey}`)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-200">
                {t('columns.support.title')}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.labelKey}>
                    <FooterLink href={link.href}>
                      {t(`columns.support.${link.labelKey}`)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div className="container-wide py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright + company info */}
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="text-xs text-neutral-500">
              {t('copyright', { year: currentYear })}
            </p>
            <p className="text-xs text-neutral-600">
              {t('companyInfo')}
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {(
              Object.entries(SOCIAL_LINKS) as [
                keyof typeof SOCIAL_LINKS,
                string,
              ][]
            ).map(([platform, url]) => {
              const Icon = socialIcons[platform];
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  onMouseEnter={() => setCursorVariant('pointer')}
                  onMouseLeave={() => setCursorVariant('default')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-neutral-800 hover:text-teal-400"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
