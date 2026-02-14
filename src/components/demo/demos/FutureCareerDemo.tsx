'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoModule,
  DemoConfig,
  DemoAnswers,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';

/* ── Static Data ─────────────────────────────────────── */
const INTERESTS = [
  { id: 'tech', emoji: '\u{1F4BB}', label: '\uD14C\uD06C\uB180\uB85C\uC9C0', desc: '\uCF54\uB529, AI, \uB85C\uBD07, \uBBF8\uB798 \uAE30\uC220' },
  { id: 'creative', emoji: '\u{1F3A8}', label: '\uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C', desc: '\uB514\uC790\uC778, \uC601\uC0C1, \uC74C\uC545, \uCF58\uD150\uCE20' },
  { id: 'science', emoji: '\u{1F52C}', label: '\uACFC\uD559', desc: '\uC5F0\uAD6C, \uC2E4\uD5D8, \uBC1C\uACAC, \uD601\uC2E0' },
  { id: 'business', emoji: '\u{1F4CA}', label: '\uBE44\uC988\uB2C8\uC2A4', desc: '\uACBD\uC601, \uB9C8\uCF00\uD305, \uC804\uB7B5, \uB9AC\uB354\uC2ED' },
  { id: 'social', emoji: '\u{1F331}', label: '\uC0AC\uD68C\uACF5\uD5CC', desc: '\uAD50\uC721, \uD658\uACBD, \uBCF5\uC9C0, \uBD09\uC0AC' },
] as const;

const QUADRANTS = [
  { id: 'structured-solo', label: '\uCCB4\uACC4\uC801 \uC804\uBB38\uAC00', row: 0, col: 0, color: 'blue' },
  { id: 'structured-team', label: '\uC870\uC9C1\uD615 \uB9AC\uB354', row: 0, col: 1, color: 'green' },
  { id: 'flexible-solo', label: '\uC790\uC720\uB85C\uC6B4 \uC7A5\uC778', row: 1, col: 0, color: 'purple' },
  { id: 'flexible-team', label: '\uC720\uC5F0\uD55C \uD611\uC5C5\uAC00', row: 1, col: 1, color: 'amber' },
] as const;

const SUPERPOWERS = [
  { id: 'creativity', emoji: '\u2728', label: '\uCC3D\uC758\uB825', desc: '\uB0A8\uB4E4\uC774 \uBCF4\uC9C0 \uBABB\uD558\uB294 \uAC83\uC744 \uBCF8\uB2E4' },
  { id: 'logic', emoji: '\u{1F9E9}', label: '\uB17C\uB9AC\uB825', desc: '\uBCF5\uC7A1\uD55C \uBB38\uC81C\uB97C \uBA85\uCF8C\uD558\uAC8C \uD574\uACB0' },
  { id: 'communication', emoji: '\u{1F5E3}\uFE0F', label: '\uC18C\uD1B5\uB825', desc: '\uB204\uAD6C\uC640\uB3C4 \uD1B5\uD558\uB294 \uB300\uD654\uC758 \uB2EC\uC778' },
  { id: 'leadership', emoji: '\u{1F451}', label: '\uB9AC\uB354\uC2ED', desc: '\uC0AC\uB78C\uB4E4\uC744 \uC774\uB044\uB294 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uD798' },
  { id: 'empathy', emoji: '\u{1F49B}', label: '\uACF5\uAC10\uB825', desc: '\uB9C8\uC74C\uC744 \uC77D\uACE0 \uC5F0\uACB0\uD558\uB294 \uB2A5\uB825' },
] as const;

