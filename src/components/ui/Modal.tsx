'use client';

import {
  type ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  children: ReactNode;
  /** Optional title rendered at the top of the modal */
  title?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // 최신 onClose 를 ref 로 읽는다 — 부모가 다시 그려질 때마다 새 함수를 넘겨도 아래 효과가 다시 돌지 않게.
  // (2026-11-22: 효과가 키 입력마다 다시 돌며 팝업으로 포커스를 되돌려, 입력 칸에 한 글자씩밖에 안 들어갔다)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Trap focus and handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);

      // Focus the modal after animation
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        // data-lenis-prevent: 사이트의 부드러운 스크롤(Lenis)이 휠을 가져가면 팝업 대신 뒤 페이지가 움직인다.
        // 팝업 위의 휠은 브라우저에 맡겨 팝업 안이 스크롤되게 한다 (MobileMenu · DemoModal 과 같은 방식).
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lenis-prevent>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Modal'}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              'relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl',
              'outline-none max-h-[85vh] overflow-y-auto overscroll-contain',
              className
            )}
          >
            {/* Header with optional title and close button */}
            <div className="flex items-start justify-between mb-4">
              {title && (
                <h2 className="text-lg font-semibold text-slate-900 pr-8">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'rounded-lg p-1.5 text-slate-400 hover:text-slate-600',
                  'hover:bg-slate-100 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  !title && 'ml-auto'
                )}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
