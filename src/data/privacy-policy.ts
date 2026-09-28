/**
 * 개인정보처리방침 본문 (/privacy)
 *
 * 실제 코드 동작을 기준으로 적었다. 동작을 바꾸면 이 문서도 함께 고친다.
 *   - 문의·견적: src/lib/firebase/inquiries.ts → Firestore `inquiries` (asia-northeast3, 서울)
 *   - 문의 알림: src/app/api/inquiry-notify → Gmail로 담당자에게 발송
 *   - 방문 통계: src/lib/analytics/tracker.ts, src/app/api/track → Firestore `analytics_events` (IP 미저장)
 *   - 체험 데모: src/app/api/demo-ai → OpenRouter로 전달해 결과만 돌려주고 저장하지 않음
 * 보유기간·시행일 등 회사가 정하는 값은 POLICY_META에 모아 둔다.
 */

export const POLICY_META = {
  effectiveDate: '2026-09-26',
  officer: { ko: '유재영 (대표이사)', en: 'Yoo Jae-young (CEO)' },
  email: 'ok@neander.co.kr',
  phone: '02-336-3368',
  mobile: '010-8507-5121',
  inquiryRetention: { ko: '문의 접수일로부터 3년', en: '3 years from the date of the inquiry' },
} as const;

export interface PolicySection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
}

export interface PolicyDoc {
  title: string;
  subtitle: string;
  highlightsTitle: string;
  highlights: string[];
  sections: PolicySection[];
  effective: string;
}

