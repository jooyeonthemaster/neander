/**
 * Existing photo-result demos offered as quote templates, one experience per entry.
 * Names match messages/{ko,en}.json → services.exp; slugs match experiences.ts.
 * Every entry has an active demo, an image-generation spec, and photo-print output.
 * Demo links use /services?demo=<slug> (or /services/<slug> for a full page).
 *
 * Only the existing demo's styles, clothing, and backdrops are included here.
 * New brand assets, characters, outfits, or backgrounds belong to custom design.
 * Keep this module dependency-free so the quote engine never imports demo UI.
 */

export type PhotoBoothTemplateAppearance =
  | 'caricature'
  | 'hanbok'
  | 'runway'
  | 'retro'
  | 'idol'
  | 'photocard'
  | 'graduation'
  | 'history'
  | 'avatar'
  | 'traditional'
  | 'wedding';

export interface PhotoBoothTemplate {
  readonly slug: string;
  readonly name: { readonly ko: string; readonly en: string };
  readonly description: { readonly ko: string; readonly en: string };
  readonly appearance: PhotoBoothTemplateAppearance;
}

export const PHOTO_BOOTH_TEMPLATES = [
  {
    slug: 'ai-caricature-artist',
    name: { ko: 'AI 캐리커처 아티스트', en: 'AI Caricature Artist' },
    description: {
      ko: '웹툰·팝아트·픽셀·스케치·수채화, 준비된 5가지 화풍으로 내 사진을 그려요.',
      en: 'Turn your photo into one of five existing styles: webtoon, pop art, pixel art, sketch, or watercolor.',
    },
    appearance: 'caricature',
  },
  {
    slug: 'ai-hanbok-booth',
    name: { ko: 'AI 한복 포토부스', en: 'AI Hanbok Photo Booth' },
    description: {
      ko: '준비된 한복 4종과 궁궐·한옥마을·정원 배경으로 한복 사진을 만들어요.',
      en: 'Create a portrait with four existing hanbok outfits and palace, hanok village, or garden backdrops.',
    },
    appearance: 'hanbok',
  },
  {
    slug: 'ai-runway-photobooth',
    name: { ko: 'AI 런웨이 포토부스', en: 'AI Runway Photo Booth' },
    description: {
      ko: '파리·밀라노·서울·뉴욕, 준비된 의상과 배경으로 패션 잡지 표지를 만들어요.',
      en: 'Become a magazine cover star with existing Paris, Milan, Seoul, or New York outfits and settings.',
    },
    appearance: 'runway',
  },
  {
    slug: 'ai-fashion-timemachine',
    name: { ko: 'AI 패션 타임머신', en: 'AI Fashion Time Machine' },
    description: {
      ko: '1920년대부터 Y2K·미래까지, 준비된 6가지 시대의 의상과 사진 분위기로 변신해요.',
      en: 'Try six existing era looks, from the 1920s to Y2K and the future, with matching outfits and photo styles.',
    },
    appearance: 'retro',
  },
  {
    slug: 'ai-idol-makeup-booth',
    name: { ko: 'AI 아이돌 메이크업 포토부스', en: 'AI Idol Makeup Photo Booth' },
    description: {
      ko: '준비된 메이크업 콘셉트 5종과 무대·화보·앨범·팬사인회 배경으로 변신해요.',
      en: 'Try five existing makeup concepts with stage, studio, album, or fansign settings.',
    },
    appearance: 'idol',
  },
  {
    slug: 'ai-fan-photocard',
    name: { ko: 'AI 팬 포토카드 메이커', en: 'AI Fan Photocard Maker' },
    description: {
      ko: '시즌 그리팅·월드투어·데뷔·홀로그램, 준비된 4가지 콘셉트로 나만의 포토카드 이미지를 만들어요.',
      en: 'Create your own photocard image in four existing concepts: season greetings, world tour, debut, or hologram.',
    },
    appearance: 'photocard',
  },
  {
    slug: 'ai-graduation-booth',
    name: { ko: 'AI 졸업 포토부스', en: 'AI Graduation Photo Booth' },
    description: {
      ko: '준비된 학위복 4종과 캠퍼스 정문·도서관·졸업식장 배경으로 졸업 사진을 만들어요.',
      en: 'Create a graduation portrait with four existing gown colors and campus gate, library, or ceremony backdrops.',
    },
    appearance: 'graduation',
  },
  {
    slug: 'ai-history-travel',
    name: { ko: 'AI 역사 속 나', en: 'AI History Travel' },
    description: {
      ko: '삼국·고려·조선·근대, 준비된 시대별 의상과 배경으로 역사 속 주인공이 되어봐요.',
      en: 'Step into the Three Kingdoms, Goryeo, Joseon, or early modern Korea with existing period outfits and settings.',
    },
    appearance: 'history',
  },
  {
    slug: 'ai-brand-avatar',
    name: { ko: 'AI 브랜드 아바타 메이커', en: 'AI Brand Avatar Maker' },
    description: {
      ko: '모노·팝·블루·파스텔, 준비된 4가지 색상 스타일로 아바타를 그려요. 새 브랜드 자산 적용은 별도예요.',
      en: 'Create an avatar in four existing palettes: mono, pop, blue, or pastel. New brand assets are a separate customization.',
    },
    appearance: 'avatar',
  },
  {
    slug: 'ai-traditional-painter',
    name: { ko: 'AI 전통 화가', en: 'AI Traditional Painter' },
    description: {
      ko: '수묵화·민화·단청·청화백자, 준비된 4가지 화풍으로 전통 초상화를 그려요.',
      en: 'Create a traditional portrait in four existing styles: ink wash, minhwa, dancheong, or blue-and-white porcelain.',
    },
    appearance: 'traditional',
  },
  {
    slug: 'ai-wedding-booth',
    name: { ko: 'AI 웨딩 포토부스', en: 'AI Wedding Photo Booth' },
    description: {
      ko: '한 장의 사진을 동화·영화·빈티지·여행, 준비된 4가지 웨딩 테마로 바꿔요.',
      en: 'Transform one photo using four existing wedding themes: fairytale, cinema, vintage, or travel.',
    },
    appearance: 'wedding',
  },
] as const satisfies readonly PhotoBoothTemplate[];

export type PhotoBoothTemplateSlug = (typeof PHOTO_BOOTH_TEMPLATES)[number]['slug'];

const templateBySlug = new Map<string, PhotoBoothTemplate>(
  PHOTO_BOOTH_TEMPLATES.map((template) => [template.slug, template]),
);

/** Keep known slugs once, in the visitor's selection order; reject non-array input. */
export function normalizePhotoBoothTemplateSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((value): value is string => typeof value === 'string' && templateBySlug.has(value)))];
}

/** Missing or empty selections stay empty. Use PHOTO_BOOTH_TEMPLATES for the catalog. */
export function getPhotoBoothTemplates(slugs?: readonly string[]): PhotoBoothTemplate[] {
  return normalizePhotoBoothTemplateSlugs(slugs).map((slug) => templateBySlug.get(slug)!);
}
