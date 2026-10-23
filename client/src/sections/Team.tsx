import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { TiltCard } from '../components/TiltCard';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import type { TeamMember } from '../context/ContentContext';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function Socials({ socials }: { socials: Record<string, string> }) {
  const entries = Object.entries(socials).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="mt-5 flex gap-3">
      {entries.map(([k, v]) => (
        <a
          key={k}
          href={v}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors hover:text-white"
        >
          {k}
        </a>
      ))}
    </div>
  );
}

export function Team() {
  const { t } = useI18n();
  const { team } = useContent();

  return (
    <section id="team" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('team.eyebrow')}</p>
          <h2 className="display mt-5 text-3xl sm:text-5xl lg:text-6xl">{t('team.title')}</h2>
          <p className="mt-5 max-w-xl text-white/55">{t('team.subtitle')}</p>
        </Reveal>

        {team.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-white/40">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <StaggerItem key={m.id}>
                <TiltCard className="group h-full">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/15 bg-ink-800">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="h-full w-full object-cover grayscale" />
                      ) : (
                        <span className="grid h-full w-full place-items-center font-mono text-sm text-white/70">
                          {initials(m.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">{m.name}</h3>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-white/45">{m.role}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/55">{m.bio}</p>
                  <Socials socials={m.socials} />
                  <span className="absolute right-5 top-5 font-mono text-[11px] text-white/20">
                    0{i + 1}
                  </span>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
