/* ─────────────────────────────────────────────────────────
   온라인 견적 → 보고서(ReportDoc)
   2026-11-21 사용자 결정: 보고서는 온라인 견적 마지막 단계에서 받는다. 연락처는 받지 않는다. 형식은 한글 파일과 PDF.
   - 견적에서 고른 행사 정보 · 체험 · 금액을 그대로 쓴다 (금액은 calculateQuote 결과 그대로).
   - 행사 종류(EVENT_TYPES 8가지)마다 목적 · 기대 효과 문장을 두고, 체험(서비스 6가지)마다 세부 운영 내용을 만든다.
   - 업체 선정 사유의 실적은 행사 종류에 맞는 행사별 안내 글의 공개 사례 링크를 쓴다.
   ───────────────────────────────────────────────────────── */

import { COMMON, CUSTOM_DEV, CUSTOM_DEV_TEXT, ESTIMATE_DISCLAIMER, PERFUME, PHOTO_BOOTH, REGIONS, SERVICE_TEXT, isConsultationService, type ServiceKey } from '@/lib/quote/catalog';
import type { QuoteInput, QuoteResult } from '@/lib/quote/engine';
import { formatKioskNumbers, getKioskAssignments, getKioskExperience, groupKioskAssignments } from '@/lib/quote/kiosk-experiences';
import { getPhotoBoothTemplates } from '@/lib/quote/photo-booth-templates';
import { getInsight } from '@/data/insights';
import { CONTACT } from '@/lib/constants';
import type { ReportDoc, ReportLine } from './report-doc';

interface EventCopy { noun: string; kicker: string; purpose: string; effect: string; guide: string }

const EVENT_COPY: Record<string, EventCopy> = {
  popup: { noun: '브랜드 팝업', kicker: '브랜드 팝업 방문객 경험 강화를 위한', purpose: '브랜드 팝업 방문객이 직접 참여하는 AI 체험을 운영하여 체류 시간과 브랜드 경험 강화', effect: '방문객이 브랜드가 담긴 결과물을 가져가 행사 후에도 브랜드 노출 지속', guide: 'brand-scent-kiosk' },
  festival: { noun: '축제', kicker: '축제 방문객 참여 확대를 위한', purpose: '축제 방문객이 직접 참여하는 AI 체험 부스를 운영하여 축제 참여도와 만족도 제고', effect: '체험 대기와 결과물 공유로 부스 주변에 자연스러운 집객 효과', guide: 'festival-experience-booth' },
  exhibition: { noun: '전시·박람회', kicker: '전시·박람회 부스 집객을 위한', purpose: '전시·박람회 부스에 방문객 참여형 AI 체험을 두어 부스 방문과 상담 연결 확대', effect: '체험을 계기로 부스에 머무는 시간이 늘어 상담·홍보 기회 확대', guide: 'brand-scent-kiosk' },
  corporate: { noun: '기업 행사', kicker: '참석자 참여 확대를 위한', purpose: '기업 행사에 참석자가 직접 참여하는 체험 프로그램을 더해 행사 참여도 제고', effect: '진행 순서가 없는 시간에도 참석자가 머물 거리가 생겨 행사 흐름 유지', guide: 'corporate-year-end-event-ai-booth' },
  campus: { noun: '대학 행사', kicker: '학생 참여 확대를 위한', purpose: '대학 행사에 학생이 직접 참여하는 AI 체험을 운영하여 참여 확대 및 AI 활용 경험 제공', effect: '학생이 AI 기술을 직접 체험하며 행사 관심도와 참여율 제고', guide: 'school-library-ai-experience' },
  public: { noun: '공공 행사', kicker: '시민·관광객 참여 확대를 위한', purpose: '공공·관광 행사에 시민과 관광객이 참여하는 AI 체험을 운영하여 행사 만족도 제고', effect: '세대 구분 없이 참여할 수 있는 체험으로 시민 참여 확대', guide: 'festival-experience-booth' },
  fan: { noun: '팬 이벤트', kicker: '팬 참여 경험 강화를 위한', purpose: '팬 이벤트·공연 현장에 참여형 AI 체험을 운영하여 팬 경험 강화', effect: '현장에서만 받을 수 있는 결과물로 팬 만족도와 현장 공유 확대', guide: 'festival-experience-booth' },
  other: { noun: '행사', kicker: '참석자 참여 확대를 위한', purpose: '행사에 참석자가 직접 참여하는 AI 체험 프로그램을 운영하여 참여도 제고', effect: '참여형 체험으로 행사 체류 시간과 만족도 제고', guide: 'festival-experience-booth' },
};

