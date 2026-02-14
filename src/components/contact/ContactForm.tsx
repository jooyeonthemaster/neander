'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Input, Textarea, Select } from '@/components/ui';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(1, 'required'),
  email: z.string().min(1, 'required').email('email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, 'required'),
  message: z.string().min(10, 'minLength'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('contact');
  const tValidation = useTranslations('validation');
  const [status, setStatus] = useState<FormStatus>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
    },
  });

  const subjectValue = watch('subject');

  function getErrorMessage(field: keyof ContactFormValues): string | undefined {
    const err = errors[field];
    if (!err?.message) return undefined;
    try {
      return tValidation(err.message as 'required' | 'email' | 'minLength', { min: 10 });
    } catch {
      return err.message;
    }
  }

  async function onSubmit(data: ContactFormValues) {
    setStatus('submitting');

    try {
      // Placeholder: console log for now, API route later
      console.log('Contact form submitted:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  }

  const subjectOptions = [
    { value: 'general', label: t('form.subjectOptions.general') },
    { value: 'partnership', label: t('form.subjectOptions.partnership') },
    { value: 'quote', label: t('form.subjectOptions.quote') },
    { value: 'media', label: t('form.subjectOptions.media') },
    { value: 'career', label: t('form.subjectOptions.career') },
    { value: 'other', label: t('form.subjectOptions.other') },
  ];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center sm:p-12"
            role="status"
          >
            {/* Success icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
              <svg className="h-7 w-7 text-teal-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-teal-900">
              {t('success.title')}
            </h3>
            <p className="text-sm text-teal-700">
              {t('success.description')}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-teal-300 bg-white px-5 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              Send another message
            </button>
          </motion.div>
        ) : status === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center sm:p-12"
            role="alert"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-7 w-7 text-rose-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-rose-900">
              {t('error.title')}
            </h3>
            <p className="text-sm text-rose-700">
              {t('error.description')}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-5 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Try again
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Name + Email row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label={t('form.name')}
                error={getErrorMessage('name')}
                {...register('name')}
              />
              <Input
                type="email"
                label={t('form.email')}
                error={getErrorMessage('email')}
                {...register('email')}
              />
            </div>

            {/* Phone + Company row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                type="tel"
                label={t('form.phone')}
                error={getErrorMessage('phone')}
                {...register('phone')}
              />
              <Input
                label={t('form.company')}
                error={getErrorMessage('company')}
                {...register('company')}
              />
            </div>

            {/* Subject select */}
            <Select
              label={t('form.subject')}
              options={subjectOptions}
              placeholder={t('form.subject')}
              error={getErrorMessage('subject')}
              value={subjectValue}
              {...register('subject')}
            />

            {/* Message textarea */}
            <Textarea
              label={t('form.message')}
              error={getErrorMessage('message')}
              {...register('message')}
            />

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              whileHover={status !== 'submitting' ? { scale: 1.02 } : undefined}
              whileTap={status !== 'submitting' ? { scale: 0.97 } : undefined}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3.5',
                'text-base font-medium text-white',
                'bg-teal-600 transition-colors hover:bg-teal-500',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-60'
              )}
            >
              {status === 'submitting' ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  {t('form.submit')}
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