const ko: PolicyDoc = {
  title: '개인정보처리방침',
  subtitle:
    '(주)네안데르(이하 "회사")는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 관련 고충을 신속하게 처리하기 위해 다음과 같이 개인정보처리방침을 둡니다.',
  highlightsTitle: '얼굴·사진 데이터에 대한 원칙',
  highlights: [
    '웹사이트 체험 데모에서 촬영한 사진·음성은 결과를 만드는 데에만 쓰고, 회사 서버에 저장하지 않습니다.',
    '사진으로 개인을 식별하는 얼굴 인식이나 생체 식별 정보(특징점 템플릿)를 만들거나 저장하지 않습니다.',
    '이용자의 사진·음성을 회사의 AI 모델 학습에 사용하지 않습니다.',
    '이용자의 개인정보를 판매하지 않습니다.',
    '행사 현장 부스에서 촬영한 사진의 보관 기간과 파기 방법은 행사를 주최하는 고객사와 협의해 계약서에 명시하며, 현장에서 참가자에게 안내합니다.',
  ],
  sections: [
    {
      id: 'items',
      title: '1. 수집하는 개인정보 항목과 수집 방법',
      table: {
        head: ['구분', '항목', '수집 방법'],
        rows: [
          ['문의·견적 요청 (가견적서 발급 포함)', '(필수) 이름, 이메일, 문의 내용 / (선택) 연락처, 회사명, 행사 정보(유형·일자·인원·장소)', '문의하기·온라인 견적 폼에 직접 입력'],
          ['회사소개서 요청', '(필수) 이름, 이메일 / (선택) 회사·기관명, 검토 중인 행사', '회사소개서 받기 폼에 직접 입력'],
          ['체험 데모', '카메라로 촬영한 사진, 마이크로 녹음한 음성, 데모에 입력한 답변', '데모 이용 시 이용자가 직접 촬영·입력 (브라우저 권한 허용 시에만)'],
          ['방문 통계', '브라우저별 무작위 식별값, 방문 페이지, 체류 시간, 유입 경로, 기기·브라우저 종류, 접속 지역(시·군·구 단위)', '웹사이트 이용 시 자동 수집 (IP 주소는 저장하지 않음)'],
        ],
      },
    },
    {
      id: 'purpose',
      title: '2. 개인정보의 처리 목적',
      bullets: [
        '문의·견적 요청: 문의 확인, 상담·견적 회신, 계약 진행을 위한 연락',
        '회사소개서 요청: 회사소개서 제공과 상담 연락',
        '체험 데모: 이용자가 요청한 AI 체험 결과 생성 (결과 생성 후 즉시 폐기)',
        '방문 통계: 웹사이트 이용 현황 분석과 서비스 개선',
      ],
    },
    {
      id: 'retention',
      title: '3. 보유 기간과 파기',
      bullets: [
        `문의·견적 정보: ${POLICY_META.inquiryRetention.ko} 보관 후 파기합니다. 계약으로 이어진 경우 관계 법령이 정한 기간 동안 보관합니다.`,
        '회사소개서 요청 정보: 요청일로부터 1년 보관 후 파기합니다.',
        '체험 데모 사진·음성: 결과를 만든 뒤 회사 서버에 남기지 않습니다.',
        '방문 통계: 개인을 식별할 수 없는 형태로 보관하며, 통계 목적이 끝나면 삭제합니다.',
        '파기 방법: 전자 파일은 복구할 수 없는 방법으로 삭제하고, 출력물은 분쇄하거나 소각합니다.',
      ],
    },
    {
      id: 'third-party',
      title: '4. 개인정보의 제3자 제공',
      paragraphs: [
        '회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가 동의한 경우나 법령에 특별한 규정이 있는 경우는 예외로 합니다.',
      ],
    },
    {
      id: 'outsourcing',
      title: '5. 개인정보 처리 위탁과 국외 이전',
      paragraphs: [
        '회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다. 이 중 일부는 국외에서 처리됩니다. 국외 이전을 원하지 않으시면 해당 기능(체험 데모 등)을 이용하지 않거나, 이메일·전화로 문의하실 수 있습니다.',
      ],
      table: {
        head: ['수탁 업체', '위탁 업무', '이전 항목', '처리 국가'],
        rows: [
          ['Google LLC (Firebase)', '문의·방문 통계 데이터 저장', '문의 정보, 방문 통계', '대한민국 (서울 리전)'],
          ['Google LLC (Gmail)', '접수된 문의·회사소개서 요청을 담당자에게 메일로 알림', '문의 정보, 회사소개서 요청 정보', '미국 등'],
          ['Vercel Inc.', '웹사이트 호스팅, 데모 요청 중계', '데모 사진·음성·답변 (전달만 하고 저장하지 않음)', '미국 등'],
          ['OpenRouter, Inc. 및 연결된 AI 모델 제공사', '체험 데모의 AI 결과 생성', '데모 사진·음성·답변', '미국 등'],
        ],
      },
    },
    {
      id: 'rights',
      title: '6. 이용자의 권리와 행사 방법',
      bullets: [
        '이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다.',
        `요청은 이메일(${POLICY_META.email}) 또는 전화(${POLICY_META.phone}, 휴대폰 ${POLICY_META.mobile})로 하실 수 있으며, 회사는 지체 없이 조치합니다.`,
        '행사 현장에서 촬영한 사진의 삭제를 원하시면 행사명과 촬영 일시를 알려 주세요. 고객사와 확인해 처리합니다.',
      ],
    },
    {
      id: 'storage',
      title: '7. 자동 수집 장치의 설치·운영과 거부',
      paragraphs: [
        '회사는 방문 통계를 위해 브라우저 저장소(localStorage)에 무작위 식별값을 저장합니다. 이 값으로는 개인을 알아볼 수 없습니다. 브라우저 설정에서 사이트 데이터를 삭제하거나 저장을 차단하면 수집을 거부할 수 있으며, 이 경우에도 웹사이트 이용에는 제한이 없습니다.',
      ],
    },
    {
      id: 'security',
      title: '8. 개인정보의 안전성 확보 조치',
      bullets: [
        '모든 통신은 HTTPS로 암호화합니다.',
        '문의 정보는 지정된 관리자 계정만 열람할 수 있도록 접근 권한을 제한합니다.',
        '체험 데모의 사진·음성은 저장하지 않는 구조로 처리합니다.',
        '개인정보를 다루는 인원을 최소한으로 유지합니다.',
      ],
    },
    {
      id: 'officer',
      title: '9. 개인정보 보호책임자',
      table: {
        head: ['구분', '내용'],
        rows: [
          ['책임자', POLICY_META.officer.ko],
          ['이메일', POLICY_META.email],
          ['전화', `${POLICY_META.phone} / 휴대폰 ${POLICY_META.mobile}`],
        ],
      },
      paragraphs: [
        '개인정보 침해에 대한 신고나 상담이 필요하시면 아래 기관에 문의하실 수 있습니다.',
        '개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118) · 개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972) · 대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301) · 경찰청 사이버수사국 (ecrm.police.go.kr / 국번없이 182)',
      ],
    },
    {
      id: 'changes',
      title: '10. 개인정보처리방침의 변경',
      paragraphs: ['이 방침의 내용이 바뀌면 시행 7일 전부터 웹사이트를 통해 알립니다.'],
    },
  ],
  effective: `시행일: ${POLICY_META.effectiveDate}`,
};

