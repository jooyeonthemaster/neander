'use client';

import { useState } from 'react';
import { EVENT_TYPES, type Lang } from '@/lib/quote/catalog';
import type { CustomOptions } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';

/** Screen concept independent of the physical event floor and its camera. */
export function CustomContentTablet({ options, eventType, lang, expanded = false }: {
  options: CustomOptions; eventType: string; lang: Lang; expanded?: boolean;
}) {
  const [result, setResult] = useState(true);
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const event = EVENT_TYPES.find(entry => entry.key === eventType)?.label[lang] ?? L('우리 행사', 'Your event');
  return <div data-testid="custom-content-tablet" data-scope={options.scope} data-pg={!!options.pgIntegration} data-consulting={options.consulting}
    data-maintenance={options.maintenanceMonths} data-screen={result ? 'result' : 'participate'}
    className={cn('w-[142px] lg:w-[230px] xl:w-[250px]', expanded && '!w-[160px] lg:!w-[320px]')}>
    <p className="mb-1 whitespace-nowrap text-right text-[8px] font-semibold text-teal-800 lg:text-[10px]">{L('행사 맞춤 AI · 화면 예시', 'Event AI · screen example')}</p>
    <button type="button" data-testid="custom-tablet-screen" onClick={() => setResult(!result)}
      aria-label={result ? L('태블릿 참여 화면 보기', 'Show tablet participation screen') : L('태블릿 AI 결과 보기', 'Show tablet AI result')}
      className="block w-full rounded-[14px] shadow-[0_10px_24px_-12px_rgba(15,23,42,.5)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none">
      <svg viewBox="0 0 360 230" role="img" aria-label={L(`${event}를 위한 커스텀 AI 콘텐츠 ${result ? '결과' : '참여'} 예시`, `Custom AI ${result ? 'result' : 'participation'} example for ${event}`)} className="block w-full">
        <rect x="1" y="1" width="358" height="228" rx="22" fill="#293f49" stroke="#60747a" strokeWidth="2" />
        <circle cx="9" cy="115" r="2.5" fill="#a5c3c5" />
        <rect x="18" y="12" width="326" height="204" rx="12" fill="#fcfbf7" />
        <rect x="18" y="12" width="326" height="37" rx="12" fill="#e5efea" />
        <text x="31" y="36" fill="#245760" fontSize="13" fontWeight="700">{event} · AI</text>
        <text x="330" y="36" textAnchor="end" fill="#507879" fontSize="11">{options.consulting ? L('함께 기획', 'Co-designed') : L('맞춤 제작', 'Custom-built')}</text>
        {result ? <g data-testid="custom-tablet-result">
          <rect x="31" y="60" width="108" height="118" rx="14" fill="#c8e3dc" />
          <circle cx="85" cy="104" r="31" fill="#f5dfc9" />
          <path d="m85 77 8 19 19 8-19 8-8 19-8-19-19-8 19-8Z" fill="#218d96" />
          <path d="M48 155Q85 120 122 155" fill="none" stroke="#f5fcf9" strokeWidth="8" strokeLinecap="round" />
          <circle cx="121" cy="70" r="7" fill="#eb9c7e" />
          <text x="152" y="78" fill="#63817d" fontSize="11">{L('나를 위한 행사 콘텐츠', 'Made for this event')}</text>
          <text x="152" y="103" fill="#263f48" fontSize="17" fontWeight="700">{L('나만의 AI 결과', 'Your AI result')}</text>
          <rect x="152" y="116" width="155" height="5" rx="2.5" fill="#d9dfd7" />
          <rect x="152" y="129" width="118" height="5" rx="2.5" fill="#d9dfd7" />
          {options.scope === 'large' && <g data-testid="custom-tablet-connected"><rect x="152" y="147" width="71" height="29" rx="7" fill="#e5efea" /><rect x="230" y="147" width="97" height="29" rx="7" fill="#f5e6d5" /><text x="188" y="166" textAnchor="middle" fill="#386866" fontSize="11">{L('맞춤 추천', 'Match')}</text><text x="278" y="166" textAnchor="middle" fill="#80684e" fontSize="11">{L('다음 체험', 'Next activity')}</text></g>}
        </g> : <g data-testid="custom-tablet-participate">
          <text x="181" y="78" textAnchor="middle" fill="#263f48" fontSize="17" fontWeight="700">{L('어떤 이야기를 만나볼까요?', 'What would you like to explore?')}</text>
          {[0, 1, 2].map(index => <g key={index} transform={`translate(${38 + index * 100} 92)`}><rect width="88" height="76" rx="12" fill={['#c8e3dc', '#f2dfc8', '#e0e6ee'][index]} /><circle cx="44" cy="30" r="16" fill="#fffdf6" /><path d="M25 59H63" stroke="#738d89" strokeWidth="4" strokeLinecap="round" /></g>)}
        </g>}
        <rect x="31" y="188" width="298" height="20" rx="7" fill={options.pgIntegration ? '#293f49' : '#218d96'} />
        <text x="180" y="202" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{options.pgIntegration ? L('결제하고 참여하기 · PG 연결', 'Pay & participate · payment gateway') : L('행사 맞춤 체험에 참여하기', 'Join your event experience')}</text>
        <path d="M152 222H208" stroke="#819294" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
    <p className="mt-1 whitespace-nowrap text-right text-[8px] leading-tight text-slate-500 lg:text-[9px]">{L('눌러서 참여·결과 보기', 'Tap to preview')}{options.maintenanceMonths > 0 && <span className="ml-1 text-teal-700">· {options.maintenanceMonths}{L('개월 관리', 'mo support')}</span>}</p>
  </div>;
}
