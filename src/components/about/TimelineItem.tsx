'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  title: string;
  description: string;
  icon?: string;
  side: 'left' | 'right';
  delay: number;
  /** 팝오버에 띄울 사진 (없으면 설명만 표시) */
  image?: string;
}

export function TimelineItem({
  title,
  description,
  icon,
  side,
  delay,
  image,
}: TimelineItemProps) {
  const isLeft = side === 'left';
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  // 터치 기기에서는 탭으로 열고 닫는다.
  // (마우스가 없는 기기에서도 pointerenter가 먼저 발생해 클릭이 곧바로 닫아버리던 문제 방지)
  const pointerType = useRef<string>('mouse');

  // 보여줄 내용이 없으면 팝오버를 띄우지 않는다
  const hasDetail = Boolean(description || image);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative"
    >
      <div
        className={cn(
          'relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
          'transition-colors duration-200',
          hasDetail
            ? 'cursor-pointer hover:border-teal-300 hover:shadow-md'
            : 'hover:border-teal-200 hover:shadow-md'
        )}
        // 데스크톱은 마우스 호버, 모바일은 탭, 키보드는 포커스로 열린다
        onPointerEnter={(e) => {
          pointerType.current = e.pointerType;
          if (hasDetail && e.pointerType === 'mouse') setOpen(true);
        }}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setOpen(false);
        }}
        onFocus={(e) => {
          // 키보드 포커스일 때만 연다.
          // (터치로 탭하면 포커스가 먼저 열고 이어지는 클릭이 곧바로 닫아버린다)
          if (hasDetail && e.currentTarget.matches(':focus-visible')) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onClick={() => {
          // 마우스는 호버로 이미 열려 있으므로 클릭에 반응하지 않는다
          if (hasDetail && pointerType.current !== 'mouse') setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        tabIndex={hasDetail ? 0 : undefined}
        role={hasDetail ? 'button' : undefined}
        aria-expanded={hasDetail ? open : undefined}
        aria-describedby={hasDetail && open ? popoverId : undefined}
      >
        {/* Connector arrow */}
        <div
          className={cn(
            'absolute top-5 hidden h-3 w-3 rotate-45 border bg-white lg:block',
            isLeft
              ? '-right-1.5 border-r border-t border-slate-200'
              : '-left-1.5 border-b border-l border-slate-200'
          )}
          aria-hidden="true"
        />

        <div className="flex items-start gap-3">
          {icon && (
            <span className="shrink-0 text-xl" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
              {title}
            </h4>
            {description && (
              <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-slate-400 sm:text-sm lg:hidden">
                {description}
              </p>
            )}
          </div>
          {hasDetail && (
            <span
              className="mt-0.5 hidden shrink-0 text-slate-300 lg:block"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M8 7.2v4M8 5.1v.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Popover */}
      <AnimatePresence>
        {hasDetail && open && (
          <motion.div
            id={popoverId}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              'absolute z-30 w-full overflow-hidden rounded-xl lg:w-80',
              'border border-slate-200 bg-white text-left shadow-xl shadow-slate-900/10',
              // 모바일은 카드 아래, 데스크톱은 타임라인 바깥쪽으로 펼친다
              'left-0 top-[calc(100%+8px)]',
              isLeft
                ? 'lg:left-auto lg:right-0 lg:top-[calc(100%+10px)]'
                : 'lg:left-0 lg:top-[calc(100%+10px)]'
            )}
          >
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                className="h-36 w-full object-cover"
                loading="lazy"
              />
            )}
            {description && (
              <p className="px-4 py-3 text-xs leading-relaxed text-slate-600">
                {description}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
