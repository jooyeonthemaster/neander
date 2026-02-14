'use client';

import { useRef, type RefObject } from 'react';
import { useInView as useMotionInView, type UseInViewOptions as MotionInViewOptions } from 'motion/react';

type MarginType = NonNullable<MotionInViewOptions['margin']>;

interface UseInViewOptions {
  /** Margin around the root, e.g. "-100px 0px" */
  margin?: MarginType;
  /** If true, triggers only once and stays true */
  once?: boolean;
  /** IntersectionObserver threshold (0-1) */
  amount?: number | 'some' | 'all';
}

/**
 * Wrapper around motion's useInView with a simpler API.
 * Returns a ref to attach and a boolean for visibility state.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): { ref: RefObject<T | null>; isInView: boolean } {
  const ref = useRef<T | null>(null);

  const isInView = useMotionInView(ref, {
    margin: options.margin,
    once: options.once ?? false,
    amount: options.amount,
  });

  return { ref, isInView };
}
