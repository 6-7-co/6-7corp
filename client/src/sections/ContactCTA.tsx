import { Reveal } from '../components/Reveal';
import { ContactForm } from '../components/ContactForm';
import { useI18n } from '../i18n';

export function ContactCTA() {
  const { t } = useI18n();
  return (
    <section id="contact" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2 className="display mt-5 max-w-3xl text-3xl sm:text-5xl lg:text-6xl">{t('contact.title')}</h2>
          <p className="mt-5 max-w-xl text-white/55">{t('contact.subtitle')}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <div className="border-l border-white/20 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Email</p>
                <a href="mailto:hello@6-7corp.com" className="mt-1 block text-white transition-colors hover:text-white/70">
                  hello@6-7corp.com
                </a>
              </div>
              <div className="border-l border-white/20 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Est.</p>
                <p className="mt-1 text-white">2019</p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Location</p>
                <p className="mt-1 text-white">Stockholm · Remote</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
