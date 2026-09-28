import { CUSTOM_DEV_TEXT, OPTION_TEXT, type Lang } from '@/lib/quote/catalog';
import type { QuoteItem } from '@/lib/quote/engine';

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
      add(o.extraTeams > 0, `조향 팀 +${o.extraTeams}`, `+${o.extraTeams} team(s)`);
      add(o.customScent, '전용 향', 'Custom scent');
      add(o.customBox, '전용 디자인 단박스', 'Custom box');
      add(!o.customBox && o.premiumPackaging, "AC'SCENT 패키지", "AC'SCENT package");
      break;
    }
    case 'photoBooth': {
      const o = item.options;
      out.push(ko ? `${o.booths}대` : `${o.booths} booth(s)`);
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
      const name = o.experienceSlug ? experienceName?.(o.experienceSlug) : undefined;
      if (name) out.push(name);
      add(o.mode === 'event' && o.extraContents > 0, `체험 +${o.extraContents}종`, `+${o.extraContents} experience(s)`);
      add(o.printer, '결과 인쇄', 'Printer');
      if (o.custom && o.custom !== 'none') out.push(CUSTOM_DEV_TEXT.kiosk[o.custom].name[lang]);
      break;
    }
    case 'mediaArt': {
      const o = item.options;
      out.push(OPTION_TEXT.production[o.grade][lang]);
      add(o.extraSensors > 0, `센서 +${o.extraSensors}세트`, `+${o.extraSensors} sensor set(s)`);
      break;
    }
    case 'spatialDesign': {
      const o = item.options;
      out.push(o.size === 'large' ? (ko ? `팝업·공간 ${o.pyeong}평` : `Space ${o.pyeong} pyeong`) : OPTION_TEXT.space[o.size][lang]);
      add(o.photoZone, '포토존', 'Photo spot');
      add(o.lighting, '조명', 'Lighting');
      break;
    }
    case 'custom': {
      const o = item.options;
      out.push(OPTION_TEXT.scope[o.scope][lang]);
      add(o.consulting, '기획 함께', 'Planning');
      add(o.maintenanceMonths > 0, `관리 ${o.maintenanceMonths}개월`, `${o.maintenanceMonths} mo upkeep`);
      break;
    }
  }
  return out;
}
