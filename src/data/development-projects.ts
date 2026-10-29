export type DevelopmentCategory = 'web' | 'commerce' | 'ai' | 'platform' | 'interactive';

export type LocalizedProjectText = {
  ko: string;
  en: string;
};

export interface DevelopmentProject {
  id: string;
  name: LocalizedProjectText;
  client: string;
  description: LocalizedProjectText;
  category: DevelopmentCategory;
  tags: readonly string[];
  url: string;
  image: string;
  accent: string;
}

/** Project descriptions reflect the supplied scope, without inferred results or technology stacks. */
export const DEVELOPMENT_PROJECTS: readonly DevelopmentProject[] = [
  {
    id: 'ansan-science',
    name: { ko: '2026 안산 과학축제', en: '2026 Ansan Science Festival' },
    client: 'ANSAN SCIENCE FESTIVAL',
    description: {
      ko: '2026 안산 과학축제의 정보와 분위기를 온라인으로 전하는 행사 웹사이트.',
      en: 'An event website introducing the 2026 Ansan Science Festival.',
    },
    category: 'web',
    tags: ['Festival', 'Website'],
    url: 'https://asv-2026-delta.vercel.app/',
    image: '/images/development/ansan-science.webp',
    accent: '#DCEAE6',
  },
  {
    id: 'smoat',
    name: { ko: 'SMOAT', en: 'SMOAT' },
    client: 'SMOAT',
    description: {
      ko: '영어 내신 문제 제작에 AI를 활용하는 교육 솔루션.',
      en: 'An AI solution for generating English exam questions.',
    },
    category: 'ai',
    tags: ['AI', 'Education'],
    url: 'https://www.smoat.co.kr/',
    image: '/images/development/smoat.webp',
    accent: '#E0E6F3',
  },
  {
    id: 'ikseonjae',
    name: { ko: '익선재', en: 'Ikseonjae' },
    client: 'IKSEONJAE',
    description: {
      ko: '한식 디저트 브랜드 익선재의 제품과 정체성을 담은 브랜드 자사몰.',
      en: 'A direct-to-consumer store for Korean dessert brand Ikseonjae.',
    },
    category: 'commerce',
    tags: ['E-commerce', 'Food & Beverage'],
    url: 'https://ikseonjae.com/',
    image: '/images/development/ikseonjae.webp',
    accent: '#ECE5D9',
  },
  {
    id: 'booth-3d',
    name: { ko: '3D 부스 설계', en: '3D Booth Design' },
    client: 'BOOTH DESIGN',
    description: {
      ko: '부스 설치와 공간 설계를 3D 모델링으로 구체화하는 웹사이트.',
      en: 'A 3D modeling website for planning booth installations and layouts.',
    },
    category: 'interactive',
    tags: ['3D', 'Spatial Design'],
    url: 'https://jjin-booth-lite.vercel.app/',
    image: '',
    accent: '#E3E8EB',
  },
  {
    id: 'jimff-run',
    name: { ko: 'JIMFF RUN', en: 'JIMFF RUN' },
    client: 'JECHEON INTERNATIONAL MUSIC & FILM FESTIVAL',
    description: {
      ko: '제천국제음악영화제를 게임으로 경험하는 체험형 콘텐츠.',
      en: 'An experiential game developed for the Jecheon International Music & Film Festival.',
    },
    category: 'interactive',
    tags: ['Festival', 'Game', 'Interactive Web'],
    url: 'https://jimffrun.vercel.app/',
    image: '/images/development/jimff-run.webp',
    accent: '#E8E2F3',
  },
  {
    id: 'jimff-ai-perfumer',
    name: { ko: 'JIMFF AI 조향', en: 'JIMFF AI Perfumer' },
    client: 'JECHEON INTERNATIONAL MUSIC & FILM FESTIVAL',
    description: {
      ko: '제천국제음악영화제를 위한 AI 기반 조향 체험 솔루션.',
      en: 'An AI-powered perfume-making experience for the Jecheon International Music & Film Festival.',
    },
    category: 'ai',
    tags: ['AI', 'Fragrance', 'Festival'],
    url: 'https://jimff-ai-perfumer.vercel.app/',
    image: '/images/development/jimff-ai-perfumer.webp',
    accent: '#E5EAD8',
  },
  {
    id: 'morak',
    name: { ko: '모락 AI 키오스크', en: 'Morak AI Kiosk' },
    client: 'MORAK',
    description: {
      ko: '매장 방문객에게 음식을 추천하는 AI 키오스크 솔루션.',
      en: 'An AI kiosk solution that recommends food to store visitors.',
    },
    category: 'ai',
    tags: ['AI', 'Kiosk', 'Food & Beverage'],
    url: 'https://morak-kiosk.vercel.app/',
    image: '/images/development/morak.webp',
    accent: '#F1E2D4',
  },
  {
    id: 'stamp-tour',
    name: { ko: '축제 스탬프투어', en: 'Festival Stamp Tour' },
    client: 'FESTIVAL STAMP TOUR',
    description: {
      ko: '축제 현장에서 사용하는 행사 전용 스탬프투어 프로그램.',
      en: 'A dedicated stamp-tour program for festival experiences.',
    },
    category: 'platform',
    tags: ['Festival', 'Stamp Tour'],
    url: 'https://neander-stamp.vercel.app/dju',
    image: '/images/development/stamp-tour.webp',
    accent: '#F0E6D8',
  },
  {
    id: 'kwave-dance',
    name: { ko: 'K-WAVE 댄스 페스티벌', en: 'K-WAVE Dance Festival' },
    client: 'K-WAVE DANCE FESTIVAL',
    description: {
      ko: '이태원 K-WAVE 댄스 페스티벌을 소개하는 행사 웹사이트.',
      en: 'An event website for the K-WAVE Dance Festival in Itaewon.',
    },
    category: 'web',
    tags: ['Festival', 'Website'],
    url: 'https://k-wavedance.co.kr/',
    image: '/images/development/kwave-dance.webp',
    accent: '#E8DEF0',
  },
  {
    id: 'okto',
    name: { ko: '옥토 미디어아트', en: 'OKTO Media Art' },
    client: 'OKTO',
    description: {
      ko: '미디어아트 포트폴리오를 인터랙티브한 웹 경험으로 선보이는 웹사이트.',
      en: 'An interactive portfolio website showcasing media art.',
    },
    category: 'interactive',
    tags: ['Media Art', 'Interactive Web'],
    url: 'https://okto-moon-rabbit.vercel.app/',
    image: '/images/development/okto.webp',
    accent: '#E0E2EA',
  },
  {
    id: 'surisuri',
    name: { ko: '수리수리', en: 'Surisuri' },
    client: 'SURISURI',
    description: {
      ko: '수학 학습 콘텐츠에 AI를 접목한 교육 서비스.',
      en: 'An educational service combining AI with mathematics learning content.',
    },
    category: 'ai',
    tags: ['AI', 'Education', 'Mathematics'],
    url: 'https://surisuri.vercel.app/',
    image: '/images/development/surisuri.webp',
    accent: '#E4E3F2',
  },
  {
    id: 'tea',
    name: { ko: '독서 취향 기반 AI 티 추천', en: 'AI Tea Pairing' },
    client: 'AI TEA PAIRING',
    description: {
      ko: '독서 취향을 바탕으로 어울리는 차를 추천하는 AI 프로그램.',
      en: 'An AI program recommending tea based on reading preferences.',
    },
    category: 'ai',
    tags: ['AI', 'Recommendation', 'Tea'],
    url: 'https://tea-gamma-ashen.vercel.app/',
    image: '/images/development/tea.webp',
    accent: '#E2E8DC',
  },
  {
    id: 'daleum',
    name: { ko: 'DALEUM', en: 'DALEUM' },
    client: 'DALEUM',
    description: {
      ko: 'AI를 접목한 발효 곤약 판매를 위한 브랜드 자사몰.',
      en: 'A brand-owned store combining fermented konjac sales with AI.',
    },
    category: 'commerce',
    tags: ['E-commerce', 'AI', 'Food & Beverage'],
    url: 'https://daleum.shop/',
    image: '/images/development/daleum.webp',
    accent: '#EAE6DA',
  },
  {
    id: 'middle-grammar',
    name: { ko: 'AI 영어 강의 플랫폼', en: 'AI English Learning Platform' },
    client: 'MIDDLE GRAMMAR',
    description: {
      ko: 'AI를 활용한 영어 강의를 제공하는 학습 플랫폼.',
      en: 'A learning platform for AI-powered English lessons.',
    },
    category: 'platform',
    tags: ['AI', 'Education', 'Learning Platform'],
    url: 'https://middle-grammar-green.vercel.app/',
    image: '/images/development/middle-grammar.webp',
    accent: '#DBE9E4',
  },
  {
    id: 'darumdaum',
    name: { ko: '다름다움 페스티벌', en: 'Darumdaum Festival' },
    client: 'DARUMDAUM FESTIVAL',
    description: {
      ko: '다름다움 페스티벌의 이야기를 전하는 행사 웹사이트.',
      en: 'An event website introducing Darumdaum Festival.',
    },
    category: 'web',
    tags: ['Festival', 'Website'],
    url: 'https://darumdaum.com/',
    image: '/images/development/darumdaum.webp',
    accent: '#F0E1E2',
  },
  {
    id: 'pinlight',
    name: { ko: '핀라이트', en: 'PINLIGHT' },
    client: 'PINLIGHT',
    description: {
      ko: 'AI 아이돌과의 대화를 중심으로 구성한 채팅 플랫폼.',
      en: 'A chat platform for conversations with AI idols.',
    },
    category: 'platform',
    tags: ['AI', 'Chat', 'Entertainment'],
    url: 'https://pinlight.vercel.app/',
    image: '/images/development/pinlight.webp',
    accent: '#E8E0EE',
  },
  {
    id: 'aible',
    name: { ko: 'AIBLE', en: 'AIBLE' },
    client: 'AIBLE',
    description: {
      ko: '매장 메뉴 추천에 AI 에이전트를 활용하는 구축 솔루션.',
      en: 'A solution for building AI agents that recommend store menus.',
    },
    category: 'ai',
    tags: ['AI Agent', 'Recommendation', 'Food & Beverage'],
    url: 'https://frontend-ten-mu-42.vercel.app/',
    image: '/images/development/aible.webp',
    accent: '#DEE8EC',
  },
  {
    id: 'tomato-club',
    name: { ko: '토마토클럽', en: 'Tomato Club' },
    client: 'TOMATO CLUB',
    description: {
      ko: '토마토클럽의 브랜드와 제품을 담아낸 자사몰.',
      en: 'A direct-to-consumer store presenting Tomato Club and its products.',
    },
    category: 'commerce',
    tags: ['E-commerce', 'Brand Website'],
    url: 'https://tomato-club.vercel.app/',
    image: '/images/development/tomato-club.webp',
    accent: '#EEDFD9',
  },
  {
    id: 'suhn',
    name: { ko: 'SUHN', en: 'SUHN' },
    client: 'SUHN',
    description: {
      ko: '의류·패션 브랜드 SUHN의 컬렉션을 선보이는 브랜드 자사몰.',
      en: 'A brand-owned online store showcasing fashion label SUHN.',
    },
    category: 'commerce',
    tags: ['E-commerce', 'Fashion'],
    url: 'https://suhn-lac.vercel.app/',
    image: '/images/development/suhn.webp',
    accent: '#E8E5E1',
  },
  {
    id: 'goseorak',
    name: { ko: '고서 메타버스 전시관', en: 'Rare Books Metaverse Gallery' },
    client: 'GOSEORAK',
    description: {
      ko: '고서를 가상 전시 공간에서 소개하는 메타버스 전시관.',
      en: 'A metaverse gallery introducing rare books in a virtual exhibition space.',
    },
    category: 'interactive',
    tags: ['Metaverse', 'Virtual Exhibition'],
    url: 'https://goseorak.vercel.app/gallery',
    image: '/images/development/goseorak.webp',
    accent: '#E9E2D7',
  },
  {
    id: 'linkbridge',
    name: { ko: '링크브릿지', en: 'Linkbridge' },
    client: 'LINKBRIDGE',
    description: {
      ko: '외국인 구직자와 일자리를 연결하는 직업 매칭 플랫폼.',
      en: 'A job-matching platform connecting foreign job seekers with employment opportunities.',
    },
    category: 'platform',
    tags: ['Job Matching', 'Platform'],
    url: 'https://linkbridgeworld.com/',
    image: '/images/development/linkbridge.webp',
    accent: '#E0E6EF',
  },
];