interface CareerData { name: string; emoji: string; compatibility: number; skills: string[]; timeline: [string, string, string]; desc: string; }
const CAREERS: Record<string, CareerData> = {
  'ai-engineer': {
    name: 'AI \uC5D4\uC9C0\uB2C8\uC5B4', emoji: '\u{1F916}', compatibility: 94,
    skills: ['Python', 'Machine Learning', '\uB370\uC774\uD130 \uBD84\uC11D', '\uBB38\uC81C \uD574\uACB0'],
    timeline: ['AI \uAE30\uCD08\uC640 \uD504\uB85C\uADF8\uB798\uBC0D \uB9C8\uC2A4\uD130', 'AI \uD504\uB85C\uC81D\uD2B8 \uB9AC\uB4DC \uBC0F \uB17C\uBB38 \uBC1C\uD45C', '\uAE00\uB85C\uBC8C AI \uC5F0\uAD6C\uC18C \uC218\uC11D \uC5D4\uC9C0\uB2C8\uC5B4'],
    desc: '\uC778\uACF5\uC9C0\uB2A5\uC758 \uCD5C\uC804\uC120\uC5D0\uC11C \uBBF8\uB798\uB97C \uB9CC\uB4DC\uB294 \uC5D4\uC9C0\uB2C8\uC5B4! \uB17C\uB9AC\uC801 \uC0AC\uACE0\uC640 \uAE30\uC220\uB825\uC73C\uB85C \uC138\uC0C1\uC744 \uBCC0\uD654\uC2DC\uD0B5\uB2C8\uB2E4.',
  },
  'ux-designer': {
    name: 'UX \uB514\uC790\uC774\uB108', emoji: '\u{1F3AF}', compatibility: 91,
    skills: ['\uC0AC\uC6A9\uC790 \uB9AC\uC11C\uCE58', 'Figma', '\uD504\uB85C\uD1A0\uD0C0\uC774\uD551', '\uB514\uC790\uC778 \uC0AC\uACE0'],
    timeline: ['UX \uBC29\uBC95\uB860\uACFC \uB514\uC790\uC778 \uD234 \uC2B5\uB4DD', '\uC8FC\uC694 \uC11C\uBE44\uC2A4 UX \uB9AC\uB4DC \uB514\uC790\uC774\uB108', '\uAE00\uB85C\uBC8C \uD14C\uD06C \uAE30\uC5C5 \uB514\uC790\uC778 \uB9AC\uB354'],
    desc: '\uAE30\uC220\uACFC \uAC10\uC131\uC744 \uC5F0\uACB0\uD558\uB294 UX \uB514\uC790\uC774\uB108! \uC0AC\uC6A9\uC790 \uC911\uC2EC\uC758 \uD601\uC2E0\uC801\uC778 \uACBD\uD5D8\uC744 \uB9CC\uB4E4\uC5B4\uAC11\uB2C8\uB2E4.',
  },
  'tech-entrepreneur': {
    name: '\uD14C\uD06C \uCC3D\uC5C5\uAC00', emoji: '\u{1F680}', compatibility: 88,
    skills: ['\uBE44\uC804 \uC124\uACC4', '\uC81C\uD488 \uAC1C\uBC1C', '\uD300 \uBE4C\uB529', '\uD22C\uC790 \uC720\uCE58'],
    timeline: ['\uAE30\uC220 \uC2A4\uD0DD \uAD6C\uCD95 & \uC544\uC774\uB514\uC5B4 \uAC80\uC99D', '\uC2A4\uD0C0\uD2B8\uC5C5 \uC124\uB9BD & \uC2DC\uB9AC\uC988A \uB2EC\uC131', '\uC720\uB2C8\uCF58 \uAE30\uC5C5\uC73C\uB85C \uC131\uC7A5'],
    desc: '\uAE30\uC220\uB85C \uC138\uC0C1\uC758 \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB294 \uCC3D\uC5C5\uAC00! \uD601\uC2E0\uC801\uC778 \uC544\uC774\uB514\uC5B4\uB97C \uD604\uC2E4\uB85C \uB9CC\uB4DC\uB294 \uC2E4\uD589\uB825\uC774 \uBB34\uAE30\uC785\uB2C8\uB2E4.',
  },
  'content-creator': {
    name: '\uCF58\uD150\uCE20 \uD06C\uB9AC\uC5D0\uC774\uD130', emoji: '\u{1F4F1}', compatibility: 92,
    skills: ['\uC601\uC0C1 \uC81C\uC791', '\uC2A4\uD1A0\uB9AC\uD154\uB9C1', 'SNS \uB9C8\uCF00\uD305', '\uD2B8\uB80C\uB4DC \uBD84\uC11D'],
    timeline: ['\uCF58\uD150\uCE20 \uC81C\uC791 \uC2A4\uD0AC & \uCC44\uB110 \uAD6C\uCD95', '10\uB9CC \uAD6C\uB3C5\uC790 \uB2EC\uC131 & \uBE0C\uB79C\uB4DC \uD611\uC5C5', '\uBBF8\uB514\uC5B4 \uD68C\uC0AC \uC124\uB9BD & \uB2E4\uC911 \uCC44\uB110 \uC6B4\uC601'],
    desc: '\uCC3D\uC758\uC801\uC778 \uCF58\uD150\uCE20\uB85C \uC138\uC0C1\uACFC \uC18C\uD1B5\uD558\uB294 \uD06C\uB9AC\uC5D0\uC774\uD130! \uD2B8\uB80C\uB4DC\uB97C \uC77D\uACE0 \uC774\uB044\uB294 \uC601\uD5A5\uB825\uC744 \uBC1C\uD718\uD569\uB2C8\uB2E4.',
  },
  'creative-director': {
    name: '\uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uB514\uB809\uD130', emoji: '\u{1F3AC}', compatibility: 90,
    skills: ['\uBE44\uC8FC\uC5BC \uC804\uB7B5', '\uBE0C\uB79C\uB529', '\uD300 \uB9E4\uB2C8\uC9C0\uBA3C\uD2B8', '\uD2B8\uB80C\uB4DC \uD050\uB808\uC774\uC158'],
    timeline: ['\uB2E4\uC591\uD55C \uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uD504\uB85C\uC81D\uD2B8 \uACBD\uD5D8', '\uC5D0\uC774\uC804\uC2DC \uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uD300 \uB9AC\uB4DC', '\uAE00\uB85C\uBC8C \uBE0C\uB79C\uB4DC \uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uCD1D\uAD04'],
    desc: '\uBE0C\uB79C\uB4DC\uC758 \uC2DC\uAC01\uC801 \uC138\uACC4\uAD00\uC744 \uB9CC\uB4DC\uB294 \uB514\uB809\uD130! \uC18C\uD1B5 \uB2A5\uB825\uACFC \uCC3D\uC758\uB825\uC73C\uB85C \uD300\uC744 \uC774\uB055\uB2C8\uB2E4.',
  },
  'research-scientist': {
    name: '\uC5F0\uAD6C \uACFC\uD559\uC790', emoji: '\u{1F52C}', compatibility: 93,
    skills: ['\uB370\uC774\uD130 \uBD84\uC11D', '\uB17C\uBB38 \uC791\uC131', '\uC2E4\uD5D8 \uC124\uACC4', '\uBE44\uD310\uC801 \uC0AC\uACE0'],
    timeline: ['\uC11D\uC0AC/\uBC15\uC0AC \uACFC\uC815 & \uC5F0\uAD6C \uAE30\uBC18 \uAD6C\uCD95', '\uC8FC\uC694 \uD559\uC220\uC9C0 \uB17C\uBB38 \uAC8C\uC7AC & \uC5F0\uAD6C\uBE44 \uC218\uC8FC', '\uC5F0\uAD6C\uC18C\uC7A5 & \uB178\uBCA8\uC0C1 \uD6C4\uBCF4'],
    desc: '\uC9C0\uC2DD\uC758 \uACBD\uACC4\uB97C \uB113\uD788\uB294 \uACFC\uD559\uC790! \uB04A\uC784\uC5C6\uB294 \uD0D0\uAD6C\uC2EC\uACFC \uB17C\uB9AC\uB85C \uC778\uB958\uC758 \uBC1C\uC804\uC5D0 \uAE30\uC5EC\uD569\uB2C8\uB2E4.',
  },
  'biotech-innovator': {
    name: '\uBC14\uC774\uC624\uD14C\uD06C \uD601\uC2E0\uAC00', emoji: '\u{1F9EC}', compatibility: 87,
    skills: ['\uC0DD\uBA85\uACF5\uD559', '\uC784\uC0C1 \uC5F0\uAD6C', '\uD2B9\uD5C8 \uC804\uB7B5', '\uADDC\uC81C \uB300\uC751'],
    timeline: ['\uC0DD\uBA85\uACFC\uD559 \uC804\uACF5 & \uC5F0\uAD6C\uC2E4 \uACBD\uD5D8', '\uBC14\uC774\uC624 \uC2A4\uD0C0\uD2B8\uC5C5 \uACF5\uB3D9 \uCC3D\uC5C5', '\uAE00\uB85C\uBC8C \uD5EC\uC2A4\uCF00\uC5B4 \uD601\uC2E0 \uB9AC\uB354'],
    desc: '\uACFC\uD559\uACFC \uAE30\uC220\uC758 \uACBD\uACC4\uC5D0\uC11C \uC0DD\uBA85\uC744 \uD601\uC2E0\uD558\uB294 \uAC1C\uCC99\uC790! \uC0C8\uB85C\uC6B4 \uCE58\uB8CC\uBC95\uACFC \uAE30\uC220\uC744 \uC138\uC0C1\uC5D0 \uC120\uBCF4\uC785\uB2C8\uB2E4.',
  },
  'startup-ceo': {
    name: '\uC2A4\uD0C0\uD2B8\uC5C5 CEO', emoji: '\u{1F4A1}', compatibility: 89,
    skills: ['\uB9AC\uB354\uC2ED', '\uC804\uB7B5 \uAE30\uD68D', '\uB124\uD2B8\uC6CC\uD0B9', '\uC758\uC0AC \uACB0\uC815'],
    timeline: ['\uBE44\uC988\uB2C8\uC2A4 \uBAA8\uB378 \uAC1C\uBC1C & MBA', '\uC2DC\uB9AC\uC988 B \uD22C\uC790 \uC720\uCE58 & \uD300 50\uBA85 \uD655\uC7A5', 'IPO \uB2EC\uC131 & \uC5C5\uACC4 \uB9AC\uB354\uB85C \uC778\uC815'],
    desc: '\uBE44\uC804\uC73C\uB85C \uC0AC\uB78C\uB4E4\uC744 \uC774\uB044\uB294 \uB9AC\uB354! \uC804\uB7B5\uC801 \uC0AC\uACE0\uC640 \uC2E4\uD589\uB825\uC73C\uB85C \uBE44\uC988\uB2C8\uC2A4\uB97C \uC131\uACF5\uC73C\uB85C \uC774\uB055\uB2C8\uB2E4.',
  },
  'brand-strategist': {
    name: '\uBE0C\uB79C\uB4DC \uC804\uB7B5\uAC00', emoji: '\u{1F4E3}', compatibility: 86,
    skills: ['\uC2DC\uC7A5 \uBD84\uC11D', '\uBE0C\uB79C\uB4DC \uC804\uB7B5', '\uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158', '\uC18C\uBE44\uC790 \uC2EC\uB9AC'],
    timeline: ['\uB9C8\uCF00\uD305 \uC804\uACF5 & \uC5D0\uC774\uC804\uC2DC \uACBD\uD5D8', '\uBE0C\uB79C\uB4DC \uC804\uB7B5 \uD300 \uB9AC\uB4DC', '\uAE00\uB85C\uBC8C \uBE0C\uB79C\uB4DC CMO'],
    desc: '\uBE0C\uB79C\uB4DC\uC758 \uC774\uC57C\uAE30\uB97C \uC124\uACC4\uD558\uB294 \uC804\uB7B5\uAC00! \uC18C\uD1B5\uB825\uC73C\uB85C \uC18C\uBE44\uC790\uC758 \uB9C8\uC74C\uC744 \uC0AC\uB85C\uC7A1\uC2B5\uB2C8\uB2E4.',
  },
  'social-innovator': {
    name: '\uC18C\uC15C \uC774\uB178\uBCA0\uC774\uD130', emoji: '\u{1F30D}', compatibility: 91,
    skills: ['\uACF5\uAC10 \uB2A5\uB825', '\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC', '\uC784\uD329\uD2B8 \uCE21\uC815', '\uCEE4\uBBA4\uB2C8\uD2F0 \uBE4C\uB529'],
    timeline: ['\uC0AC\uD68C \uBB38\uC81C \uC5F0\uAD6C & \uD604\uC7A5 \uACBD\uD5D8', '\uC18C\uC15C \uBCE4\uCC98 \uC124\uB9BD & \uC784\uD329\uD2B8 \uD22C\uC790 \uC720\uCE58', '\uAE00\uB85C\uBC8C \uC0AC\uD68C \uD601\uC2E0 \uB9AC\uB354\uB85C \uC131\uC7A5'],
    desc: '\uACF5\uAC10 \uB2A5\uB825\uC73C\uB85C \uC138\uC0C1\uC744 \uBC14\uAFB8\uB294 \uD601\uC2E0\uAC00! \uC0AC\uD68C \uBB38\uC81C\uB97C \uCC3D\uC758\uC801\uC73C\uB85C \uD574\uACB0\uD558\uB294 \uCCB4\uC778\uC9C0\uBA54\uC774\uCEE4\uC785\uB2C8\uB2E4.',
  },
  'ngo-leader': {
    name: 'NGO \uB9AC\uB354', emoji: '\u{1F91D}', compatibility: 88,
    skills: ['\uC815\uCC45 \uBD84\uC11D', '\uAE00\uB85C\uBC8C \uB124\uD2B8\uC6CC\uD0B9', '\uD380\uB4DC\uB808\uC774\uC9D5', '\uC704\uAE30 \uAD00\uB9AC'],
    timeline: ['\uAD6D\uC81C\uAC1C\uBC1C \uC804\uACF5 & \uD604\uC7A5 \uD65C\uB3D9', '\uAD6D\uC81C \uAE30\uAD6C \uD504\uB85C\uC81D\uD2B8 \uB9E4\uB2C8\uC800', '\uAD6D\uC81C NGO \uC0AC\uBB34\uCD1D\uC7A5'],
    desc: '\uB9AC\uB354\uC2ED\uC73C\uB85C \uC138\uC0C1\uC744 \uBCC0\uD654\uC2DC\uD0A4\uB294 \uD65C\uB3D9\uAC00! \uAE00\uB85C\uBC8C \uBB34\uB300\uC5D0\uC11C \uC0AC\uD68C\uC801 \uC601\uD5A5\uB825\uC744 \uBC1C\uD718\uD569\uB2C8\uB2E4.',
  },
};

