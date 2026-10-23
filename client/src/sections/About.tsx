import { motion } from 'framer-motion';
import { Reveal } from '../components/Reveal';
import { useI18n } from '../i18n';
import { ABOUT } from '../content';

export function About() {
  const { pick } = useI18n();

  return (
    <section id="about" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">{pick(ABOUT.eyebrow)}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3.2rem)] font-medium">
                {pick(ABOUT.title)}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12} className="lg:col-span-5 lg:pt-14">
            <p className="lead max-w-lg">{pick(ABOUT.body)}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {ABOUT.principles.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="surface card-hover p-7"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[15px] tracking-[0.15em] text-muted/70">{p.n}</span>
              </div>
              <h3 className="mt-8 font-display text-[19px] font-semibold tracking-[-0.02em]">{pick(p.title)}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{pick(p.text)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
