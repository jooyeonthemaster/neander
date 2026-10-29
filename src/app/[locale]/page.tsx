import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { FeaturedPortfolio } from '@/components/home/FeaturedPortfolio';
import { FlagshipStore } from '@/components/home/FlagshipStore';
import { CTASection } from '@/components/home/CTASection';
import { ScrollOverlayHome } from '@/components/home/ScrollOverlayHome';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates('/', locale) };
}

export default function HomePage() {
  return (
    <ScrollOverlayHome>
      <HeroSection />
      <ServicesOverview />
      <FlagshipStore />
      <FeaturedPortfolio />
      <CTASection />
    </ScrollOverlayHome>
  );
}
