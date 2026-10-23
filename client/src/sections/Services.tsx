import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { TiltCard } from '../components/TiltCard';
import { useI18n } from '../i18n';

const SERVICES = [
  { icon: '◎', t: 'Product Design', d: 'Research, UX and design systems that turn dense problems into calm interfaces.' },
  { icon: '⬡', t: 'Web Engineering', d: 'React, TypeScript and performance budgets enforced from the first commit.' },
  { icon: '◆', t: 'Distributed Systems', d: 'Backend services, queues and data platforms built to scale horizontally.' },
  { icon: '⛨', t: 'Security', d: 'Threat modeling, hardening, audits and zero-trust architectures.' },
  { icon: '⚙', t: 'DevTools', d: 'Build platforms, CI/CD and internal tooling that make teams faster.' },
  { icon: '✦', t: 'AI Engineering', d: 'LLM pipelines, RAG and evaluation — shipped with guardrails.' },
];

export function Services() {
  const { t } = useI18n();

  return (
    <section id="capabilities" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('services.eyebrow')}</p>
          <h2 className="display mt-5 text-3xl sm:text-5xl lg:text-6xl">{t('services.title')}</h2>
          <p className="mt-5 max-w-xl text-white/55">{t('services.subtitle')}</p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <StaggerItem key={s.t}>
              <TiltCard className="group h-full">
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl text-white/80">{s.icon}</span>
                  <span className="font-mono text-[11px] text-white/30">
                    0{SERVICES.indexOf(s) + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.d}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
