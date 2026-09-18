export interface TimelineEntry {
  year: number;
  titleKey: string;
  events: TimelineEvent[];
}

export interface TimelineEvent {
  titleKey: string;
  descriptionKey: string;
  icon?: string;
  /**
   * 호버 팝오버에 띄울 사진. 없으면 설명만 보여준다.
   * 설명 문구는 messages의 about.timeline.details.<titleKey> 에 있다.
   */
  image?: string;
}

export const timelineData: TimelineEntry[] = [
  {
    year: 2022,
    titleKey: 'year2022',
    events: [
      {
        titleKey: 'contentImpact',
        descriptionKey: 'contentImpactDesc',
        icon: '🏆',
      },
      {
        titleKey: 'crossTheLine',
        descriptionKey: 'crossTheLineDesc',
        icon: '🎭',
        image: '/images/portfolio/cross-the-line-1.webp',
      },
    ],
  },
  {
    year: 2023,
    titleKey: 'year2023',
    events: [
      {
        titleKey: 'preStartup',
        descriptionKey: 'preStartupDesc',
        icon: '🚀',
      },
      {
        titleKey: 'acscentSinchon',
        descriptionKey: 'acscentSinchonDesc',
        icon: '🧪',
        image: '/images/portfolio/acscent-sinchon-1.webp',
      },
      {
        titleKey: 'alleyStartup',
        descriptionKey: 'alleyStartupDesc',
        icon: '🏆',
      },
      {
        titleKey: 'seodaemunVenture',
        descriptionKey: 'seodaemunVentureDesc',
        icon: '🏅',
      },
    ],
  },
  {
    year: 2024,
    titleKey: 'year2024',
    events: [
      {
        titleKey: 'tourismVenture',
        descriptionKey: 'tourismVentureDesc',
        icon: '✈️',
      },
      {
        titleKey: 'campusTown',
        descriptionKey: 'campusTownDesc',
        icon: '🏫',
      },
      {
        titleKey: 'acscentWau',
        descriptionKey: 'acscentWauDesc',
        icon: '🧪',
        image: '/images/portfolio/acscent-wau-1.webp',
      },
      {
        titleKey: 'hahyunsangElegy',
        descriptionKey: 'hahyunsangElegyDesc',
        icon: '🎵',
        image: '/images/portfolio/hahyunsang-elegy-2024-1.webp',
      },
    ],
  },
  {
    year: 2025,
    titleKey: 'year2025',
    events: [
      {
        titleKey: 'youthStartup',
        descriptionKey: 'youthStartupDesc',
        icon: '🎓',
      },
      {
        titleKey: 'acscentId',
        descriptionKey: 'acscentIdDesc',
        icon: '🧪',
        image: '/images/portfolio/acscent-id-1.webp',
      },
      {
        titleKey: 'jecheonFestival',
        descriptionKey: 'jecheonFestivalDesc',
        icon: '🎬',
        image: '/images/portfolio/jecheon-music-film-festival-1.webp',
      },
      {
        titleKey: 'seoulWriters',
        descriptionKey: 'seoulWritersDesc',
        icon: '📖',
        image: '/images/portfolio/seoul-writers-festival-1.webp',
      },
      {
        titleKey: 'ansanScience',
        descriptionKey: 'ansanScienceDesc',
        icon: '🔬',
        image: '/images/portfolio/ansan-science-1.webp',
      },
    ],
  },
  {
    year: 2026,
    titleKey: 'year2026',
    events: [
      {
        titleKey: 'deepTechValueUp',
        descriptionKey: 'deepTechValueUpDesc',
        icon: '🚀',
      },
      {
        titleKey: 'ktoPerfumeClass',
        descriptionKey: 'ktoPerfumeClassDesc',
        icon: '✈️',
      },
      {
        titleKey: 'nflyingMd',
        descriptionKey: 'nflyingMdDesc',
        icon: '🎵',
        image: '/images/portfolio/nflying-into-rem-1.webp',
      },
      {
        titleKey: 'jimffOstFair',
        descriptionKey: 'jimffOstFairDesc',
        icon: '🎬',
        image: '/images/portfolio/jimff-2026-ost-fair-1.webp',
      },
    ],
  },
];
