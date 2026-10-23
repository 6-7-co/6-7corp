import { motion } from 'framer-motion';
import { Reveal } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';

const PRINCIPLES = [
  { n: '01', t: 'Clarity', d: 'One obvious path through a thousand possible ones.' },
  { n: '02', t: 'Resilience', d: 'Systems that degrade gracefully, not loudly.' },
  { n: '03', t: 'Security', d: 'Threat models written before the first line of code.' },
];

export function About() {
  const { t } = useI18n();
  const { settings } = useContent();

  return (
    <section id="services" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('about.eyebrow')}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display mt-5 max-w-4xl text-3xl sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            {settings.description || t('about.body')}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-ink p-8 transition-colors hover:bg-ink-800"
            >
              <span className="font-mono text-sm text-white/30">{p.n}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{p.d}</p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
