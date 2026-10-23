import { motion } from 'framer-motion';
import { Reveal, SectionHeading, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { SERVICES } from '../content';

export function Services() {
  const { pick, t } = useI18n();

  return (
    <section id="capabilities" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={pick(SERVICES.eyebrow)}
          title={pick(SERVICES.title)}
          lead={pick(SERVICES.subtitle)}
        />

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.items.map((s, i) => (
            <StaggerItem key={i}>
              <motion.article
                whileHover={{ y: -3 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] border border-line bg-surface p-7 transition-colors duration-500 hover:border-line-strong"
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]"
                  style={{ background: 'linear-gradient(140deg, var(--accent-a), var(--accent-c))' }}
                />
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-[13px] border border-line bg-bg/40 font-mono text-[11px] text-muted">
                    0{i + 1}
                  </span>
                </div>
                <div className="mt-12">
                  <h3 className="font-display text-[19px] font-semibold tracking-[-0.02em]">{pick(s.title)}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{pick(s.text)}</p>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-10">
          <div className="flex flex-col items-start justify-between gap-4 rounded-[26px] border border-line bg-surface px-7 py-6 sm:flex-row sm:items-center">
            <p className="text-[15px] text-muted">
              {pick({
                ru: 'Нужен только дизайн, только код или всё вместе — соберём команду под задачу.',
                en: 'Need design only, engineering only, or the whole thing — we assemble the team around the task.',
              })}
            </p>
            <a
              href="/contact"
              className="shrink-0 rounded-full border border-line-strong px-5 py-2.5 text-[13px] font-semibold text-fg transition-colors hover:bg-surface-soft"
            >
              {t('nav.cta')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
