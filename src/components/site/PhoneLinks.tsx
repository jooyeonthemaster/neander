import { PHONE_LINES } from '@/lib/constants';

/* 고객센터 · 직통 두 번호를 이름과 함께 적는다 (2026-11-26 사용자) — 바닥글 · 메뉴 등 한 줄짜리 자리 */
export function PhoneLinks({
  lang,
  className,
  linkClassName,
  labelClassName,
  separator = true,
}: {
  lang: 'ko' | 'en';
  className?: string;
  linkClassName?: string;
  labelClassName?: string;
  separator?: boolean;
}) {
  return (
    <span className={className}>
      {PHONE_LINES.map((p, i) => (
        <span key={p.key} className="whitespace-nowrap">
          {separator && i > 0 && <span aria-hidden="true"> · </span>}
          <span className={labelClassName}>{p[lang]}</span>{' '}
          <a href={`tel:${p.intl}`} className={linkClassName}>{lang === 'ko' ? p.number : p.intl}</a>
        </span>
      ))}
    </span>
  );
}
