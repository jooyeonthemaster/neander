# Service imagery

The 41 services use four existing on-site photographs and 37 individually generated concept images. Actual event photographs retain their event names and take priority over concept images. Generated images are labeled “AI 콘셉트 이미지” in Korean and “AI-generated concept” in English.

## Files

- Generated assets: `public/images/services/concepts/<service-slug>.webp`
- Original event photographs: `public/images/services/experiences/`
- Image selection and bilingual descriptions: `src/data/experience-images.ts`
- Shared image rendering: `src/components/services/ExperienceImage.tsx`

The same images appear in service listing cards, detail-page overviews, and related-service cards. Images use a 16:9 frame, responsive Next.js image sizing, and lazy loading.

## Generation prompts

Each image was generated separately with the built-in `image_gen` tool, then converted to a 1200 × 675 WebP for the website. Exact prompts and output paths are recorded here:

- [Beauty, food and beverage, fashion](service-image-prompts-beauty-fashion.json)
- [Entertainment, education, festival](service-image-prompts-entertainment-education-festival.json)
- [Corporate, travel, wedding](service-image-prompts-corporate-travel-wedding.json)

These images illustrate service concepts; they do not document completed client projects. To add an actual event photograph later, add it to `EXPERIENCE_PHOTOS` in `src/data/experience-photos.ts`. It will automatically take precedence on every service surface.
