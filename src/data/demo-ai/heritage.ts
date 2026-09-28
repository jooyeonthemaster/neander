/* AI 문화유산 타임머신 — 데모 화면과 생성 API가 함께 쓰는 문화유산·시대 정보 */

export const HERITAGE_SITE_IDS = ['gyeongbok', 'bulguk', 'hwaseong', 'cheomseong'] as const;
export type HeritageSiteId = (typeof HERITAGE_SITE_IDS)[number];

type Sky = 'dawn' | 'day' | 'sunset' | 'night';

interface EraPrompt {
  site: HeritageSiteId;
  /** 화면의 era.year · era.label 과 같은 값 */
  year: string;
  label: string;
  sky: Sky;
  /** 이미지 생성용 장면 묘사 (영문) */
  scene: string;
  /** 이미지 생성용 복장 (영문) */
  costume: string;
  /** 해설 작성용 사실 (화면의 era.desc) */
  fact: string;
}

const JOSEON_EARLY = 'an elegant early-Joseon-period hanbok suited to the person (e.g. a scholar\'s dopo robe with a gat hat, or a jeogori and chima), modest and historically plausible, not royal attire';
const JOSEON_LATE = 'an elegant late-Joseon-period (18th century) hanbok suited to the person (e.g. a dopo robe with a gat hat, or a jeogori and full chima), modest and historically plausible, not royal attire';
const SILLA = 'a graceful Silla-period Korean costume suited to the person (long jacket with a sash over wide trousers or a long skirt, as seen in Silla figurines and murals), modest and historically plausible, not royal attire';
const MODERN = 'their own clothes from the reference photo, unchanged';

