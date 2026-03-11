'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  AGE_OPTIONS, USAGE_OPTIONS, LIFESTYLE_OPTIONS, NOTE_TAG_OPTIONS,
  type BrandBrief,
} from '@/data/formula-lab-data';

interface Props {
  onSubmit: (brief: BrandBrief) => void;
}

function TagSelect({ options, selected, onChange, color = 'teal' }: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  color?: 'teal' | 'red';
}) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-pointer ${
              active
                ? color === 'teal'
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-red-50 text-red-600 border-red-300'
                : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function BrandBriefForm({ onSubmit }: Props) {
  const [brandName, setBrandName] = useState('');
  const [targetAge, setTargetAge] = useState('20late');
  const [targetGender, setTargetGender] = useState<'female' | 'male' | 'unisex'>('female');
  const [emotionalDescription, setEmotionalDescription] = useState('');
  const [usageContext, setUsageContext] = useState('daily');
  const [budgetLevel, setBudgetLevel] = useState<'standard' | 'premium' | 'luxury'>('premium');
  const [preferredNotes, setPreferredNotes] = useState<string[]>([]);
  const [avoidedNotes, setAvoidedNotes] = useState<string[]>([]);
  const [lifestyleKeywords, setLifestyleKeywords] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emotionalDescription.trim()) return;
    onSubmit({
      brandName, targetAge, targetGender, emotionalDescription,
      usageContext, budgetLevel, preferredNotes, avoidedNotes, lifestyleKeywords,
    });
  };

  const isValid = emotionalDescription.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-neutral-950 text-white overflow-hidden"
      >
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Teal Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-teal-500/8 rounded-full blur-[120px]" />

        <div className="relative max-w-[1400px] mx-auto px-8 py-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-teal-500" />
              <span className="text-xs font-medium text-teal-400 tracking-[0.2em] uppercase">
                AI-Powered Fragrance Design
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
              Emotional Brief
            </h1>
            <p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
              목표 고객과 감성 키워드를 입력하면, AI가 최적의 향 배합을 자동으로 설계합니다.
              감성 언어를 수학적 벡터로 변환하는 것에서 시작합니다.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-12 gap-y-16">

            {/* ── Left Column: Core Info ── */}
            <div className="col-span-7 space-y-12">
              {/* Brand Name */}
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-3">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="예: Nonfiction, Tamburins, Diptyque..."
                  className="w-full border-b-2 border-neutral-200 focus:border-teal-500 bg-transparent pb-3 text-2xl font-[family-name:var(--font-display)] font-semibold text-neutral-950 placeholder:text-neutral-300 outline-none transition-colors"
                />
              </motion.div>

              {/* Emotional Description - The Key Input */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-2">
                  Emotional Brief <span className="text-teal-500">*</span>
                </label>
                <p className="text-sm text-neutral-700 mb-4">
                  원하는 감성을 자연어로 자유롭게 기술하세요. AI가 이를 16차원 감성 벡터로 변환합니다.
                </p>
                <textarea
                  value={emotionalDescription}
                  onChange={e => setEmotionalDescription(e.target.value)}
                  placeholder="예: 세련되고 도시적이면서도 편안한 느낌. 퇴근 후 자기만의 시간에 쓰는 향."
                  rows={4}
                  className="w-full border-2 border-neutral-200 focus:border-teal-500 rounded-xl px-5 py-4 text-base text-neutral-800 placeholder:text-neutral-300 outline-none transition-colors resize-none leading-relaxed"
                />
                <div className="flex gap-2 mt-3">
                  {['세련되고 도시적인', '따뜻하고 포근한', '신비롭고 관능적인', '상쾌하고 자유로운'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEmotionalDescription(prev => prev ? `${prev} ${tag}` : tag)}
                      className="text-xs text-neutral-700 border border-neutral-200 rounded-full px-3 py-1 hover:border-teal-400 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Target Audience */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-5">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-8">
                  {/* Age */}
                  <div>
                    <span className="text-sm font-medium text-neutral-950 mb-3 block">연령대</span>
                    <div className="space-y-1.5">
                      {AGE_OPTIONS.map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
                            targetAge === opt.value
                              ? 'bg-teal-50 text-teal-700'
                              : 'hover:bg-neutral-50 text-neutral-900'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            targetAge === opt.value ? 'border-teal-500' : 'border-neutral-300'
                          }`}>
                            {targetAge === opt.value && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                          </div>
                          <span className="text-sm font-medium">{opt.label}</span>
                          <input type="radio" name="age" value={opt.value} checked={targetAge === opt.value}
                            onChange={() => setTargetAge(opt.value)} className="sr-only" />
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Gender */}
                  <div>
                    <span className="text-sm font-medium text-neutral-950 mb-3 block">성별</span>
                    <div className="space-y-1.5">
                      {([
                        { value: 'female', label: '여성' },
                        { value: 'male', label: '남성' },
                        { value: 'unisex', label: '유니섹스' },
                      ] as const).map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
                            targetGender === opt.value
                              ? 'bg-teal-50 text-teal-700'
                              : 'hover:bg-neutral-50 text-neutral-900'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            targetGender === opt.value ? 'border-teal-500' : 'border-neutral-300'
                          }`}>
                            {targetGender === opt.value && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                          </div>
                          <span className="text-sm font-medium">{opt.label}</span>
                          <input type="radio" name="gender" value={opt.value} checked={targetGender === opt.value}
                            onChange={() => setTargetGender(opt.value)} className="sr-only" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lifestyle Keywords */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-2">
                  Lifestyle Keywords
                </label>
                <p className="text-sm text-neutral-700 mb-4">타깃 고객의 라이프스타일을 선택하세요.</p>
                <TagSelect options={LIFESTYLE_OPTIONS} selected={lifestyleKeywords} onChange={setLifestyleKeywords} />
              </motion.div>
            </div>

            {/* ── Right Column: Preferences ── */}
            <div className="col-span-5 space-y-12">
              {/* Usage Context */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-3">
                  Usage Context
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {USAGE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUsageContext(opt.value)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border cursor-pointer ${
                        usageContext === opt.value
                          ? 'bg-neutral-950 text-white border-neutral-950'
                          : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Budget Level */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-3">
                  Budget Tier
                </label>
                <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
                  {([
                    { value: 'standard', label: 'Standard', desc: '₩500~800만' },
                    { value: 'premium', label: 'Premium', desc: '₩800~1,200만' },
                    { value: 'luxury', label: 'Luxury', desc: '₩1,200만+' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudgetLevel(opt.value)}
                      className={`flex-1 py-4 text-center transition-all cursor-pointer ${
                        budgetLevel === opt.value
                          ? 'bg-neutral-950 text-white'
                          : 'bg-white text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className={`text-xs mt-0.5 ${budgetLevel === opt.value ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Preferred Notes */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-2">
                  Preferred Notes <span className="text-neutral-500">(optional)</span>
                </label>
                <p className="text-sm text-neutral-700 mb-4">선호하는 향의 계열을 선택하세요.</p>
                <TagSelect options={NOTE_TAG_OPTIONS} selected={preferredNotes} onChange={setPreferredNotes} />
              </motion.div>

              {/* Avoided Notes */}
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
                <label className="block text-xs font-semibold text-neutral-950 tracking-[0.15em] uppercase mb-2">
                  Notes to Avoid <span className="text-neutral-500">(optional)</span>
                </label>
                <p className="text-sm text-neutral-700 mb-4">피하고 싶은 향의 계열을 선택하세요.</p>
                <TagSelect options={NOTE_TAG_OPTIONS} selected={avoidedNotes} onChange={setAvoidedNotes} color="red" />
              </motion.div>

              {/* Submit */}
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="pt-4">
                <motion.button
                  type="submit"
                  disabled={!isValid}
                  whileHover={isValid ? { scale: 1.01 } : undefined}
                  whileTap={isValid ? { scale: 0.98 } : undefined}
                  className={`w-full py-4 rounded-xl text-base font-semibold tracking-wide transition-all cursor-pointer ${
                    isValid
                      ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    AI 배합 설계 시작
                  </span>
                </motion.button>
                <p className="text-center text-xs text-neutral-600 mt-3">
                  OPT-16 → CVAE-PA → CINN → BO-OC → SOP 파이프라인이 순차적으로 실행됩니다
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
