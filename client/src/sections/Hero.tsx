import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { OrganicLines } from '../components/OrganicLines';
import { useI18n } from '../i18n';
import { HERO } from '../content';

function HeadlineLine({
  children,
  delay,
  className = '',
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden pb-[0.12em] -mb-[0.08em]">
      <motion.span
        initial={{ y: '108%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const { pick, t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yType = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      <OrganicLines />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex items-center gap-2.5 text-[12.5px] font-medium tracking-[0.02em] text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-a)' }} />
          {pick(HERO.eyebrow)}
        </motion.p>

        <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <motion.h1
            style={{ y: yType, opacity: fade }}
            className="display col-span-full text-[clamp(3.4rem,11.5vw,9.5rem)] font-normal leading-[0.88] tracking-[-0.045em] lg:col-span-8"
          >
            <HeadlineLine delay={0.25}>{pick(HERO.line1)}</HeadlineLine>
            <HeadlineLine delay={0.36} className="grad-text">
              {pick(HERO.line2)}
            </HeadlineLine>
            <HeadlineLine delay={0.47}>{pick(HERO.line3)}</HeadlineLine>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-full lg:col-span-4 lg:pb-4"
          >
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">{pick(HERO.description)}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
              >
                {pick(HERO.ctaPrimary)}
              </Link>
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-6 py-3.5 text-[14px] font-semibold text-fg transition-colors hover:bg-surface-soft"
              >
                {pick(HERO.ctaSecondary)}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-20 text-center sm:mt-28"
        >
          <p className="text-[13px] text-muted/80">{pick(HERO.trusted)}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
            {HERO.clients.map((name, i) => (
              <span
                key={name}
                className={`select-none text-[15px] font-semibold text-fg/45 transition-colors hover:text-fg/80 ${
                  i % 3 === 0
                    ? 'tracking-[-0.04em]'
                    : i % 3 === 1
                      ? 'font-serif italic tracking-[-0.01em]'
                      : 'text-[13px] uppercase tracking-[0.18em]'
                }`}
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stat card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="pastel mt-14 grid grid-cols-1 gap-y-10 rounded-[34px] px-8 py-12 text-center shadow-[var(--shadow-soft)] sm:mt-16 sm:grid-cols-3 sm:gap-y-0 sm:px-10"
        >
          {HERO.stats.map((s, i) => (
            <div
              key={s.value}
              className={`flex flex-col items-center justify-center ${
                i > 0 ? 'sm:border-l sm:border-black/10' : ''
              }`}
            >
              <span className="display text-[clamp(2.2rem,4.5vw,3.4rem)] font-medium tracking-[-0.04em] text-[#0b0b0d]">
                {s.value}
              </span>
              <span className="mt-2 text-[13px] text-[#0b0b0d]/60">{pick(s.label)}</span>
            </div>
          ))}
        </motion.div>

        <div className="pb-24 pt-10 text-center">
          <button
            onClick={() =>
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-fg"
          >
            {t('common.more')}
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
