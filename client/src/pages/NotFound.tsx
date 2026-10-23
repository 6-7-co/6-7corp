import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export function NotFound() {
  const { pick } = useI18n();

  return (
    <div className="grid min-h-[85vh] place-items-center px-5 pt-28">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="display grad-text text-[clamp(6rem,22vw,14rem)] font-medium leading-none"
        >
          404
        </motion.p>
        <p className="mt-4 text-[15px] text-muted">
          {pick({
            ru: 'Такой страницы нет — возможно, она переехала.',
            en: 'This page does not exist — it may have moved.',
          })}
        </p>
        <Link
          to="/"
          className="mt-9 inline-block rounded-full px-6 py-3.5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5"
          style={{ background: 'var(--cta-bg)', color: 'var(--cta-fg)' }}
        >
          {pick({ ru: 'На главную', en: 'Back home' })}
        </Link>
      </div>
    </div>
  );
}
