'use client';

import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  /** The text content to reveal word-by-word */
  text: string;
  className?: string;
  /** Initial delay before the first word appears, in seconds */
  delay?: number;
  /** Delay between each word, in seconds */
  staggerDelay?: number;
}

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.04,
}: TextRevealProps) {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      y: '100%',
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      aria-label={text}
      className={cn('inline-flex flex-wrap', className)}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden mr-[0.25em] pt-[0.1em] -mt-[0.1em]"
        >
          <motion.span
            variants={wordVariants}
            className="inline-block"
            aria-hidden="true"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
