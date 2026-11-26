import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactTabs } from '@/components/contact/ContactTabs';
import { getExperienceBySlug } from '@/data/experiences';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { redirect } from '@/i18n/navigation';
import { QUOTE_HREF, getServiceContactHref } from '@/lib/constants';
import { PageHero } from '@/components/site/PageHero';

interface Props {
  params: Promise<{ locale: string }>;
  /** 견적은 별도 페이지로, 개발 상담은 전용 문의 화면으로 연결한다. */
  searchParams: Promise<{ type?: string; service?: string }>;
}

const DEVELOPMENT_CONTACT = {
  ko: {
    title: '개발·AX 상담',
    subtitle: '어떤 서비스를 만들고 싶으신가요?',
    description: '웹사이트와 플랫폼 구축부터 AI 도입·업무 자동화까지. 목표와 필요한 기능, 일정 등 생각하고 계신 내용을 편하게 남겨주세요.',
  },
  en: {
    title: 'Development & AX consultation',
    subtitle: 'What would you like to build?',
    description: 'From websites and platforms to AI integration and workflow automation. Tell us about your goals, the features you need, and your timeline.',
  },
} as const;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { type } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const developmentCopy = type === 'development' ? DEVELOPMENT_CONTACT[locale === 'en' ? 'en' : 'ko'] : undefined;
  const title = developmentCopy?.title ?? t('title');
  const description = developmentCopy?.description ?? t('description');

  return {
    alternates: localeAlternates('/contact', locale),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { type, service } = await searchParams;
  const developmentInquiry = type === 'development';
  const initialService = !developmentInquiry && typeof service === 'string' && getExperienceBySlug(service) ? service : undefined;
  // 예전 견적 탭 주소는 온라인 견적 페이지로 넘긴다
  if (type === 'quote') {
    redirect({ href: initialService ? getServiceContactHref(initialService) : QUOTE_HREF, locale });
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  const developmentCopy = developmentInquiry ? DEVELOPMENT_CONTACT[locale === 'en' ? 'en' : 'ko'] : undefined;

  return (
    <main>
      {/* Hero banner */}
      <PageHero
        id="contact-hero-title"
        label="CONTACT"
        en={["LET'S TALK."]}
        ko={`${developmentCopy?.title ?? t('title')} — ${developmentCopy?.subtitle ?? t('subtitle')}`}
        lead={developmentCopy?.description ?? t('description')}
        size="h1"
      />

      {/* 간단 문의 / 견적 계산 */}
      <section className="bg-ink pb-[clamp(4rem,9vw,8rem)] pt-4" aria-labelledby="contact-form-title">
        <div className="wrap">
          <h2 id="contact-form-title" className="sr-only">
            {developmentCopy?.title ?? t('title')}
          </h2>
          <ContactTabs
            key={developmentInquiry ? 'development' : 'general'}
            initialTab="inquiry"
            initialService={initialService}
            developmentInquiry={developmentInquiry}
          />
        </div>
      </section>
    </main>
  );
}
