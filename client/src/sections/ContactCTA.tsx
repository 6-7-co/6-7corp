import { Reveal } from '../components/Reveal';
import { ContactForm } from '../components/ContactForm';
import { useI18n } from '../i18n';
import { CONTACT } from '../content';

export function ContactCTA() {
  const { pick } = useI18n();

  return (
    <section id="contact" className="relative scroll-mt-28 border-t border-line py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">{pick(CONTACT.eyebrow)}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-medium">{pick(CONTACT.title)}</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="lead mt-5 max-w-md">{pick(CONTACT.subtitle)}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-10 space-y-5">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11.5px] uppercase tracking-[0.16em] text-muted/70">
                    {CONTACT.emailLabel}
                  </dt>
                  <dd>
                    <a href="mailto:hello@6-7corp.com" className="link-soft text-[15px]">
                      hello@6-7corp.com
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[11.5px] uppercase tracking-[0.16em] text-muted/70">
                    {pick(CONTACT.locationLabel)}
                  </dt>
                  <dd className="text-[15px] text-fg">{pick(CONTACT.location)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[11.5px] uppercase tracking-[0.16em] text-muted/70">
                    {pick(CONTACT.responseLabel)}
                  </dt>
                  <dd className="text-[15px] text-fg">{pick(CONTACT.response)}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.14} className="lg:col-span-7">
            <div className="rounded-[30px] border border-line bg-surface p-6 sm:p-9">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
