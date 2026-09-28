'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { getExperienceImage } from '@/data/experience-images';
import { cn } from '@/lib/utils';

interface ExperienceImageProps {
  slug: string;
  name: string;
  sizes?: string;
  className?: string;
}

export function ExperienceImage({
  slug,
  name,
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px',
  className,
}: ExperienceImageProps) {
  const locale = useLocale();
  const t = useTranslations('services');
  const image = getExperienceImage(slug);
  if (!image) return null;

  const isKorean = locale === 'ko';
  const caption = image.kind === 'case'
    ? `${t('photoCase')} · ${isKorean ? image.eventKo : image.eventEn}`
    : t('photoConcept');
  const alt = image.kind === 'case'
    ? `${name} — ${caption}`
    : `${name} — ${isKorean ? image.altKo : image.altEn} (${caption})`;

  return (
    <figure className={cn('relative aspect-[16/9] shrink-0 overflow-hidden bg-neutral-100', className)}>
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-neutral-950/5 to-transparent"
        aria-hidden="true"
      />
      <figcaption className="absolute bottom-3 left-3 right-3 truncate text-[11px] font-medium text-white">
        {caption}
      </figcaption>
    </figure>
  );
}
