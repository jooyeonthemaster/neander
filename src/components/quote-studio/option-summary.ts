import { CUSTOM_DEV_TEXT, OPTION_TEXT, PERFUME, type Lang } from '@/lib/quote/catalog';
import type { QuoteItem } from '@/lib/quote/engine';
import { getPhotoBoothTemplates } from '@/lib/quote/photo-booth-templates';
import { getKioskAssignments, getKioskExperience, groupKioskAssignments } from '@/lib/quote/kiosk-experiences';
import { formatSpaceArea } from '@/lib/quote/space-area';

/* 온라인 견적 — 오른쪽 '지금까지 고른 견적'에 체험별로 고른 옵션을 짧게 보여 준다 */

export function optionSummary(item: QuoteItem, lang: Lang, experienceName?: (slug: string) => string | undefined): string[] {
  const ko = lang === 'ko';
  const out: string[] = [];
  const add = (cond: unknown, koText: string, enText: string) => { if (cond) out.push(ko ? koText : enText); };

  switch (item.key) {
    case 'acscent': {
      const o = item.options;
      const ak = o.analysisKiosks ?? 0;
      out.push(ko ? `${o.guests}명` : `${o.guests} guests`, o.volume);
      out.push(ak > 0 ? (ko ? `분석 키오스크 ${ak}대` : `${ak} analysis kiosk(s)`) : (ko ? 'QR 분석' : 'QR analysis'));
      out.push(ko ? `조향 ${PERFUME.includedTeams + o.extraTeams}팀` : `${PERFUME.includedTeams + o.extraTeams} perfumer team(s)`);
      add(o.customScent, '전용 향', 'Custom scent');
      add(o.customBox, '전용 디자인 단박스', 'Custom box');
      add(!o.customBox && o.premiumPackaging, "AC'SCENT 패키지", "AC'SCENT package");
      add(!o.customBox && !o.premiumPackaging, '무지 패키지', 'Plain package');
      break;
    }
    case 'photoBooth': {
      const o = item.options;
      out.push(ko ? `${o.booths}대` : `${o.booths} booth(s)`);
      const templates = getPhotoBoothTemplates(o.templateSlugs);
      if (templates.length) out.push(templates.map((template) => template.name[lang]).join(' · '));
      add(o.extraStyles > 0, `스타일 +${o.extraStyles}종`, `+${o.extraStyles} style(s)`);
      add(o.extraPrintRolls > 0, `인화지 +${o.extraPrintRolls}롤`, `+${o.extraPrintRolls} roll(s)`);
      add(o.wrapping, '부스 랩핑', 'Booth wrap');
      add((o.customStyles ?? 0) > 0, `전용 스타일 ${o.customStyles}종`, `${o.customStyles} custom style(s)`);
      if (o.custom && o.custom !== 'none') out.push(CUSTOM_DEV_TEXT.booth[o.custom].name[lang]);
      break;
    }
    case 'rental': {
      const o = item.options;
      out.push(o.mode === 'monthly'
        ? (ko ? `월 이용 · ${o.kiosks}대 · ${o.months}개월` : `Monthly · ${o.kiosks} kiosk(s) · ${o.months} mo`)
        : (ko ? `${o.kiosks}대` : `${o.kiosks} kiosk(s)`));
      if (o.experienceSlugs !== undefined) {
        // 체험별로 묶어 대수를 붙인다 — 'AI 퍼스널 컬러 2대 · AI 소믈리에 2대'
        groupKioskAssignments(getKioskAssignments(o)).forEach(({ slug, kiosks }) => {
          const name = (slug && (experienceName?.(slug) ?? getKioskExperience(slug)?.name[lang])) || (ko ? '상담 후 결정' : 'Decide later');
          out.push(o.kiosks === 1 ? name : ko ? `${name} ${kiosks.length}대` : `${name} ×${kiosks.length}`);
        });
      } else {
        const name = o.experienceSlug ? experienceName?.(o.experienceSlug) : undefined;
        if (name) out.push(name);
        add(o.mode === 'event' && o.extraContents > 0, `체험 +${o.extraContents}종`, `+${o.extraContents} experience(s)`);
      }
      add(o.printer, '결과 인쇄', 'Printer');
      if (o.custom && o.custom !== 'none') out.push(CUSTOM_DEV_TEXT.kiosk[o.custom].name[lang]);
      break;
    }
    case 'mediaArt': {
      const o = item.options;
      out.push(OPTION_TEXT.production[o.grade][lang]);
      out.push(o.sensorType === 'depth' ? (ko ? '3D 카메라' : '3D camera') : (ko ? '이미지 카메라' : 'Image camera'));
      add(o.extraSensors > 0, `센서 +${o.extraSensors}세트`, `+${o.extraSensors} sensor set(s)`);
      break;
    }
    case 'spatialDesign': {
      const o = item.options;
      out.push(o.size === 'large' ? (ko ? `팝업·공간 ${formatSpaceArea(o, lang)}` : `Space ${formatSpaceArea(o, lang)}`) : `${OPTION_TEXT.space[o.size][lang]} · ${OPTION_TEXT.boothBuild[o.build ?? 'fabric'][lang]}`);
      add(o.photoZone, '포토존', 'Photo spot');
      add(o.lighting, '조명', 'Lighting');
      break;
    }
    case 'custom': {
      const o = item.options;
      out.push(OPTION_TEXT.scope[o.scope][lang]);
      add(o.consulting, '기획 함께', 'Planning');
      add(o.pgIntegration ?? false, 'PG 연결', 'Payment gateway');
      add(o.maintenanceMonths > 0, `관리 ${o.maintenanceMonths}개월`, `${o.maintenanceMonths} mo upkeep`);
      break;
    }
  }
  return out;
}
