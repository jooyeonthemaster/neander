import { HeroSection } from '@/components/home/HeroSection';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { StatsCounter } from '@/components/home/StatsCounter';
import { FeaturedPortfolio } from '@/components/home/FeaturedPortfolio';
import { ClientLogos } from '@/components/home/ClientLogos';
import { FlagshipStore } from '@/components/home/FlagshipStore';
import { CTASection } from '@/components/home/CTASection';
import { ScrollOverlayHome } from '@/components/home/ScrollOverlayHome';

export default function HomePage() {
  return (
    <ScrollOverlayHome>
      <HeroSection />
      <ServicesOverview />
      <FlagshipStore />
      <StatsCounter />
      <FeaturedPortfolio />
      <ClientLogos />
      <CTASection />
    </ScrollOverlayHome>
  );
}
