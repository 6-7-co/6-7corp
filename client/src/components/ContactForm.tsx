import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { api } from '../lib/api';
import { useI18n } from '../i18n';

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

  const otherLang = lang === 'ru' ? 'en' : 'ru';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setError('');
    setStatus('translating');
    try {
      // Auto-translate the message into the studio's working languages.
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
      setError(err?.message || 'Something went wrong.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">{t('contact.name')}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="eyebrow">{t('contact.email')}</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-white/20 bg-transparent py-2.5 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white"
            placeholder="you@email.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow">{t('contact.message')}</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-2 w-full resize-none border-b border-white/20 bg-transparent py-2.5 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white"
          placeholder="Tell us about the impossible thing…"
        />
      </label>

      <AnimatePresence mode="wait">
        {status === 'translating' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-mono text-xs text-white/50"
          >
            <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
            {t('contact.translating')}
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'error' && <p className="font-mono text-xs text-white/60">{error}</p>}
      {status === 'done' && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-white"
        >
          {t('contact.sent')}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={status === 'translating' || status === 'sending' || status === 'done'}
        className="group flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-black transition-all hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === 'done' ? '✓' : t('contact.send')}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
