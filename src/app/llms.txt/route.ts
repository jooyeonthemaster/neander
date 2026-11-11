import { getTranslations } from 'next-intl/server';
import { CONTACT, SITE_URL } from '@/lib/constants';
import { experiences } from '@/data/experiences';
import { CREDENTIALS_KO, INSIGHTS } from '@/data/insights';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { serviceForExperience, startingPrice } from '@/lib/quote/engine';
import { COMMON, CUSTOM, KIOSK, MEDIA_ART, PERFUME, PHOTO_BOOTH, SPACE } from '@/lib/quote/catalog';

// /llms.txt — ChatGPT·Perplexity 같은 AI 답변이 회사를 정확히 소개하도록 핵심 사실을 한곳에 모은 글.
// 금액은 온라인 견적 카탈로그, 체험·사례는 사이트 데이터에서 읽어 사이트와 어긋나지 않게 한다.
export const revalidate = 3600;

const man = (n: number) => `${(n / 10_000).toLocaleString('ko-KR')}만원`;

export async function GET() {
  const t = await getTranslations({ locale: 'ko', namespace: 'services' });
  const portfolio = await fetchPublishedPortfolio();

  const byService = (key: string) =>
    experiences
      .filter((e) => serviceForExperience(e.slug, e.pillar) === key)
      .map((e) => `  - [${t(e.nameKey)}](${SITE_URL}/services/${e.slug}): ${t(e.oneLinerKey)}`);

  const cases = portfolio
    .filter((p) => p.category === 'offline')
    .slice(0, 20)
    .map((p) => `- [${p.title_ko}](${SITE_URL}/portfolio/${p.slug})${p.client_ko || p.client ? ` — ${p.client_ko || p.client}` : ''}${p.year ? `, ${p.year}` : ''}`);

  const guides = INSIGHTS.map((i) => `- [${i.ko.title}](${SITE_URL}/insights/${i.slug}): ${i.ko.description}`);

  const body = `# 네안데르 (NEANDER, (주)네안데르)

> 행사·팝업·축제·전시 현장에서 방문객이 직접 참여하는 AI 체험(AI 향수 만들기, AI 포토부스, AI 운세·진단 키오스크, 인터랙티브 미디어아트)을 기획·제작하고 장비와 운영 인력까지 보내 현장에서 운영하는 서울 마포구의 AI 체험 콘텐츠 회사입니다. 2022년 설립, 190건 이상의 행사를 운영했습니다. 웹사이트·AI 솔루션 개발(외주 개발·AX)도 합니다.

- 누구를 위한 서비스인가: 브랜드 팝업, 기업 행사(시상식·송년회·워크숍·사내 행사), 지역 축제, 전시·박람회, 대학 행사, 공공기관·문화재단 체험 프로그램, 팬 이벤트·공연
- 운영 지역: 전국 출장 운영 (서울 기준 금액, 지역별 운송비 추가). 제주 및 도서 지역은 운영하지 않습니다.
- 견적: [온라인 견적](${SITE_URL}/quote)에서 행사 조건을 고르면 연락처 없이 금액을 바로 확인하고 내부 결재용 가견적서 PDF를 받을 수 있습니다. 모든 금액은 VAT 별도입니다.
- 문의: ${CONTACT.email} · ${CONTACT.phone} · [문의하기](${SITE_URL}/contact)

## 서비스와 시작가 (VAT 별도, 서울 기준)

- AI 향수 체험 (AC'SCENT): AI가 취향·이미지를 분석해 향을 추천하고 조향사가 현장에서 향수를 만들어 건넵니다. ${man(startingPrice('acscent'))}부터 (1인 10ml ${man(PERFUME.tiers[2].unit['10ml'])}~${man(PERFUME.tiers[0].unit['10ml'])}, 조향사가 현장 출장).
${byService('acscent').join('\n')}
- AI 포토부스: 1대 1일 ${man(PHOTO_BOOTH.firstBooth)}부터 (AI 스타일 ${PHOTO_BOOTH.includedStyles}종·즉석 인화 ${PHOTO_BOOTH.printsPerRoll}장·운송·설치 포함, 최대 ${PHOTO_BOOTH.maxBooths}대).
${byService('photoBooth').join('\n')}
- AI 체험 키오스크: 1대 1일 ${man(KIOSK.firstKiosk)}부터 (영수증형 즉석 프린터 내장, 추가 1대 ${man(KIOSK.extraKiosk)}, 상시 운영 대당 월 ${man(KIOSK.monthlyPerKiosk)}).
${byService('rental').join('\n')}
- 인터랙티브 미디어아트: ${man(MEDIA_ART.production.standard + MEDIA_ART.operationFirstDay)}부터 (제작 ${man(MEDIA_ART.production.standard)} + 1일 운영 ${man(MEDIA_ART.operationFirstDay)}).
${byService('mediaArt').join('\n')}
- 공간 디자인(부스·포토존): 조립식 부스 3×3m ${man(SPACE.booth3x3)}부터.
- 커스텀 AI 콘텐츠 개발: ${man(CUSTOM.scope.standard)}부터.
- 현장 운영 인력 1인 1일 ${man(COMMON.staffPerDay)}, 1일 기본 운영 ${COMMON.baseHours}시간.

## 등록·신고 (향수 체험)

${CREDENTIALS_KO.map((c) => `- ${c}`).join('\n')}

## 가이드

${guides.join('\n')}

## 운영 사례

${cases.join('\n')}
- 전체 사례: ${SITE_URL}/portfolio

## 주요 페이지

- [서비스 소개](${SITE_URL}/services)
- [온라인 견적](${SITE_URL}/quote)
- [포트폴리오](${SITE_URL}/portfolio)
- [회사 소개](${SITE_URL}/about)
- [자주 묻는 질문](${SITE_URL}/faq)
- [프로그램 개발(웹·AI 외주 개발)](${SITE_URL}/development)
- [English site](${SITE_URL}/en)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