/** 체험마다 참석자가 가져가는 것 */
const TAKEAWAY: Partial<Record<ServiceKey, string>> = { photoBooth: '즉석 인화 사진', rental: 'AI 결과지', acscent: '맞춤 향수' };

const won = (n: number) => n.toLocaleString('ko-KR');
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
function dateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCFullYear()}. ${d.getUTCMonth() + 1}. ${d.getUTCDate()}.(${DAYS[d.getUTCDay()]})`;
}
function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const todayKst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const svc = (key: ServiceKey) => SERVICE_TEXT[key].name.ko;

/** 「AI 포토부스 1대」 같은 짧은 구성 이름 */
function itemLabel(item: QuoteInput['items'][number]): string {
  switch (item.key) {
    case 'photoBooth': return `${svc('photoBooth')} ${item.options.booths}대`;
    case 'rental': return item.options.mode === 'monthly' ? `${svc('rental')} ${item.options.kiosks}대(${item.options.months}개월 상시 운영)` : `${svc('rental')} ${item.options.kiosks}대`;
    case 'acscent': return `${svc('acscent')} ${item.options.guests.toLocaleString('ko-KR')}명분`;
    default: return svc(item.key);
  }
}

function detailLines(input: QuoteInput): ReportLine[] {
  const out: ReportLine[] = [];
  for (const item of input.items) {
    switch (item.key) {
      case 'photoBooth': {
        const o = item.options;
        out.push({ mark: '❍', label: svc('photoBooth'), text: `${o.booths}대` });
        out.push({ mark: '-', text: `AI가 참석자 사진을 행사 컨셉 스타일로 바꿔 즉석 인화 (인화 ${(PHOTO_BOOTH.printsPerRoll * (o.booths + o.extraPrintRolls)).toLocaleString('ko-KR')}장 포함)` });
        const templates = getPhotoBoothTemplates(o.templateSlugs);
        if (templates.length) out.push({ mark: '-', text: `AI 스타일: ${templates.map((t) => t.name.ko).join(', ')}` });
        out.push({ mark: '-', text: `행사명을 넣은 프레임 1종 디자인 포함${o.wrapping ? ', 부스 외관 랩핑' : ''}` });
        if (o.customStyles) out.push({ mark: '-', text: `행사 전용 AI 스타일 ${o.customStyles}종 새로 제작` });
        if (o.custom && o.custom !== 'none') out.push({ mark: '-', text: `맞춤 개발: ${CUSTOM_DEV_TEXT.booth[o.custom].name.ko}` });
        break;
      }
      case 'rental': {
        const o = item.options;
        out.push({ mark: '❍', label: svc('rental'), text: o.mode === 'monthly' ? `${o.kiosks}대, ${o.months}개월 상시 운영` : `${o.kiosks}대` });
        if (o.experienceSlugs !== undefined) {
          for (const { slug, kiosks } of groupKioskAssignments(getKioskAssignments(o))) {
            out.push({ mark: '-', text: `${formatKioskNumbers(kiosks, 'ko')} 키오스크: ${getKioskExperience(slug)?.name.ko ?? '체험 상담 후 결정'}` });
          }
        }
        out.push({ mark: '-', text: '참석자가 직접 조작하고 결과를 영수증형 결과지로 출력' });
        if (o.custom && o.custom !== 'none') out.push({ mark: '-', text: `맞춤 개발: ${CUSTOM_DEV_TEXT.kiosk[o.custom].name.ko}` });
        break;
      }
      case 'acscent': {
        const o = item.options;
        out.push({ mark: '❍', label: svc('acscent'), text: `참석자 ${o.guests.toLocaleString('ko-KR')}명` });
        out.push({ mark: '-', text: `AI 취향 분석 후 조향사가 현장에서 ${o.volume} 맞춤 향수 제작·증정` });
        if (o.premiumPackaging) out.push({ mark: '-', text: '고급 선물 포장' });
        if (o.customBox) out.push({ mark: '-', text: '전용 디자인 단박스 제작 (상담 후 확정)' });
        if (o.customScent) out.push({ mark: '-', text: '브랜드 전용 향 개발' });
        out.push({ mark: '-', text: `조향사·조수 팀 현장 운영 (1팀 시간당 약 ${PERFUME.guestsPerTeamHour}명)` });
        break;
      }
      default:
        out.push({ mark: '❍', label: svc(item.key), text: '구성과 금액은 상담 후 확정' });
    }
  }
  const onsite = input.items.some((i) => !isConsultationService(i.key) && !(i.key === 'rental' && i.options.mode === 'monthly'));
  if (onsite && input.extraStaff > 0) out.push({ mark: '❍', label: '운영 인력', text: `현장 운영 인력 ${input.extraStaff}명` });
  if (onsite && input.setupDayBefore) out.push({ mark: '❍', label: '사전 설치', text: '행사 전날 설치' });
  out.push({ mark: '※', text: '준비 사항: 220V 전원 및 인터넷 연결 (클라우드 AI 사용)' });
  return out;
}

/** 맞춤 제작이 있으면 그중 가장 긴 준비 기간(일) */
function customLead(input: QuoteInput): number {
  let lead = 0;
  for (const item of input.items) {
    if (item.key === 'photoBooth') {
      if (item.options.customStyles) lead = Math.max(lead, CUSTOM_DEV.leadDays.style);
      if (item.options.custom && item.options.custom !== 'none') lead = Math.max(lead, CUSTOM_DEV.leadDays[item.options.custom]);
    }
    if (item.key === 'rental' && item.options.custom && item.options.custom !== 'none') lead = Math.max(lead, CUSTOM_DEV.leadDays[item.options.custom]);
  }
  return lead;
}

export function buildQuoteReport(input: QuoteInput, quote: QuoteResult, refNo?: string): ReportDoc {
  const ev = EVENT_COPY[input.eventType] ?? EVENT_COPY.other;
  const today = todayKst();
  const year = input.eventDate ? input.eventDate.slice(0, 4) : today.slice(0, 4);
  const name = input.eventName?.trim() || `${year}년 ${ev.noun}`;
  const parts = input.items.map(itemLabel);
  const perHead = input.attendees > 0 && quote.supply > 0 ? Math.round(quote.supply / input.attendees / 100) * 100 : 0;
  const hasTbd = quote.lines.some((l) => l.tbd);
  const takeaways = input.items.map((i) => TAKEAWAY[i.key]).filter((t): t is string => !!t);
  const devices = input.items.some((i) => i.key === 'photoBooth' || i.key === 'rental');
  const region = REGIONS.find((r) => r.key === input.region)?.label.ko ?? '';

  // 일시 — 여러 날이면 시작일부터 며칠간
  const when = input.eventDate
    ? input.days > 1 ? `${dateLabel(input.eventDate)} ~ ${dateLabel(shiftDays(input.eventDate, input.days - 1))} (${input.days}일간)` : dateLabel(input.eventDate)
    : input.days > 1 ? `(미정), ${input.days}일간` : '(미정)';

  // 추진 일정
  const lead = customLead(input);
  const by = (days: number) => {
    if (!input.eventDate) return `행사 ${days}일 전`;
    const due = shiftDays(input.eventDate, -days);
    return due < today ? `행사 ${days}일 전 (기한 경과, 업체와 가능 여부 협의)` : `${dateLabel(due)}까지 (행사 ${days}일 전)`;
  };
  const schedule: ReportLine[] = [{ mark: '❍', label: '업체 확정', text: '일정 및 장비 확보 즉시' }];
  if (lead) schedule.push({ mark: '❍', label: '맞춤 제작 확정', text: by(lead) });
  else if (devices) schedule.push({ mark: '❍', label: '로고·색 적용 확정 (적용 시)', text: by(CUSTOM_DEV.leadDays.brand) });
  schedule.push({ mark: '❍', label: '행사 운영', text: input.eventDate ? when : '행사 당일' });
  if (devices) schedule.push({ mark: '※', text: '업체 보유 장비 수가 한정되어 성수기에는 조기 확정 필요' });
  if (hasTbd) schedule.push({ mark: '※', text: '상담이 필요한 항목은 상담 후 일정 확정' });

  // 기대 효과
  const effects: ReportLine[] = [{ mark: '❍', text: ev.effect }];
  if (takeaways.length) effects.push({ mark: '❍', text: `${takeaways.join('·')} 등 결과물을 현장에서 바로 전달하여 별도 기념품 구매·배송 업무 절감` });
  if (perHead) effects.push({ mark: '❍', text: `참석자 1인당 약 ${won(perHead)}원(공급가 기준)으로 참여형 프로그램 운영` });

  // 업체 선정 사유 — 행사 종류에 맞는 안내 글의 공개 사례
  const cases = (getInsight(ev.guide)?.ko.blocks ?? []).flatMap((b) => (b.type === 'links' ? b.items : [])).slice(0, 4);

  const budgetRows = quote.lines.map((l) => [l.label, l.detail, l.tbd ? '상담 후 산정' : won(l.amount)]);

  return {
    kicker: `- ${ev.kicker} -`,
    title: `${name} 체험 프로그램 운영계획(안)`,
    summary: [
      `${ev.noun}에서 ${parts.join('·')} 운영으로 참석자 참여 제고${takeaways.length ? ' 및 결과물 제공' : ''}`,
      `소요 예산 ${won(quote.total)}원(부가세 포함)${perHead ? `, 참석자 1인당 약 ${won(perHead)}원(공급가 기준)` : ''}${hasTbd ? ', 상담 항목 별도' : ''}`,
    ],
    sections: [
      { title: '추진 배경 및 목적', blocks: [{ kind: 'lines', items: [
        { mark: '❍', text: ev.purpose },
        ...(takeaways.length ? [{ mark: '❍' as const, text: `${takeaways.join('·')} 등 체험 결과물을 참석자에게 현장 제공` }] : []),
      ] }] },
      { title: '추진 개요', blocks: [{ kind: 'lines', items: [
        { mark: '❍', label: '행 사 명', text: name },
        { mark: '❍', label: '일 시', text: `${when}, 하루 ${input.hoursPerDay}시간 운영` },
        { mark: '❍', label: '장 소', text: `${region} (세부 장소 협의)` },
        { mark: '❍', label: '대 상', text: `참석자 약 ${input.attendees.toLocaleString('ko-KR')}명` },
        { mark: '❍', label: '내 용', text: parts.join(', ') },
        { mark: '❍', label: '운영 업체', text: '네안데르(NEANDER)' },
        { mark: '❍', label: '연 락 처', text: `${CONTACT.phone}, ${CONTACT.email}` },
        ...(refNo ? [{ mark: '※' as const, text: `견적번호 ${refNo} — 업체 문의 시 알려 주면 같은 구성으로 정식 견적 발급` }] : []),
      ] }] },
      { title: '세부 운영 내용', blocks: [{ kind: 'lines', items: detailLines(input) }] },
      { title: '소요 예산', blocks: [
        {
          kind: 'table', unit: '(단위: 원, 부가세 별도)', head: ['구분', '산출 내역', '금액'], rows: budgetRows,
          foot: [['소계', '', won(quote.supply)], ['부가세', `공급가액의 ${Math.round(COMMON.vatRate * 100)}%`, won(quote.vat)], ['합계', '', won(quote.total)]],
        },
        { kind: 'lines', items: [
          { mark: '※', text: `${today} 네안데르 온라인 견적 기준 금액. ${ESTIMATE_DISCLAIMER.ko}` },
          ...quote.warnings.map((w) => ({ mark: '※' as const, text: w })),
        ] },
      ] },
      { title: '추진 일정', blocks: [{ kind: 'lines', items: schedule }] },
      { title: '기대 효과', blocks: [{ kind: 'lines', items: effects }] },
      { title: '업체 선정 사유', blocks: [{ kind: 'lines', items: [
        ...(cases.length ? [{ mark: '❍' as const, label: '수행 실적', text: '유사 행사 운영 경험 보유' }, ...cases.map((c) => ({ mark: '-' as const, text: c.text }))] : []),
        { mark: '❍', label: '일괄 수행', text: '장비 운송·설치부터 현장 운영·철수까지 단일 업체 수행' },
        { mark: '❍', label: '가격 투명성', text: '온라인 견적으로 금액 기준 공개, 동일 조건 가견적서 즉시 발급' },
        { mark: '❍', label: '운영 지역', text: '전국 출장 운영 (제주·도서 지역 제외)' },
      ] }] },
    ],
    attachments: ['가견적서 1부 (neander.co.kr/quote)', '업체 소개서 1부 (neander.co.kr/portfolio)'],
  };
}
