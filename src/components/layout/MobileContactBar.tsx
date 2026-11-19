'use client';

import { useLocale } from 'next-intl';
import { Calculator, MessageCircle, Phone } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useUIStore } from '@/stores/uiStore';
import { trackEvent } from '@/lib/analytics/tracker';
import { CONTACT, KAKAO_CHANNEL_CHAT_URL } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────
   휴대폰·태블릿 화면 하단에 늘 떠 있는 연락 버튼 (전화 · 온라인 견적 · 카카오톡 상담).
   머리글의 문의 버튼은 넓은 PC 화면에서만 보여서, 휴대폰 방문(전체의 40%)에서는
   메뉴를 열어야 연락할 수 있었다 — 2026-11 방문 분석에서 휴대폰 문의 0곳, 전화 클릭 0회.
   카카오톡 버튼은 KAKAO_CHANNEL_CHAT_URL 이 있을 때만 보인다 (2026-11-19부터 비워 둬서 숨김).
   견적·문의 화면과 체험 데모처럼 자체 버튼이 있는 화면에서는 숨긴다.
   ───────────────────────────────────────────────────────── */

const HIDDEN_PREFIXES = ['/quote', '/contact', '/demo', '/formula-lab'];

export default function MobileContactBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const menuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const ko = locale !== 'en';

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const cell =
    'flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400';

  return (
    <>
      {/* 바가 푸터 마지막 줄을 가리지 않도록 같은 높이만큼 띄운다 */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
      <nav
        aria-label={ko ? '빠른 연락' : 'Quick contact'}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 lg:hidden ${
          menuOpen ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-xl gap-2">
          <a
            href={`tel:${CONTACT.phone.replace(/[^0-9+]/g, '')}`}
            onClick={() => trackEvent('click_cta', 'mobile_bar:tel')}
            className={`${cell} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {ko ? '전화 상담' : 'Call us'}
          </a>
          {KAKAO_CHANNEL_CHAT_URL && (
            <a
              href={KAKAO_CHANNEL_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('click_cta', 'mobile_bar:kakao')}
              className={`${cell} bg-[#FEE500] text-[#191919] hover:bg-[#f5dc00]`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {ko ? '카카오톡 상담' : 'KakaoTalk'}
            </a>
          )}
          <Link
            href="/quote"
            onClick={() => trackEvent('click_cta', 'mobile_bar:quote')}
            className={`${cell} bg-teal-600 text-white hover:bg-teal-500`}
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {ko ? '온라인 견적' : 'Get a quote'}
          </Link>
        </div>
      </nav>
    </>
  );
}
