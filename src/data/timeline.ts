export interface TimelineEntry {
  year: number;
  titleKey: string;
  events: {
    titleKey: string;
    descriptionKey: string;
    icon?: string;
  }[];
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
        titleKey: 'acscentWau',
        descriptionKey: 'acscentWauDesc',
        icon: '🧪',
      },
      {
        titleKey: 'jecheonFestival',
        descriptionKey: 'jecheonFestivalDesc',
        icon: '🎬',
      },
      {
        titleKey: 'seoulWriters',
        descriptionKey: 'seoulWritersDesc',
        icon: '📖',
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
      },
      {
        titleKey: 'ansanScience',
        descriptionKey: 'ansanScienceDesc',
        icon: '🔬',
      },
    ],
  },
];
