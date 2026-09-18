import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('errors.404');
  const tNav = await getTranslations('nav');

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-7xl font-extrabold tracking-tight text-teal-600 sm:text-8xl">
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {t('description')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-7 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
          >
            {t('backToHome')}
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-200 px-7 text-base font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            {tNav('portfolio')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-200 px-7 text-base font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            {tNav('contact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
