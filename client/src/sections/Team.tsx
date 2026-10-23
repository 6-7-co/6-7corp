import { Reveal, SectionHeading, Stagger, StaggerItem } from '../components/Reveal';
import { useI18n } from '../i18n';
import { useContent } from '../context/ContentContext';
import { TEAM } from '../content';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function Team() {
  const { pick, t } = useI18n();
  const { team, settings } = useContent();
  const email = settings.email || 'hello@6-7corp.com';

  return (
    <section id="team" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={pick(TEAM.eyebrow)} title={pick(TEAM.title)} lead={pick(TEAM.subtitle)} />

        {team.length === 0 ? (
          <p className="mt-12 text-sm text-muted">{t('common.empty')}</p>
        ) : (
          <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <StaggerItem key={m.id}>
                <div className="surface card-hover flex h-full flex-col p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line bg-ink-700">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="h-full w-full object-cover grayscale" />
                      ) : (
                        <span className="grid h-full w-full place-items-center font-mono text-[12px] text-muted">
                          {initials(m.name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[17px] font-semibold tracking-[-0.02em]">
                        {m.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[12.5px] text-muted">{m.role}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-[14px] leading-relaxed text-muted">{m.bio}</p>
                  {Object.entries(m.socials ?? {}).filter(([, v]) => v).length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {Object.entries(m.socials)
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <a
                            key={k}
                            href={v}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                          >
                            {k}
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <Reveal delay={0.1} className="mt-12">
          <p className="text-[14px] text-muted">
            {pick({
              ru: `Хотите присоединиться? Напишите на ${email} — читаем всё.`,
              en: `Want to join? Write to ${email} — we read everything.`,
            })}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
