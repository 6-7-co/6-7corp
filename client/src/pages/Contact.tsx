import { Reveal } from '../components/Reveal';
import { ContactForm } from '../components/ContactForm';
import { useI18n } from '../i18n';

export function Contact() {
  const { t } = useI18n();
  return (
    <div className="relative pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h1 className="display mt-5 text-4xl sm:text-6xl">{t('contact.title')}</h1>
          <p className="mt-5 max-w-xl text-white/55">{t('contact.subtitle')}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-12">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