export const HERITAGE_ERAS: Record<string, EraPrompt> = {
  'gb-1395': {
    site: 'gyeongbok', year: '1395', label: '창건', sky: 'dawn',
    scene: 'the courtyard of Gyeongbokgung Palace in Seoul in 1395, freshly built: Geunjeongjeon throne hall with its two-tiered roof, colorful dancheong paint, stone-paved courtyard with rank stones, mountains behind',
    costume: JOSEON_EARLY,
    fact: '새 왕조의 법궁이 막 완성된 새벽이에요. 정도전이 궁궐과 전각의 이름을 지었어요.',
  },
  'gb-1443': {
    site: 'gyeongbok', year: '1443', label: '세종의 시대', sky: 'day',
    scene: 'the courtyard of Gyeongbokgung Palace in Seoul during King Sejong\'s reign (1443), lively and bright: Geunjeongjeon throne hall, colorful dancheong paint, stone-paved courtyard with rank stones, mountains behind',
    costume: JOSEON_EARLY,
    fact: '세종이 궁궐 안 집현전 학자들과 함께 훈민정음을 만든 해예요. 궁궐이 가장 활기찼던 시절이에요.',
  },
  'gb-1867': {
    site: 'gyeongbok', year: '1867', label: '중건', sky: 'sunset',
    scene: 'the courtyard of Gyeongbokgung Palace in Seoul in 1867, just rebuilt: Geunjeongjeon throne hall with fresh dancheong paint, stone-paved courtyard with rank stones, mountains behind',
    costume: JOSEON_LATE,
    fact: '임진왜란 때 불탄 뒤 270여 년 동안 비어 있던 궁궐을 흥선대원군이 다시 세웠어요.',
  },
  'bg-751': {
    site: 'bulguk', year: '751', label: '창건', sky: 'dawn',
    scene: 'Bulguksa Temple in Gyeongju in 751 as construction begins: great stone terraces and the Cheongungyo and Baegungyo stone stairway-bridges, wooden scaffolding on half-built halls, pine-covered hills behind',
    costume: SILLA,
    fact: '신라의 재상 김대성이 불국사를 짓기 시작한 해예요. 삼국유사에 그 이야기가 전해져요.',
  },
  'bg-774': {
    site: 'bulguk', year: '774', label: '통일신라 전성기', sky: 'day',
    scene: 'Bulguksa Temple in Gyeongju in 774, newly completed: Seokgatap and Dabotap stone pagodas in the courtyard, great stone terraces, the Cheongungyo and Baegungyo stone stairway-bridges, colorful wooden halls',
    costume: SILLA,
    fact: '20여 년의 공사 끝에 석가탑과 다보탑이 나란히 선 불국사가 모습을 드러냈어요.',
  },
  'bg-1995': {
    site: 'bulguk', year: '1995', label: '세계유산 등재', sky: 'sunset',
    scene: 'Bulguksa Temple in Gyeongju in 1995 as a visitor sees it: the great stone terraces and the Cheongungyo and Baegungyo stone stairway-bridges, wooden halls, autumn trees; styled like a warm 1990s film travel photo',
    costume: MODERN,
    fact: '석굴암과 함께 유네스코 세계유산이 되어 온 세계가 그 가치를 인정했어요.',
  },
  'hs-1794': {
    site: 'hwaseong', year: '1794', label: '축성 시작', sky: 'dawn',
    scene: 'Hwaseong Fortress in Suwon in 1794 during construction: stone walls rising, workers and a wooden geojunggi pulley crane lifting stones, Paldalmun gate taking shape',
    costume: JOSEON_LATE,
    fact: '정조의 명으로 성 쌓기가 시작됐어요. 정약용이 설계한 거중기가 무거운 돌을 들어 올렸어요.',
  },
  'hs-1795': {
    site: 'hwaseong', year: '1795', label: '을묘원행', sky: 'day',
    scene: 'Hwaseong Fortress in Suwon in 1795 during King Jeongjo\'s royal procession: the stone fortress walls and Paldalmun gate, colorful banners and flags, a festive crowd in the distance',
    costume: JOSEON_LATE,
    fact: '정조가 어머니 혜경궁 홍씨의 회갑 잔치를 화성 행궁에서 성대하게 열었어요.',
  },
  'hs-1796': {
    site: 'hwaseong', year: '1796', label: '완공', sky: 'sunset',
    scene: 'Hwaseong Fortress in Suwon in 1796, just completed: the long stone fortress wall with battlements, the two-tiered Paldalmun gate with its rounded ongseong wall, colorful flags',
    costume: JOSEON_LATE,
    fact: '착공 2년 9개월 만에 성곽이 완성됐어요. 모든 과정은 화성성역의궤에 꼼꼼히 기록됐어요.',
  },
  'cs-7c': {
    site: 'cheomseong', year: '7세기', label: '선덕여왕 시대', sky: 'night',
    scene: 'Cheomseongdae observatory in Gyeongju (Seorabeol) in the 7th century at night: the bottle-shaped stone tower with its square south window under a sky full of stars, open grassy field, faint torchlight',
    costume: SILLA,
    fact: '선덕여왕 때 서라벌 한가운데 별을 살피는 돌탑이 세워졌어요.',
  },
  'cs-8c': {
    site: 'cheomseong', year: '8세기', label: '통일신라 서라벌', sky: 'sunset',
    scene: 'Cheomseongdae observatory in Gyeongju (Seorabeol) in the 8th century at sunset: the bottle-shaped stone tower with its square south window, open grassy field, tiled roofs of the Silla capital in the distance',
    costume: SILLA,
    fact: '천문 관리들이 해·달·별의 움직임을 기록해 농사 달력과 나라의 앞날을 살폈어요.',
  },
  'cs-1962': {
    site: 'cheomseong', year: '1962', label: '국보 지정', sky: 'day',
    scene: 'Cheomseongdae observatory in Gyeongju in 1962 on a clear day: the bottle-shaped stone tower with its square south window, open grassy field; styled like a softly faded 1960s color film photo',
    costume: MODERN,
    fact: '1,300년 넘게 제자리를 지켜 온 가치를 인정받아 국보로 지정됐어요.',
  },
};

export const HERITAGE_SITE_LABELS: Record<HeritageSiteId, string> = {
  gyeongbok: '경복궁',
  bulguk: '불국사',
  hwaseong: '수원화성',
  cheomseong: '첨성대',
};

export const SKY_PROMPTS: Record<Sky, string> = {
  dawn: 'soft dawn light with a pink and violet sky',
  day: 'bright clear daylight with a blue sky',
  sunset: 'warm golden sunset light with an orange sky',
  night: 'moonlit night with a starry sky and warm torchlight on the person',
};

/** /api/demo-ai/heritage-timemachine 응답 */
export interface AiHeritage {
  /** 그 시대 장면 속 방문객 사진 (data:image/jpeg URL) */
  image: string;
  /** 음성으로 읽어 줄 해설 */
  narration: string;
  /** 사진 속 복장 한 줄 (예: '조선 전기 선비의 도포') */
  outfit: string;
}
