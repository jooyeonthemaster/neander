'use client';

import { useLocale } from 'next-intl';
import { Calculator, MessageCircle, Phone } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useUIStore } from '@/stores/uiStore';
import { trackEvent } from '@/lib/analytics/tracker';
import { CONTACT, KAKAO_CHANNEL_CHAT_URL } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────
   휴대폰·태블릿 화면 하단에 늘 떠 있는 연락 버튼 (전화 · 온라인 견적 · 카카오톡 상담).
   휴대폰 방문은 한 페이지만 보고 23초 만에 나가는 경우가 많아(2026-09~11 방문 기록),
   어느 화면에서든 바로 연락할 수 있게 둔다.
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
    'flex min-h-12 flex-1 items-center justify-center gap-2 px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <>
      {/* 바가 바닥글 마지막 줄을 가리지 않도록 같은 높이만큼 띄운다 */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
      <nav
        aria-label={ko ? '빠른 연락' : 'Quick contact'}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-ink/85 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-xl gap-2">
          <a
            href={`tel:${CONTACT.mobile.replace(/[^0-9+]/g, '')}`}
            onClick={() => trackEvent('click_cta', 'mobile_bar:tel')}
            className={`${cell} border border-paper/40 text-paper active:bg-paper/10`}
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
              className={`${cell} bg-[#FEE500] text-[#191919]`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {ko ? '카카오톡 상담' : 'KakaoTalk'}
            </a>
          )}
          <Link
            href="/quote"
            onClick={() => trackEvent('click_cta', 'mobile_bar:quote')}
            className={`${cell} bg-paper text-ink active:bg-accent`}
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {ko ? '온라인 견적' : 'Get a quote'}
          </Link>
        </div>
      </nav>
    </>
  );
}