const en: PolicyDoc = {
  title: 'Privacy Policy',
  subtitle:
    'NEANDERco.ltd ("the Company") protects your personal information in accordance with the Personal Information Protection Act of Korea and handles related requests promptly, as set out below.',
  highlightsTitle: 'Our principles for face and photo data',
  highlights: [
    'Photos and voice captured in website demos are used only to create your result and are not stored on our servers.',
    'We do not perform facial recognition or create or store biometric identifiers (face templates).',
    'We do not use your photos or voice to train our AI models.',
    'We do not sell personal information.',
    'For photos taken at on-site event booths, the retention period and deletion method are agreed with the hosting client, written into the contract, and announced to participants on site.',
  ],
  sections: [
    {
      id: 'items',
      title: '1. Information we collect and how',
      table: {
        head: ['Purpose', 'Items', 'How collected'],
        rows: [
          ['Inquiries & quotes (incl. estimate PDFs)', '(Required) name, email, message / (Optional) phone, company, event details (type, date, attendees, venue)', 'Entered by you in the contact and online estimate forms'],
          ['Company profile requests', '(Required) name, email / (Optional) company, event being planned', 'Entered by you in the company profile form'],
          ['Experience demos', 'Photos from your camera, voice from your microphone, answers you enter', 'Captured by you while using a demo (only with browser permission)'],
          ['Visit analytics', 'Random per-browser ID, pages visited, time on page, referral source, device and browser type, approximate location (city level)', 'Collected automatically (IP addresses are not stored)'],
        ],
      },
    },
    {
      id: 'purpose',
      title: '2. Why we process it',
      bullets: [
        'Inquiries & quotes: to review your request, reply with a consultation or quote, and contact you about a contract',
        'Company profile requests: to provide the profile and follow up',
        'Experience demos: to generate the AI result you asked for (discarded right after)',
        'Visit analytics: to understand site usage and improve the service',
      ],
    },
    {
      id: 'retention',
      title: '3. Retention and deletion',
      bullets: [
        `Inquiry and quote data: kept for ${POLICY_META.inquiryRetention.en}, then deleted. If a contract follows, kept for the period required by law.`,
        'Company profile requests: kept for 1 year from the request, then deleted.',
        'Demo photos and voice: not kept on our servers after the result is created.',
        'Visit analytics: kept in a form that cannot identify you, and deleted when no longer needed for statistics.',
        'Method: electronic files are deleted irrecoverably; printed material is shredded or incinerated.',
      ],
    },
    {
      id: 'third-party',
      title: '4. Sharing with third parties',
      paragraphs: [
        'We do not provide your personal information to third parties, except with your consent or where required by law.',
      ],
    },
    {
      id: 'outsourcing',
      title: '5. Processors and international transfers',
      paragraphs: [
        'We entrust the following processing to service providers, some of which operate outside Korea. If you do not want your data transferred abroad, you can skip the relevant feature (such as demos) or contact us by email or phone instead.',
      ],
      table: {
        head: ['Provider', 'Task', 'Data', 'Location'],
        rows: [
          ['Google LLC (Firebase)', 'Storing inquiries and visit analytics', 'Inquiry data, analytics', 'Republic of Korea (Seoul region)'],
          ['Google LLC (Gmail)', 'Emailing new inquiries and profile requests to our staff', 'Inquiry and profile request data', 'United States and others'],
          ['Vercel Inc.', 'Website hosting, relaying demo requests', 'Demo photos, voice, answers (relayed, not stored)', 'United States and others'],
          ['OpenRouter, Inc. and connected AI model providers', 'Generating demo results', 'Demo photos, voice, answers', 'United States and others'],
        ],
      },
    },
    {
      id: 'rights',
      title: '6. Your rights',
      bullets: [
        'You may ask to access, correct, delete, or stop the processing of your personal information at any time.',
        `Send requests to ${POLICY_META.email} or call +82-2-336-3368 (mobile +82-10-8507-5121); we will act without delay.`,
        'To delete a photo taken at an event, tell us the event name and the time it was taken. We will confirm with the client and process it.',
      ],
    },
    {
      id: 'storage',
      title: '7. Browser storage',
      paragraphs: [
        'For visit analytics we store a random ID in your browser (localStorage). It cannot identify you. You can refuse by clearing or blocking site data in your browser settings; the website will still work.',
      ],
    },
    {
      id: 'security',
      title: '8. Security measures',
      bullets: [
        'All traffic is encrypted with HTTPS.',
        'Only designated administrator accounts can read inquiry data.',
        'Demo photos and voice are processed without being stored.',
        'We keep the number of staff handling personal information to a minimum.',
      ],
    },
    {
      id: 'officer',
      title: '9. Privacy officer',
      table: {
        head: ['', ''],
        rows: [
          ['Officer', POLICY_META.officer.en],
          ['Email', POLICY_META.email],
          ['Phone', '+82-2-336-3368 / Mobile +82-10-8507-5121'],
        ],
      },
      paragraphs: [
        'You can also contact the Personal Information Infringement Report Center (privacy.kisa.or.kr, 118) or the Personal Information Dispute Mediation Committee (www.kopico.go.kr, 1833-6972).',
      ],
    },
    {
      id: 'changes',
      title: '10. Changes to this policy',
      paragraphs: ['We will announce any changes on this website at least 7 days before they take effect.'],
    },
  ],
  effective: `Effective: ${POLICY_META.effectiveDate}`,
};

export function getPrivacyPolicy(locale: string): PolicyDoc {
  return locale === 'en' ? en : ko;
}
