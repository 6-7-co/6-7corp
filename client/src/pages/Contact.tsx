import { Reveal } from '../components/Reveal';
import { ContactForm } from '../components/ContactForm';
import { useI18n } from '../i18n';
import { CONTACT } from '../content';

export function Contact() {
  const { pick } = useI18n();

  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{pick(CONTACT.eyebrow)}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="display mt-4 text-[clamp(2.2rem,5.5vw,3.8rem)] font-medium">{pick(CONTACT.title)}</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="lead mt-5 max-w-xl">{pick(CONTACT.subtitle)}</p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-12 rounded-[30px] border border-line bg-surface p-6 sm:p-9">
            <ContactForm />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
            <a href="mailto:hello@6-7corp.com" className="link-soft">
              hello@6-7corp.com
            </a>
            <span className="tick" />
            <span>{pick(CONTACT.location)}</span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
