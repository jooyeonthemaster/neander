export interface PortfolioProject {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  year: number;
  category: 'popup' | 'festival' | 'exhibition' | 'brand' | 'store';
  tags: string[];
  image: string;
  images: string[];
  services: string[];
  client: string;
  location: string;
  featured: boolean;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'cross-the-line',
    titleKey: 'crossTheLine',
    descriptionKey: 'crossTheLineDesc',
    year: 2022,
    category: 'exhibition',
    tags: ['mediaArt', 'immersive', 'liveMusic'],
    image: '/images/portfolio/cross-the-line-1.webp',
    images: [
      '/images/portfolio/cross-the-line-1.webp',
      '/images/portfolio/cross-the-line-2.webp',
      '/images/portfolio/cross-the-line-3.webp',
      '/images/portfolio/cross-the-line-4.webp',
    ],
    services: ['mediaArt', 'spatialDesign'],
    client: '한국콘텐츠진흥원',
    location: '서울',
    featured: true,
  },
  {
    slug: 'acscent-sinchon',
    titleKey: 'acscentSinchon',
    descriptionKey: 'acscentSinchonDesc',
    year: 2023,
    category: 'store',
    tags: ['ai', 'scent', 'experience'],
    image: '/images/portfolio/acscent-sinchon-1.webp',
    images: [
      '/images/portfolio/acscent-sinchon-1.webp',
      '/images/portfolio/acscent-sinchon-2.webp',
      '/images/portfolio/acscent-sinchon-3.webp',
      '/images/portfolio/acscent-sinchon-4.webp',
    ],
    services: ['acscent', 'spatialDesign', 'custom'],
    client: '자체 프로젝트',
    location: '서울 신촌',
    featured: true,
  },
  {
    slug: 'jecheon-music-film-festival',
    titleKey: 'jecheonMusicFilm',
    descriptionKey: 'jecheonFestivalDesc',
    year: 2024,
    category: 'festival',
    tags: ['ai', 'scent', 'festival', 'film'],
    image: '/images/portfolio/jecheon-festival-1.webp',
    images: [
      '/images/portfolio/jecheon-festival-1.webp',
      '/images/portfolio/jecheon-festival-2.webp',
      '/images/portfolio/jecheon-festival-3.webp',
      '/images/portfolio/jecheon-festival-4.webp',
      '/images/portfolio/jecheon-festival-5.webp',
    ],
    services: ['acscent', 'spatialDesign', 'custom'],
    client: '제천국제음악영화제',
    location: '제천',
    featured: true,
  },
  {
    slug: 'seoul-writers-festival',
    titleKey: 'seoulWritersFestival',
    descriptionKey: 'seoulWritersDesc',
    year: 2024,
    category: 'festival',
    tags: ['ai', 'scent', 'literature', 'bookPerfume'],
    image: '/images/portfolio/seoul-writers-1.webp',
    images: [
      '/images/portfolio/seoul-writers-1.webp',
      '/images/portfolio/seoul-writers-2.webp',
      '/images/portfolio/seoul-writers-3.webp',
      '/images/portfolio/seoul-writers-4.webp',
    ],
    services: ['acscent', 'custom'],
    client: '서울국제작가축제',
    location: '서울',
    featured: false,
  },
  {
    slug: 'ansan-science-festival',
    titleKey: 'ansanScienceFestival',
    descriptionKey: 'ansanScienceDesc',
    year: 2025,
    category: 'festival',
    tags: ['ai', 'photoBooth', 'science'],
    image: '/images/portfolio/ansan-science-1.webp',
    images: [
      '/images/portfolio/ansan-science-1.webp',
      '/images/portfolio/ansan-science-2.webp',
      '/images/portfolio/ansan-science-3.webp',
    ],
    services: ['photoBooth', 'rental'],
    client: '안산시',
    location: '안산',
    featured: false,
  },
  {
    slug: 'acscent-wau',
    titleKey: 'acscentWau',
    descriptionKey: 'acscentWauDesc',
    year: 2024,
    category: 'store',
    tags: ['ai', 'scent', 'experience'],
    image: '/images/portfolio/acscent-wau-1.webp',
    images: [
      '/images/portfolio/acscent-wau-1.webp',
      '/images/portfolio/acscent-wau-2.webp',
      '/images/portfolio/acscent-wau-3.webp',
      '/images/portfolio/acscent-wau-4.webp',
    ],
    services: ['acscent', 'spatialDesign'],
    client: '자체 프로젝트',
    location: '서울 와우',
    featured: false,
  },
  {
    slug: 'acscent-id',
    titleKey: 'acscentId',
    descriptionKey: 'acscentIdDesc',
    year: 2025,
    category: 'store',
    tags: ['ai', 'scent', 'flagship'],
    image: '/images/portfolio/acscent-id-1.webp',
    images: [
      '/images/portfolio/acscent-id-1.webp',
      '/images/portfolio/acscent-id-2.webp',
      '/images/portfolio/acscent-id-3.webp',
      '/images/portfolio/acscent-id-4.webp',
    ],
    services: ['acscent', 'spatialDesign', 'custom'],
    client: '자체 프로젝트',
    location: '안산',
    featured: true,
  },
];

export const portfolioCategories = [
  'all',
  'popup',
  'festival',
  'exhibition',
  'brand',
  'store',
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number];
