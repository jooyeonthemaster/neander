import { CUSTOM_DEV_TEXT, PERFUME, isConsultationService, type Lang } from '@/lib/quote/catalog';
import type { QuoteItem } from '@/lib/quote/engine';
import { getPhotoBoothTemplates } from '@/lib/quote/photo-booth-templates';
import { getKioskAssignments, getKioskExperience, groupKioskAssignments } from '@/lib/quote/kiosk-experiences';

/* 온라인 견적 — 오른쪽 '지금까지 고른 견적'에 체험별로 고른 옵션을 짧게 보여 준다 */

export function optionSummary(item: QuoteItem, lang: Lang, experienceName?: (slug: string) => string | undefined): string[] {
  const ko = lang === 'ko';
  if (isConsultationService(item.key)) return [ko ? '별도 문의 필요' : 'Separate inquiry required'];
  const out: string[] = [];
  const add = (cond: unknown, koText: string, enText: string) => { if (cond) out.push(ko ? koText : enText); };
  /** 영어 수량 표기 — 1 kiosk · 3 kiosks */
  const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

  switch (item.key) {
    case 'acscent': {
      const o = item.options;
      const ak = o.analysisKiosks ?? 0;
      out.push(ko ? `${o.guests}명` : `${o.guests} guests`, o.volume);
      out.push(ak > 0 ? (ko ? `분석 키오스크 ${ak}대` : count(ak, 'analysis kiosk')) : (ko ? 'QR 분석' : 'QR analysis'));
      out.push(ko ? `조향 ${PERFUME.includedTeams + o.extraTeams}팀` : count(PERFUME.includedTeams + o.extraTeams, 'perfumer team'));
      add(o.customScent, '전용 향', 'Custom scent');
      add(o.customBox, '전용 디자인 단박스', 'Custom box');
      add(!o.customBox && o.premiumPackaging, "AC'SCENT 패키지", "AC'SCENT package");
      add(!o.customBox && !o.premiumPackaging, '무지 패키지', 'Plain package');
      break;
    }
    case 'photoBooth': {
      const o = item.options;
      out.push(ko ? `${o.booths}대` : count(o.booths, 'booth'));
      const templates = getPhotoBoothTemplates(o.templateSlugs);
      if (templates.length) out.push(templates.map((template) => template.name[lang]).join(' · '));
      add(o.extraStyles > 0, `스타일 +${o.extraStyles}종`, `+${count(o.extraStyles, 'style')}`);
      add(o.extraPrintRolls > 0, `인화지 +${o.extraPrintRolls}롤`, `+${count(o.extraPrintRolls, 'roll')}`);
      add(o.wrapping, '부스 랩핑', 'Booth wrap');
      add((o.customStyles ?? 0) > 0, `전용 스타일 ${o.customStyles}종`, count(o.customStyles ?? 0, 'custom style'));
      if (o.custom && o.custom !== 'none') out.push(CUSTOM_DEV_TEXT.booth[o.custom].name[lang]);
      break;
    }
    case 'rental': {
      const o = item.options;
      out.push(o.mode === 'monthly'
        ? (ko ? `월 이용 · ${o.kiosks}대 · ${o.months}개월` : `Monthly · ${count(o.kiosks, 'kiosk')} · ${o.months} mo`)
        : (ko ? `${o.kiosks}대` : count(o.kiosks, 'kiosk')));
      if (o.experienceSlugs !== undefined) {
        // 체험별로 묶어 대수를 붙인다 — 'AI 퍼스널 컬러 2대 · AI 소믈리에 2대'
        const groups = groupKioskAssignments(getKioskAssignments(o));
        // 아직 아무 체험도 고르지 않았으면 대수를 되풀이하지 않는다 ('3대 · 상담 후 결정 3대' → '3대 · 체험 미정')
        if (groups.every(({ slug }) => !slug)) out.push(ko ? '체험 미정' : 'experience not chosen yet');
        else groups.forEach(({ slug, kiosks }) => {
          const name = (slug && (experienceName?.(slug) ?? getKioskExperience(slug)?.name[lang])) || (ko ? '상담 후 결정' : 'Decide later');
          out.push(o.kiosks === 1 ? name : ko ? `${name} ${kiosks.length}대` : `${name} ×${kiosks.length}`);
        });
      } else {
        const name = o.experienceSlug ? experienceName?.(o.experienceSlug) : undefined;
        if (name) out.push(name);
        add(o.mode === 'event' && o.extraContents > 0, `체험 +${o.extraContents}종`, `+${count(o.extraContents, 'experience')}`);
      }
      add(o.printer, '결과 인쇄', 'Printer');
      if (o.custom && o.custom !== 'none') out.push(CUSTOM_DEV_TEXT.kiosk[o.custom].name[lang]);
      break;
    }

  }
  return out;
}
