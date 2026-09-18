'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Input, Textarea } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { useQuoteStore } from '@/stores/quoteStore';
import { services as servicesData } from '@/data/services';
import { addOns } from '@/data/pricing';
import { createInquiry } from '@/lib/firebase/inquiries';
import type { QuoteSnapshot } from '@/types/inquiry';

// 최대 길이는 firestore.rules 의 inquiries 생성 규칙과 맞춘다 (넘으면 저장이 거부된다)
const MAX_LENGTH = { name: 100, email: 200, message: 5000 } as const;

const submitSchema = z.object({
  name: z.string().trim().min(1, 'required').max(MAX_LENGTH.name, 'maxLength'),
  email: z.string().trim().min(1, 'required').max(MAX_LENGTH.email, 'maxLength').email('email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().max(MAX_LENGTH.message, 'maxLength').optional(),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: 'required' }),
  }),
});

type SubmitFormValues = z.infer<typeof submitSchema>;
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function QuoteSubmitForm() {
  const t = useTranslations('quote');
  const tValidation = useTranslations('validation');
  const locale = useLocale();
  const [status, setStatus] = useState<FormStatus>('idle');

  const selectedServices = useQuoteStore((s) => s.services);
  const eventDetails = useQuoteStore((s) => s.eventDetails);
  const selectedAddOns = useQuoteStore((s) => s.selectedAddOns);
  const getEstimate = useQuoteStore((s) => s.getEstimate);
  const reset = useQuoteStore((s) => s.reset);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: { name: '', email: '', phone: '', company: '', message: '' },
  });

  function getErrorMessage(field: keyof SubmitFormValues): string | undefined {
    const message = errors[field]?.message;
    if (!message) return undefined;
    try {
      const max = field in MAX_LENGTH ? MAX_LENGTH[field as keyof typeof MAX_LENGTH] : 0;
      return tValidation(message as 'required' | 'email' | 'maxLength', { max });
    } catch {
      return message as string;
    }
  }

  /** 현재 선택한 견적 내용을 사람이 읽을 수 있는 형태로 정리한다 */
  function buildSnapshot(): QuoteSnapshot {
    const { total } = getEstimate();
    return {
      eventType: t(`eventTypes.${eventDetails.type}`),
      eventDate: eventDetails.date || undefined,
      duration: eventDetails.duration,
      expectedAttendees: eventDetails.expectedAttendees,
      location: eventDetails.location || undefined,
      venueSize: t(`venueSizes.${eventDetails.venueSize}`),
      services: selectedServices.map((selected) => {
        const service = servicesData.find((s) => s.key === selected.serviceKey);
        return service ? t(`services.${service.key}.name`) : selected.serviceKey;
      }),
      addOns: selectedAddOns.map((id) => {
        const addOn = addOns.find((a) => a.id === id);
        return addOn ? t(`addOns.${addOn.labelKey}`) : id;
      }),
      estimatedTotal: total,
    };
  }

  async function onSubmit(data: SubmitFormValues) {
    setStatus('submitting');
    try {
      const snapshot = buildSnapshot();
      await createInquiry({
        kind: 'quote',
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: t('title'),
        message:
          data.message?.trim() ||
          `${snapshot.services.join(', ')} / 예상 견적 ${snapshot.estimatedTotal.toLocaleString('ko-KR')}원`,
        locale,
        quote: snapshot,
      });
      setStatus('success');
      reset();
    } catch (error) {
      console.error('[QuoteSubmitForm] 견적 요청 저장 실패:', error);
      setStatus('error');
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center"
          role="status"
        >
          <h3 className="mb-2 text-lg font-bold text-teal-900">{t('success.title')}</h3>
          <p className="text-sm text-teal-700">{t('success.description')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-500"
            >
              {t('success.backToHome')}
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-teal-300 bg-white px-6 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50"
            >
              {t('portfolioLink')}
            </Link>
          </div>
        </motion.div>
      ) : status === 'error' ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"
          role="alert"
        >
          <h3 className="mb-2 text-lg font-bold text-rose-900">{t('error.title')}</h3>
          <p className="text-sm text-rose-700">{t('error.description')}</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-rose-300 bg-white px-6 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            {t('error.retry')}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8"
        >
          <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('summaryReview')}</h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">{t('summaryDescription')}</p>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label={t('form.contactName')}
                placeholder={t('form.contactNamePlaceholder')}
                error={getErrorMessage('name')}
                required
                {...register('name')}
              />
              <Input
                label={t('form.email')}
                type="email"
                placeholder={t('form.emailPlaceholder')}
                error={getErrorMessage('email')}
                required
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label={t('form.phone')}
                type="tel"
                placeholder={t('form.phonePlaceholder')}
                {...register('phone')}
              />
              <Input
                label={t('form.companyName')}
                placeholder={t('form.companyNamePlaceholder')}
                {...register('company')}
              />
            </div>

            <Textarea
              label={t('form.additionalInfo')}
              placeholder={t('form.additionalInfoPlaceholder')}
              rows={4}
              error={getErrorMessage('message')}
              {...register('message')}
            />

            <div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  {...register('privacyConsent')}
                />
                <span>
                  {t('form.privacyConsent')}
                  <span className="mt-1 block text-xs text-slate-400">
                    {t('form.privacyConsentDetail')}
                  </span>
                </span>
              </label>
              {errors.privacyConsent && (
                <p className="mt-2 text-xs text-rose-600">{getErrorMessage('privacyConsent')}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || selectedServices.length === 0}
            className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {status === 'submitting' ? t('form.submitting') : t('form.submit')}
          </button>

          {selectedServices.length === 0 && (
            <p className="mt-3 text-center text-xs text-slate-400">{t('emptyServices')}</p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
