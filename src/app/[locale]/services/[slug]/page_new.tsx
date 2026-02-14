import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ScrollReveal } from '@/components/animations';
import {
  experiences,
  getAllSlugs,
  getExperienceBySlug,
  getExperiencesByPillar,
  getExperiencesByIndustry,
  getPillarById,
  getIndustryById,
} from '@/data/experiences';
import { ExperienceDetailClient } from './ExperienceDetailClient';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const exp = getExperienceBySlug(slug);
  if (!exp) return { title: 'Not Found' };

  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    title: t(exp.nameKey),
    description: t(exp.oneLinerKey),
    openGraph: {
      title: t(exp.nameKey),
      description: t(exp.oneLinerKey),
    },
  };
}