/* ── Step 1: Interest Field ──────────────────────────── */
function InterestStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['interest'] as string | undefined;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {INTERESTS.map((item, idx) => {
          const isSelected = selected === item.id;
          const isLast = idx === INTERESTS.length - 1;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onUpdate('interest', item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
                isLast && 'col-span-2 sm:col-span-1',
              )}
              aria-pressed={isSelected}
            >
              <span className="text-3xl shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <p className={cn('font-semibold text-sm', isSelected ? 'text-blue-300' : 'text-white')}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Work Style (2x2 Matrix) ────────────────── */
const quadrantColors: Record<string, { bg: string; border: string; text: string }> = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500',   text: 'text-blue-300' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500',  text: 'text-green-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-300' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500',  text: 'text-amber-300' },
};
function WorkStyleStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['workStyle'] as string | undefined;
  return (
    <div className="space-y-4">
      {/* Axis labels - top */}
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-2">
        <div />
        <p className="text-center text-xs font-medium text-slate-500">\uD63C\uC790 Solo</p>
        <p className="text-center text-xs font-medium text-slate-500">\uD568\uAED8 Team</p>
      </div>

      {/* Matrix rows */}
      {[0, 1].map((row) => (
        <div key={row} className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center">
          <p className="text-xs font-medium text-slate-500 [writing-mode:vertical-lr] rotate-180 text-center">
            {row === 0 ? '\uAD6C\uC870\uC801' : '\uC720\uC5F0\uD55C'}
          </p>
          {QUADRANTS.filter((q) => q.row === row).map((q) => {
            const isSelected = selected === q.id;
            const colors = quadrantColors[q.color];

            return (
              <motion.button
                key={q.id}
                type="button"
                onClick={() => onUpdate('workStyle', q.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-xl border p-6 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  colors.bg,
                  isSelected
                    ? cn(colors.border, 'border-2 shadow-lg')
                    : 'border-slate-700/50',
                )}
                aria-pressed={isSelected}
              >
                <span className={cn('text-sm font-semibold', isSelected ? colors.text : 'text-slate-300')}>
                  {q.label}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="ws-check"
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Step 3: Superpower ──────────────────────────────── */
function SuperpowerStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['superpower'] as string | undefined;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {SUPERPOWERS.map((item, idx) => {
          const isSelected = selected === item.id;
          const isLast = idx === SUPERPOWERS.length - 1;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onUpdate('superpower', item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
                isLast && 'col-span-2 sm:col-span-1',
              )}
              aria-pressed={isSelected}
            >
              <span className="text-3xl">{item.emoji}</span>
              <p className={cn('text-sm font-semibold', isSelected ? 'text-blue-300' : 'text-white')}>
                {item.label}
              </p>
              <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Result Component ────────────────────────────────── */
function CareerResult({ resultKey, onRestart }: DemoResultProps) {
  const career = CAREERS[resultKey] ?? CAREERS['tech-entrepreneur']!;
  const yearLabels = ['Year 1', 'Year 3', 'Year 5'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <p className="text-sm font-medium tracking-widest text-blue-400 uppercase">
          AI \uBBF8\uB798 \uCEE4\uB9AC\uC5B4 \uBD84\uC11D \uACB0\uACFC
        </p>
        <p className="text-5xl">{career.emoji}</p>
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {career.name}
        </h2>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-4 py-1.5">
          <span className="text-sm font-semibold text-blue-300">
            \uC801\uD569\uB3C4 {career.compatibility}%
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400 text-center"
      >
        {career.desc}
      </motion.p>

      {/* Growth Roadmap Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
          \uC131\uC7A5 \uB85C\uB4DC\uB9F5
        </p>
        <div className="relative ml-8 space-y-6 py-2">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-0 h-full w-0.5 bg-blue-500/30" aria-hidden="true" />

          {career.timeline.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
              <div>
                <p className="text-xs font-semibold text-blue-400">{yearLabels[i]}</p>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Core Skills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
          \uD575\uC2EC \uC2A4\uD0AC
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {career.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-3 pt-4"
      >
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          \uB2E4\uC2DC \uBD84\uC11D\uD558\uAE30
        </button>
      </motion.div>
    </div>
  );
}

/* ── computeResult ───────────────────────────────────── */
function computeResult(answers: DemoAnswers): string {
  const interest = answers['interest'] as string | undefined;
  const superpower = answers['superpower'] as string | undefined;
  if (interest === 'tech') {
    if (superpower === 'logic') return 'ai-engineer';
    if (superpower === 'creativity') return 'ux-designer';
    return 'tech-entrepreneur';
  }
  if (interest === 'creative') {
    if (superpower === 'creativity') return 'content-creator';
    if (superpower === 'communication') return 'creative-director';
    return 'content-creator';
  }
  if (interest === 'science') {
    if (superpower === 'logic') return 'research-scientist';
    return 'biotech-innovator';
  }
  if (interest === 'business') {
    if (superpower === 'leadership') return 'startup-ceo';
    if (superpower === 'communication') return 'brand-strategist';
    return 'startup-ceo';
  }
  if (interest === 'social') {
    if (superpower === 'empathy') return 'social-innovator';
    if (superpower === 'leadership') return 'ngo-leader';
    return 'social-innovator';
  }
  return 'tech-entrepreneur';
}

/* ── Config & Export ─────────────────────────────────── */
const config: DemoConfig = {
  id: 'future-career',
  targetSlug: 'ai-future-career',
  industryId: 'education' as IndustryId,
  analyzeEmoji: '\u{1F680}',
  analyzeDurationMs: 2800,
  steps: [
    {
      id: 'interest',
      titleKey: '\uAC00\uC7A5 \uAD00\uC2EC \uC788\uB294 \uBD84\uC57C\uB294?',
      subtitleKey: '\uB9C8\uC74C\uC774 \uB04C\uB9AC\uB294 \uBD84\uC57C\uB97C \uC120\uD0DD\uD558\uC138\uC694',
      canProceed: (a) => typeof a['interest'] === 'string',
    },
    {
      id: 'workStyle',
      titleKey: '\uB098\uC758 \uC5C5\uBB34 \uC2A4\uD0C0\uC77C\uC740?',
      subtitleKey: '2x2 \uB9E4\uD2B8\uB9AD\uC2A4\uC5D0\uC11C \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC704\uCE58\uB97C \uD0ED\uD558\uC138\uC694',
      canProceed: (a) => typeof a['workStyle'] === 'string',
    },
    {
      id: 'superpower',
      titleKey: '\uB2F9\uC2E0\uC758 \uCD08\uB2A5\uB825\uC740?',
      subtitleKey: '\uD558\uB098\uB9CC \uACE0\uB97C \uC218 \uC788\uB2E4\uBA74?',
      canProceed: (a) => typeof a['superpower'] === 'string',
    },
  ],
};

const futureCareerDemo: DemoModule = {
  config,
  StepComponents: [InterestStep, WorkStyleStep, SuperpowerStep],
  ResultComponent: CareerResult,
  computeResult,
};

export default futureCareerDemo;
