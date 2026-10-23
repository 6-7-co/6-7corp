import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? t('theme.toDark') : t('theme.toLight')}
      title={isLight ? t('theme.toDark') : t('theme.toLight')}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line text-fg transition-colors hover:bg-surface-soft"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: isLight ? -60 : 60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: isLight ? 60 : -60, scale: 0.7 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="text-[13px] leading-none"
        >
          {isLight ? '☀' : '☾'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
