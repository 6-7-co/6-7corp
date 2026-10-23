import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { api } from '../lib/api';
import { useI18n } from '../i18n';

const fieldCls =
  'mt-2 w-full rounded-[16px] border border-line bg-bg/60 px-4 py-3.5 text-[15px] text-fg outline-none transition-colors duration-300 placeholder:text-muted/50 focus:border-line-strong focus:bg-bg';

/**
 * Contact form. The message is auto-translated through Google Translate and
 * sent alongside the original, so the studio always understands it.
 */
export function ContactForm() {
  const { t, translate, lang } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'translating' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setError('');
    setStatus('translating');
    try {
      const translated = await translate(message);
      setStatus('sending');
      await api.post('/api/messages', {
        name,
        email,
        content: message,
        content_en: lang === 'en' ? message : translated,
        content_ru: lang === 'ru' ? message : translated,
      });
      setStatus('done');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || t('contact.error'));
    }
  }

  const busy = status === 'translating' || status === 'sending';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted/80">
            {t('contact.name')}
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldCls}
            placeholder={t('contact.namePh')}
            disabled={status === 'done'}
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted/80">
            {t('contact.email')}
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldCls}
            placeholder={t('contact.emailPh')}
            disabled={status === 'done'}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted/80">
          {t('contact.message')}
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={`${fieldCls} resize-none leading-relaxed`}
          placeholder={t('contact.messagePh')}
          disabled={status === 'done'}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <AnimatePresence mode="wait">
          {status === 'translating' && (
            <motion.span
              key="translating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[12.5px] text-muted"
            >
              <span className="h-3 w-3 animate-spin rounded-full border border-line-strong border-t-fg" />
              {t('contact.translating')}
            </motion.span>
          )}
          {status === 'error' && (
            <motion.span
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[12.5px] text-muted"
            >
              {error}
            </motion.span>
          )}
          {status === 'done' && (
            <motion.span
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12.5px] text-fg"
            >
              {t('contact.sent')}
            </motion.span>
          )}
          {status === 'idle' && (
            <span key="hint" className="text-[12.5px] text-muted/60">
              {lang === 'ru' ? 'Отвечаем в течение рабочего дня' : 'We reply within one business day'}
            </span>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={busy || status === 'done'}
          className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
        >
          {t('contact.send')}
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
